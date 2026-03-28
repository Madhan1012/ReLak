from pydantic import BaseModel, Field
from typing import List, Optional


class Experience(BaseModel):
    company: str
    role: str
    duration: str
    highlights: List[str] = Field(
        description="Max 4 bullet points per role. Each must follow: Action Verb + Specific Task + Quantified Result. "
                    "Only include what is explicitly stated in the resume — do NOT invent metrics or outcomes."
    )

class Project(BaseModel):
    title: str
    description: str = Field(
        description="2-3 sentences max. Improve clarity and impact using the source text only. No fabrication."
    )
    technologies: List[str]

class Education(BaseModel):
    institution: str
    degree: str
    year: str

class PortfolioData(BaseModel):
    # ── Personal details ──────────────────────────────────────────────────────
    name: str
    email: str
    phone: Optional[str] = Field(
        default=None,
        description="Phone number exactly as written in the resume. Null if not present."
    )
    address: Optional[str] = Field(
        default=None,
        description="City/State or full address as written in the resume. Null if not present."
    )
    photo_url: Optional[str] = Field(
        default=None,
        description="URL or base64 of a photo if explicitly present in the resume. Null otherwise — do NOT invent one."
    )

    # ── Content ───────────────────────────────────────────────────────────────
    summary: str = Field(
        description="3-4 sentence professional summary. Rewrite for impact using only facts from the resume. "
                    "No fabrication. Must pass a factual self-check against the source."
    )
    skills: List[str] = Field(
        description="Technical and soft skills explicitly listed or clearly demonstrated in the resume."
    )
    experience: List[Experience]
    projects: List[Project]
    education: List[Education]
    tech_stack_icons: List[str] = Field(
        description="5-8 Lucide-react icon names matching the candidate's actual tech stack (e.g. 'database', 'brain', 'code-2')."
    )
    style_id: int = Field(
        default=2,
        description="1: ATS Friendly, 2: Blueprint Aesthetic, 3: Classic Resume"
    )

# Graceful failure wrapper — success flag + optional data or error message
class ResumeRepsonse(BaseModel):
    success: bool
    data: Optional[PortfolioData] = None
    error: Optional[str] = None
