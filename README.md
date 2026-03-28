# ReLak — AI-Driven Architectural Resume Refactor

> Upload a PDF resume → AI extracts, improves, and verifies the content → choose a style → pay ₹20 → download.
> Built with Gemini 2.5 Flash, FastAPI, React 19, and Neon PostgreSQL.

---

## Stack

| Layer      | Technology                                                        |
|------------|-------------------------------------------------------------------|
| Frontend   | React 19 + Vite 8, react-router-dom v7, plain CSS, lucide-react  |
| PDF Export | html2canvas + jsPDF (JPEG 82% quality, compress: true, < 2MB)    |
| Backend    | FastAPI 0.135, Uvicorn, SQLAlchemy 2.0, Pydantic v2              |
| AI Engine  | Google Gemini 2.5 Flash — structured JSON output, two-pass prompt |
| Database   | Neon PostgreSQL (serverless, pooled via psycopg2)                 |
| Parser     | pymupdf4llm — PDF/DOCX → Markdown                                |
| Payment    | Razorpay (demo mode — no real charges)                           |

---

## Project Structure

```
ReLak/
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                    # Entry — HashRouter wraps App
│       ├── App.jsx                     # Route definitions + wake-up ping + beforeunload guard
│       ├── index.css                   # Full design system (no Tailwind)
│       ├── App.css
│       ├── pages/
│       │   ├── ResultPage.jsx          # Style picker, blurred preview, payment gate
│       │   └── AdminLogin.jsx          # Secret admin panel with DB purge
│       ├── components/
│       │   ├── Navbar.jsx              # Fixed nav with live server status
│       │   ├── UploadZone.jsx          # Drag-and-drop file selector (no auto-upload)
│       │   ├── ProcessingOverlay.jsx   # Full-screen 7-step AI progress animation
│       │   ├── StyleSelector.jsx       # 3-style card picker
│       │   ├── BlueprintPreview.jsx    # Style 2 — architectural grid layout
│       │   ├── ATSPreview.jsx          # Style 1 — single-column, parser-safe
│       │   ├── ClassicPreview.jsx      # Style 3 — A4 two-column serif, max 2 pages
│       │   ├── LucideIcon.jsx          # Dynamic icon resolver (name → Lucide component)
│       │   └── PaymentModal.jsx        # Razorpay demo payment flow
│       └── utils/
│           ├── downloadPdf.js          # html2canvas → jsPDF multi-page export
│           └── sampleData.js           # Fallback resume shown before upload
│
└── server/
    ├── temp_uploads/                   # Ephemeral upload staging (auto-cleaned)
    └── app/
        ├── __init__.py
        ├── .env                        # API keys (not committed)
        ├── main.py                     # FastAPI app — all routes
        ├── engine.py                   # Gemini two-pass extraction + improvement
        ├── schemas.py                  # Pydantic v2 models
        ├── models.py                   # SQLAlchemy ORM (User, Portfolio)
        └── database.py                 # Neon connection + session factory
```

---

## Running Locally

### Backend

```bash
cd server
./rel/bin/uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and expects the backend at `http://localhost:8000`.

---

## Environment Variables

`server/app/.env`:

```env
GEMINI_API_KEY   = your_gemini_api_key
NEON_URL         = postgresql://user:pass@host/db?sslmode=require
ADMIN_SECRET_KEY = your_secret_admin_key
```

---

## User Flow

```
/ (Hero page)
  └─ Drop PDF into upload zone
  └─ Click "Analyze & Build"
       └─ ProcessingOverlay appears (full-screen, 7-step animation)
       └─ POST /upload → Gemini two-pass extraction
       └─ Navigate to /result

/result (Result page)
  └─ Style selector (ATS / Blueprint / Classic) — switch freely
  └─ Preview blurred with "Unlock for ₹20" overlay
  └─ Click unlock → PaymentModal (Razorpay demo)
  └─ Payment success → blur lifts, Download PDF enabled
  └─ PDF exported via html2canvas + jsPDF (< 2MB)

/#/home/admins-login (Admin panel — secret URL)
  └─ Enter admin key → GET /admin/stats
  └─ View metrics dashboard
  └─ Danger Zone: type CONFIRM → DELETE /admin/purge
```

---

## Pages

### `/` — Hero / Upload

- Drafting-grid background with blueprint blue CSS lines
- Server status badge (checking → warming → online) with retry ping every 5s, up to 6 attempts
- Drag-and-drop upload zone with architectural corner marks and blueprint decoration
- "Analyze & Build" button is disabled until a file is selected — does not open a file picker
- `beforeunload` browser warning fires if the user tries to close the tab while resume data is in memory

### `/result` — Result Page

- Shows the AI-generated resume (or `sampleData.js` if navigated to directly)
- Style selector with 3 cards — switching is instant, no re-upload needed
- Preview is blurred at 7px until payment is completed
- Unlock overlay card sits above the blur with a single CTA
- After payment: blur lifts with a CSS transition, download button activates

### `/#/home/admins-login` — Admin Panel

- Dark navy theme matching the blueprint aesthetic
- Password field with show/hide toggle
- Authenticates via `GET /admin/stats` with `X-Admin-Key` header
- Dashboard shows: Total Users, Portfolios Built, Revenue (₹), Paid Builds
- Danger Zone: "Purge All Data" requires typing `CONFIRM` in a text field before the button activates
- Purge calls `DELETE /admin/purge`, shows deleted counts, auto-refreshes stats

---

## API Reference

### `GET /health`

Returns engine status. Used by the frontend wake-up routine.

```json
{ "status": "online", "message": "Engine is warmed-up" }
```

---

### `POST /upload`

Accepts `multipart/form-data` with a `file` field (PDF or DOCX, max 2MB).

**Processing pipeline:**
1. Save to `temp_uploads/`
2. Convert to Markdown via `pymupdf4llm`
3. Send to Gemini 2.5 Flash with two-pass prompt
4. Upsert result into `portfolios` table by slug (no `UniqueViolation` on re-upload)
5. Delete temp file
6. Return `ResumeResponse`

**Response schema:**
```json
{
  "success": true,
  "data": {
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "address": "string | null",
    "photo_url": "string | null",
    "summary": "string",
    "skills": ["string"],
    "experience": [
      {
        "company": "string",
        "role": "string",
        "duration": "string",
        "highlights": ["string"]
      }
    ],
    "projects": [
      {
        "title": "string",
        "description": "string",
        "technologies": ["string"]
      }
    ],
    "education": [
      {
        "institution": "string",
        "degree": "string",
        "year": "string"
      }
    ],
    "tech_stack_icons": ["string"],
    "style_id": 2
  }
}
```

---

### `DELETE /cleanup`

Deletes all unpaid portfolios older than 2 hours. No auth required. Call manually or via cron.

```bash
curl -X DELETE http://localhost:8000/cleanup
```

---

### `GET /admin/stats` — protected

Requires `X-Admin-Key` header matching `ADMIN_SECRET_KEY` in `.env`.

```bash
curl -H "X-Admin-Key: your_key" http://localhost:8000/admin/stats
```

```json
{ "users": 12, "portfolios": 34, "revenue_inr": 200 }
```

---

### `DELETE /admin/purge` — protected

Hard-deletes all rows from `portfolios` and `users` tables. Irreversible.

```bash
curl -X DELETE -H "X-Admin-Key: your_key" http://localhost:8000/admin/purge
```

```json
{
  "message": "All data purged successfully.",
  "portfolios_deleted": 34,
  "users_deleted": 12
}
```

---

## Resume Styles

| ID | Name      | Layout                  | Typography              | Use case                          |
|----|-----------|-------------------------|-------------------------|-----------------------------------|
| 1  | ATS       | Single-column           | Inter, black on white   | Job portals, ATS scanners         |
| 2  | Blueprint | Grid + two-column       | Space Grotesk + JetBrains Mono | Portfolios, tech roles   |
| 3  | Classic   | A4 two-column, sidebar  | Georgia serif           | Formal applications, banking      |

All 3 styles are unlocked with a single ₹20 payment per resume generation. Switching styles is free — the charge is per build, not per style.

Classic style renders at exactly 794px (A4 width at 96dpi) and is capped at 2 pages via `overflow: hidden`. Photo is only shown if `photo_url` is non-null in the parsed data.

---

## AI Engine — Anti-Hallucination Design

The Gemini prompt enforces a strict two-pass approach:

**Pass 1 — Extract only**
Read the resume markdown. Pull raw facts verbatim. No inference, no invention.

**Pass 2 — Improve + self-check**
Rewrite bullets as `Action Verb + Task + Result`. Before finalising each field, the model is instructed to ask: *"Did the resume actually say this? If not, revert."*

Rules enforced via both the prompt and Pydantic field descriptions:
- Metrics (%, ₹, time saved) are never added unless present in the source
- `phone` and `address` are copied verbatim or set to `null`
- `photo_url` is only populated if an image is embedded in the document
- Experience highlights capped at 4 per role
- Summary capped at 3–4 sentences, facts-only

---

## PDF Size Optimisation

Target: **< 2MB**

| Technique                    | Effect                                        |
|------------------------------|-----------------------------------------------|
| `scale: 1.5` (not 2)         | ~44% fewer pixels vs 2× scale                |
| JPEG at 82% quality          | ~70% smaller than PNG for equivalent quality  |
| `compress: true` on jsPDF    | zlib-compresses the internal PDF stream       |
| `scrollWidth/scrollHeight`   | Renders at natural element size, no stretching|
| Multi-page slicing           | Splits tall content across A4 pages cleanly   |

---

## Database Schema

```sql
-- users
id          UUID PRIMARY KEY
email       TEXT UNIQUE NOT NULL
created_at  TIMESTAMP DEFAULT now()

-- portfolios
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id)
slug        TEXT UNIQUE NOT NULL        -- e.g. "madhan-kumar"
resume_data JSONB NOT NULL              -- full PortfolioData as JSON
is_paid     BOOLEAN DEFAULT false
created_at  TIMESTAMP DEFAULT now()
```

Upsert logic: on `/upload`, if a portfolio with the same slug already exists it is updated in-place (`resume_data` overwritten, `created_at` reset). No `UniqueViolation` on re-upload of the same person's resume.

---

## Payment — Demo Mode

The Razorpay integration is currently in demo mode. The `PaymentModal` simulates the full UX:

1. Confirm screen — shows what's included, ₹20 price, clarifies it's per generation not per style
2. Processing screen — 2s spinner simulating gateway connection
3. Success screen — green checkmark, blur lifts on the preview

To go live: replace the `setTimeout` block in `PaymentModal.jsx` with the actual Razorpay `checkout.js` SDK call and pass a real `order_id` from your backend.

---

## Design System

All styles live in `frontend/src/index.css` — no Tailwind, no CSS-in-JS framework.

| Token          | Value                                      |
|----------------|--------------------------------------------|
| Primary        | `#001e40` (Blueprint Navy)                 |
| Primary container | `#003366` (Blueprint Blue)              |
| Surface        | `#f9f9f9`                                  |
| Secondary      | `#006e2f` (Technical Green — success only) |
| Outline        | `#737780`                                  |
| Font headline  | Space Grotesk                              |
| Font mono      | JetBrains Mono (all labels, system output) |
| Font body      | Inter                                      |
| Grid           | 24px CSS linear-gradient lines at 5% opacity |
| Border radius  | 2px max — no pill shapes                   |

---

## Known Limitations

- Scanned image PDFs (no text layer) return an error — use a text-based PDF
- `photo_url` extraction depends on pymupdf4llm embedding the image; not all PDF generators include extractable images
- The 2-page cap on Classic style clips content in the preview — the full JSON data is still intact
- Resume data lives in React state only — refreshing the page clears it (browser warns via `beforeunload`)
- Admin panel has no session persistence — re-enter the key after a page refresh
