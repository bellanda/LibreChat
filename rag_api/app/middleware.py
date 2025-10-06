# app/middleware.py
import asyncio
import os
from datetime import datetime, timezone

import jwt
from fastapi import Request
from fastapi.responses import JSONResponse
from jwt import PyJWTError

from app.config import RAG_PROCESSING_TIMEOUT, RAG_UPLOAD_TIMEOUT, logger


async def security_middleware(request: Request, call_next):
    async def next_middleware_call():
        return await call_next(request)

    if request.url.path in {"/docs", "/openapi.json", "/health"}:
        return await next_middleware_call()

    jwt_secret = os.getenv("JWT_SECRET")
    if not jwt_secret:
        logger.warn("JWT_SECRET not found in environment variables")
        return await next_middleware_call()

    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        logger.info(f"Unauthorized request with missing or invalid Authorization header to: {request.url.path}")
        return JSONResponse(
            status_code=401,
            content={"detail": "Missing or invalid Authorization header"},
        )

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        exp_timestamp = payload.get("exp")
        if exp_timestamp and datetime.now(tz=timezone.utc) > datetime.fromtimestamp(exp_timestamp, tz=timezone.utc):
            logger.info(f"Unauthorized request with expired token to: {request.url.path}")
            return JSONResponse(status_code=401, content={"detail": "Token has expired"})

        request.state.user = payload
        logger.debug(f"{request.url.path} - {payload}")
    except PyJWTError as e:
        logger.info(f"Unauthorized request with invalid token to: {request.url.path}, reason: {str(e)}")
        return JSONResponse(status_code=401, content={"detail": f"Invalid token: {str(e)}"})

    return await next_middleware_call()


async def timeout_middleware(request: Request, call_next):
    """Middleware to handle timeouts for upload and processing requests."""
    # Determine timeout based on endpoint
    if request.url.path in ["/embed", "/text"]:
        timeout = RAG_UPLOAD_TIMEOUT
    elif request.url.path in ["/query", "/query_multiple"]:
        timeout = RAG_PROCESSING_TIMEOUT
    else:
        timeout = 30  # Default timeout for other endpoints

    try:
        # Apply timeout to the request
        response = await asyncio.wait_for(call_next(request), timeout=timeout)
        return response
    except asyncio.TimeoutError:
        logger.error(f"Request timeout after {timeout} seconds for path: {request.url.path}")
        return JSONResponse(status_code=408, content={"detail": f"Request timeout after {timeout} seconds"})
    except Exception as e:
        logger.error(f"Unexpected error in timeout middleware: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
