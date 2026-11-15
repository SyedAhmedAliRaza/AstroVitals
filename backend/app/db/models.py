"""SQLAlchemy ORM models for AstroVitals — TimescaleDB hypertable + pgvector."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    """Shared declarative base for all models."""
    pass


# ── Enums ────────────────────────────────────────────────────────────────────

class AstronautRole(str, enum.Enum):
    astronaut = "astronaut"
    crew_medical_officer = "crew_medical_officer"
    flight_surgeon = "flight_surgeon"


class RiskLevel(str, enum.Enum):
    nominal = "nominal"
    caution = "caution"
    critical = "critical"


class AlertType(str, enum.Enum):
    sms = "sms"
    whatsapp = "whatsapp"
    voice = "voice"


class DonkiEventType(str, enum.Enum):
    FLR = "FLR"
    SEP = "SEP"


# ── Models ───────────────────────────────────────────────────────────────────

class Astronaut(Base):
    __tablename__ = "astronauts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    role = Column(Enum(AstronautRole), nullable=False, default=AstronautRole.astronaut)
    auth0_sub = Column(String(255), unique=True, nullable=True)
    mission_name = Column(String(255), nullable=True)
    crew_position = Column(String(255), nullable=True)
    xp_points = Column(Integer, nullable=False, default=0)
    streak_days = Column(Integer, nullable=False, default=0)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    vitals = relationship("VitalTelemetry", back_populates="astronaut", lazy="selectin")
    assessments = relationship("DiagnosticAssessment", back_populates="astronaut", lazy="selectin")
    quests = relationship("HealthQuest", back_populates="astronaut", lazy="selectin")
    alerts = relationship("AlertLog", back_populates="astronaut", lazy="selectin")


class VitalTelemetry(Base):
    __tablename__ = "vital_telemetry"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    astronaut_id = Column(UUID(as_uuid=True), ForeignKey("astronauts.id"), nullable=False)
    recorded_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    heart_rate = Column(Float, nullable=True)
    systolic_bp = Column(Float, nullable=True)
    diastolic_bp = Column(Float, nullable=True)
    hrv_ms = Column(Float, nullable=True)
    blood_sugar_mgdl = Column(Float, nullable=True)
    core_temp_c = Column(Float, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    radiation_msv_day = Column(Float, nullable=True)
    mood_score = Column(Integer, nullable=True)
    spo2_percent = Column(Float, nullable=True)
    is_simulated = Column(Boolean, nullable=False, default=True)

    astronaut = relationship("Astronaut", back_populates="vitals")


class NasaMedicalKnowledge(Base):
    __tablename__ = "nasa_medical_knowledge"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source = Column(String(255), nullable=False)
    title = Column(String(512), nullable=False)
    content_text = Column(Text, nullable=False)
    category = Column(String(255), nullable=True)
    embedding = Column(Vector(768), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class DiagnosticAssessment(Base):
    __tablename__ = "diagnostic_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    astronaut_id = Column(UUID(as_uuid=True), ForeignKey("astronauts.id"), nullable=False)
    assessed_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    body_region = Column(String(100), nullable=True)
    risk_level = Column(Enum(RiskLevel), nullable=False, default=RiskLevel.nominal)
    risk_score = Column(Float, nullable=False, default=0.0)
    diagnosis_text = Column(Text, nullable=True)
    countermeasures = Column(JSON, nullable=True)
    gemini_model_used = Column(String(100), nullable=True)
    context_chunks_used = Column(JSON, nullable=True)

    astronaut = relationship("Astronaut", back_populates="assessments")


class HealthQuest(Base):
    __tablename__ = "health_quests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    astronaut_id = Column(UUID(as_uuid=True), ForeignKey("astronauts.id"), nullable=False)
    quest_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    quest_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    xp_reward = Column(Integer, nullable=False, default=10)
    completed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    astronaut = relationship("Astronaut", back_populates="quests")


class AlertLog(Base):
    __tablename__ = "alert_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    astronaut_id = Column(UUID(as_uuid=True), ForeignKey("astronauts.id"), nullable=False)
    alert_type = Column(Enum(AlertType), nullable=False)
    recipient_number = Column(String(50), nullable=True)
    message_body = Column(Text, nullable=True)
    twilio_sid = Column(String(255), nullable=True)
    status = Column(String(50), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    astronaut = relationship("Astronaut", back_populates="alerts")


class DonkiEvent(Base):
    __tablename__ = "donki_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(Enum(DonkiEventType), nullable=False)
    event_id_nasa = Column(String(255), unique=True, nullable=True)
    begin_time = Column(DateTime(timezone=True), nullable=True)
    peak_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    class_type = Column(String(50), nullable=True)
    source_location = Column(String(100), nullable=True)
    severity = Column(String(50), nullable=True)
    raw_json = Column(JSON, nullable=True)
    fetched_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
