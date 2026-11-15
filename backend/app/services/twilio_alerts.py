"""Twilio emergency alert dispatch — SMS, WhatsApp, Voice."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models import AlertLog, AlertType

logger = logging.getLogger("astrovitals.alerts")


# ── Alert dispatch functions ─────────────────────────────────────────────────

async def send_sms_alert(
    db: AsyncSession,
    astronaut_id: uuid.UUID,
    to: str,
    body: str,
) -> dict[str, Any]:
    """Send an SMS alert via Twilio (or log to console in DEMO_MODE)."""
    settings = get_settings()
    twilio_sid: Optional[str] = None
    status = "sent"

    if settings.DEMO_MODE or not settings.TWILIO_ACCOUNT_SID:
        logger.info("[DEMO SMS] To=%s Body=%s", to, body[:100])
        twilio_sid = f"DEMO_SM_{uuid.uuid4().hex[:12]}"
        status = "demo_logged"
    else:
        try:
            from twilio.rest import Client as TwilioClient
            client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=body,
                from_=settings.TWILIO_FROM_NUMBER,
                to=to,
            )
            twilio_sid = message.sid
            status = message.status or "queued"
            logger.info("SMS sent: SID=%s", twilio_sid)
        except Exception as exc:
            logger.error("Twilio SMS failed: %s", exc)
            twilio_sid = None
            status = f"failed: {exc}"

    log_entry = AlertLog(
        astronaut_id=astronaut_id,
        alert_type=AlertType.sms,
        recipient_number=to,
        message_body=body,
        twilio_sid=twilio_sid,
        status=status,
    )
    db.add(log_entry)
    await db.flush()

    return {"alert_type": "sms", "twilio_sid": twilio_sid, "status": status}


async def send_whatsapp_alert(
    db: AsyncSession,
    astronaut_id: uuid.UUID,
    to: str,
    body: str,
) -> dict[str, Any]:
    """Send a WhatsApp message via Twilio sandbox (or log in DEMO_MODE)."""
    settings = get_settings()
    twilio_sid: Optional[str] = None
    status = "sent"

    whatsapp_to = f"whatsapp:{to}" if not to.startswith("whatsapp:") else to

    if settings.DEMO_MODE or not settings.TWILIO_ACCOUNT_SID:
        logger.info("[DEMO WhatsApp] To=%s Body=%s", whatsapp_to, body[:100])
        twilio_sid = f"DEMO_WA_{uuid.uuid4().hex[:12]}"
        status = "demo_logged"
    else:
        try:
            from twilio.rest import Client as TwilioClient
            client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=body,
                from_=f"whatsapp:{settings.TWILIO_FROM_NUMBER}",
                to=whatsapp_to,
            )
            twilio_sid = message.sid
            status = message.status or "queued"
            logger.info("WhatsApp sent: SID=%s", twilio_sid)
        except Exception as exc:
            logger.error("Twilio WhatsApp failed: %s", exc)
            twilio_sid = None
            status = f"failed: {exc}"

    log_entry = AlertLog(
        astronaut_id=astronaut_id,
        alert_type=AlertType.whatsapp,
        recipient_number=to,
        message_body=body,
        twilio_sid=twilio_sid,
        status=status,
    )
    db.add(log_entry)
    await db.flush()

    return {"alert_type": "whatsapp", "twilio_sid": twilio_sid, "status": status}


async def initiate_voice_briefing(
    db: AsyncSession,
    astronaut_id: uuid.UUID,
    to: str,
    twiml_message: str,
) -> dict[str, Any]:
    """Initiate a voice call with TwiML (or log in DEMO_MODE)."""
    settings = get_settings()
    twilio_sid: Optional[str] = None
    status = "initiated"

    twiml_body = f"<Response><Say voice='Polly.Joanna'>{twiml_message}</Say></Response>"

    if settings.DEMO_MODE or not settings.TWILIO_ACCOUNT_SID:
        logger.info("[DEMO Voice] To=%s TwiML=%s", to, twiml_message[:100])
        twilio_sid = f"DEMO_CA_{uuid.uuid4().hex[:12]}"
        status = "demo_logged"
    else:
        try:
            from twilio.rest import Client as TwilioClient
            client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            call = client.calls.create(
                twiml=twiml_body,
                from_=settings.TWILIO_FROM_NUMBER,
                to=to,
            )
            twilio_sid = call.sid
            status = call.status or "initiated"
            logger.info("Voice call initiated: SID=%s", twilio_sid)
        except Exception as exc:
            logger.error("Twilio Voice failed: %s", exc)
            twilio_sid = None
            status = f"failed: {exc}"

    log_entry = AlertLog(
        astronaut_id=astronaut_id,
        alert_type=AlertType.voice,
        recipient_number=to,
        message_body=twiml_message,
        twilio_sid=twilio_sid,
        status=status,
    )
    db.add(log_entry)
    await db.flush()

    return {"alert_type": "voice", "twilio_sid": twilio_sid, "status": status}


# ── Auto-alert evaluator ────────────────────────────────────────────────────

CRITICAL_THRESHOLDS = {
    "heart_rate": {"low": 40, "high": 120},
    "spo2_percent": {"low": 90, "high": None},
    "core_temp_c": {"low": 35.0, "high": 39.0},
    "systolic_bp": {"low": 85, "high": 160},
    "radiation_msv_day": {"low": None, "high": 5.0},
    "blood_sugar_mgdl": {"low": 50, "high": 250},
}


async def check_and_alert(
    db: AsyncSession,
    vitals: dict[str, Any],
    astronaut_id: uuid.UUID,
    astronaut_name: str = "Astronaut",
) -> list[dict[str, Any]]:
    """Evaluate vitals against critical thresholds and auto-dispatch alerts if triggered.

    Returns a list of alert results (empty if nothing triggered).
    """
    settings = get_settings()
    alerts_sent: list[dict[str, Any]] = []
    violations: list[str] = []

    for metric, bounds in CRITICAL_THRESHOLDS.items():
        value = vitals.get(metric)
        if value is None:
            continue

        low = bounds.get("low")
        high = bounds.get("high")

        if low is not None and value < low:
            violations.append(f"{metric}={value} (below critical {low})")
        if high is not None and value > high:
            violations.append(f"{metric}={value} (above critical {high})")

    if not violations:
        return alerts_sent

    body = (
        f"🚨 AstroVitals CRITICAL ALERT for {astronaut_name}\n"
        f"Violations:\n" + "\n".join(f"  • {v}" for v in violations) +
        f"\n\nImmediate medical evaluation required."
    )

    to_number = settings.TWILIO_TO_NUMBER or "+10000000000"

    sms_result = await send_sms_alert(db, astronaut_id, to_number, body)
    alerts_sent.append(sms_result)

    if len(violations) >= 2:
        voice_msg = (
            f"Critical health alert for {astronaut_name}. "
            f"Multiple vital signs outside safe limits: {', '.join(violations[:3])}. "
            "Requesting immediate medical officer response."
        )
        voice_result = await initiate_voice_briefing(db, astronaut_id, to_number, voice_msg)
        alerts_sent.append(voice_result)

    return alerts_sent
