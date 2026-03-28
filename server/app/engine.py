import os
import pymupdf4llm
from google import genai
from dotenv import load_dotenv
from .schemas import PortfolioData, ResumeRepsonse

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# ── Prompt ────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are a professional resume editor and structured data extractor.
Your job is to extract, improve, and verify resume content in TWO internal passes before producing output.

═══════════════════════════════════════════════════════
PASS 1 — EXTRACT (read the resume, pull raw facts)
═══════════════════════════════════════════════════════
Read the resume markdown carefully. Extract:
- Full name, email, phone number (if present), address/location (if present)
- Every job role, company, duration, and bullet point
- Every project title, description, and tech stack
- Education entries
- All listed skills and technologies

STRICT RULE: Only extract what is explicitly written. Do NOT infer, assume, or invent any detail.

═══════════════════════════════════════════════════════
PASS 2 — IMPROVE + VERIFY (rewrite, then self-check)
═══════════════════════════════════════════════════════
Now improve the writing quality:

1. SUMMARY: Write a 3-4 sentence professional summary. Use only facts from Pass 1.
   Before finalising, ask yourself: "Is every claim in this summary supported by the resume?" 
   If not, remove it.

2. EXPERIENCE BULLETS: Rewrite each bullet as: Action Verb + Task + Result.
   - Cap at 4 bullets per role.
   - If a metric (%, $, time saved) is NOT in the original resume, do NOT add one.
   - Before finalising each bullet, verify: "Did the resume actually say this?" If no, revert to the original wording.

3. PROJECT DESCRIPTIONS: Improve clarity and conciseness (2-3 sentences max).
   Only use information present in the resume.

4. SKILLS: List only skills explicitly mentioned or clearly demonstrated.

5. TECH ICONS: Pick 5-8 Lucide-react icon names that match the actual tech stack.
   Examples: "database", "brain", "code-2", "server", "cloud", "terminal", "cpu", "git-branch"

PHOTO RULE: Only populate photo_url if the resume document contains an actual embedded image.
Do NOT generate, guess, or link to any photo.

CONTACT RULE: phone and address must be copied verbatim from the resume.
If they are not present, set them to null.

OUTPUT: Return the structured JSON matching the schema exactly.
"""

def parse_resume_to_json(file_path: str) -> ResumeRepsonse:
    try:
        # Lazy client init — ensures .env is loaded before key is read
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        md_txt = pymupdf4llm.to_markdown(file_path)

        if not md_txt.strip():
            return ResumeRepsonse(
                success=False,
                error="Document appears empty or is a scanned image — cannot extract text."
            )

        prompt = f"""{SYSTEM_PROMPT}

═══════════════════════════════════════════════════════
RESUME CONTENT (source of truth — do not deviate from this)
═══════════════════════════════════════════════════════
{md_txt}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": PortfolioData,
            },
        )

        return ResumeRepsonse(success=True, data=response.parsed)

    except Exception as e:
        return ResumeRepsonse(success=False, error=str(e))
