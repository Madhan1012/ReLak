# ReLak — AI-Driven Architectural Resume Refactor

> Upload a PDF → AI extracts, improves, and verifies → choose a style → edit inline → pay ₹20 → download.

**Stack:** Gemini 2.5 Flash · FastAPI · React 19 · Neon PostgreSQL · slowapi · APScheduler

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Local Development](#local-development)
5. [Environment Variables](#environment-variables)
6. [API Reference](#api-reference)
7. [Frontend Routes](#frontend-routes)
8. [User Flow](#user-flow)
9. [AI Engine](#ai-engine)
10. [Security Architecture](#security-architecture)
11. [Data Privacy & Retention](#data-privacy--retention)
12. [Resume Styles](#resume-styles)
13. [PDF Export](#pdf-export)
14. [Inline Editing](#inline-editing)
15. [Admin Panel](#admin-panel)
16. [Request Queue](#request-queue)
17. [Database Schema](#database-schema)
18. [Deployment](#deployment)
19. [Deployment Readiness Checklist](#deployment-readiness-checklist)
20. [Known Issues & Roadmap](#known-issues--roadmap)

---

## Overview

ReLak is a zero-touch resume refactor tool. Users upload a PDF or DOCX resume, optionally provide a job description, and the AI engine extracts, improves, and verifies the content using a two-pass anti-hallucination prompt with JSON recovery. The result is rendered in one of three professional styles, tailored to the job description if provided. A ₹20 one-time payment unlocks all styles, inline editing, and unlimited PDF downloads.

The service is designed for minimal data retention: uploaded files are deleted within seconds, and unpaid resume data is automatically purged from the database every 2 hours. Unique, unguessable slugs are generated for each portfolio to enhance security.

---

## Architecture

```
Browser (React 19 + Vite)
    │
    │  HTTPS / CORS-restricted
    ▼
FastAPI (Python 3.12)
    ├── slowapi rate limiter (5 req/min/IP on /upload)
    ├── asyncio.Semaphore queue (max 3 concurrent AI calls)
    ├── PDF sanitiser (malicious content scan + metadata scrubbing)
    ├── pymupdf4llm → Markdown extraction
    │       └── Vision fallback (pymupdf → base64 PNG) for scanned PDFs
    ├── Google Gemini 2.5 Flash (structured JSON output + recovery)
    └── Neon PostgreSQL (SQLAlchemy ORM)
            └── APScheduler auto-cleanup every 2 hours
```

---

## Project Structure

```
ReLak/
├── .gitignore                          # .env, node_modules, rel/, dist excluded
├── README.md
├── demo_docs/
│   ├── Resume.pdf                      # Text-based PDF test file
│   └── Resume1_DA_resume.pdf           # Image-only PDF — tests vision fallback
│
├── frontend/
│   ├── .env                            # VITE_API_BASE=http://localhost:8000
│   ├── .env.production                 # VITE_API_BASE=https://your-backend.railway.app
│   ├── index.html                      # CSP meta tag, security headers, page title
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── config.js                   # Central config (API_BASE, PRICE_INR)
│       ├── main.jsx                    # Entry — ErrorBoundary + HashRouter + ThemeProvider
│       ├── App.jsx                     # Routes + wake-up ping + beforeunload guard
│       ├── index.css                   # Full design system with CSS vars + dark mode
│       ├── context/
│       │   └── ThemeContext.jsx        # Dark/light toggle, persisted to localStorage
│       ├── components/
│       │   ├── ErrorBoundary.jsx       # Class component — catches render crashes
│       │   ├── Navbar.jsx              # Logo → home, dark mode toggle
│       │   ├── UploadZone.jsx          # Drag-and-drop file selector (no auto-upload)
│       │   ├── ProcessingOverlay.jsx   # Full-screen 7-step AI progress animation
│       │   ├── StyleSelector.jsx       # 3-style card picker
│       │   ├── BlueprintPreview.jsx    # Style 2 — fully inline-editable
│       │   ├── ATSPreview.jsx          # Style 1 — single-column, parser-safe
│       │   ├── ClassicPreview.jsx      # Style 3 — A4 two-column serif, max 2 pages
│       │   ├── LucideIcon.jsx          # Dynamic icon resolver (name → Lucide component)
│       │   └── PaymentModal.jsx        # Razorpay demo flow (3-step UX simulation)
│       ├── pages/
│       │   ├── ResultPage.jsx          # Style picker, edit mode, blur gate, download
│       │   ├── BuildPage.jsx           # 5-step manual resume builder (no AI)
│       │   ├── AdminLogin.jsx          # Tabbed admin panel
│       │   └── ContentPage.jsx         # Privacy/Support/About renderer
│       └── utils/
│           ├── downloadPdf.js          # html2canvas → jsPDF multi-page export
│           ├── sampleData.js           # Fallback resume for demo/direct URL visits
│           └── contentStore.js         # localStorage-backed content for static pages
│
└── server/
    └── app/
        ├── .env                        # Secrets — never committed
        ├── main.py                     # FastAPI app — all routes, security middleware, unique slug generation
├── engine.py                   # Gemini two-pass extraction + vision fallback + JD tailoring + JSON recovery
├── schemas.py                  # Pydantic v2 models
├── models.py                   # SQLAlchemy ORM (User, Portfolio, Payment)
        ├── database.py                 # Neon connection + session factory
        └── security.py                 # PII masking, PDF sanitisation, CSP policy
```

---

## Local Development

### Backend

```bash
cd server
./rel/bin/uvicorn app.main:app --reload --port 8000
```

Requires `ADMIN_SECRET_KEY` to be set in `server/app/.env` — the server will refuse to start without it.

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

---

## Environment Variables

### `server/app/.env`

```env
GEMINI_API_KEY          = your_gemini_api_key
NEON_URL                = postgresql://user:pass@host/db?sslmode=require
ADMIN_SECRET_KEY        = your_strong_random_secret   # REQUIRED — server won't start without it
ALLOWED_ORIGINS         = https://your-app.vercel.app,http://localhost:5173
MAX_CONCURRENT_JOBS     = 3          # Max simultaneous Gemini API calls
ENV                     = production # Hides /docs, enables HSTS + CSP headers
PORT                    = 8000
WORKERS                 = 1
LOG_LEVEL               = info
```

### `frontend/.env` (local)

```env
VITE_API_BASE = http://localhost:8000
```

### `frontend/.env.production`

```env
VITE_API_BASE = https://your-backend.railway.app
```

---

## API Reference

All endpoints return JSON. Admin endpoints return **404** (not 401) on missing/invalid key to prevent endpoint discovery.

### Public

| Method | Path | Rate limit | Description |
|--------|------|-----------|-------------|
| GET | `/health` | — | Wake-up check. Returns `{"status":"online"}` |
| POST | `/upload` | 5/min/IP | Parse resume. Accepts `multipart/form-data` with `file` field |

#### `POST /upload` — Request

```
Content-Type: multipart/form-data
file: <PDF or DOCX, max 2MB>
job_description: <Optional: Text of job description for tailoring>
```

#### `POST /upload` — Response

```json
{
  "success": true,
  "data": {
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "address": "string | null",
    "linkedin": "string | null",
    "github": "string | null",
    "summary": "string",
    "technical_skills": ["string"],
    "soft_skills": ["string"],
    "experience": [
      { "company": "string", "role": "string", "duration": "string", "highlights": ["string"] }
    ],
    "projects": [
      { "title": "string", "description": "string", "technologies": ["string"], "link": "string | null" }
    ],
    "education": [
      { "institution": "string", "degree": "string", "year": "string", "gpa": "string | null" }
    ]
  }
}
```

#### Error responses

| Status | Meaning |
|--------|---------|
| 413 | File exceeds 2MB |
| 415 | Not a PDF or DOCX |
| 422 | File failed security scan (malicious content detected) |
| 429 | Rate limit exceeded (5/min/IP) |

### Admin (require `X-Admin-Key` header)

| Method | Path | Description |
|--------|------|-------------|
| DELETE | `/cleanup` | Delete unpaid portfolios >2h old + temp files |
| GET | `/admin/stats` | Platform metrics |
| GET | `/admin/portfolios` | All portfolios with full resume_data |
| GET | `/admin/users` | All users |
| PATCH | `/admin/portfolios/{pid}/mark-paid` | Mark as paid |
| DELETE | `/admin/portfolios/{pid}` | Delete one portfolio |
| DELETE | `/admin/users/{uid}` | Delete user + their portfolios |
| DELETE | `/admin/purge` | Hard-delete everything |

```bash
# Example
curl -H "X-Admin-Key: your_key" https://your-backend.railway.app/admin/stats
```

---

## Frontend Routes

Uses `HashRouter` — no server-side routing config needed.

| Hash path | Page |
|-----------|------|
| `/#/` | Hero — upload or build from scratch |
| `/#/result` | Result — style picker, edit, payment, download |
| `/#/build` | 5-step manual resume builder (no AI) |
| `/#/privacy` | Privacy Policy & Terms of Service |
| `/#/support` | Support & FAQ |
| `/#/about` | About ReLak |
| `/#/home/admins-login` | Admin panel (secret URL) |

---

## User Flow

```
/ (Hero)
  ├─ Drop PDF into upload zone
  ├─ Click "Analyze & Build"
  │    └─ ProcessingOverlay (7-step animation while AI runs)
  │    └─ POST /upload → Gemini two-pass → navigate to /result
  └─ "Build from Scratch" → /build (5-step form, zero AI calls) → /result

/result
  ├─ StyleSelector — ATS / Blueprint / Classic (switch freely, no re-upload)
  ├─ Preview blurred at 7px until payment
  ├─ Link quality notices:
  │    ├─ "Links found — use Edit mode to correct any errors"
  │    └─ "No links found — add them in Edit mode"
  ├─ "Unlock for ₹20" → PaymentModal → blur lifts
  ├─ Edit toggle (Blueprint style only, after payment)
  │    ├─ contentEditable on every text field
  │    ├─ Add/remove experience, projects, education entries
  │    ├─ Inline skill chip editing
  │    └─ [LINK] badge editing for projects, LinkedIn, GitHub
  └─ "Download PDF" → html2canvas → jsPDF (< 2MB)

/#/home/admins-login
  ├─ Enter X-Admin-Key → GET /admin/stats
  ├─ Overview — metrics (users, portfolios, revenue)
  ├─ Portfolios — list, view JSON, mark paid, delete
  ├─ Users — list, delete
  ├─ Pages — edit Privacy/Terms, Support, About content
  └─ Danger Zone — type CONFIRM → DELETE /admin/purge
```

---

## AI Engine

### Two-Pass Anti-Hallucination Prompt

**Pass 1 — Extract only**
Read the resume. Pull raw facts verbatim. No inference, no invention. Apply OCR corrections (`FASTAPE → FastAPI`, `2925 → 2025`, etc.). Copy email and dates exactly as written.

**Pass 2 — Improve + self-check + JD Tailoring**
If a `job_description` is provided:
- TAILOR the summary to highlight skills matching the JD.
- TAILOR experience bullets to emphasize relevant accomplishments.
- Re-order technical skills to put JD-required skills first.
- Ensure the tone matches the industry in the JD.

Rewrite bullets as `Action Verb + Task + Result`. Before finalising each field: *"Did the resume actually say this? If not, revert."* Deduplicate skills. Clean artifact strings (`\n`, `\r`, CSV fragments).

### JSON Recovery

If the initial structured JSON output from Gemini is malformed or incomplete, a second attempt is made. The raw output is fed back to Gemini with a specific recovery prompt and the Pydantic schema, instructing it to fix the JSON structure. This significantly reduces "hallucinations" and ensures valid data.

### Vision Fallback

If `pymupdf4llm` returns only image placeholders (scanned/image-only PDFs), each page is rendered to PNG at 150dpi via `pymupdf` and sent to Gemini as a multimodal prompt. Tested and confirmed working on image-only PDFs.

### Link Extraction

PDF hyperlink annotations are extracted directly from the PDF's link table (not from text or vision) before the AI call. They are injected into the prompt as a labelled list. Google Drive links are explicitly excluded from project link matching. A keyword-scoring fallback runs post-AI to catch any unmatched projects.

### OCR Corrections Applied

| Garbled | Corrected |
|---------|-----------|
| FASTAPE, FastApe, PASTARI | FastAPI |
| Owen/Qwen/0wen + version | Qwen \<version\> |
| Lang Chain | LangChain |
| Spring boot | Spring Boot |
| Year typos (2925) | 2025 |

---

## Security Architecture

### Backend

| Layer | Implementation |
|-------|---------------|
| Rate limiting | slowapi — 5 uploads/min/IP |
| Request queue | asyncio.Semaphore — max 3 concurrent AI calls |
| CORS | Explicit origin whitelist from `ALLOWED_ORIGINS` env var. No wildcard. |
| Admin auth | `X-Admin-Key` header. Returns **404** (not 401) on failure — hides endpoint existence |
| PDF sanitisation | Scans first 512KB for `/JavaScript`, `/Launch`, `/EmbeddedFile`, `/OpenAction`, `eval(`, `<script`. **Metadata scrubbing** (removes author, producer, etc.) |
| Filename sanitisation | Path traversal stripped, non-alphanumeric chars removed |
| PII masking | Emails and phone numbers masked in all log output |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy` |
| HSTS + CSP | Applied in production (`ENV=production`) |
| Secrets | All from env vars. `ADMIN_SECRET_KEY` is required — server refuses to start without it |
| Docs | `/docs` hidden in production. `/redoc` always hidden |
| DB queries | SQLAlchemy ORM only — no raw SQL, no injection surface |
| Unique Slugs | Randomly generated hex suffix to prevent guessing/overwriting |

### Frontend

| Layer | Implementation |
|-------|---------------|
| CSP | Meta tag in `index.html` — restricts scripts, styles, connections |
| `X-Content-Type-Options` | Meta tag |
| `X-Frame-Options: DENY` | Meta tag |
| Error boundary | `ErrorBoundary` class component wraps entire app |
| No localStorage secrets | Admin key is session-only (React state), never persisted |
| `beforeunload` guard | Warns user before closing tab with unsaved resume data |

---

## Data Privacy & Retention

| Data | Retention |
|------|-----------|
| Uploaded PDF/DOCX | Deleted immediately after AI parsing (~30 seconds) |
| Unpaid resume data | Auto-deleted every 2 hours by scheduled cleanup |
| Paid resume data | Retained until manual deletion request |
| Temp files | Deleted on server restart and by `/cleanup` |
| Server logs | PII (email, phone) masked before writing |
| Payment data | Never stored — handled entirely by Razorpay |

The 2-hour cleanup runs as an `APScheduler` job inside the FastAPI lifespan. It also runs on every `/cleanup` call (admin-only). Additionally, if total portfolio count reaches 40, the 20 oldest unpaid records are deleted automatically on each upload.

---

## Resume Styles

| ID | Name | Layout | Typography | Best for |
|----|------|--------|------------|----------|
| 1 | ATS Friendly | Single-column | Inter, black on white | Job portals, ATS scanners |
| 2 | Blueprint | Grid + sections | Space Grotesk + JetBrains Mono | Tech portfolios |
| 3 | Classic | A4 two-column, navy sidebar | Georgia serif | Formal applications |

All 3 styles are unlocked with one ₹20 payment per resume generation. Switching styles is free. The ₹20 is per generation, not per style.

---

## PDF Export

Target: **< 2MB**

| Technique | Effect |
|-----------|--------|
| `scale: 1.5` (not 2) | ~44% fewer pixels vs 2× |
| JPEG at 82% quality | ~70% smaller than PNG |
| `compress: true` on jsPDF | zlib-compresses the PDF stream |
| `scrollWidth/scrollHeight` | Renders at natural element size |
| Multi-page slicing | Splits tall content across A4 pages |

Links in the PDF are rendered as visible `[LINK] github.com/...` text badges — not invisible `<a>` tags that disappear in screenshots.

---

## Inline Editing

After payment, an Edit/Preview toggle appears (Blueprint style only). In edit mode:

- Every text field is `contentEditable` — click to edit
- Skills chips have inline inputs with add/remove buttons
- Experience, project, and education entries can be added or deleted
- Contact fields (phone, address, LinkedIn, GitHub) are editable even if empty
- Duration and year fields are editable
- Project `[LINK]` badges become editable inputs
- All changes are reflected in the downloaded PDF

---

## Admin Panel

Access at `/#/home/admins-login`. Enter the `ADMIN_SECRET_KEY` value.

| Tab | Features |
|-----|---------|
| Overview | Users, portfolios, paid builds, revenue |
| Portfolios | List all, view full JSON, mark paid, delete individual |
| Users | List all, delete (cascades to portfolios) |
| Pages | Edit Privacy/Terms, Support, About content (saved to localStorage) |
| Danger Zone | Type CONFIRM → purge entire database |

---

## Request Queue

Multiple simultaneous uploads are handled via `asyncio.Semaphore(MAX_CONCURRENT_JOBS)`. Requests beyond the limit wait in queue rather than failing. Default is 3 concurrent AI calls. Tune via `MAX_CONCURRENT_JOBS` env var.

---

## Database Schema

```sql
-- users
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
email       TEXT UNIQUE NOT NULL
created_at  TIMESTAMP DEFAULT now()

-- portfolios
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID REFERENCES users(id)
slug        TEXT UNIQUE NOT NULL        -- e.g. "madhan-kumar-a1b2c3"
resume_data JSONB NOT NULL              -- full PortfolioData as JSON
file_hash   TEXT UNIQUE                 -- SHA256 hash of file + JD for deduplication
is_paid     BOOLEAN DEFAULT false
created_at  TIMESTAMP DEFAULT now()

-- payments
id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
portfolio_id UUID REFERENCES portfolios(id)
order_id     TEXT UNIQUE                -- Razorpay order_id
payment_id   TEXT UNIQUE                -- Razorpay payment_id
status       TEXT DEFAULT 'pending'     -- pending | paid | failed
amount       TEXT DEFAULT '2000'        -- in paise (₹20)
created_at   TIMESTAMP DEFAULT now()
```

All queries use SQLAlchemy ORM — no raw SQL anywhere in the codebase.

---

## Deployment

### Backend — Railway / Render

1. Set all env vars in the platform dashboard (see [Environment Variables](#environment-variables))
2. Set `ALLOWED_ORIGINS` to your Vercel frontend URL
3. Set `ENV=production`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. The server will refuse to start if `ADMIN_SECRET_KEY` is not set

### Frontend — Vercel

1. Set `VITE_API_BASE` to your Railway/Render backend URL
2. Build command: `npm run build`
3. Output directory: `dist`
4. No server-side routing config needed (HashRouter)

---

## Deployment Readiness Checklist

### ✅ Ready

- [x] All secrets from environment variables — no hardcoded credentials
- [x] `ADMIN_SECRET_KEY` required at startup — server refuses to start without it
- [x] CORS restricted to explicit origin whitelist (no wildcard)
- [x] Rate limiting on `/upload` (5/min/IP via slowapi)
- [x] Request queue prevents Gemini API overload (asyncio.Semaphore)
- [x] PDF sanitisation — malicious content scan + metadata scrubbing
- [x] Filename sanitisation — path traversal prevention
- [x] PII masking in all server logs
- [x] Security headers on all responses (X-Frame-Options, X-Content-Type-Options, etc.)
- [x] HSTS + CSP in production mode
- [x] Admin endpoints return 404 on bad key (not 401)
- [x] `/docs` hidden in production
- [x] SQLAlchemy ORM only — no raw SQL
- [x] Auto-cleanup every 2 hours (APScheduler)
- [x] Temp files deleted immediately after processing
- [x] Error boundary in React — no blank-screen crashes
- [x] `beforeunload` warning for unsaved data
- [x] Dark mode, responsive layout
- [x] PDF < 2MB (JPEG compression + scale 1.5)
- [x] Vision fallback for scanned/image-only PDFs
- [x] `.env` in `.gitignore`
- [x] Unique, unguessable slugs for portfolios
- [x] File hashing for deduplication (including JD for tailored versions)
- [x] JSON recovery for AI output

### ⚠️ Before Going Live

| Item | Status | Action required |
|------|--------|----------------|
| Razorpay integration | Demo only | Replace `setTimeout` in `PaymentModal.jsx` with real Razorpay `checkout.js` SDK. Add a `/payment/verify` backend endpoint that validates the Razorpay signature before marking `is_paid=True` in the DB. |
| `ADMIN_SECRET_KEY` strength | Weak default | Set a cryptographically random 32+ character key in production |
| `ALLOWED_ORIGINS` | Localhost default | Set to your exact Vercel URL before deploying |
| Content pages | localStorage only | Privacy/Terms/Support/About content is stored in the browser. If you edit it in the admin panel on one device, it won't reflect on other users' browsers. Move to a DB-backed endpoint for production. |
| Neon DB credentials | Exposed in `.env` | Rotate the Neon credentials shown in this repo's history. Generate new ones from the Neon dashboard. |
| Gemini API key | Exposed in `.env` | Rotate the Gemini API key from Google AI Studio. |
| `ENV=production` | Not set | Set `ENV=production` on your deployment platform to enable HSTS, CSP, and hide `/docs` |
| `MAX_CONCURRENT_JOBS` | Default 3 | Adjust based on expected load and Gemini API quotas. |

### 🔴 Not Blocking But Should Fix Soon

| Item | Notes |
|------|-------|
| Razorpay webhook verification | Payment unlock is currently client-side (`isPaid` state). A determined user could bypass it in the browser console. The fix: create a `/payment/verify` endpoint, verify the Razorpay signature server-side, then return a signed token that the frontend uses to unlock. |
| Admin session expiry | Fixed |
| ATS + Classic styles not editable | Fixed |
| Content pages in localStorage | Fixed |
| No email on payment | Add a Razorpay webhook → send download confirmation email. |
| `ResumeRepsonse` typo | Fixed |
| No retry on failed upload | Fixed |

---

## Known Issues & Roadmap

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Razorpay is demo-only | Real SDK + server-side signature verification |
| HIGH | Rotate exposed API keys | Neon + Gemini keys visible in git history |
| MEDIUM | Client-side payment gate | Move `isPaid` to server-verified token |
| MEDIUM | Content pages in localStorage | DB-backed `/content` endpoint |
| MEDIUM | Admin session has no expiry | Add 30-min timeout |
| LOW | ATS/Classic not editable | Extend inline editing to all styles |
| LOW | `ResumeRepsonse` typo | Rename to `ResumeResponse` |
| LOW | No upload retry | Exponential backoff |
| LOW | No ARIA labels on icon buttons | Accessibility pass |
