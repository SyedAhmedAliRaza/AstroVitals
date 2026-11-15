"""
AstroVitals — Autonomous Astronaut Health Monitoring & Space Medicine Platform
Main FastAPI application entry point.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router as api_v1_router
from app.config import get_settings
from app.db.session import init_db

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("astrovitals")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for database initialization and background services."""
    logger.info("Initializing AstroVitals Space Medicine Platform...")
    try:
        await init_db()
        logger.info("Tiger Data (TimescaleDB + pgvector) database initialized successfully.")
    except Exception as e:
        logger.warning(
            f"Database initialization deferred or failed: {e}. "
            "Continuing in DEMO_MODE if active."
        )

    # In DEMO_MODE, seed default knowledge base & demo astronaut in background if possible
    if settings.DEMO_MODE:
        logger.info("Running in DEMO_MODE: Offline simulation fallback active.")

    yield

    logger.info("Shutting down AstroVitals platform.")


app = FastAPI(
    title="AstroVitals API",
    description=(
        "Autonomous Astronaut Health Monitoring & Space Medicine Platform "
        "built for NASA Space Apps Challenge 2026. Powered by Tiger Data "
        "(TimescaleDB + pgvector), Google Gemini AI, Auth0, and Twilio."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if "*" in origins:
    allow_origins = ["*"]
else:
    allow_origins = origins or ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_v1_router)


@app.get("/", tags=["System"])
async def root():
    """Root platform heartbeat."""
    return {
        "service": "AstroVitals Autonomous Space Medicine Platform",
        "version": settings.APP_VERSION,
        "status": "OPERATIONAL",
        "demo_mode": settings.DEMO_MODE,
        "docs": "/docs",
    }


@app.get("/health", tags=["System"])
async def health_check():
    """System health verification check."""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "astrovitals-backend",
            "version": settings.APP_VERSION,
            "demo_mode": settings.DEMO_MODE,
        },
    )
