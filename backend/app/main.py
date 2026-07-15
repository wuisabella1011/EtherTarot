"""EtherTarot API — FastAPI application."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.data.loader import get_card_repository
from app.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    get_card_repository()
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Premium tarot reading API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix=settings.api_v1_prefix)


@app.get("/api/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "app": settings.app_name}
