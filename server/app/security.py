"""
Security utilities for ReLak:
- PII masking for logs
- PDF input sanitisation
- CSP header values
"""
import re
import logging
import pymupdf

log = logging.getLogger("relak.security")

# ── PII masking ───────────────────────────────────────────────────────────────

def mask_email(email: str) -> str:
    """user@example.com → u***@example.com"""
    if not email or "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    return f"{local[0]}***@{domain}"

def mask_phone(phone: str) -> str:
    """Keep last 4 digits only: +91 98765 43210 → +91 *** 3210"""
    if not phone:
        return "***"
    digits = re.sub(r"\D", "", phone)
    return f"***{digits[-4:]}" if len(digits) >= 4 else "***"

def mask_pii(text: str) -> str:
    """Mask emails and phone-like patterns in a log string."""
    # Mask emails
    text = re.sub(
        r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
        lambda m: mask_email(m.group()),
        text,
    )
    # Mask phone numbers (10+ digit sequences, optionally with +/spaces/dashes)
    text = re.sub(
        r"(\+?\d[\d\s\-]{8,}\d)",
        lambda m: mask_phone(m.group()),
        text,
    )
    return text


# ── PDF sanitisation ──────────────────────────────────────────────────────────

# Known-malicious PDF stream keywords
_DANGEROUS_PATTERNS = [
    b"/JavaScript",
    b"/JS ",
    b"/Launch",
    b"/EmbeddedFile",
    b"/AA ",          # Additional Actions
    b"/OpenAction",
    b"eval(",
    b"<script",
]

def sanitise_pdf(file_path: str) -> tuple[bool, str]:
    """
    Scan a PDF for dangerous embedded content and scrub metadata.
    Returns (is_safe, reason).
    MODIFIES the file in-place to remove metadata if safe.
    """
    try:
        # Read raw bytes for pattern scan
        with open(file_path, "rb") as f:
            raw = f.read(512 * 1024)  # scan first 512KB

        for pattern in _DANGEROUS_PATTERNS:
            if pattern.lower() in raw.lower():
                log.warning(f"Dangerous PDF pattern detected: {pattern}")
                return False, f"File contains disallowed content: {pattern.decode(errors='replace')}"

        # Verify it's a valid PDF that pymupdf can open
        doc = pymupdf.open(file_path)
        page_count = doc.page_count

        if page_count == 0:
            doc.close()
            return False, "PDF has no pages"
        if page_count > 10:
            doc.close()
            return False, f"PDF too long ({page_count} pages, max 10)"

        # ── Metadata Scrubbing ────────────────────────────────────────────────
        # Create a new document without metadata/sensitive info
        doc.set_metadata({})
        # Save to a memory buffer first, then overwrite the original file
        # (Direct save to same path requires incremental=True, which we don't want)
        buffer = doc.tobytes(garbage=3, deflate=True)
        doc.close()

        with open(file_path, "wb") as f:
            f.write(buffer)

        return True, "ok"

    except Exception as e:
        return False, f"Invalid or corrupt file: {e}"


# ── CSP header value ──────────────────────────────────────────────────────────

CSP_POLICY = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; "
    "font-src 'self' https://fonts.gstatic.com data:; "
    "img-src 'self' data: blob:; "
    "connect-src 'self' https://api.razorpay.com; "
    "frame-src 'none'; "
    "object-src 'none';"
)
