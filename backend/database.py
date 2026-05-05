from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./visionix.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Record(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String)  # 'voice', 'ocr', 'csv'
    item = Column(String)
    quantity = Column(Float)
    price = Column(Float, nullable=True)
    category = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    raw_data = Column(JSON, nullable=True)

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    business_state = Column(JSON)  # Now structured
    trend_analysis = Column(JSON)  # New section
    root_causes = Column(JSON)
    impact = Column(String)        # New section
    forecast = Column(JSON)        # New section
    recommendations = Column(JSON)
    risks = Column(JSON)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
