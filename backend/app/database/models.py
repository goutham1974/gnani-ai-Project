from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    crop = Column(String(100), nullable=True)
    scheduled_date = Column(String(100), nullable=False)
    scheduled_time = Column(String(100), nullable=True)
    status = Column(String(50), default="pending")  # pending, completed, cancelled
    is_confirmed = Column(Boolean, default=True)
    language = Column(String(20), default="te")
    created_at = Column(DateTime, default=datetime.utcnow)

class FarmActivity(Base):
    __tablename__ = "farm_activities"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String(100), nullable=False)  # Spraying, Fertilizer, Irrigation, Sowing, Harvest
    crop = Column(String(100), nullable=False)
    field_name = Column(String(100), default="Main Plot")
    notes = Column(Text, nullable=True)
    expense_amount = Column(Float, default=0.0)
    activity_date = Column(String(100), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    created_at = Column(DateTime, default=datetime.utcnow)

class ConversationLog(Base):
    __tablename__ = "conversation_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True)
    farmer_query_text = Column(Text, nullable=False)
    detected_language = Column(String(20), default="te")
    intent_classified = Column(String(50), nullable=True)
    agent_routed = Column(String(50), nullable=True)
    response_text = Column(Text, nullable=False)
    audio_generated = Column(Boolean, default=False)
    rag_sources_used = Column(Text, nullable=True)
    latency_stt_ms = Column(Float, default=0.0)
    latency_llm_ms = Column(Float, default=0.0)
    latency_tts_ms = Column(Float, default=0.0)
    total_latency_ms = Column(Float, default=0.0)
    wer_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

