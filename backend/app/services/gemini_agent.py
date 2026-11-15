"""Gemini AI diagnostic engine — embeddings, structured health evaluation, and RAG."""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any

import numpy as np

from app.config import get_settings

logger = logging.getLogger("astrovitals.gemini")

# ── Lazy-init Gemini client ──────────────────────────────────────────────────

_client: Any = None


def _get_client():
    """Create or return the cached google.genai Client."""
    global _client
    if _client is None:
        from google import genai
        settings = get_settings()
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


# ── Embeddings ───────────────────────────────────────────────────────────────

async def generate_embedding(text: str) -> list[float]:
    """Generate a 768-dimensional embedding using Gemini text-embedding-004."""
    settings = get_settings()

    if settings.DEMO_MODE or not settings.GEMINI_API_KEY:
        rng = np.random.default_rng(hash(text) % (2**31))
        return rng.normal(size=768).tolist()

    client = _get_client()
    result = client.models.embed_content(
        model="text-embedding-004",
        contents=text,
    )
    return list(result.embeddings[0].values)


# ── Structured diagnostic evaluation ────────────────────────────────────────

_SYSTEM_PROMPT = """\
You are **AstroVitals AI**, a flight-surgeon-grade diagnostic engine deployed aboard a deep-space mission.
You analyse astronaut vital-sign telemetry, NASA OSDR biomarker reference ranges, and relevant HRP/CSA medical protocols retrieved via RAG.

Your output MUST conform to the JSON schema provided.  Be medically precise but understandable to a crew medical officer.
When assigning risk_level:
  - "nominal" — all values within NASA-STD-3001 nominal ranges, no action needed.
  - "caution" — one or more values in the concern band, recommend monitoring.
  - "critical" — any value in the critical band or multi-system concern, immediate action required.
"""

DIAGNOSTIC_SCHEMA = {
    "type": "object",
    "properties": {
        "risk_level": {"type": "string", "enum": ["nominal", "caution", "critical"]},
        "risk_score": {"type": "number", "description": "0.0 (safe) to 1.0 (critical)"},
        "diagnosis": {"type": "string", "description": "Concise medical assessment."},
        "affected_systems": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Body systems impacted, e.g. cardiovascular, neuro-ocular."
        },
        "countermeasures": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Ordered list of recommended countermeasures."
        },
        "escalation_needed": {"type": "boolean", "description": "Whether to alert ground control."},
        "self_exam_steps": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Steps the astronaut should perform for self-assessment."
        },
    },
    "required": [
        "risk_level", "risk_score", "diagnosis", "affected_systems",
        "countermeasures", "escalation_needed", "self_exam_steps",
    ],
}


async def evaluate_astronaut_health(
    vitals: dict[str, Any],
    osdr_baselines: dict[str, Any],
    relevant_protocols: list[dict[str, str]],
) -> dict[str, Any]:
    """Run a Gemini-powered health evaluation combining vitals, OSDR data, and RAG protocol chunks.

    In DEMO_MODE a realistic mock diagnostic JSON is returned.
    """
    settings = get_settings()

    if settings.DEMO_MODE or not settings.GEMINI_API_KEY:
        return _mock_diagnostic(vitals)

    # Build prompt with context
    protocol_text = "\n\n".join(
        f"### {p['title']} ({p['source']})\n{p['content']}"
        for p in relevant_protocols
    )

    user_prompt = (
        f"## Current Vital Signs\n```json\n{json.dumps(vitals, indent=2)}\n```\n\n"
        f"## OSDR Reference Thresholds\n```json\n{json.dumps(osdr_baselines.get('reference_thresholds', {}), indent=2)}\n```\n\n"
        f"## Relevant Medical Protocols (RAG-retrieved)\n{protocol_text}\n\n"
        "Perform a comprehensive diagnostic evaluation."
    )

    client = _get_client()
    from google.genai import types

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=_SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=DIAGNOSTIC_SCHEMA,
            temperature=0.3,
        ),
    )

    try:
        result = json.loads(response.text)
    except (json.JSONDecodeError, AttributeError):
        logger.error("Failed to parse Gemini response: %s", response.text)
        result = _mock_diagnostic(vitals)

    return result


def _mock_diagnostic(vitals: dict[str, Any]) -> dict[str, Any]:
    """Generate a realistic mock diagnostic for DEMO_MODE."""
    hr = vitals.get("heart_rate", 72)
    spo2 = vitals.get("spo2_percent", 98)
    temp = vitals.get("core_temp_c", 36.8)
    sys_bp = vitals.get("systolic_bp", 118)
    radiation = vitals.get("radiation_msv_day", 0.5)

    risk_score = 0.0
    affected = []
    countermeasures = []
    escalation = False

    # Evaluate each system
    if hr > 100:
        risk_score += 0.2
        affected.append("cardiovascular")
        countermeasures.append("Rest for 15 minutes and re-measure heart rate.")
    if hr > 120:
        risk_score += 0.3
        escalation = True
        countermeasures.append("Administer oral hydration protocol (500 mL isotonic).")

    if spo2 < 93:
        risk_score += 0.3
        affected.append("pulmonary")
        countermeasures.append("Check cabin O2 levels; apply supplemental O2 if below 20.9%.")
    if spo2 < 90:
        risk_score += 0.2
        escalation = True

    if temp > 38.0:
        risk_score += 0.15
        affected.append("thermoregulation")
        countermeasures.append("Remove extra layers, apply cooling towels, monitor for 30 min.")
    if temp > 39.0:
        risk_score += 0.25
        escalation = True
        countermeasures.append("Administer 1g acetaminophen per CMO protocol.")

    if sys_bp > 145:
        risk_score += 0.15
        affected.append("cardiovascular")
        countermeasures.append("Reduce sodium intake; perform relaxation breathing exercise.")

    if radiation > 2.5:
        risk_score += 0.2
        affected.append("radiation_exposure")
        countermeasures.append("Relocate to storm shelter; don radiation vest.")
    if radiation > 5.0:
        risk_score += 0.3
        escalation = True

    risk_score = min(risk_score, 1.0)

    if risk_score >= 0.6:
        risk_level = "critical"
    elif risk_score >= 0.25:
        risk_level = "caution"
    else:
        risk_level = "nominal"

    if not affected:
        affected = ["none"]
    if not countermeasures:
        countermeasures = ["Continue routine monitoring per NASA-STD-3001 schedule."]

    diagnosis_parts = []
    if risk_level == "nominal":
        diagnosis_parts.append("All vital signs within NASA-STD-3001 nominal ranges.")
        diagnosis_parts.append("Astronaut is fit for duty including EVA readiness.")
    elif risk_level == "caution":
        diagnosis_parts.append(f"Mild deviations detected in {', '.join(affected)}.")
        diagnosis_parts.append("Recommend enhanced monitoring frequency (every 2 hours).")
    else:
        diagnosis_parts.append(f"Critical values detected in {', '.join(affected)}.")
        diagnosis_parts.append("Immediate CMO evaluation required. Ground control notification advised.")

    return {
        "risk_level": risk_level,
        "risk_score": round(risk_score, 2),
        "diagnosis": " ".join(diagnosis_parts),
        "affected_systems": list(set(affected)),
        "countermeasures": countermeasures,
        "escalation_needed": escalation,
        "self_exam_steps": [
            "1. Sit upright and remain still for 2 minutes.",
            "2. Re-measure heart rate and SpO2 using wrist biosensor.",
            "3. Check pupil response with penlight (equal and reactive).",
            "4. Perform grip-strength test with dynamometer (both hands).",
            "5. Report subjective symptoms: headache, nausea, visual changes, chest pain.",
            "6. Log findings in AstroVitals and notify CMO if any abnormality persists.",
        ],
    }
