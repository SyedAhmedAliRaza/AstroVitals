"""Auth0 JWT verification and FastAPI auth dependencies."""

from __future__ import annotations

import logging
import uuid
from typing import Any, Optional

import httpx
from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt

from app.config import get_settings

logger = logging.getLogger("astrovitals.auth")

# ── In-memory JWKS cache ────────────────────────────────────────────────────

_jwks_cache: dict[str, Any] | None = None


async def _fetch_jwks(domain: str) -> dict[str, Any]:
    """Fetch JSON Web Key Set from Auth0 and cache it in memory."""
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache

    jwks_url = f"https://{domain}/.well-known/jwks.json"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(jwks_url)
        resp.raise_for_status()
        _jwks_cache = resp.json()
    logger.info("JWKS keys fetched and cached from %s", jwks_url)
    return _jwks_cache


def _get_signing_key(jwks: dict[str, Any], token: str) -> dict[str, Any]:
    """Extract the RSA signing key matching the token's kid header."""
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")
    for key in jwks.get("keys", []):
        if key["kid"] == kid:
            return key
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unable to find appropriate signing key.",
    )


# ── Demo-mode mock user ─────────────────────────────────────────────────────

DEMO_USER: dict[str, Any] = {
    "sub": "demo|astrovitals-demo-user",
    "name": "Commander Ava Chen",
    "email": "ava.chen@astrovitals.dev",
    "role": "crew_medical_officer",
    "astronaut_id": str(uuid.UUID("00000000-0000-4000-a000-000000000001")),
}


# ── FastAPI dependencies ────────────────────────────────────────────────────

async def get_current_user(request: Request) -> dict[str, Any]:
    """Validate JWT bearer token and return decoded claims.

    In DEMO_MODE the token check is bypassed and a mock user is returned.
    """
    settings = get_settings()

    if settings.DEMO_MODE:
        return DEMO_USER

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.split(" ", 1)[1]

    try:
        jwks = await _fetch_jwks(settings.AUTH0_DOMAIN)
        signing_key = _get_signing_key(jwks, token)

        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            audience=settings.AUTH0_AUDIENCE,
            issuer=f"https://{settings.AUTH0_DOMAIN}/",
        )
        return payload
    except JWTError as exc:
        logger.warning("JWT verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(role: str):
    """Return a dependency that ensures the authenticated user has the given role."""

    async def _role_checker(
        current_user: dict[str, Any] = Depends(get_current_user),
    ) -> dict[str, Any]:
        settings = get_settings()

        if settings.DEMO_MODE:
            return current_user

        user_roles: list[str] = current_user.get("astrovitals/roles", [])
        user_role_claim: str | None = current_user.get("role")

        if role in user_roles or user_role_claim == role:
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{role}' is required for this endpoint.",
        )

    return _role_checker
