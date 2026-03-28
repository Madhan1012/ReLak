import os
import shutil
import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pathlib import Path
from .database import engine, get_db
from .engine import parse_resume_to_json
from .schemas import ResumeRepsonse
from .models import Base, Portfolio, User
from contextlib import asynccontextmanager

ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "change-me-in-env")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Syncing to Database.......")
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="ReLak API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with Vercel URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# ── Guards ────────────────────────────────────────────────────────────────────

def verify_admin(x_admin_key: str = Header(None)):
    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized Access")
    return True


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "online", "message": "Engine is warmed-up"}


@app.post("/upload", response_model=ResumeRepsonse)
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):

    if file.size > 2 * 1024 * 1024:
        raise HTTPException(status_code=403, detail="File too large (Max limit is 2MB)")

    temp_path = UPLOAD_DIR / file.filename

    try:
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = parse_resume_to_json(str(temp_path))

        if result.success and result.data:
            new_slug = result.data.name.lower().replace(" ", "-")

            # Upsert: update if slug exists, otherwise create
            existing = db.query(Portfolio).filter(Portfolio.slug == new_slug).first()
            if existing:
                existing.resume_data = result.data.model_dump()
                existing.created_at = datetime.datetime.utcnow()
                db.commit()
            else:
                db.add(Portfolio(
                    slug=new_slug,
                    resume_data=result.data.model_dump(),
                    is_paid=False,
                ))
                db.commit()

        return result

    except Exception as e:
        return ResumeRepsonse(success=False, error=f"Server error: {str(e)}")

    finally:
        if temp_path.exists():
            os.remove(temp_path)


@app.delete("/cleanup")
def cleanup_old_data(db: Session = Depends(get_db)):
    """Delete unpaid portfolios older than 2 hours. Call manually or via cron."""
    two_hours_ago = datetime.datetime.utcnow() - datetime.timedelta(hours=2)
    deleted_count = db.query(Portfolio).filter(
        Portfolio.created_at < two_hours_ago,
        Portfolio.is_paid == False,
    ).delete()
    db.commit()
    return {"message": f"Cleaned up {deleted_count} expired records"}


@app.get("/admin/stats", dependencies=[Depends(verify_admin)])
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_portfolios = db.query(Portfolio).count()
    revenue = db.query(Portfolio).filter(Portfolio.is_paid == True).count() * 20
    return {
        "users": total_users,
        "portfolios": total_portfolios,
        "revenue_inr": revenue,
    }


@app.delete("/admin/purge", dependencies=[Depends(verify_admin)])
def purge_all_data(db: Session = Depends(get_db)):
    """Hard-delete ALL portfolios and users from the database. Irreversible."""
    portfolios_deleted = db.query(Portfolio).delete()
    users_deleted = db.query(User).delete()
    db.commit()
    return {
        "message": "All data purged successfully.",
        "portfolios_deleted": portfolios_deleted,
        "users_deleted": users_deleted,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
