"""Draw API endpoint."""

from fastapi import APIRouter, HTTPException

from app.models.draw import DrawRequest, DrawResponse
from app.services.draw_service import DrawService

router = APIRouter()


@router.post("/", response_model=DrawResponse)
async def draw_cards(request: DrawRequest):
    """
    Draw cards for a tarot reading.

    Uses cryptographically secure randomness (SystemRandom via /dev/urandom).
    Returns the drawn cards, their positions, orientations, and the seed
    used for this draw (for transparency/verification).

    The seed can be used with the verify endpoint to reproduce the exact
    same draw, proving no manipulation occurred.
    """
    try:
        response = DrawService.draw(request)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify", response_model=DrawResponse)
async def verify_draw(seed: str, spread_type: str):
    """
    Verify a previous draw by reproducing it from its seed.

    This provides cryptographic transparency: given the same seed,
    the same cards will always be drawn in the same positions with
    the same orientations. Users can independently verify fairness.
    """
    try:
        response = DrawService.verify_draw(seed, spread_type)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
