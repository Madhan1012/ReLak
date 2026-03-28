import os
import pymupdf4llm
from google import genai 
from pydantic import ValidationError
from dotenv import load_dotenv
from .schemas import PortfolioData, ResumeRepsonse

load_dotenv()

#Initialize the gemini modeling
client = genai.Client(api_key = os.getenv("GEMINI_API_KEY"))

def parse_resume_to_json(file_path: str) -> ResumeRepsonse:
    try:
        # Extract as Markdown
        md_txt = pymupdf4llm.to_markdown(file_path)

        if not md_txt.strip():
            return ResumeRepsonse(success = False, error = "PDF cannot be converted into Markdown as it appears to be empty or an image.")
        
        prompt = f"""
        Extract professional portfolio data from the following resume arkdown.
        Optimise all experience highlights into 'Power Bullets' (Action verb + Result).
        Suggest 5 Lucide-react icons for the tech-stack.

        RESUME CONTENT:
        {md_txt}
        """

        response = client.models.generate_content(
            model = "gemini-2.5-flash",
            contents = prompt,
            config = {
                "response_mime_type": "application/json",
                "response_schema": PortfolioData
            }
        )

        return ResumeRepsonse(success = True, data = response.parsed)

    except Exception as e:
        return ResumeRepsonse(success = False, error = str(e))