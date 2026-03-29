from sqlalchemy import Column, String, JSON, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base
import uuid
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid = True), primary_key = True, default = uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Portfolio(Base):
    __tablename__ = "portfolios"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    slug = Column(String, unique=True, nullable=False)
    resume_data = Column(JSON, nullable=False)
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SiteContent(Base):
    __tablename__ = "site_content"
    key = Column(String, primary_key=True)   # 'privacy' | 'support' | 'about'
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)