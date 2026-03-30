import os
import re
import shutil
import hashlib
import asyncio
import datetime
import logging
import secrets
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header, Request, Response, Body, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from sqlalchemy import text as sqlalchemy_text

from .database import engine, get_db
from .engine import parse_resume_to_json
from .schemas import ResumeResponse, PortfolioData
from .models import Base, Portfolio, User, SiteContent
from .security import sanitise_pdf, mask_pii, CSP_POLICY

# ── Logging ───────────────────────────────────────────────────────────────────

class _PIIFilter(logging.Filter):
    """Strip emails and phone numbers from all log records before they hit stdout."""
    _EMAIL = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')
    _PHONE = re.compile(r'\+?\d[\d\s\-]{8,}\d')

    def filter(self, record: logging.LogRecord) -> bool:
        msg = str(record.getMessage())
        msg = self._EMAIL.sub('[MASKED]', msg)
        msg = self._PHONE.sub('[MASKED]', msg)
        record.msg  = msg
        record.args = ()
        return True

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("relak")
log.addFilter(_PIIFilter())
# Also attach to root so third-party loggers are covered
logging.getLogger().addFilter(_PIIFilter())

# ── Helpers ───────────────────────────────────────────────────────────────────
def calculate_file_hash(file_path: str) -> str:
    """SHA256 hash for deduplication."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):
            sha256.update(chunk)
    return sha256.hexdigest()

# ── Config (all from env — never hardcoded) ───────────────────────────────────
ADMIN_SECRET_KEY  = os.getenv("ADMIN_SECRET_KEY")
ALLOWED_ORIGINS   = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")]
MAX_CONCURRENT    = int(os.getenv("MAX_CONCURRENT_JOBS", "3"))
IS_PROD           = os.getenv("ENV", "dev") == "production"
PAYMENT_ENABLED   = os.getenv("PAYMENT_ENABLED", "true").lower() == "true"
RAZORPAY_KEY_ID   = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_SECRET   = os.getenv("RAZORPAY_SECRET", "")

if not ADMIN_SECRET_KEY:
    raise RuntimeError("ADMIN_SECRET_KEY env var is required")

UPLOAD_DIR = Path(__file__).parent.parent / "temp_uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# ── Semaphore (request queue) — created inside lifespan ──────────────────────
_sem: asyncio.Semaphore | None = None

# ── Rate limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


# ── Lifespan ──────────────────────────────────────────────────────────────────
def _run_migrations():
    """
    Lightweight schema migrations — adds columns that may be missing from
    an existing database created before the current models were defined.
    Safe to run on every startup (all statements are idempotent).
    """
    migrations = [
        # Added in v1.1 — deduplication hash
        """
        ALTER TABLE portfolios
        ADD COLUMN IF NOT EXISTS file_hash VARCHAR;
        """,
        # Index for fast hash lookups (CREATE INDEX IF NOT EXISTS is idempotent)
        """
        CREATE INDEX IF NOT EXISTS ix_portfolios_file_hash
        ON portfolios (file_hash);
        """,
    ]
    with engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(sqlalchemy_text(sql))
            except Exception as e:
                log.warning(f"Migration skipped ({e})")
        conn.commit()
    log.info("Schema migrations applied.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _sem
    _sem = asyncio.Semaphore(MAX_CONCURRENT)
    log.info(f"DB sync... (max concurrent AI jobs: {MAX_CONCURRENT})")
    Base.metadata.create_all(bind=engine)
    _run_migrations()
    yield
    # Clean up any leftover temp files on shutdown
    for f in UPLOAD_DIR.glob("*"):
        try:
            f.unlink()
        except Exception:
            pass
    log.info("Shutdown complete.")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ReLak API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "PUT"],
    allow_headers=["*"],
    allow_credentials=False,
)


# ── Security headers middleware ───────────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"]  = "nosniff"
    response.headers["X-Frame-Options"]         = "DENY"
    response.headers["X-XSS-Protection"]        = "1; mode=block"
    response.headers["Referrer-Policy"]         = "strict-origin-when-cross-origin"
    if IS_PROD:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"]   = CSP_POLICY
    return response


# ── Guards ────────────────────────────────────────────────────────────────────
def verify_admin(x_admin_key: str = Header(None)):
    """
    Returns 404 (not 401) when key is missing or wrong — hides the existence
    of admin endpoints from unauthenticated scanners.
    """
    if not x_admin_key or x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=404, detail="Not Found")
    return True


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "online", "message": "Engine is warmed-up"}


@app.get("/config")
async def get_config():
    """Public config endpoint — lets frontend know if real payments are enabled."""
    return {"payment_enabled": PAYMENT_ENABLED}


@app.post("/payment/create-order")
async def create_order(payload: dict = Body(...), db: Session = Depends(get_db)):
    """
    Create a Razorpay order for ₹20. In demo mode returns a fake order.
    """
    portfolio_slug = payload.get("portfolio_slug")
    if not portfolio_slug:
        raise HTTPException(status_code=422, detail="portfolio_slug is required")

    if not PAYMENT_ENABLED:
        return {"id": "demo_order", "amount": 2000, "currency": "INR"}

    if not RAZORPAY_KEY_ID or not RAZORPAY_SECRET:
        raise HTTPException(status_code=503, detail="Payment not configured")

    import razorpay
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET))
    order = client.order.create({
        "amount": 2000,  # ₹20 in paise
        "currency": "INR",
        "receipt": portfolio_slug[:40],
        "payment_capture": 1,
    })
    return order


@app.post("/payment/verify")
async def verify_payment(payload: dict = Body(...), db: Session = Depends(get_db)):
    """
    Verify a Razorpay payment signature and mark the portfolio as paid.
    In demo mode (PAYMENT_ENABLED=false) this always succeeds.
    """
    portfolio_id = payload.get("portfolio_id")
    if not portfolio_id:
        raise HTTPException(status_code=422, detail="portfolio_id is required")

    # ── Demo mode bypass ──────────────────────────────────────────────────────
    if not PAYMENT_ENABLED or payload.get("demo_mode"):
        row = db.query(Portfolio).filter(Portfolio.slug == portfolio_id).first()
        if row:
            row.is_paid = True
            db.commit()
        return {"success": True, "demo": True}

    # ── Real Razorpay signature verification ──────────────────────────────────
    order_id   = payload.get("razorpay_order_id", "")
    payment_id = payload.get("razorpay_payment_id", "")
    signature  = payload.get("razorpay_signature", "")

    if not all([order_id, payment_id, signature]):
        raise HTTPException(status_code=422, detail="Missing Razorpay fields")

    import hmac, hashlib as _hl
    expected = hmac.new(
        RAZORPAY_SECRET.encode(),
        f"{order_id}|{payment_id}".encode(),
        _hl.sha256,
    ).hexdigest()

    if not secrets.compare_digest(expected, signature):
        log.warning("Payment signature mismatch — possible tampering")
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Signature valid — mark paid
    row = db.query(Portfolio).filter(Portfolio.slug == portfolio_id).first()
    if row:
        row.is_paid = True
        db.commit()
        log.info(f"Portfolio {portfolio_id[:8]}... marked paid via Razorpay")

    return {"success": True}


@app.post("/upload", response_model=ResumeResponse)
@limiter.limit("5/minute")
async def upload_resume(
    request: Request, 
    file: UploadFile = File(...), 
    job_description: str = Form(None),
    db: Session = Depends(get_db)
):
    # ── Size check ────────────────────────────────────────────────────────────
    if file.size and file.size > 2 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 2MB)")

    # ── MIME type check ───────────────────────────────────────────────────────
    allowed_types = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(status_code=415, detail="Only PDF and DOCX files are accepted")

    # ── Sanitise filename (prevent path traversal) ────────────────────────────
    safe_name = Path(file.filename or "upload.pdf").name.replace(" ", "_")
    # Strip any non-alphanumeric except dot, dash, underscore
    safe_name = "".join(c for c in safe_name if c.isalnum() or c in "._-") or "upload.pdf"
    temp_path = UPLOAD_DIR / safe_name

    try:
        with temp_path.open("wb") as buf:
            shutil.copyfileobj(file.file, buf)

        # ── PDF content sanitisation ──────────────────────────────────────────
        is_safe, reason = sanitise_pdf(str(temp_path))
        if not is_safe:
            log.warning(f"Rejected unsafe file: {safe_name} — {reason}")
            raise HTTPException(status_code=422, detail=f"File rejected: {reason}")

        # ── File Hashing (Deduplication) ──────────────────────────────────────
        # We include job_description in the hash to allow different versions for different JDs
        hasher = hashlib.sha256()
        with open(temp_path, "rb") as f:
            while chunk := f.read(8192):
                hasher.update(chunk)
        if job_description:
            hasher.update(job_description.encode())
        file_hash = hasher.hexdigest()
        
        existing_portfolio = db.query(Portfolio).filter(Portfolio.file_hash == file_hash).first()

        if existing_portfolio:
            log.info(f"Deduplication hit: {safe_name} (hash: {file_hash[:8]}...)")
            existing_data = PortfolioData(**existing_portfolio.resume_data)
            existing_data._created_at = existing_portfolio.created_at.isoformat()
            return ResumeResponse(
                success=True,
                data=existing_data,
                slug=existing_portfolio.slug,
            )

        log.info(f"Upload queued: {safe_name} ({file.size} bytes)")

        # ── Queue: wait for a free AI slot ────────────────────────────────────
        if _sem is None:
            raise RuntimeError("Server not ready — semaphore not initialised")
        async with _sem:
            result = await asyncio.to_thread(parse_resume_to_json, str(temp_path), job_description)

        # ── Log with PII masked ───────────────────────────────────────────────
        if result.success and result.data:
            masked_name = mask_pii(result.data.name)
            log.info(f"Parsed successfully for: {masked_name}")

            # Check if this exact file (with same hash) already exists
            existing = db.query(Portfolio).filter(Portfolio.file_hash == file_hash).first()
            if existing:
                existing.resume_data = result.data.model_dump()
                existing.created_at  = datetime.datetime.utcnow()
                db.commit()
                result.data._created_at = existing.created_at.isoformat()
                result.slug = existing.slug
                return result

            # New portfolio: create a unique, unguessable slug
            base_slug = result.data.name.lower().replace(" ", "-")
            base_slug = "".join(c for c in base_slug if c.isalnum() or c == "-")
            random_suffix = secrets.token_hex(3)
            unique_slug = f"{base_slug}-{random_suffix}"

            db.add(Portfolio(
                slug=unique_slug,
                resume_data=result.data.model_dump(),
                file_hash=file_hash,
                is_paid=False
            ))
            db.commit()

            new_portfolio = db.query(Portfolio).filter(Portfolio.slug == unique_slug).first()
            if new_portfolio:
                result.data._created_at = new_portfolio.created_at.isoformat()
            result.slug = unique_slug

            # Auto-trim: if total records >= 40, delete 20 oldest unpaid
            total = db.query(Portfolio).count()
            if total >= 40:
                oldest = (
                    db.query(Portfolio.id)
                    .filter(Portfolio.is_paid == False)
                    .order_by(Portfolio.created_at.asc())
                    .limit(20)
                    .subquery()
                )
                trimmed = db.query(Portfolio).filter(
                    Portfolio.id.in_(oldest)
                ).delete(synchronize_session=False)
                db.commit()
                log.info(f"Auto-trim: removed {trimmed} oldest unpaid portfolios")

        return result

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Upload error: {e}", exc_info=True)
        return ResumeResponse(success=False, error="Processing failed. Please try again.")
    finally:
        if temp_path.exists():
            os.remove(temp_path)


@app.delete("/session/cleanup")
async def session_cleanup(payload: dict = Body(...), db: Session = Depends(get_db)):
    """
    Called via navigator.sendBeacon on tab close.
    Deletes the unpaid portfolio for the given slug so no stale data lingers.
    """
    slug = payload.get("slug")
    if not slug:
        return {"ok": False}
    row = db.query(Portfolio).filter(
        Portfolio.slug == slug,
        Portfolio.is_paid == False,
    ).first()
    if row:
        db.delete(row)
        db.commit()
        log.info(f"Session cleanup: deleted unpaid portfolio {slug[:8]}...")
    return {"ok": True}



@app.delete("/cleanup", dependencies=[Depends(verify_admin)])
def cleanup_old_data(db: Session = Depends(get_db)):
    """Delete unpaid portfolios older than 2 hours + any leftover temp files."""
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=2)
    n = db.query(Portfolio).filter(
        Portfolio.created_at < cutoff,
        Portfolio.is_paid == False,
    ).delete()
    db.commit()

    # Also clean temp_uploads directory
    cleaned_files = 0
    for f in UPLOAD_DIR.glob("*"):
        try:
            f.unlink()
            cleaned_files += 1
        except Exception:
            pass

    log.info(f"Cleanup: {n} DB records + {cleaned_files} temp files removed")
    return {"message": f"Cleaned up {n} expired records and {cleaned_files} temp files"}


# ── Admin routes (all return 404 on bad key) ──────────────────────────────────

@app.get("/admin/stats", dependencies=[Depends(verify_admin)])
def get_admin_stats(db: Session = Depends(get_db)):
    paid = db.query(Portfolio).filter(Portfolio.is_paid == True).count()
    return {
        "users":           db.query(User).count(),
        "portfolios":      db.query(Portfolio).count(),
        "paid_portfolios": paid,
        "revenue_inr":     paid * 20,
    }


@app.get("/admin/portfolios", dependencies=[Depends(verify_admin)])
def list_portfolios(db: Session = Depends(get_db)):
    rows = db.query(Portfolio).order_by(Portfolio.created_at.desc()).all()
    return [
        {
            "id":          str(r.id),
            "slug":        r.slug,
            "is_paid":     r.is_paid,
            "created_at":  r.created_at.isoformat() if r.created_at else None,
            "resume_data": r.resume_data,
        }
        for r in rows
    ]


@app.get("/admin/users", dependencies=[Depends(verify_admin)])
def list_users(db: Session = Depends(get_db)):
    rows = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id":         str(r.id),
            "email":      r.email,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@app.patch("/admin/portfolios/{pid}/mark-paid", dependencies=[Depends(verify_admin)])
def mark_paid(pid: str, db: Session = Depends(get_db)):
    row = db.query(Portfolio).filter(Portfolio.id == pid).first()
    if not row:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    row.is_paid = True
    db.commit()
    return {"message": f"Portfolio {pid} marked as paid."}


@app.delete("/admin/portfolios/{pid}", dependencies=[Depends(verify_admin)])
def del_portfolio(pid: str, db: Session = Depends(get_db)):
    row = db.query(Portfolio).filter(Portfolio.id == pid).first()
    if not row:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    db.delete(row)
    db.commit()
    return {"message": f"Portfolio {pid} deleted."}


@app.delete("/admin/users/{uid}", dependencies=[Depends(verify_admin)])
def del_user(uid: str, db: Session = Depends(get_db)):
    row = db.query(User).filter(User.id == uid).first()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    db.query(Portfolio).filter(Portfolio.user_id == uid).delete()
    db.delete(row)
    db.commit()
    return {"message": f"User {uid} and their portfolios deleted."}


@app.delete("/admin/purge", dependencies=[Depends(verify_admin)])
def purge_all(db: Session = Depends(get_db)):
    p = db.query(Portfolio).delete()
    u = db.query(User).delete()
    db.commit()
    log.warning(f"PURGE executed: {p} portfolios, {u} users deleted")
    return {"message": "All data purged.", "portfolios_deleted": p, "users_deleted": u}


# ── Public content routes ─────────────────────────────────────────────────────

_CONTENT_DEFAULTS = {
    "privacy": {"title": "Privacy & Terms", "body": ""},
    "support": {"title": "Support", "body": ""},
    "about":   {"title": "About ReLak", "body": ""},
}

@app.get("/content/{key}")
def get_content(key: str, db: Session = Depends(get_db)):
    if key not in _CONTENT_DEFAULTS:
        raise HTTPException(status_code=404, detail="Content page not found")
    row = db.query(SiteContent).filter(SiteContent.key == key).first()
    if not row:
        return _CONTENT_DEFAULTS[key]
    return {"title": row.title, "body": row.body}


@app.put("/content/{key}", dependencies=[Depends(verify_admin)])
def set_content(key: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    if key not in _CONTENT_DEFAULTS:
        raise HTTPException(status_code=404, detail="Content page not found")
    title = str(payload.get("title", "")).strip()
    body  = str(payload.get("body", "")).strip()
    if not title:
        raise HTTPException(status_code=422, detail="title is required")
    row = db.query(SiteContent).filter(SiteContent.key == key).first()
    if row:
        row.title = title
        row.body  = body
        row.updated_at = datetime.datetime.utcnow()
    else:
        db.add(SiteContent(key=key, title=title, body=body))
    db.commit()
    log.info(f"Content updated: {key}")
    return {"message": f"Content '{key}' saved."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        workers=int(os.getenv("WORKERS", 1)),
        log_level=os.getenv("LOG_LEVEL", "info"),
        reload=False,
    )
