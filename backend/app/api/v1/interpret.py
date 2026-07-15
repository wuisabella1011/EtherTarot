"""Interpretation API endpoint."""

from fastapi import APIRouter, HTTPException

from app.models.interpretation import InterpretationReport
from app.models.draw import DrawRequest
from app.services.draw_service import DrawService
from app.engine.oracle import get_oracle_engine
from app.settings import settings

router = APIRouter()


@router.post("/")
async def interpret(
    spread_type: str = "three-card",
    question: str | None = None,
    client_seed: str | None = None,
    tone: str = "philosophical",
):
    """
    Perform a full tarot reading: draw cards + interpret.

    This is the main endpoint for the app. It:
    1. Draws cards cryptographically (or verifies a seed)
    2. Runs the two-stage oracle engine:
       - Stage 1: Intent analysis (Haiku, temp=0.1)
       - Stage 2: Deep interpretation (Opus, temp varies by tone)

    Args:
        spread_type: 'single', 'three-card', or 'celtic-cross'
        question: Optional querent question (max 500 chars)
        client_seed: Optional seed for draw verification
        tone: 'philosophical' (archetypal, mythic) or 'psychological' (CBT, behavioral)
    """
    # Draw cards
    if client_seed:
        draw_response = DrawService.verify_draw(client_seed, spread_type)
    else:
        draw_request = DrawRequest(
            spread_type=spread_type,
            question=question,
        )
        draw_response = DrawService.draw(draw_request)

    # Interpret
    try:
        oracle = get_oracle_engine(api_key=settings.anthropic_api_key)
        interpretation = oracle.interpret(
            cards=draw_response.cards,
            spread_type=spread_type,
            question=question,
            tone=tone,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Interpretation failed: {str(e)}. Your draw seed is {draw_response.seed} — you can retry interpretation with this seed.",
        )

    return {
        "draw": draw_response.model_dump(),
        "interpretation": interpretation,
    }
