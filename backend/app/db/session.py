"""Async SQLAlchemy engine, session factory, and DB lifecycle helpers."""

from __future__ import annotations

import logging
from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings
from app.db.models import Base

logger = logging.getLogger("astrovitals.db")

settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db() -> None:
    """Create all tables and configure TimescaleDB / pgvector extensions."""
    async with engine.begin() as conn:
        # Enable extensions (safe to run repeatedly)
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"))
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))

        # Create all ORM tables
        await conn.run_sync(Base.metadata.create_all)

        # Convert vital_telemetry to a hypertable (idempotent)
        await conn.execute(
            text(
                "SELECT create_hypertable('vital_telemetry', 'recorded_at', "
                "if_not_exists => TRUE, migrate_data => TRUE);"
            )
        )

    logger.info("Database initialised — extensions enabled, hypertable configured.")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an async database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
