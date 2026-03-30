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
    file_hash = Column(String, nullable=True, index=True) # To prevent duplicate AI calls
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"))
    order_id = Column(String, unique=True, nullable=True) # Razorpay order_id
    payment_id = Column(String, unique=True, nullable=True) # Razorpay payment_id
    status = Column(String, default="pending") # pending | paid | failed
    amount = Column(String, default="2000") # in paise (₹20)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SiteContent(Base):
    __tablename__ = "site_content"
    key = Column(String, primary_key=True)   # 'privacy' | 'support' | 'about'
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)