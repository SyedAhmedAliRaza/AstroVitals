"""AstroVitals configuration — Pydantic Settings loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings sourced from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://astrovitals:astrovitals@localhost:5432/astrovitals"

    # ── Gemini AI ─────────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""

    # ── Auth0 ─────────────────────────────────────────────────────────────────
    AUTH0_DOMAIN: str = ""
    AUTH0_AUDIENCE: str = ""
    AUTH0_CLIENT_ID: str = ""
    AUTH0_CLIENT_SECRET: str = ""

    # ── Twilio ────────────────────────────────────────────────────────────────
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    TWILIO_TO_NUMBER: str = ""

    # ── NASA DONKI ────────────────────────────────────────────────────────────
    NASA_DONKI_API_KEY: str = "DEMO_KEY"

    # ── Demo mode (bypass external services) ──────────────────────────────────
    DEMO_MODE: bool = True

    # ── App metadata ──────────────────────────────────────────────────────────
    APP_TITLE: str = "AstroVitals"
    APP_VERSION: str = "0.1.0"
    CORS_ORIGINS: str = "*"


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton of application settings."""
    return Settings()
