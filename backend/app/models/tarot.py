"""Pydantic models for EtherTarot card database."""

from datetime import datetime, timezone
from enum import StrEnum
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


class ArcanaType(StrEnum):
    MAJOR = "major"
    MINOR = "minor"


class Suit(StrEnum):
    WANDS = "wands"
    CUPS = "cups"
    SWORDS = "swords"
    PENTACLES = "pentacles"


class PsychologicalArchetype(StrEnum):
    THE_INNOCENT = "the_innocent"
    THE_ORPHAN = "the_orphan"
    THE_HERO = "the_hero"
    THE_CAREGIVER = "the_caregiver"
    THE_EXPLORER = "the_explorer"
    THE_REBEL = "the_rebel"
    THE_LOVER = "the_lover"
    THE_CREATOR = "the_creator"
    THE_JESTER = "the_jester"
    THE_SAGE = "the_sage"
    THE_MAGICIAN = "the_magician"
    THE_RULER = "the_ruler"
    THE_SHADOW = "the_shadow"


class SymbolItem(BaseModel):
    """A single visual symbol on a tarot card and its esoteric meaning."""

    name: str
    description: str
    position: Optional[str] = None


class RelatedCard(BaseModel):
    """Cross-reference to another card."""

    card_id: str
    relationship: str


class TarotCard(BaseModel):
    """Complete tarot card data model — one of 78 cards."""

    # ── Identity ──
    id: str = Field(pattern=r"^(major|minor)-\d{2,3}$")
    name_en: str
    name_zh: str

    # ── Visual ──
    image_url: str = ""
    thumbnail_url: str = ""

    # ── Classification ──
    arcana: ArcanaType
    suit: Optional[Suit] = None
    number: int = Field(ge=0, le=21)

    # ── Keywords ──
    keywords_upright: list[str] = Field(min_length=3, max_length=12)
    keywords_reversed: list[str] = Field(min_length=3, max_length=12)

    # ── Meanings ──
    upright_meaning: str = Field(min_length=100)
    reversed_meaning: str = Field(min_length=100)

    # ── Depth ──
    psychological_archetype: PsychologicalArchetype
    symbolism: str = ""
    symbols: list[SymbolItem] = Field(default_factory=list)
    element: Optional[Literal["fire", "water", "air", "earth"]] = None
    planet: Optional[str] = None
    zodiac: Optional[str] = None
    numerology: Optional[int] = None

    # ── Interpretation metadata ──
    aspect_shadow: str = Field(default="", description="The shadow side — unrecognized patterns")
    aspect_light: str = Field(default="", description="The light side — developed qualities")
    soul_question: str = Field(default="", description="The soul-level question this card poses")

    # ── Relations ──
    related_cards: list[RelatedCard] = Field(default_factory=list)

    # ── Metadata ──
    source: str = "Rider-Waite-Smith (standard)"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode="after")
    def validate_arcana_consistency(self) -> "TarotCard":
        if self.arcana == ArcanaType.MAJOR:
            if self.suit is not None:
                raise ValueError(f"Major Arcana card {self.id} must have suit=None")
            if self.number > 21:
                raise ValueError(f"Major Arcana number must be 0-21, got {self.number}")
        else:
            if self.suit is None:
                raise ValueError(f"Minor Arcana card {self.id} must have a suit")
            if self.number < 1 or self.number > 14:
                raise ValueError(f"Minor Arcana number must be 1-14, got {self.number}")
            if self.element is None:
                raise ValueError(f"Minor Arcana card {self.id} must have an element")
        return self

    def get_meaning(self, orientation: str) -> str:
        """Return meaning text based on orientation."""
        return self.upright_meaning if orientation == "upright" else self.reversed_meaning

    def to_context_string(self, position: str, orientation: str) -> str:
        """Format card for LLM prompt injection (token-efficient)."""
        meaning = self.get_meaning(orientation)
        keywords = (
            self.keywords_upright if orientation == "upright" else self.keywords_reversed
        )
        return (
            f"{self.name_en} ({orientation}) in {position} position:\n"
            f"Keywords: {', '.join(keywords[:6])}\n"
            f"Archetype: {self.psychological_archetype.value}\n"
            f"Element: {self.element or 'N/A'}\n"
            f"Meaning: {meaning[:300]}"
        )
