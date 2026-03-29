# ReLak — AI-Driven Architectural Resume Refactor

> Upload a PDF → AI extracts, improves, and verifies → choose a style → edit inline → pay ₹20 → download.
> Gemini 2.5 Flash · FastAPI · React 19 · Neon PostgreSQL · Dark Mode · Request Queue

---

## Stack

| Layer      | Technology                                                          |
|------------|---------------------------------------------------------------------|
| Frontend   | React 19 + Vite 8, react-router-dom v7, plain CSS vars, lucide-react |
| PDF Export | html2canvas + jsPDF (JPEG 82%, compress, < 2MB)                    |
| Backend    | FastAPI 0.135, Uvicorn, SQLAlchemy 2.0, Pydantic v2                |
| AI Engine  | Google Gemini 2.5 Flash — structured JSON, two-pass prompt          |
| Database   | Neon PostgreSQL (serverless, pooled)                                |
| Parser     | pymupdf4llm (text) + pymupdf vision fallback (scanned PDFs)        |
| Queue      | asyncio.Semaphore — max 3 concurrent AI calls                      |
| Rate limit | slowapi — 5 uploads/min per IP, 30 req/min global                  |
| Scheduler  | APScheduler — auto-cleanup every 2 hours                           |
| Payment    | Razorpay (demo mode — swap setTimeout for SDK to go live)          |

---

## Project Structure

```
ReLak/
├── .gitignore                          # .env, node_modules, rel/, dist excluded
├── README.md
├── demo_docs/
│   ├── Resume.pdf
│   └── Resume1_DA_resume.pdf           # Image-only PDF — uses vision fallback
│
├── frontend/
│   ├── .env                            # VITE_API_BASE=http://localhost:8000
│   ├── .env.production                 # VITE_API_BASE=https://your-backend.railway.app
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── config.js                   # Central config (API_BASE, PRICE_INR, APP_NAME)
│       ├── main.jsx                    # Entry — ErrorBoundary + HashRouter + ThemeProvider
│       ├── App.jsx                     # Routes + wake-up ping + beforeunload guard
│       ├── index.css                   # Full design system with CSS vars + dark mode
│       ├── context/
│       │   └── ThemeContext.jsx        # Dark/light toggle, persisted to localStorage
│       ├── components/
│       │   ├── ErrorBoundary.jsx       # Class component — catches render crashes
│       │   ├── Navbar.jsx              # Logo click → home, dark mode toggle
│       │   ├── UploadZone.jsx          # Drag-and-drop file selector
│       │   ├── ProcessingOverlay.jsx   # Full-screen 7-step AI progress animation
│       │   ├── StyleSelector.jsx       # 3-style card picker
│       │   ├── BlueprintPreview.jsx    # Style 2 — fully inline-editable
│       │   ├── ATSPreview.jsx          # Style 1 — single-column, parser-safe
│       │   ├── ClassicPreview.jsx      # Style 3 — A4 two-column serif
│       │   ├── LucideIcon.jsx          # Dynamic icon resolver
│       │   └── PaymentModal.jsx        # Razorpay demo flow
│       ├── pages/
│       │   ├── ResultPage.jsx          # Style picker, edit mode, blur gate, download
│       │   ├── BuildPage.jsx           # 5-step manual resume builder (no AI)
│       │   ├── AdminLogin.jsx          # Tabbed admin panel (Overview/Portfolios/Users/Pages/Danger)
│       │   └── ContentPage.jsx         # Privacy & Terms / Support / About renderer
│       └── utils/
│           ├── downloadPdf.js          # html2canvas → jsPDF multi-page export
│           ├── sampleData.js           # Fallback resume for demo mode
│           └── contentStore.js         # localStorage-backed content for static pages
│
└── server/
    └── app/
        ├── .env                        # GEMINI_API_KEY, NEON_URL, ADMIN_SECRET_KEY
        ├── main.py                     # FastAPI app — queue, rate limit, scheduler
        ├── engine.py                   # Gemini two-pass extraction + vision fallback
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
npm run dev        # http://localhost:5173
```

---

## Environment Variables

### `server/app/.env`

```env
GEMINI_API_KEY      = your_gemini_api_key
NEON_URL            = postgresql://user:pass@host/db?sslmode=require
ADMIN_SECRET_KEY    = your_strong_secret_key
ALLOWED_ORIGINS     = https://your-frontend.vercel.app,http://localhost:5173
MAX_CONCURRENT_UPLOADS = 3
```

### `frontend/.env`

```env
VITE_API_BASE = http://localhost:8000
```

### `frontend/.env.production`

```env
VITE_API_BASE = https://your-backend.railway.app
```

---

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Wake-up check |
| POST | `/upload` | — | Parse resume (rate: 5/min/IP) |
| DELETE | `/cleanup` | — | Manual cleanup of old unpaid records |
| GET | `/admin/stats` | X-Admin-Key | Platform metrics |
| GET | `/admin/portfolios` | X-Admin-Key | All portfolios with resume_data |
| GET | `/admin/users` | X-Admin-Key | All users |
| PATCH | `/admin/portfolios/{id}/mark-paid` | X-Admin-Key | Mark as paid |
| DELETE | `/admin/portfolios/{id}` | X-Admin-Key | Delete one portfolio |
| DELETE | `/admin/users/{id}` | X-Admin-Key | Delete user + their portfolios |
| DELETE | `/admin/purge` | X-Admin-Key | Hard-delete everything |

---

## Frontend Routes

| Path | Page |
|------|------|
| `/#/` | Hero — upload or build from scratch |
| `/#/result` | Result — style picker, edit, payment, download |
| `/#/build` | 5-step manual resume builder |
| `/#/privacy` | Privacy & Terms |
| `/#/support` | Support |
| `/#/about` | About |
| `/#/home/admins-login` | Admin panel (secret URL) |

---

## User Flow

```
/ (Hero)
  ├─ Drop PDF → "Analyze & Build" → ProcessingOverlay (7-step animation)
  │    └─ POST /upload → Gemini two-pass → /result
  └─ "Build from Scratch" → /build (5-step form, no AI) → /result

/result
  ├─ StyleSelector (ATS / Blueprint / Classic) — switch freely
  ├─ Preview blurred until paid
  ├─ "Unlock for ₹20" → PaymentModal (demo) → blur lifts
  ├─ Edit toggle (Blueprint only) — inline editing of every field
  │    ├─ Click any text to edit (contentEditable)
  │    ├─ Add/remove experience, projects, education entries
  │    ├─ Edit skills chips inline
  │    └─ Edit [LINK] badges for projects, LinkedIn, GitHub
  └─ "Download PDF" → html2canvas → jsPDF (< 2MB)

/#/home/admins-login
  ├─ Enter X-Admin-Key → GET /admin/stats
  ├─ Overview tab — metrics grid
  ├─ Portfolios tab — list, view JSON, mark paid, delete
  ├─ Users tab — list, delete
  ├─ Pages tab — edit Privacy/Terms, Support, About content
  └─ Danger Zone — type CONFIRM → DELETE /admin/purge
```

---

## Resume Styles

| ID | Name | Layout | Typography | Use case |
|----|------|--------|------------|----------|
| 1 | ATS | Single-column | Inter, black on white | Job portals, ATS scanners |
| 2 | Blueprint | Grid + sections | Space Grotesk + JetBrains Mono | Portfolios, tech roles |
| 3 | Classic | A4 two-column, navy sidebar | Georgia serif | Formal applications |

All 3 styles are unlocked with one ₹20 payment per resume generation. Switching is free.

---

## AI Engine — Anti-Hallucination Design

**Pass 1 — Extract only:** Pull raw facts verbatim. No inference.

**Pass 2 — Improve + self-check:** Rewrite bullets as `Action Verb + Task + Result`. Before finalising each field: *"Did the resume actually say this? If not, revert."*

**OCR correction:** Garbled text from image PDFs is corrected before extraction (`FASTAPE → FastAPI`, `Owen → Qwen`, etc.).

**Vision fallback:** If `pymupdf4llm` returns only image placeholders, each page is rendered to PNG at 150dpi and sent to Gemini as a multimodal prompt.

**Link extraction:** PDF hyperlink annotations are extracted directly (not from text/vision) and injected into the prompt for project link matching.

---

## Request Queue

Multiple simultaneous uploads are handled via `asyncio.Semaphore(MAX_CONCURRENT_UPLOADS)`. Requests beyond the limit wait in queue rather than failing. Default is 3 concurrent AI calls. Set `MAX_CONCURRENT_UPLOADS` in `.env` to tune.

---

## Auto-Cleanup

APScheduler runs `_run_cleanup()` every 2 hours, deleting unpaid portfolios older than 2 hours. Paid portfolios are never auto-deleted. The `/cleanup` endpoint also allows manual triggering.

Additionally, after every upload, if total portfolio count ≥ 40, the 20 oldest unpaid records are deleted automatically.

---

## Dark Mode

Implemented via CSS custom properties (`--bg`, `--text`, `--blue`, etc.) with a `[data-theme="dark"]` override block. Toggle button in the Navbar. Preference persisted to `localStorage`. All components use `var(--*)` — no hardcoded colors in any component.

---

## Inline Resume Editing (Blueprint Style)

After payment, an Edit/Preview toggle appears. In edit mode:
- Every text field is `contentEditable`
- Skills chips have inline input fields with add/remove buttons
- Experience, project, and education entries can be added or deleted
- Contact fields (phone, address, LinkedIn, GitHub) are editable
- Project `[LINK]` badges become editable inputs
- All changes are reflected in the downloaded PDF

---

## PDF Size Optimisation

| Technique | Effect |
|-----------|--------|
| `scale: 1.5` | ~44% fewer pixels vs 2× |
| JPEG 82% quality | ~70% smaller than PNG |
| `compress: true` | zlib-compresses PDF stream |
| `scrollWidth/scrollHeight` | Renders at natural element size |

---

## Database Schema

```sql
portfolios: id UUID, user_id UUID, slug TEXT UNIQUE, resume_data JSONB, is_paid BOOL, created_at TIMESTAMP
users:      id UUID, email TEXT UNIQUE, created_at TIMESTAMP
```

---

## Production Deployment

### Backend (Railway / Render)

1. Set all env vars in the platform dashboard
2. Set `ALLOWED_ORIGINS` to your Vercel frontend URL
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)

1. Set `VITE_API_BASE` to your backend URL
2. Build command: `npm run build`
3. Output directory: `dist`

---

## Known Issues & Improvements

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Razorpay is demo-only | Replace `setTimeout` in `PaymentModal.jsx` with real SDK + backend order verification |
| HIGH | Admin key has no session expiry | Add JWT or time-limited tokens |
| MEDIUM | ATS and Classic styles not editable | Extend inline editing to all 3 styles |
| MEDIUM | No retry on failed upload | Add exponential backoff in `App.jsx` |
| MEDIUM | `ResumeRepsonse` typo | Rename to `ResumeResponse` (breaking change — update all references) |
| LOW | No ARIA labels on icon buttons | Add `aria-label` to all icon-only buttons |
| LOW | `tech_stack_icons` not editable | Add icon name editor in edit mode |
| LOW | Content pages use localStorage only | Move to backend DB for multi-device persistence |
| LOW | No email notification on payment | Add Razorpay webhook → send download link via email |
