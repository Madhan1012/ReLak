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
    link: Optional[str] = Field(
        default=None,
        description="GitHub URL, live demo URL, or case study link if explicitly present in the resume. "
                    "Null if not present — do NOT invent or guess URLs."
    )

class Education(BaseModel):
    institution: str
    degree: str
    year: str
    gpa: Optional[str] = Field(
        default=None,
        description="CGPA, GPA, or percentage if explicitly present in the resume. Null otherwise."
    )

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
    linkedin: Optional[str] = Field(
        default=None,
        description="LinkedIn profile URL if present in the resume. Null if not present."
    )
    github: Optional[str] = Field(
        default=None,
        description="GitHub profile URL if present in the resume. Null if not present."
    )

    # ── Content ───────────────────────────────────────────────────────────────
    summary: str = Field(
        description="3-4 sentence professional summary. Rewrite for impact using only facts from the resume. "
                    "No fabrication. Must pass a factual self-check against the source."
    )
    technical_skills: List[str] = Field(
        description="Only hard technical skills: programming languages, frameworks, tools, platforms, databases. "
                    "Extracted verbatim from the resume. No soft skills here."
    )
    soft_skills: List[str] = Field(
        description="Only interpersonal and professional soft skills: e.g. 'Team Leadership', 'Problem Solving', "
                    "'Communication'. Extracted from the resume. Empty list if none are mentioned."
    )
    experience: List[Experience]
    projects: List[Project]
    education: List[Education]

class ResumeResponse(BaseModel):
    success: bool
    data: Optional[PortfolioData] = None
    error: Optional[str] = None
    slug: Optional[str] = None
