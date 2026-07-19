/**
 * Content store for Privacy/Terms, Support, About pages.
 * Primary source: GET /content/:key from the backend (DB-backed, all users see same content).
 * Fallback: localStorage cache, then hardcoded defaults.
 * Admin writes via PUT /content/:key (requires X-Admin-Key header).
 */
import { API_BASE } from '../config';

const CACHE_KEY = 'relak-content-cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const CONTENT_DEFAULTS = {
  privacy: {
    title: 'Privacy & Terms',
    body: `## Privacy Policy

**Last updated: March 2026**

ReLak ("we", "our", "the service") is committed to handling your personal data with transparency and minimal retention. This policy explains exactly what we collect, how long we keep it, and what rights you have.

---

## 1. What We Collect

When you upload a resume, we extract and temporarily store the following structured data:

- **Name** — as written in your resume
- **Email address** — as written in your resume
- **Phone number** — if present in your resume
- **Location / address** — if present in your resume
- **Professional summary, skills, experience, projects, education** — extracted and AI-improved from your resume

We do **not** collect:
- The original PDF or DOCX file (deleted immediately after parsing — see Section 3)
- Passwords or account credentials (we have no login system)
- Payment card details (handled entirely by Razorpay — we never see your card)
- Browser cookies, tracking pixels, or analytics identifiers
- IP addresses in our database (only used transiently for rate limiting)

---

## 2. How Your Data Is Used

Your resume data is used for one purpose only: generating a formatted PDF resume for you to download. It is:

- Sent to Google Gemini 2.5 Flash for AI extraction and improvement
- Stored temporarily in our Neon PostgreSQL database under a slug (e.g. "your-name")
- Rendered into your chosen resume style in the browser
- Never sold, shared, or used for advertising

---

## 3. Data Retention — The 2-Hour Rule

**Your data is automatically deleted within 2 hours of upload** unless you have completed a payment.

Specifically:
- **Uploaded file (PDF/DOCX):** Deleted from our server immediately after the AI finishes parsing — typically within 30 seconds of upload.
- **Parsed resume data (unpaid):** Automatically purged from the database every 2 hours by our scheduled cleanup job. This runs continuously.
- **Parsed resume data (paid):** Retained until you request deletion or we perform a manual purge. Paid records are never auto-deleted.
- **Temp files:** Any residual files in our upload staging directory are deleted on server restart and by the cleanup routine.

If you want your data deleted immediately, email us at smk060506@gmail.com with your name and we will manually remove it within 24 hours.

---

## 4. Third-Party Services

| Service | Purpose | Their Privacy Policy |
|---------|---------|---------------------|
| Google Gemini API | AI resume extraction | https://policies.google.com/privacy |
| Neon PostgreSQL | Database hosting | https://neon.tech/privacy |
| Razorpay | Payment processing | https://razorpay.com/privacy |

We do not use Google Analytics, Facebook Pixel, or any advertising networks.

---

## 5. Security

We implement the following technical safeguards:

- **HTTPS only** in production (HSTS enforced)
- **PDF sanitisation** — uploaded files are scanned for malicious content before processing
- **PII masking** — email addresses and phone numbers are masked in all server logs
- **Rate limiting** — upload endpoint is limited to 5 requests per minute per IP
- **No wildcard CORS** — only our specific frontend domain is allowed to call the API
- **Admin endpoints return 404** to unauthenticated requests to prevent endpoint discovery
- **Content Security Policy** headers on all responses

---

## 6. Your Rights

You have the right to:
- **Access** the data we hold about you
- **Delete** your data at any time (email smk060506@gmail.com)
- **Correct** any inaccurate data (use the inline editor before downloading)

Since we do not collect email addresses at registration (no accounts), deletion requests are handled by name + approximate upload time.

---

## Terms of Service

**Last updated: March 2026**

By using ReLak, you agree to the following terms.

### Acceptable Use

You may only upload resumes that you own or have the right to process. You may not:
- Upload files containing malware, scripts, or executable content
- Attempt to reverse-engineer, scrape, or abuse the API
- Use the service for any unlawful purpose

### Payment Terms

- The ₹25 charge is a **one-time fee per resume generation**, not per style
- All 3 resume styles (ATS, Blueprint, Classic) are included in a single payment
- Switching between styles after payment is free and unlimited
- Re-uploading a new or updated resume requires a new ₹25 payment
- **Refunds:** Due to the digital and immediate nature of the service, refunds are not available once the resume has been generated and the download has been made available. If you experience a technical failure that prevents download, contact us within 24 hours.

### Disclaimer

ReLak is provided "as is" without warranty of any kind. The AI-generated content is a starting point for your resume — always review it carefully before submitting to employers. We make no guarantees about job outcomes, interview success, or the accuracy of AI-generated text. You are responsible for verifying all content before use.

### Governing Law

These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Tamil Nadu, India.`,
  },
  support: {
    title: 'Support',
    body: `## Get Help

**Email:** smk060506@gmail.com

**Response time:** Within 24 hours on business days.

---

## Common Questions

**My PDF won't upload.**
Ensure the file is under 2MB and is a text-based PDF (not a scanned image). Scanned PDFs are supported via our vision engine but may take longer to process.

**The AI got something wrong.**
After generation, unlock your resume and use **Edit mode** to correct any field directly in the preview before downloading. Click any text to edit it inline.

**I paid but can't download.**
Refresh the page and try again. If the issue persists, email us with your transaction ID from Razorpay.

**Can I regenerate for free?**
No — each generation costs ₹25. Switching between the 3 styles is free within the same generation.

**How long is my data kept?**
Unpaid resume data is automatically deleted within 2 hours of upload. Paid data is retained until you request deletion. Your original PDF is deleted immediately after parsing.

**I want my data deleted.**
Email smk060506@gmail.com with your name and approximate upload time. We will remove it within 24 hours.

**The links in my PDF are wrong.**
Use Edit mode (after unlocking) to correct project links directly in the preview. Google Drive links are automatically removed — only GitHub and demo URLs are kept.`,
  },
  about: {
    title: 'About ReLak',
    body: `## What is ReLak?

ReLak is an AI-driven resume refactor tool. Upload your existing PDF resume and our engine extracts, improves, and restructures it into a polished portfolio — in under 60 seconds.

## How it works

1. **Upload** your PDF or DOCX resume (max 2MB)
2. **AI Engine** runs a two-pass extraction: first pulling raw facts, then rewriting bullets with power-verbs while self-checking for hallucinations
3. **Choose a style** — ATS Friendly, Blueprint Aesthetic, or Classic Serif
4. **Edit** any field inline before downloading (after unlocking)
5. **Pay ₹25** to unlock all styles and download your PDF

## Why ₹25?

We believe professional resume help shouldn't cost thousands. ₹25 covers our AI API costs and keeps the service running. One payment unlocks all 3 styles for that resume.

## Data Privacy

Your uploaded file is deleted immediately after parsing. Unpaid resume data is automatically purged within 2 hours. We never sell your data or use it for advertising. See our Privacy Policy for full details.

## Built with

Gemini 2.5 Flash · FastAPI · React 19 · Neon PostgreSQL · Razorpay`,
  },
  refund: {
    title: 'Refund Policy',
    body: `## Refund Policy

**Last updated: March 2026**

---

## Automatic Refunds

Refunds for failed PDF generations are processed within 48 hours. If your generation fails due to a technical error, a refund is initiated automatically via the dashboard.

Contact smk060506@gmail.com with your Payment ID if you do not see the refund within 48 hours.

---

## Data Policy

User data (PDFs and PII) is automatically purged from our Neon DB 120 minutes after session creation.

Paid records are retained until you request deletion. Email smk060506@gmail.com with your name to request immediate deletion.

---

## Non-Refundable Cases

- Successful generation where you choose not to use the output
- Requests made more than 30 days after the transaction
- Issues caused by incorrect information you provided`,
  },
};

// ── Cache helpers ─────────────────────────────────────────────────────────────

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

function invalidateCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch {}
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch a single content page. Tries API first, falls back to cache, then defaults.
 */
export async function fetchContent(key) {
  try {
    const res = await fetch(`${API_BASE}/content/${key}`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      // If the server returned empty body, fall through to defaults
      if (data?.body) {
        const cached = readCache() || {};
        writeCache({ ...cached, [key]: data });
        return data;
      }
    }
  } catch { /* network error — fall through */ }

  // Try cache
  const cached = readCache();
  if (cached?.[key]) return cached[key];

  // Hardcoded default
  return CONTENT_DEFAULTS[key] || { title: key, body: '' };
}

/**
 * Save a content page via the admin API.
 * Invalidates the local cache so the next fetch gets fresh data.
 */
export async function saveContent(key, title, body, adminKey) {
  const res = await fetch(`${API_BASE}/content/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
    body: JSON.stringify({ title, body }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Save failed');
  }
  invalidateCache();
  return res.json();
}

// Legacy sync helpers (used by ContentPage before async fetch completes)
export function getContent() {
  const cached = readCache();
  return cached ? { ...CONTENT_DEFAULTS, ...cached } : CONTENT_DEFAULTS;
}
export function setContent() {} // no-op — use saveContent() instead
