import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("NEON_URL")

if not DATABASE_URL:
    raise RuntimeError("NEON_URL env var is required")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping = True
)

SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine)

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()  