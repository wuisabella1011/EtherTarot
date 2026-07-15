"""API v1 routes."""

from fastapi import APIRouter

from app.api.v1.cards import router as cards_router
from app.api.v1.draw import router as draw_router
from app.api.v1.interpret import router as interpret_router

router = APIRouter()
router.include_router(cards_router, prefix="/cards", tags=["cards"])
router.include_router(draw_router, prefix="/draw", tags=["draw"])
router.include_router(interpret_router, prefix="/interpret", tags=["interpret"])
