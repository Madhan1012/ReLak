from pydantic import BaseModel, Field
from typing import List, Optional

# To implement Granularity and have a Field Description for the AI

class Experience(BaseModel):
    company: str
    role: str
    duration: str
    highlights: List[str] = Field(description = "Bullet points optimized with power verbs")

class Project(BaseModel):
    title: str
    description: str
    technologies: List[str]

class Education(BaseModel):
    institution: str
    degree: str
    year: str

# To make a Recursive modeling and have the Lucide-icons for the tech stack

class PortfolioData(BaseModel):
    name: str
    email: str
    summary: str
    skills: List[str]
    experience: List[Experience]
    projects: List[Project]
    education: List[Education]
    tech_stack_icons: List[str] = Field(description = "Suggested Lucide-react icon names for the UI")

# This is for Graceful failure and "success" for Frontend logic

class ResumeRepsonse(BaseModel):
    success: bool
    data: Optional[PortfolioData] = None
    error: Optional[str] = None