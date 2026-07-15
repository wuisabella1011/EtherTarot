"""Request/response models for the draw API."""

from datetime import datetime, timezone
from enum import StrEnum
from typing import Optional

from pydantic import BaseModel, Field

from app.models.tarot import TarotCard


class Orientation(StrEnum):
    UPRIGHT = "upright"
    REVERSED = "reversed"


class SpreadType(StrEnum):
    SINGLE = "single"
    THREE_CARD = "three-card"
    CELTIC_CROSS = "celtic-cross"


class DrawnCard(BaseModel):
    """A card as it appears in a reading — with position and orientation."""

    card: TarotCard
    position: str
    orientation: Orientation
    position_description: str = ""


class DrawRequest(BaseModel):
    spread_type: SpreadType = SpreadType.THREE_CARD
    question: Optional[str] = Field(default=None, max_length=500)
    client_seed: Optional[str] = Field(default=None, description="User-provided entropy")


class DrawResponse(BaseModel):
    cards: list[DrawnCard]
    seed: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
