# ReLak — AI-Driven Resume Refactor

Transform your PDF resume into a polished, optimized version in 60 seconds using AI.

**Upload a PDF → AI extracts & improves → choose a style → edit inline → download**

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL (Neon recommended)

### Installation

**Backend Setup**
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with:
# GEMINI_API_KEY=your_gemini_api_key
# NEON_URL=postgresql://user:pass@host/db?sslmode=require
# ADMIN_SECRET_KEY=your_secret_key
# ALLOWED_ORIGINS=http://localhost:5173

# Run migrations and start server
uvicorn app.main:app --reload --port 8000
```

**Frontend Setup**
```bash
cd frontend
npm install

# Create .env with:
# VITE_API_BASE=http://localhost:8000

npm run dev  # Runs on http://localhost:5173
```

---

## Features

- **AI-Powered Extraction** — Gemini 2.5 Flash parses PDFs with two-pass validation
- **JD Tailoring** — Optional job description to tailor resume content
- **Multiple Styles** — ATS-friendly, Blueprint (grid), Classic (A4 serif)
- **Inline Editing** — Edit resume directly in browser after generation
- **PDF Export** — Download as <2MB PDF with optimized JPEG compression
- **Anti-Hallucination** — Two-pass prompt + JSON recovery prevents AI fabrication
- **Rate Limited** — 5 uploads/min/IP prevents abuse
- **Privacy Focused** — Uploaded files deleted immediately, unpaid data purged every 2 hours

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, react-router-dom (HashRouter) |
| Backend | FastAPI, Uvicorn, Python 3.12 |
| Database | Neon PostgreSQL, SQLAlchemy ORM |
| AI | Google Gemini 2.5 Flash |
| PDF Processing | pymupdf, pymupdf4llm, html2canvas, jsPDF |
| Rate Limiting | slowapi |
| Scheduling | APScheduler |
| Hosting | Netlify (frontend), Railway/Render (backend) |

---

## API Endpoints

### Public

| Method | Endpoint | Rate Limit | Description |
|--------|----------|-----------|-------------|
| GET | `/health` | — | Server status check |
| POST | `/upload` | 5/min/IP | Parse resume PDF, return structured JSON |
| POST | `/payment/create-order` | — | Create Razorpay payment order |
| POST | `/payment/verify` | — | Verify payment and mark as paid |

### Admin (Require `X-Admin-Key` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| DELETE | `/cleanup` | Purge unpaid portfolios >2h old |
| GET | `/admin/stats` | Platform metrics |
| GET | `/admin/portfolios` | List all portfolios |
| DELETE | `/admin/portfolios/{id}` | Delete specific portfolio |

---

## Environment Variables

### Backend (`server/app/.env`)

```env
GEMINI_API_KEY=sk-...                    # Google Gemini API key
NEON_URL=postgresql://...                # Neon PostgreSQL connection string
ADMIN_SECRET_KEY=your_strong_secret      # Required — server won't start without it
ALLOWED_ORIGINS=http://localhost:5173    # CORS whitelist
MAX_CONCURRENT_JOBS=3                    # Max concurrent AI calls
ENV=production                           # Set to 'production' to enable HSTS + CSP
PORT=8000
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE=http://localhost:8000      # Backend API URL
```

### Frontend Production (`frontend/.env.production`)

```env
VITE_API_BASE=https://your-backend.railway.app
```

---

## Database Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE portfolios (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    slug TEXT UNIQUE NOT NULL,
    resume_data JSONB NOT NULL,
    file_hash TEXT UNIQUE,
    is_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id),
    order_id TEXT UNIQUE,
    payment_id TEXT UNIQUE,
    status TEXT DEFAULT 'pending',
    amount TEXT DEFAULT '2000',
    created_at TIMESTAMP DEFAULT now()
);
```

---

## Deployment

### Backend (Railway/Render)

1. Connect your Git repo
2. Set environment variables in platform dashboard:
   - `GEMINI_API_KEY`
   - `NEON_URL`
   - `ADMIN_SECRET_KEY`
   - `ALLOWED_ORIGINS` (set to your Netlify URL)
   - `ENV=production`
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Deploy

### Frontend (Netlify)

1. Connect your Git repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set `VITE_API_BASE` environment variable to your backend URL
5. Deploy

---

## Project Structure

```
ReLak/
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/        # UI components (Navbar, UploadZone, etc.)
│   │   ├── pages/             # Route pages (ResultPage, BuildPage, etc.)
│   │   ├── context/           # React Context (ThemeContext)
│   │   ├── utils/             # Utilities (PDF export, sample data)
│   │   ├── App.jsx            # Main routes
│   │   └── index.css          # Design system
│   └── package.json
│
├── server/                     # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app, all routes
│   │   ├── engine.py          # Gemini AI parsing
│   │   ├── schemas.py         # Pydantic models
│   │   ├── models.py          # SQLAlchemy ORM
│   │   ├── database.py        # Neon connection
│   │   └── security.py        # PDF sanitization, PII masking
│   ├── requirements.txt
│   └── .env                   # Secrets (not committed)
│
└── README.md                  # This file
```

---

## How It Works

### 1. Upload & Parse
- User uploads PDF (max 2MB)
- Backend scans for malicious content, sanitizes metadata
- File hashed for deduplication (SHA256)
- Text extracted via pymupdf4llm or vision (for scanned PDFs)

### 2. AI Extraction (Two-Pass)
- **Pass 1:** Extract facts verbatim, apply OCR corrections
- **Pass 2:** Improve bullets, tailor to job description (if provided)
- **Recovery:** If JSON malformed, retry with Pydantic schema

### 3. Style Selection
- User picks ATS, Blueprint, or Classic style
- Preview available (blurred until payment)
- Free style switching

### 4. Payment & Download
- Payment gateway (Razorpay demo)
- Unlock editing after payment
- Download as PDF (<2MB via html2canvas + jsPDF)

---

## Security

-  PDF sanitization (malicious pattern detection)
-  Rate limiting (5 uploads/min per IP)
-  CORS with explicit whitelist
-  Admin auth returns 404 (not 401) to hide endpoints
-  PII masked in all logs
-  SQLAlchemy ORM (no SQL injection)
-  Security headers (CSP, HSTS, X-Frame-Options)
-  Secrets from environment variables only

---

## Data Privacy

- Uploaded PDFs deleted immediately after parsing (~30 seconds)
- Unpaid resume data auto-deleted every 2 hours
- Temp files cleaned up on startup
- No payment data stored (handled by Razorpay)
- Server logs have PII masked (emails, phone numbers)

---

## Known Issues & Roadmap

| Priority | Issue | Status |
|----------|-------|--------|
| HIGH | Razorpay integration is demo-only | Pending real SDK |
| HIGH | Rotate exposed API keys | Required before production |
| HIGH | Add support for docx input | Required before production |
| MEDIUM | Payment verification server-side | Pending |
| LOW | ATS/Classic styles not editable | Pending |
| LOW | Add accessibility (ARIA labels) | Pending |

---

## Performance Targets

- **Upload latency:** ~60 seconds (Gemini API)
- **Frontend load:** <3 seconds (Netlify CDN)
- **PDF export:** <5 seconds (html2canvas + jsPDF)
- **Bundle size:** ~120KB gzipped

---

## Contributing (if public)

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MOL — It's My Own Licence 
No Licence

---

## Support

For issues or questions:
- Open a GitHub issue (if this is public)
- Email: not@yet
- Visit: https://relak.netlify.app/

---

## Author

Built by ME

---

**Made with using FastAPI, React, and AIs**
