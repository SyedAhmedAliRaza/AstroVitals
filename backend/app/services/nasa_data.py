"""NASA data integration — DONKI API, OSDR baselines, HRP knowledge base."""

from __future__ import annotations

import json
import logging
import os
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx
import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models import DonkiEvent, DonkiEventType, NasaMedicalKnowledge

logger = logging.getLogger("astrovitals.nasa_data")

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

# ── Cached DONKI fallback ────────────────────────────────────────────────────

_CACHED_DONKI_EVENTS: list[dict[str, Any]] = [
    {
        "flrID": "2024-01-01T12:00:00-FLR-001",
        "beginTime": "2024-01-01T12:00Z",
        "peakTime": "2024-01-01T13:15Z",
        "endTime": "2024-01-01T14:30Z",
        "classType": "M5.2",
        "sourceLocation": "N14E30",
    },
    {
        "flrID": "2024-02-15T08:30:00-FLR-002",
        "beginTime": "2024-02-15T08:30Z",
        "peakTime": "2024-02-15T09:45Z",
        "endTime": "2024-02-15T11:00Z",
        "classType": "X1.1",
        "sourceLocation": "S22W15",
    },
]


# ── DONKI API ────────────────────────────────────────────────────────────────

async def fetch_donki_events(
    event_type: str = "FLR",
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[dict[str, Any]]:
    """Fetch Solar Flare (FLR) or Solar Energetic Particle (SEP) events from NASA DONKI.

    Falls back to cached sample data on network failure or in DEMO_MODE.
    """
    settings = get_settings()

    if settings.DEMO_MODE:
        logger.info("DEMO_MODE — returning cached DONKI events.")
        return _CACHED_DONKI_EVENTS

    _start = start_date or (date.today() - timedelta(days=30))
    _end = end_date or date.today()

    url = f"https://api.nasa.gov/DONKI/{event_type}"
    params = {
        "startDate": _start.isoformat(),
        "endDate": _end.isoformat(),
        "api_key": settings.NASA_DONKI_API_KEY,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            if not isinstance(data, list):
                data = []
            logger.info("Fetched %d DONKI %s events.", len(data), event_type)
            return data
    except Exception as exc:
        logger.warning("DONKI API call failed (%s); using cached data.", exc)
        return _CACHED_DONKI_EVENTS


async def persist_donki_events(db: AsyncSession, events: list[dict[str, Any]], event_type: str = "FLR") -> int:
    """Parse raw DONKI JSON and upsert into donki_events table. Returns count inserted."""
    count = 0
    for raw in events:
        event_id_nasa = raw.get("flrID") or raw.get("sepID") or raw.get("eventID")
        if not event_id_nasa:
            continue

        existing = await db.execute(
            select(DonkiEvent).where(DonkiEvent.event_id_nasa == event_id_nasa)
        )
        if existing.scalar_one_or_none():
            continue

        def _parse_dt(s: str | None) -> datetime | None:
            if not s:
                return None
            try:
                return datetime.fromisoformat(s.replace("Z", "+00:00"))
            except Exception:
                return None

        evt = DonkiEvent(
            event_type=DonkiEventType.FLR if event_type == "FLR" else DonkiEventType.SEP,
            event_id_nasa=event_id_nasa,
            begin_time=_parse_dt(raw.get("beginTime")),
            peak_time=_parse_dt(raw.get("peakTime")),
            end_time=_parse_dt(raw.get("endTime")),
            class_type=raw.get("classType"),
            source_location=raw.get("sourceLocation"),
            severity=raw.get("classType"),
            raw_json=raw,
        )
        db.add(evt)
        count += 1

    if count:
        await db.flush()
    return count


# ── OSDR baselines ───────────────────────────────────────────────────────────

def get_osdr_baselines() -> dict[str, Any]:
    """Load OSDR reference data from the local JSON bundle."""
    osdr_path = DATA_DIR / "osdr_baselines.json"
    with open(osdr_path, "r", encoding="utf-8") as fh:
        return json.load(fh)


# ── HRP / NASA-STD-3001 knowledge chunks ────────────────────────────────────

_HRP_CHUNKS: list[dict[str, str]] = [
    {
        "source": "HRP-5-Hazards",
        "title": "Space Radiation Hazard",
        "category": "radiation",
        "content": (
            "NASA's Human Research Program identifies space radiation as one of the five hazards of human spaceflight. "
            "Galactic Cosmic Rays (GCRs) and Solar Particle Events (SPEs) can cause acute radiation syndrome at high doses "
            "(>0.5 Gy) and elevate long-term cancer risk. Career dose limits are set per NASA-STD-3001 Vol. 1: "
            "600 mSv effective dose for all astronauts. Mitigation includes real-time dosimetry, storm shelters, "
            "and pharmacological countermeasures under investigation (e.g., amifostine analogs)."
        ),
    },
    {
        "source": "HRP-5-Hazards",
        "title": "Isolation and Confinement Hazard",
        "category": "behavioral_health",
        "content": (
            "Isolation and confinement during long-duration missions can impair cognitive performance, increase interpersonal "
            "conflict, and cause mood disorders. NASA-STD-3001 Vol. 2 mandates behavioral health monitoring, private medical "
            "conferences, and resilience training. Countermeasures include structured social time, access to nature imagery, "
            "and cognitive behavioral self-help tools."
        ),
    },
    {
        "source": "HRP-5-Hazards",
        "title": "Distance from Earth Hazard",
        "category": "autonomy",
        "content": (
            "Communication delays of up to 22 minutes one-way to Mars demand crew autonomy in medical decision-making. "
            "AstroVitals-class systems must support onboard diagnostic capability. NASA HRP research on autonomous medical "
            "care includes ultrasound training, AI-assisted triage, and telemedicine protocols."
        ),
    },
    {
        "source": "HRP-5-Hazards",
        "title": "Gravity Fields Hazard (Microgravity Effects)",
        "category": "musculoskeletal",
        "content": (
            "Microgravity causes 1-2% bone mineral density loss per month (particularly in load-bearing bones), "
            "muscle atrophy up to 20% in the first 2 weeks, and cardiovascular deconditioning (reduced stroke volume, "
            "orthostatic intolerance). Countermeasures mandated by NASA-STD-3001 include 2.5 hours/day of exercise "
            "(resistive + aerobic on ARED/CEVIS/T2), bisphosphonate prophylaxis, and compression garments."
        ),
    },
    {
        "source": "HRP-5-Hazards",
        "title": "Hostile/Closed Environments Hazard",
        "category": "environmental",
        "content": (
            "The closed spacecraft environment presents risks of elevated CO2, off-gassing contaminants, noise-induced "
            "hearing loss, and altered microbiome. NASA-STD-3001 limits: CO2 < 5.3 mmHg (8-hr TWA), noise < 72 dBA "
            "(continuous). Neurovestibular symptoms (Space Motion Sickness) affect ~60-80% of crew in the first 72 hours."
        ),
    },
    {
        "source": "NASA-STD-3001",
        "title": "Vital Sign Reference Thresholds (NASA-STD-3001 Vol. 1)",
        "category": "vitals_thresholds",
        "content": (
            "NASA-STD-3001 Vol. 1 defines acceptable physiological ranges for spaceflight crew: "
            "Heart Rate 55-85 bpm nominal (>100 bpm concern, >120 bpm critical); "
            "Blood Pressure 100-130/60-85 mmHg nominal; SpO2 ≥96% nominal (<93% concern, <90% critical); "
            "Core Temperature 36.1-37.5°C nominal (>38.0°C concern, >39.0°C critical); "
            "Daily radiation dose <1 mSv nominal (>2.5 mSv concern, >5 mSv critical action level)."
        ),
    },
    {
        "source": "CSA-CardioDecon",
        "title": "CSA Cardiovascular Deconditioning Guidelines",
        "category": "cardiovascular",
        "content": (
            "Canadian Space Agency guidelines on cardiovascular deconditioning note that microgravity induces "
            "a 10-15% reduction in left ventricular mass over 6 months, reduced baroreflex sensitivity, "
            "and increased arterial stiffness. Monitoring protocol includes weekly echocardiography, "
            "continuous HRV tracking, and orthostatic tolerance testing using LBNP. "
            "In-flight countermeasures: 30 min/day aerobic exercise at 75-85% VO2max, fluid loading "
            "protocol (1L isotonic solution) before EVA, and thigh-cuff venous occlusion sessions."
        ),
    },
    {
        "source": "CSA-CardioDecon",
        "title": "CSA SANS Monitoring Protocol",
        "category": "neuro_ocular",
        "content": (
            "Spaceflight-Associated Neuro-ocular Syndrome (SANS) monitoring per CSA guidelines includes "
            "fundoscopy every 14 days, OCT retinal imaging monthly, and ICP assessment via optic nerve sheath "
            "diameter ultrasonography. Risk factors: mission duration >30 days, male sex, and higher BMI. "
            "Countermeasures: lower body negative pressure (LBNP) 30 min/day, and dietary sodium restriction."
        ),
    },
    {
        "source": "OSD-575",
        "title": "Inspiration4 Blood Biomarker Insights",
        "category": "biomarkers",
        "content": (
            "The Inspiration4 mission (OSD-575) revealed significant post-flight elevations in inflammatory "
            "cytokines: IL-6 increased ~480%, CRP ~437%, and TNF-α ~158% compared to pre-flight baselines. "
            "Cardiac biomarkers showed BNP elevation of ~189% (fluid shift marker) and Troponin I increase "
            "of ~183% (cardiac stress marker). These changes were largely reversible within 3 months of return."
        ),
    },
]


def get_hrp_knowledge_chunks() -> list[dict[str, str]]:
    """Return pre-defined text chunks for the 5 Hazards, NASA-STD-3001, and CSA guidelines."""
    return _HRP_CHUNKS


# ── Embedding and knowledge-base seeding ─────────────────────────────────────

async def seed_medical_knowledge(db: AsyncSession) -> int:
    """Embed all HRP/OSDR knowledge chunks and insert into nasa_medical_knowledge.

    Uses Gemini text-embedding-004 for real embeddings, or random dummy vectors in DEMO_MODE.
    Returns count of new records inserted.
    """
    settings = get_settings()
    chunks = get_hrp_knowledge_chunks()
    count = 0

    for chunk in chunks:
        # Skip if already seeded (match on title + source)
        existing = await db.execute(
            select(NasaMedicalKnowledge).where(
                NasaMedicalKnowledge.source == chunk["source"],
                NasaMedicalKnowledge.title == chunk["title"],
            )
        )
        if existing.scalar_one_or_none():
            continue

        if settings.DEMO_MODE or not settings.GEMINI_API_KEY:
            embedding = np.random.default_rng(hash(chunk["title"]) % (2**31)).normal(size=768).tolist()
        else:
            from app.services.gemini_agent import generate_embedding
            embedding = await generate_embedding(chunk["content"])

        record = NasaMedicalKnowledge(
            source=chunk["source"],
            title=chunk["title"],
            content_text=chunk["content"],
            category=chunk.get("category"),
            embedding=embedding,
        )
        db.add(record)
        count += 1

    if count:
        await db.flush()
    logger.info("Seeded %d medical knowledge chunks.", count)
    return count


async def search_medical_knowledge(
    db: AsyncSession,
    query_embedding: list[float],
    limit: int = 5,
) -> list[NasaMedicalKnowledge]:
    """Cosine-similarity search over nasa_medical_knowledge using pgvector."""
    from pgvector.sqlalchemy import Vector

    stmt = (
        select(NasaMedicalKnowledge)
        .order_by(NasaMedicalKnowledge.embedding.cosine_distance(query_embedding))
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())
