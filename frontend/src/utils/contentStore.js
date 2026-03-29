// Simple localStorage-backed content store for Privacy/Terms, Support, About pages.
// Admin can edit these via the admin panel; changes persist in the browser.

const DEFAULTS = {
  privacy: {
    title: 'Privacy & Terms',
    body: `## Privacy Policy

ReLak collects only the resume document you upload. It is processed by our AI engine and immediately deleted from our servers after parsing. We do not store your personal data beyond the anonymised portfolio record in our database.

**Data we store:** Your parsed resume data (name, email, skills, experience) linked to a slug. No raw files are retained.

**Data we never collect:** Passwords, payment card details (handled by Razorpay), or browsing history.

## Terms of Service

By using ReLak you agree that the ₹20 payment is a one-time charge per resume generation. All 3 styles are included in a single payment. Re-generating with a new resume costs another ₹20.

ReLak is provided "as is". We make no guarantees about job outcomes. The AI-generated content is a starting point — always review before submitting to employers.

**Refund policy:** Due to the digital nature of the product, refunds are not available once the resume has been generated and downloaded.`,
  },
  support: {
    title: 'Support',
    body: `## Get Help

**Email:** support@relak.app

**Response time:** Within 24 hours on business days.

## Common Questions

**My PDF won't upload.** Ensure the file is under 2MB and is a text-based PDF (not a scanned image). Scanned PDFs are supported via our vision engine but may take longer.

**The AI got something wrong.** After generation, you can edit any field directly in the preview before downloading. Click any text to edit it.

**I paid but can't download.** Refresh the page and try again. If the issue persists, email us with your transaction ID.

**Can I regenerate for free?** No — each generation costs ₹20. Switching between the 3 styles is free within the same generation.`,
  },
  about: {
    title: 'About ReLak',
    body: `## What is ReLak?

ReLak is an AI-driven resume refactor tool. Upload your existing PDF resume and our engine extracts, improves, and restructures it into a polished portfolio — in under 60 seconds.

## How it works

1. **Upload** your PDF or DOCX resume (max 2MB)
2. **AI Engine** runs a two-pass extraction: first pulling raw facts, then rewriting bullets with power-verbs while self-checking for hallucinations
3. **Choose a style** — ATS Friendly, Blueprint Aesthetic, or Classic Serif
4. **Pay ₹20** to unlock all styles and download your PDF

## Why ₹20?

We believe professional resume help shouldn't cost thousands. ₹20 covers our AI API costs and keeps the service running. One payment unlocks all 3 styles for that resume.

## Built with

Gemini 2.5 Flash · FastAPI · React 19 · Neon PostgreSQL · Razorpay`,
  },
};

const KEY = 'relak-content';

export function getContent() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULTS;
}

export function setContent(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}
