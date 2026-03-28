import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session 
from pathlib import Path 
from .database import engine, get_db
from .engine import parse_resume_to_json
from .schemas import ResumeRepsonse
from .models import Base, Portfolio
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Syncing to Database.......")
    Base.metadata.create_all(bind = engine)
    yield

app = FastAPI(title = "ReLak API", version = "1.0.0", lifespan = lifespan)

# CORS setup

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"], # To be replaced with Vercel URL
    allow_methods = ["*"],
    allow_headers = ["*"]
)

# Temporary storeage for processing

UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok = True)

@app.get("/health")
async def health_check():
    return {"status": "online", "message": "Engine is warmed-up"}

@app.post("/upload", response_model = ResumeRepsonse)
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):

    if file.size > 2 * 1024 * 1024:
        raise HTTPException(status_code = 403, detail = "File too large (Max limit is 2MB)")

    temp_path = UPLOAD_DIR / file.filename

    try:
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        result = parse_resume_to_json(str(temp_path))

        if result.success and result.data:

            new_portfolio = Portfolio(
                slug = result.data.name.lower().replace(" ", "-"),
                resume_data = result.data.dict(),
                is_paid = False
            )

            db.add(new_portfolio)
            db.commit()
            db.refresh(new_portfolio)

        return result
        
    except Exception as e:
        return ResumeRepsonse(success = False, error = f"Server error: {str(e)}")
    
    finally:
        # Cleanup

        if temp_path.exists():
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host = "0.0.0.0", port = 8000)