import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY = os.getenv("NEON_URL")

engine = create_engine(
    SQLALCHEMY,
    pool_pre_ping = True
)

SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine)

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()  