import os
import re
import base64
import pymupdf4llm
import pymupdf
from google import genai
from dotenv import load_dotenv
from .schemas import PortfolioData, ResumeRepsonse

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

SYSTEM_PROMPT = """
You are a professional resume editor and structured data extractor.
Your job is to extract, improve, and verify resume content in TWO internal passes before producing output.

═══════════════════════════════════════════════════════
PASS 1 — EXTRACT (read the resume, pull raw facts)
═══════════════════════════════════════════════════════
Read the resume content carefully. Extract:
- Full name, email, phone number (if present), address/location (if present)
- LinkedIn profile URL and GitHub profile URL if present
- Every job role, company, duration, and bullet point
- Every project title, description, and tech stack
- Education entries (institution, degree, year range EXACTLY as written)
- All listed skills — separate TECHNICAL skills from SOFT skills

CRITICAL OCR / TRANSCRIPTION CORRECTION RULES — apply before extracting:
- "FASTAPE", "FastApe", "fast ape", "PASTARI", "Fastapi" → "FastAPI"
- "Owen", "Qwen", "0wen" + version number → "Qwen <version>"
- "Lang Chain", "Langchain" → "LangChain"
- "Spring boot", "springboot" → "Spring Boot"
- Any garbled technology name that is clearly a known tool must be corrected.
- Dates: "2925" → "2025", "Jan 2925" → "Jan 2025". Fix obvious year typos.
- Email addresses: copy EXACTLY as written — do NOT alter any character.
  If you see "smk06056@gmail.com" write exactly that. Never guess or reconstruct.
- Education year ranges: copy EXACTLY as written (e.g. "2023 - Present", "2023 - 2027").
  Do NOT infer or calculate end dates.

ARTIFACT CLEANUP RULES:
- Remove raw CSV/JSON artifacts from text (e.g. \\n, \\r, \\"Bachelor\\'s...\\" strings).
- Remove markdown table syntax (|, ---) from extracted text.
- Clean up any garbled Unicode or encoding artifacts.
- Consolidate duplicate skill sections — do not list the same skill twice.

STRICT RULE: Only extract what is explicitly written (after corrections). Do NOT infer or invent.

PROJECT LINKS RULE (IMPORTANT):
A separate list of ALL hyperlinks found in the PDF is provided below the resume content.
For each project, assign the most relevant GitHub/demo link from that list by matching the
project name or keywords to the URL path. Examples:
- Project "Veldora" → github.com/user/Veldora
- Project "Character Recognition" → github.com/user/Character-Recognition-V2
- Project "NL to SQL" → github.com/user/Natural-Language-To-SQL
- Google Drive links (drive.google.com) are NOT project links — ignore them for projects.
- Only assign a link if the URL path clearly matches the project name.
- Set link=null if no clean GitHub/demo match exists.
- NEVER invent, reconstruct, or guess URLs.

═══════════════════════════════════════════════════════
PASS 2 — IMPROVE + VERIFY (rewrite, then self-check)
═══════════════════════════════════════════════════════
1. SUMMARY: 3-4 sentences, facts only. Self-check every claim against the source.
2. EXPERIENCE BULLETS: Action Verb + Task + Result. Cap 4 per role. No invented metrics.
3. PROJECT DESCRIPTIONS: 2-3 sentences max. Source text only. No fabrication.
4. TECHNICAL SKILLS: Hard skills only (languages, frameworks, tools, DBs, platforms).
   Deduplicate — each skill appears once only.
5. SOFT SKILLS: Interpersonal/professional skills only. Empty list if none mentioned.
6. TECH ICONS: 5-8 valid Lucide-react icon names:
   "database", "brain", "code-2", "server", "cloud", "terminal",
   "cpu", "git-branch", "layers", "zap", "box", "globe", "shield", "activity".
   MUST be real lucide-react names — not generic English words.

PHOTO RULE: Only populate photo_url if an actual person photo is embedded in the document.
CONTACT RULE: phone and address copied verbatim or null.
EMAIL RULE: Copy the email EXACTLY as it appears — never alter it.

OUTPUT: Return the structured JSON matching the schema exactly.
"""


def _extract_pdf_links(file_path: str) -> list[str]:
    """Extract all hyperlink URIs from PDF annotations (works even on image-only PDFs)."""
    doc = pymupdf.open(file_path)
    links = []
    for page in doc:
        for link in page.get_links():
            uri = link.get("uri", "").strip()
            if uri and uri.startswith("http"):
                links.append(uri)
    doc.close()
    return list(dict.fromkeys(links))  # deduplicate, preserve order


def _pdf_to_page_images(file_path: str, dpi: int = 150) -> list[dict]:
    """Render each PDF page to a base64 PNG for Gemini vision."""
    doc = pymupdf.open(file_path)
    images = []
    for page in doc:
        pix = page.get_pixmap(dpi=dpi)
        b64 = base64.b64encode(pix.tobytes("png")).decode("utf-8")
        images.append({"inline_data": {"mime_type": "image/png", "data": b64}})
    doc.close()
    return images


def _build_links_block(links: list[str]) -> str:
    """Format extracted links as a clear block for the prompt."""
    if not links:
        return ""
    lines = "\n".join(f"  - {url}" for url in links)
    return (
        "\n\n═══════════════════════════════════════════════════════\n"
        "HYPERLINKS EXTRACTED FROM PDF (use these for project link fields)\n"
        "═══════════════════════════════════════════════════════\n"
        f"{lines}\n"
        "Match each project to the most relevant link above. "
        "Set link=null if no match exists."
    )


def _post_process_links(data: PortfolioData, links: list[str]) -> PortfolioData:
    """
    Fallback: match unassigned project links by keyword scoring.
    Also extract linkedin/github profile links.
    Filters out non-project links (Google Drive, LinkedIn, etc.).
    """
    if not links:
        return data

    github_links   = [l for l in links if "github.com" in l]
    linkedin_links = [l for l in links if "linkedin.com" in l]

    # Assign profile links if not already set
    if not data.linkedin and linkedin_links:
        data.linkedin = linkedin_links[0]

    # GitHub profile = shortest github.com URL (≤4 slashes = no repo path)
    if not data.github:
        profile_gh = [l for l in github_links if l.count('/') <= 4]
        if profile_gh:
            data.github = sorted(profile_gh, key=len)[0]

    # Only repo links (≥5 slashes) are candidates for project links
    repo_links = [l for l in github_links if l.count('/') >= 5]

    for proj in data.projects:
        if proj.link:
            # Reject Google Drive / non-GitHub links assigned by Gemini
            if "drive.google.com" in (proj.link or "") or "linkedin.com" in (proj.link or ""):
                proj.link = None
            else:
                continue

        title_words = set(re.sub(r'[^a-z0-9]', ' ', proj.title.lower()).split())
        best_match, best_score = None, 0
        for url in repo_links:
            path = url.lower().replace("-", " ").replace("_", " ").replace("/", " ")
            score = sum(1 for w in title_words if len(w) > 2 and w in path)
            if score > best_score:
                best_score, best_match = score, url
        if best_score >= 1:
            proj.link = best_match

    return data


def parse_resume_to_json(file_path: str) -> ResumeRepsonse:
    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

        # Always extract hyperlinks from PDF annotations first
        pdf_links = _extract_pdf_links(file_path)
        links_block = _build_links_block(pdf_links)

        md_txt = pymupdf4llm.to_markdown(file_path)
        has_text = bool(md_txt.strip()) and "intentionally omitted" not in md_txt

        if has_text:
            prompt_parts = [
                f"{SYSTEM_PROMPT}\n\n"
                "═══════════════════════════════════════════════════════\n"
                "RESUME CONTENT (source of truth)\n"
                "═══════════════════════════════════════════════════════\n"
                f"{md_txt}"
                f"{links_block}"
            ]
        else:
            # Vision fallback for image-only / scanned PDFs
            page_images = _pdf_to_page_images(file_path)
            if not page_images:
                return ResumeRepsonse(
                    success=False,
                    error="Could not render PDF pages for vision extraction."
                )
            prompt_parts = [
                f"{SYSTEM_PROMPT}\n\n"
                "═══════════════════════════════════════════════════════\n"
                "RESUME CONTENT: provided as page image(s) below.\n"
                "Read every visible element carefully. Apply OCR corrections as instructed.\n"
                f"{links_block}\n"
                "═══════════════════════════════════════════════════════\n"
            ]
            prompt_parts.extend(page_images)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt_parts,
            config={
                "response_mime_type": "application/json",
                "response_schema": PortfolioData,
            },
        )

        parsed = response.parsed

        # Fallback: match any unassigned project links by keyword
        parsed = _post_process_links(parsed, pdf_links)

        return ResumeRepsonse(success=True, data=parsed)

    except Exception as e:
        return ResumeRepsonse(success=False, error=str(e))
