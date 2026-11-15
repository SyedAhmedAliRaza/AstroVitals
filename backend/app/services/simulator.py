"""Continuous astronaut vital-sign simulator with physiologically realistic drift."""

from __future__ import annotations

import math
import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import VitalTelemetry


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def generate_vitals(
    astronaut_id: uuid.UUID,
    mission_day: int,
    recorded_at: Optional[datetime] = None,
) -> VitalTelemetry:
    """Generate a single physiologically-realistic vital-sign record.

    Values drift based on *mission_day* to mimic microgravity adaptation:
    - Cardiovascular deconditioning (lower BP, elevated resting HR)
    - Circadian disruption (declining sleep quality)
    - Cumulative radiation exposure
    - Mid-mission mood dip
    """
    rng = random.Random()
    day_frac = min(mission_day / 180.0, 1.0)  # normalise to 6-month mission

    # ── Heart Rate ────────────────────────────────────────────────────────
    hr_base = 65.0 + 8.0 * day_frac  # slight elevation over time
    heart_rate = _clamp(hr_base + rng.gauss(0, 5), 45, 120)

    # ── Blood Pressure (trending lower in microgravity) ───────────────────
    sys_base = 120.0 - 6.0 * day_frac
    dia_base = 78.0 - 5.0 * day_frac
    systolic_bp = _clamp(sys_base + rng.gauss(0, 6), 90, 160)
    diastolic_bp = _clamp(dia_base + rng.gauss(0, 4), 50, 100)

    # ── HRV ───────────────────────────────────────────────────────────────
    hrv_base = 55.0 - 10.0 * day_frac
    hrv_ms = _clamp(hrv_base + rng.gauss(0, 8), 15, 90)

    # ── Blood Sugar ───────────────────────────────────────────────────────
    blood_sugar = _clamp(95.0 + rng.gauss(0, 15), 65, 180)

    # ── Core Temperature ─────────────────────────────────────────────────
    core_temp = _clamp(36.8 + rng.gauss(0, 0.25), 36.0, 38.0)

    # ── Sleep (declining trend due to circadian disruption) ───────────────
    sleep_base = 7.0 - 1.5 * day_frac
    sleep_hours = _clamp(sleep_base + rng.gauss(0, 0.6), 3.0, 9.0)

    # ── Radiation (baseline + occasional spikes) ─────────────────────────
    rad_base = 0.5 + 0.2 * day_frac
    if rng.random() < 0.05:  # 5 % chance of solar-event spike
        rad_base += rng.uniform(1.0, 4.0)
    radiation = _clamp(rad_base + rng.gauss(0, 0.15), 0.1, 8.0)

    # ── Mood (fatigue curve — dip mid-mission) ───────────────────────────
    mood_curve = 7.0 - 2.5 * math.sin(math.pi * day_frac)
    mood_score = int(_clamp(mood_curve + rng.gauss(0, 0.8), 1, 10))

    # ── SpO2 ──────────────────────────────────────────────────────────────
    spo2 = _clamp(97.5 + rng.gauss(0, 0.8), 92, 100)

    # ── Occasional anomalous readings for alert testing (3 % chance) ─────
    if rng.random() < 0.03:
        anomaly = rng.choice(["hr_high", "spo2_low", "temp_high", "bp_high"])
        if anomaly == "hr_high":
            heart_rate = rng.uniform(110, 140)
        elif anomaly == "spo2_low":
            spo2 = rng.uniform(88, 93)
        elif anomaly == "temp_high":
            core_temp = rng.uniform(38.2, 39.5)
        elif anomaly == "bp_high":
            systolic_bp = rng.uniform(150, 180)

    return VitalTelemetry(
        astronaut_id=astronaut_id,
        recorded_at=recorded_at or datetime.now(timezone.utc),
        heart_rate=round(heart_rate, 1),
        systolic_bp=round(systolic_bp, 1),
        diastolic_bp=round(diastolic_bp, 1),
        hrv_ms=round(hrv_ms, 1),
        blood_sugar_mgdl=round(blood_sugar, 1),
        core_temp_c=round(core_temp, 2),
        sleep_hours=round(sleep_hours, 1),
        radiation_msv_day=round(radiation, 3),
        mood_score=mood_score,
        spo2_percent=round(spo2, 1),
        is_simulated=True,
    )


async def seed_historical_vitals(
    db: AsyncSession,
    astronaut_id: uuid.UUID,
    days: int = 30,
) -> int:
    """Bulk-insert *days* worth of simulated telemetry (4 readings per day).

    Returns the total number of records inserted.
    """
    now = datetime.now(timezone.utc)
    records: list[VitalTelemetry] = []

    for day_offset in range(days, 0, -1):
        for hour_offset in [6, 12, 18, 23]:
            ts = now - timedelta(days=day_offset) + timedelta(hours=hour_offset)
            mission_day = days - day_offset + 1
            record = generate_vitals(astronaut_id, mission_day, recorded_at=ts)
            records.append(record)

    db.add_all(records)
    await db.flush()
    return len(records)
