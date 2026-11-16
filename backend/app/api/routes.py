"""AstroVitals API routes — all /api/v1 endpoints."""

from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.auth0 import get_current_user, require_role
from app.config import get_settings
from app.db.models import (
    AlertLog,
    Astronaut,
    AstronautRole,
    DiagnosticAssessment,
    DonkiEvent,
    HealthQuest,
    RiskLevel,
    VitalTelemetry,
)
from app.db.session import async_session_factory, get_db

router = APIRouter(prefix="/api/v1", tags=["AstroVitals API v1"])


# ══════════════════════════════════════════════════════════════════════════════
# Pydantic response / request models
# ══════════════════════════════════════════════════════════════════════════════


class HealthCheckResponse(BaseModel):
    status: str
    version: str
    database: str
    demo_mode: bool


class AstronautProfile(BaseModel):
    id: str
    name: str
    role: str
    mission_name: Optional[str] = None
    crew_position: Optional[str] = None
    xp_points: int = 0
    streak_days: int = 0

    model_config = {"from_attributes": True}


class VitalReadingOut(BaseModel):
    id: int
    astronaut_id: str
    recorded_at: datetime
    heart_rate: Optional[float] = None
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    hrv_ms: Optional[float] = None
    blood_sugar_mgdl: Optional[float] = None
    core_temp_c: Optional[float] = None
    sleep_hours: Optional[float] = None
    radiation_msv_day: Optional[float] = None
    mood_score: Optional[int] = None
    spo2_percent: Optional[float] = None
    is_simulated: bool = True

    model_config = {"from_attributes": True}


class VitalRecordIn(BaseModel):
    astronaut_id: str
    heart_rate: Optional[float] = None
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    hrv_ms: Optional[float] = None
    blood_sugar_mgdl: Optional[float] = None
    core_temp_c: Optional[float] = None
    sleep_hours: Optional[float] = None
    radiation_msv_day: Optional[float] = None
    mood_score: Optional[int] = None
    spo2_percent: Optional[float] = None
    is_simulated: bool = True


class TimeseriesPoint(BaseModel):
    bucket: datetime
    avg_heart_rate: Optional[float] = None
    avg_systolic_bp: Optional[float] = None
    avg_diastolic_bp: Optional[float] = None
    avg_spo2: Optional[float] = None
    avg_core_temp: Optional[float] = None
    avg_radiation: Optional[float] = None
    avg_mood: Optional[float] = None
    avg_sleep: Optional[float] = None


class BodyRegionStatus(BaseModel):
    region_id: str
    region_name: str
    status: str
    color: str
    risk_score: float
    last_assessed: Optional[datetime] = None


class BodyRegionDetail(BaseModel):
    region_id: str
    region_name: str
    status: str
    risk_score: float
    description: str
    self_exam_steps: list[str]
    countermeasures: list[str]


class DiagnosticRequest(BaseModel):
    astronaut_id: str


class DiagnosticResponse(BaseModel):
    assessment_id: str
    risk_level: str
    risk_score: float
    diagnosis: str
    affected_systems: list[str]
    countermeasures: list[str]
    escalation_needed: bool
    self_exam_steps: list[str]
    gemini_model_used: Optional[str] = None


class QuestOut(BaseModel):
    id: str
    quest_type: str
    title: str
    description: Optional[str] = None
    xp_reward: int
    completed: bool
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class QuestCompleteResponse(BaseModel):
    quest_id: str
    xp_awarded: int
    total_xp: int
    message: str


class AlertSendRequest(BaseModel):
    astronaut_id: str
    alert_type: str = "sms"
    message: str
    recipient_number: Optional[str] = None


class AlertOut(BaseModel):
    id: str
    alert_type: str
    recipient_number: Optional[str] = None
    message_body: Optional[str] = None
    twilio_sid: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DonkiEventOut(BaseModel):
    id: str
    event_type: str
    event_id_nasa: Optional[str] = None
    begin_time: Optional[datetime] = None
    peak_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    class_type: Optional[str] = None
    source_location: Optional[str] = None
    severity: Optional[str] = None

    model_config = {"from_attributes": True}


class SeedRequest(BaseModel):
    astronaut_id: Optional[str] = None
    days: int = 30


class SeedResponse(BaseModel):
    records_inserted: int
    astronaut_id: str
    message: str


class CrewMemberOverview(BaseModel):
    astronaut_id: str
    name: str
    role: str
    latest_risk_level: str
    latest_risk_score: float
    xp_points: int
    streak_days: int


class CrewOverviewResponse(BaseModel):
    crew_count: int
    crew: list[CrewMemberOverview]


# ══════════════════════════════════════════════════════════════════════════════
# Body-map data
# ══════════════════════════════════════════════════════════════════════════════

BODY_REGIONS = {
    "head_neuro": {
        "region_name": "Head & Neuro-Ocular",
        "description": "Includes SANS monitoring (optic disc edema, globe flattening), intracranial pressure, headache tracking, and cognitive performance.",
        "self_exam_steps": [
            "1. Perform visual acuity test using onboard Snellen chart.",
            "2. Check pupillary light reflex with penlight (both eyes).",
            "3. Rate headache severity 0-10.",
            "4. Complete 2-minute cognitive reaction-time test on tablet.",
            "5. Report any visual floaters, scotomas, or blurred vision.",
        ],
        "countermeasures": [
            "LBNP session (30 min at -25 mmHg) for ICP reduction.",
            "Reduce dietary sodium to <2g/day.",
            "Schedule fundoscopy with CMO within 24 hours.",
        ],
    },
    "cardiovascular": {
        "region_name": "Cardiovascular",
        "description": "Heart rate, blood pressure, HRV, orthostatic tolerance, cardiac biomarkers (Troponin I, BNP).",
        "self_exam_steps": [
            "1. Rest seated for 3 minutes, then record HR and BP.",
            "2. Stand for 2 minutes — record standing HR and BP (orthostatic test).",
            "3. Note any palpitations, chest tightness, or dizziness.",
            "4. Perform 6-beat HRV capture using wrist biosensor.",
        ],
        "countermeasures": [
            "30 min aerobic exercise at 75-85% VO2max on CEVIS/T2.",
            "Fluid loading: 500 mL isotonic solution before EVA.",
            "Thigh-cuff venous occlusion: 3 × 5-min sessions.",
        ],
    },
    "pulmonary": {
        "region_name": "Pulmonary / Respiratory",
        "description": "SpO2, respiratory rate, cabin CO2 levels, and lung function.",
        "self_exam_steps": [
            "1. Measure SpO2 with pulse oximeter for 30 seconds.",
            "2. Count respiratory rate for 1 full minute.",
            "3. Perform peak flow meter test (3 attempts, record best).",
            "4. Check cabin CO2 display (should be <5.3 mmHg TWA).",
        ],
        "countermeasures": [
            "Verify CDRA CO2 scrubber function.",
            "Apply supplemental O2 if SpO2 <93%.",
            "Deep breathing exercises: 4-7-8 technique, 5 cycles.",
        ],
    },
    "musculoskeletal": {
        "region_name": "Musculoskeletal",
        "description": "Bone density tracking, muscle atrophy assessment, back pain, and exercise compliance.",
        "self_exam_steps": [
            "1. Grip strength test with dynamometer (both hands).",
            "2. Single-leg heel raise assessment (if in partial gravity).",
            "3. Rate lower back pain 0-10.",
            "4. Document ARED exercise log for the past 24 hours.",
        ],
        "countermeasures": [
            "2.5 hours/day combined ARED (resistive) + T2/CEVIS (aerobic).",
            "Bisphosphonate prophylaxis per prescription schedule.",
            "Compression garment use during sleep cycle.",
        ],
    },
    "immune_blood": {
        "region_name": "Immune System & Blood",
        "description": "Radiation exposure, inflammatory markers, immune cell function, and blood glucose.",
        "self_exam_steps": [
            "1. Record cumulative radiation dose from personal dosimeter.",
            "2. Check for any skin lesions, rashes, or delayed wound healing.",
            "3. Measure blood glucose with glucometer.",
            "4. Log subjective energy level 1-10.",
        ],
        "countermeasures": [
            "Relocate to storm shelter if radiation >2.5 mSv/day.",
            "Vitamin D supplementation (1000 IU/day).",
            "Dietary immune support: adequate protein (1.5 g/kg/day).",
        ],
    },
    "behavioral_sleep": {
        "region_name": "Behavioral Health & Sleep",
        "description": "Mood scoring, sleep quality, circadian alignment, interpersonal dynamics, and cognitive fatigue.",
        "self_exam_steps": [
            "1. Complete PHQ-2 mood screening (2 questions).",
            "2. Log sleep duration and quality (1-5 scale).",
            "3. Rate interpersonal crew dynamics 1-5.",
            "4. Note use of sleep aids or melatonin.",
        ],
        "countermeasures": [
            "Blue-light filtering after 20:00 crew time.",
            "Melatonin 0.3 mg 30 min before scheduled sleep.",
            "Private medical conference with ground psychologist.",
            "Structured social/recreation time (≥30 min/day).",
        ],
    },
}


# ══════════════════════════════════════════════════════════════════════════════
# Helper functions
# ══════════════════════════════════════════════════════════════════════════════

async def _get_astronaut(db: AsyncSession, astronaut_id: uuid.UUID) -> Astronaut:
    result = await db.execute(select(Astronaut).where(Astronaut.id == astronaut_id))
    astro = result.scalar_one_or_none()
    if not astro:
        raise HTTPException(status_code=404, detail=f"Astronaut {astronaut_id} not found.")
    return astro


def _parse_uuid(value: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid UUID: {value}")


def _region_risk(region_id: str, vitals: dict[str, Any] | None) -> tuple[str, str, float]:
    """Derive a simple risk status + color for a body region from latest vitals."""
    if vitals is None:
        return "unknown", "#9e9e9e", 0.0

    risk_score = 0.0

    if region_id == "cardiovascular":
        hr = vitals.get("heart_rate", 72)
        sys = vitals.get("systolic_bp", 118)
        if hr > 100 or sys > 140:
            risk_score = 0.5
        if hr > 120 or sys > 160:
            risk_score = 0.85

    elif region_id == "pulmonary":
        spo2 = vitals.get("spo2_percent", 98)
        if spo2 < 96:
            risk_score = 0.35
        if spo2 < 93:
            risk_score = 0.7
        if spo2 < 90:
            risk_score = 0.95

    elif region_id == "head_neuro":
        mood = vitals.get("mood_score", 7)
        sleep = vitals.get("sleep_hours", 7)
        if mood <= 4 or sleep < 5:
            risk_score = 0.4
        if mood <= 2 or sleep < 3.5:
            risk_score = 0.8

    elif region_id == "musculoskeletal":
        risk_score = 0.15  # baseline spaceflight risk

    elif region_id == "immune_blood":
        rad = vitals.get("radiation_msv_day", 0.5)
        sugar = vitals.get("blood_sugar_mgdl", 95)
        if rad > 1.0:
            risk_score = 0.3
        if rad > 2.5:
            risk_score = 0.7
        if sugar > 180 or sugar < 60:
            risk_score = max(risk_score, 0.5)

    elif region_id == "behavioral_sleep":
        mood = vitals.get("mood_score", 7)
        sleep = vitals.get("sleep_hours", 7)
        if mood <= 4:
            risk_score = 0.35
        if sleep < 5:
            risk_score = max(risk_score, 0.4)

    if risk_score >= 0.6:
        return "critical", "#e53935", round(risk_score, 2)
    elif risk_score >= 0.25:
        return "caution", "#ffb300", round(risk_score, 2)
    else:
        return "nominal", "#43a047", round(risk_score, 2)


# ══════════════════════════════════════════════════════════════════════════════
# 1. Health check
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/health", response_model=HealthCheckResponse)
async def healthcheck(db: AsyncSession = Depends(get_db)):
    settings = get_settings()
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unavailable"

    return HealthCheckResponse(
        status="ok",
        version=settings.APP_VERSION,
        database=db_status,
        demo_mode=settings.DEMO_MODE,
    )


# ══════════════════════════════════════════════════════════════════════════════
# 2. Astronaut profile
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/astronauts/me", response_model=AstronautProfile)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    astro_id_str = current_user.get("astronaut_id")
    if astro_id_str:
        aid = _parse_uuid(astro_id_str)
        astro = await _get_astronaut(db, aid)
    else:
        sub = current_user.get("sub", "")
        result = await db.execute(select(Astronaut).where(Astronaut.auth0_sub == sub))
        astro = result.scalar_one_or_none()
        if not astro:
            raise HTTPException(status_code=404, detail="Astronaut profile not found.")

    return AstronautProfile(
        id=str(astro.id),
        name=astro.name,
        role=astro.role.value if astro.role else "astronaut",
        mission_name=astro.mission_name,
        crew_position=astro.crew_position,
        xp_points=astro.xp_points,
        streak_days=astro.streak_days,
    )


# ══════════════════════════════════════════════════════════════════════════════
# 3. Latest vitals
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/vitals/latest/{astronaut_id}", response_model=Optional[VitalReadingOut])
async def get_latest_vitals(
    astronaut_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    aid = _parse_uuid(astronaut_id)
    result = await db.execute(
        select(VitalTelemetry)
        .where(VitalTelemetry.astronaut_id == aid)
        .order_by(VitalTelemetry.recorded_at.desc())
        .limit(1)
    )
    vital = result.scalar_one_or_none()
    if not vital:
        return None

    return VitalReadingOut(
        id=vital.id,
        astronaut_id=str(vital.astronaut_id),
        recorded_at=vital.recorded_at,
        heart_rate=vital.heart_rate,
        systolic_bp=vital.systolic_bp,
        diastolic_bp=vital.diastolic_bp,
        hrv_ms=vital.hrv_ms,
        blood_sugar_mgdl=vital.blood_sugar_mgdl,
        core_temp_c=vital.core_temp_c,
        sleep_hours=vital.sleep_hours,
        radiation_msv_day=vital.radiation_msv_day,
        mood_score=vital.mood_score,
        spo2_percent=vital.spo2_percent,
        is_simulated=vital.is_simulated,
    )


# ══════════════════════════════════════════════════════════════════════════════
# 4. Vitals timeseries (TimescaleDB time_bucket)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/vitals/timeseries/{astronaut_id}", response_model=list[TimeseriesPoint])
async def get_vitals_timeseries(
    astronaut_id: str,
    range: str = Query("24h", regex="^(24h|7d|30d)$"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    aid = _parse_uuid(astronaut_id)

    bucket_map = {
        "24h": ("1 hour", timedelta(hours=24)),
        "7d": ("6 hours", timedelta(days=7)),
        "30d": ("1 day", timedelta(days=30)),
    }
    bucket_interval, lookback = bucket_map[range]
    since = datetime.now(timezone.utc) - lookback

    query = text(f"""
        SELECT
            time_bucket(:interval, recorded_at) AS bucket,
            AVG(heart_rate)       AS avg_heart_rate,
            AVG(systolic_bp)      AS avg_systolic_bp,
            AVG(diastolic_bp)     AS avg_diastolic_bp,
            AVG(spo2_percent)     AS avg_spo2,
            AVG(core_temp_c)      AS avg_core_temp,
            AVG(radiation_msv_day) AS avg_radiation,
            AVG(mood_score)       AS avg_mood,
            AVG(sleep_hours)      AS avg_sleep
        FROM vital_telemetry
        WHERE astronaut_id = :aid AND recorded_at >= :since
        GROUP BY bucket
        ORDER BY bucket ASC
    """)

    result = await db.execute(query, {"interval": bucket_interval, "aid": aid, "since": since})
    rows = result.mappings().all()

    return [
        TimeseriesPoint(
            bucket=row["bucket"],
            avg_heart_rate=round(row["avg_heart_rate"], 1) if row["avg_heart_rate"] else None,
            avg_systolic_bp=round(row["avg_systolic_bp"], 1) if row["avg_systolic_bp"] else None,
            avg_diastolic_bp=round(row["avg_diastolic_bp"], 1) if row["avg_diastolic_bp"] else None,
            avg_spo2=round(row["avg_spo2"], 1) if row["avg_spo2"] else None,
            avg_core_temp=round(row["avg_core_temp"], 2) if row["avg_core_temp"] else None,
            avg_radiation=round(row["avg_radiation"], 3) if row["avg_radiation"] else None,
            avg_mood=round(row["avg_mood"], 1) if row["avg_mood"] else None,
            avg_sleep=round(row["avg_sleep"], 1) if row["avg_sleep"] else None,
        )
        for row in rows
    ]


# ══════════════════════════════════════════════════════════════════════════════
# 5. Record vitals
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/vitals/record", response_model=VitalReadingOut, status_code=201)
async def record_vitals(
    payload: VitalRecordIn,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    aid = _parse_uuid(payload.astronaut_id)
    await _get_astronaut(db, aid)

    record = VitalTelemetry(
        astronaut_id=aid,
        recorded_at=datetime.now(timezone.utc),
        heart_rate=payload.heart_rate,
        systolic_bp=payload.systolic_bp,
        diastolic_bp=payload.diastolic_bp,
        hrv_ms=payload.hrv_ms,
        blood_sugar_mgdl=payload.blood_sugar_mgdl,
        core_temp_c=payload.core_temp_c,
        sleep_hours=payload.sleep_hours,
        radiation_msv_day=payload.radiation_msv_day,
        mood_score=payload.mood_score,
        spo2_percent=payload.spo2_percent,
        is_simulated=payload.is_simulated,
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)

    # Auto-alert check
    from app.services.twilio_alerts import check_and_alert
    vitals_dict = {
        "heart_rate": record.heart_rate,
        "systolic_bp": record.systolic_bp,
        "spo2_percent": record.spo2_percent,
        "core_temp_c": record.core_temp_c,
        "radiation_msv_day": record.radiation_msv_day,
        "blood_sugar_mgdl": record.blood_sugar_mgdl,
    }
    await check_and_alert(db, vitals_dict, aid)

    return VitalReadingOut(
        id=record.id,
        astronaut_id=str(record.astronaut_id),
        recorded_at=record.recorded_at,
        heart_rate=record.heart_rate,
        systolic_bp=record.systolic_bp,
        diastolic_bp=record.diastolic_bp,
        hrv_ms=record.hrv_ms,
        blood_sugar_mgdl=record.blood_sugar_mgdl,
        core_temp_c=record.core_temp_c,
        sleep_hours=record.sleep_hours,
        radiation_msv_day=record.radiation_msv_day,
        mood_score=record.mood_score,
        spo2_percent=record.spo2_percent,
        is_simulated=record.is_simulated,
    )


# ══════════════════════════════════════════════════════════════════════════════
# 6. Body-map status
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/bodymap/status/{astronaut_id}", response_model=list[BodyRegionStatus])
async def get_bodymap_status(
    astronaut_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    aid = _parse_uuid(astronaut_id)

    result = await db.execute(
        select(VitalTelemetry)
        .where(VitalTelemetry.astronaut_id == aid)
        .order_by(VitalTelemetry.recorded_at.desc())
        .limit(1)
    )
    latest = result.scalar_one_or_none()

    vitals_dict: dict[str, Any] | None = None
    last_ts: datetime | None = None
    if latest:
        vitals_dict = {
            "heart_rate": latest.heart_rate,
            "systolic_bp": latest.systolic_bp,
            "diastolic_bp": latest.diastolic_bp,
            "spo2_percent": latest.spo2_percent,
            "core_temp_c": latest.core_temp_c,
            "radiation_msv_day": latest.radiation_msv_day,
            "blood_sugar_mgdl": latest.blood_sugar_mgdl,
            "mood_score": latest.mood_score,
            "sleep_hours": latest.sleep_hours,
        }
        last_ts = latest.recorded_at

    regions: list[BodyRegionStatus] = []
    for rid, info in BODY_REGIONS.items():
        status_val, color, score = _region_risk(rid, vitals_dict)
        regions.append(
            BodyRegionStatus(
                region_id=rid,
                region_name=info["region_name"],
                status=status_val,
                color=color,
                risk_score=score,
                last_assessed=last_ts,
            )
        )
    return regions


# ══════════════════════════════════════════════════════════════════════════════
# 7. Body-map region detail
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/bodymap/region/{region_id}", response_model=BodyRegionDetail)
async def get_bodymap_region(
    region_id: str,
    current_user: dict = Depends(get_current_user),
):
    info = BODY_REGIONS.get(region_id)
    if not info:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found.")

    return BodyRegionDetail(
        region_id=region_id,
        region_name=info["region_name"],
        status="nominal",
        risk_score=0.1,
        description=info["description"],
        self_exam_steps=info["self_exam_steps"],
        countermeasures=info["countermeasures"],
    )


# ══════════════════════════════════════════════════════════════════════════════
# 8. AI diagnostic evaluation
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/diagnostics/evaluate", response_model=DiagnosticResponse)
async def evaluate_diagnostics(
    payload: DiagnosticRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    aid = _parse_uuid(payload.astronaut_id)
    astro = await _get_astronaut(db, aid)

    # Fetch latest vitals
    result = await db.execute(
        select(VitalTelemetry)
        .where(VitalTelemetry.astronaut_id == aid)
        .order_by(VitalTelemetry.recorded_at.desc())
        .limit(1)
    )
    latest = result.scalar_one_or_none()
    if not latest:
        raise HTTPException(status_code=404, detail="No vital data available for evaluation.")

    vitals_dict = {
        "heart_rate": latest.heart_rate,
        "systolic_bp": latest.systolic_bp,
        "diastolic_bp": latest.diastolic_bp,
        "hrv_ms": latest.hrv_ms,
        "blood_sugar_mgdl": latest.blood_sugar_mgdl,
        "core_temp_c": latest.core_temp_c,
        "sleep_hours": latest.sleep_hours,
        "radiation_msv_day": latest.radiation_msv_day,
        "mood_score": latest.mood_score,
        "spo2_percent": latest.spo2_percent,
    }

    # Get OSDR baselines
    from app.services.nasa_data import get_osdr_baselines, search_medical_knowledge
    osdr = get_osdr_baselines()

    # RAG: embed query and retrieve relevant protocols
    from app.services.gemini_agent import evaluate_astronaut_health, generate_embedding
    query_text = f"astronaut vitals heart_rate={latest.heart_rate} spo2={latest.spo2_percent} radiation={latest.radiation_msv_day}"
    query_emb = await generate_embedding(query_text)
    protocols_raw = await search_medical_knowledge(db, query_emb, limit=5)
    protocols = [
        {"source": p.source, "title": p.title, "content": p.content_text}
        for p in protocols_raw
    ]

    settings = get_settings()
    model_used = "gemini-3.8-flash" if not settings.DEMO_MODE and settings.GEMINI_API_KEY else "demo-mock"

    diag_result = await evaluate_astronaut_health(vitals_dict, osdr, protocols)

    # Persist assessment
    assessment = DiagnosticAssessment(
        astronaut_id=aid,
        assessed_at=datetime.now(timezone.utc),
        risk_level=RiskLevel(diag_result["risk_level"]),
        risk_score=diag_result["risk_score"],
        diagnosis_text=diag_result["diagnosis"],
        countermeasures=diag_result["countermeasures"],
        gemini_model_used=model_used,
        context_chunks_used=[p["title"] for p in protocols],
    )
    db.add(assessment)
    await db.flush()
    await db.refresh(assessment)

    return DiagnosticResponse(
        assessment_id=str(assessment.id),
        risk_level=diag_result["risk_level"],
        risk_score=diag_result["risk_score"],
        diagnosis=diag_result["diagnosis"],
        affected_systems=diag_result.get("affected_systems", []),
        countermeasures=diag_result.get("countermeasures", []),
        escalation_needed=diag_result.get("escalation_needed", False),
        self_exam_steps=diag_result.get("self_exam_steps", []),
        gemini_model_used=model_used,
    )


# ══════════════════════════════════════════════════════════════════════════════
# 9. Health quests — list
# ══════════════════════════════════════════════════════════════════════════════

_QUEST_TEMPLATES = [
    {"quest_type": "exercise", "title": "Complete 30-min ARED Workout", "description": "Perform resistive exercises on ARED targeting major muscle groups.", "xp_reward": 25},
    {"quest_type": "vitals", "title": "Morning Vital Signs Check", "description": "Record your heart rate, blood pressure, and SpO2 within 30 minutes of waking.", "xp_reward": 15},
    {"quest_type": "nutrition", "title": "Hydration Goal: 2.5L Water", "description": "Track and complete your daily water intake target.", "xp_reward": 10},
    {"quest_type": "sleep", "title": "Sleep Hygiene Protocol", "description": "Follow blue-light filtering after 20:00 and log sleep quality.", "xp_reward": 20},
    {"quest_type": "mental_health", "title": "Mindfulness & Crew Check-in", "description": "Complete a 10-minute guided meditation and rate crew dynamics.", "xp_reward": 20},
    {"quest_type": "self_exam", "title": "Weekly Self-Exam: Vision Test", "description": "Perform Snellen chart visual acuity and report any changes.", "xp_reward": 30},
]


@router.get("/quests/{astronaut_id}", response_model=list[QuestOut])
async def get_quests(
    astronaut_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    aid = _parse_uuid(astronaut_id)
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    result = await db.execute(
        select(HealthQuest)
        .where(HealthQuest.astronaut_id == aid, HealthQuest.quest_date >= today_start)
        .order_by(HealthQuest.quest_date)
    )
    quests = result.scalars().all()

    if not quests:
        import random as _rng
        selected = _rng.sample(_QUEST_TEMPLATES, min(4, len(_QUEST_TEMPLATES)))
        new_quests: list[HealthQuest] = []
        for tmpl in selected:
            q = HealthQuest(
                astronaut_id=aid,
                quest_date=datetime.now(timezone.utc),
                quest_type=tmpl["quest_type"],
                title=tmpl["title"],
                description=tmpl["description"],
                xp_reward=tmpl["xp_reward"],
            )
            db.add(q)
            new_quests.append(q)
        await db.flush()
        for q in new_quests:
            await db.refresh(q)
        quests = new_quests

    return [
        QuestOut(
            id=str(q.id),
            quest_type=q.quest_type,
            title=q.title,
            description=q.description,
            xp_reward=q.xp_reward,
            completed=q.completed,
            completed_at=q.completed_at,
        )
        for q in quests
    ]


# ══════════════════════════════════════════════════════════════════════════════
# 10. Complete quest
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/quests/{quest_id}/complete", response_model=QuestCompleteResponse)
async def complete_quest(
    quest_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    qid = _parse_uuid(quest_id)
    result = await db.execute(select(HealthQuest).where(HealthQuest.id == qid))
    quest = result.scalar_one_or_none()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found.")
    if quest.completed:
        raise HTTPException(status_code=400, detail="Quest already completed.")

    quest.completed = True
    quest.completed_at = datetime.now(timezone.utc)

    astro_result = await db.execute(select(Astronaut).where(Astronaut.id == quest.astronaut_id))
    astro = astro_result.scalar_one()
    astro.xp_points += quest.xp_reward
    astro.streak_days += 1

    await db.flush()

    return QuestCompleteResponse(
        quest_id=str(quest.id),
        xp_awarded=quest.xp_reward,
        total_xp=astro.xp_points,
        message=f"Quest '{quest.title}' completed! +{quest.xp_reward} XP",
    )


# ══════════════════════════════════════════════════════════════════════════════
# 11. Manual alert dispatch
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/alerts/send", response_model=dict)
async def send_alert(
    payload: AlertSendRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    aid = _parse_uuid(payload.astronaut_id)
    settings = get_settings()
    to_number = payload.recipient_number or settings.TWILIO_TO_NUMBER or "+10000000000"

    from app.services.twilio_alerts import send_sms_alert, send_whatsapp_alert, initiate_voice_briefing

    if payload.alert_type == "sms":
        result = await send_sms_alert(db, aid, to_number, payload.message)
    elif payload.alert_type == "whatsapp":
        result = await send_whatsapp_alert(db, aid, to_number, payload.message)
    elif payload.alert_type == "voice":
        result = await initiate_voice_briefing(db, aid, to_number, payload.message)
    else:
        raise HTTPException(status_code=400, detail=f"Invalid alert_type: {payload.alert_type}")

    return result


# ══════════════════════════════════════════════════════════════════════════════
# 12. Alert log
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/alerts/log/{astronaut_id}", response_model=list[AlertOut])
async def get_alert_log(
    astronaut_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    aid = _parse_uuid(astronaut_id)
    result = await db.execute(
        select(AlertLog)
        .where(AlertLog.astronaut_id == aid)
        .order_by(AlertLog.created_at.desc())
        .limit(50)
    )
    logs = result.scalars().all()
    return [
        AlertOut(
            id=str(a.id),
            alert_type=a.alert_type.value,
            recipient_number=a.recipient_number,
            message_body=a.message_body,
            twilio_sid=a.twilio_sid,
            status=a.status,
            created_at=a.created_at,
        )
        for a in logs
    ]


# ══════════════════════════════════════════════════════════════════════════════
# 13. DONKI events
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/nasa/donki/events", response_model=list[DonkiEventOut])
async def get_donki_events(
    event_type: str = Query("FLR", regex="^(FLR|SEP)$"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    from app.services.nasa_data import fetch_donki_events, persist_donki_events

    raw_events = await fetch_donki_events(event_type)
    await persist_donki_events(db, raw_events, event_type)

    result = await db.execute(
        select(DonkiEvent)
        .where(DonkiEvent.event_type == event_type)
        .order_by(DonkiEvent.begin_time.desc().nullslast())
        .limit(50)
    )
    events = result.scalars().all()
    return [
        DonkiEventOut(
            id=str(e.id),
            event_type=e.event_type.value,
            event_id_nasa=e.event_id_nasa,
            begin_time=e.begin_time,
            peak_time=e.peak_time,
            end_time=e.end_time,
            class_type=e.class_type,
            source_location=e.source_location,
            severity=e.severity,
        )
        for e in events
    ]


# ══════════════════════════════════════════════════════════════════════════════
# 14. OSDR baselines
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/nasa/osdr/baselines")
async def get_osdr_baselines_endpoint(
    current_user: dict = Depends(get_current_user),
):
    from app.services.nasa_data import get_osdr_baselines
    return get_osdr_baselines()


# ══════════════════════════════════════════════════════════════════════════════
# 15. Simulator seed
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/simulator/seed", response_model=SeedResponse)
async def seed_simulator(
    payload: SeedRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    from app.services.simulator import seed_historical_vitals

    if payload.astronaut_id:
        aid = _parse_uuid(payload.astronaut_id)
    else:
        aid = _parse_uuid(current_user.get("astronaut_id", "00000000-0000-4000-a000-000000000001"))

    await _get_astronaut(db, aid)
    count = await seed_historical_vitals(db, aid, days=payload.days)

    return SeedResponse(
        records_inserted=count,
        astronaut_id=str(aid),
        message=f"Seeded {count} simulated vital records over {payload.days} days.",
    )


# ══════════════════════════════════════════════════════════════════════════════
# 16. Crew overview (CMO / flight surgeon)
# ══════════════════════════════════════════════════════════════════════════════

@router.get(
    "/crew/overview",
    response_model=CrewOverviewResponse,
    dependencies=[Depends(require_role("crew_medical_officer"))],
)
async def get_crew_overview(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Astronaut))
    astronauts = result.scalars().all()

    crew_list: list[CrewMemberOverview] = []
    for astro in astronauts:
        # Get latest assessment
        assess_result = await db.execute(
            select(DiagnosticAssessment)
            .where(DiagnosticAssessment.astronaut_id == astro.id)
            .order_by(DiagnosticAssessment.assessed_at.desc())
            .limit(1)
        )
        assessment = assess_result.scalar_one_or_none()

        crew_list.append(
            CrewMemberOverview(
                astronaut_id=str(astro.id),
                name=astro.name,
                role=astro.role.value if astro.role else "astronaut",
                latest_risk_level=assessment.risk_level.value if assessment else "nominal",
                latest_risk_score=assessment.risk_score if assessment else 0.0,
                xp_points=astro.xp_points,
                streak_days=astro.streak_days,
            )
        )

    return CrewOverviewResponse(crew_count=len(crew_list), crew=crew_list)
