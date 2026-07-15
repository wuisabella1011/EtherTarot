"""Models for the interpretation output."""

from pydantic import BaseModel, Field


class PhilosophicalSection(BaseModel):
    narrative: str = Field(description="Archetypal story told by these cards")
    archetypes: list[str] = Field(description="Jungian archetypes active in this reading")
    mythic_theme: str = Field(description="The mythological pattern at play")
    soul_question: str = Field(description="The deeper question the querent's soul is asking")


class PsychologicalSection(BaseModel):
    current_patterns: str = Field(description="Behavioral and cognitive patterns revealed")
    blind_spots: list[str] = Field(description="Patterns the querent may not see")
    emotional_landscape: str = Field(description="Map of emotions shown in the cards")
    actionable_guidance: str = Field(description="Concrete steps grounded in these insights")


class ThreeDimensions(BaseModel):
    """The three-dimensional reading framework."""

    class DimensionSection(BaseModel):
        title: str
        narrative: str = Field(min_length=80)

    situation: DimensionSection = Field(description="The current landscape — what is")
    dynamics: DimensionSection = Field(description="The forces in motion — what is shifting")
    transcendence: DimensionSection = Field(description="The path forward — what is becoming")


class CardNote(BaseModel):
    card_id: str
    card_name: str
    position: str
    orientation: str
    positional_meaning: str
    key_symbol: str


class InterpretationReport(BaseModel):
    """Complete interpretation output — the JSON sent to the frontend."""

    overview: str = Field(
        min_length=100, max_length=500, description="Holistic summary of the reading"
    )
    three_dimensions: ThreeDimensions
    synthesis: str = Field(
        max_length=200, description="One-line wisdom — the reading's motto"
    )
    card_notes: list[CardNote]


class InterpretationRequest(BaseModel):
    draw_seed: str = Field(description="Seed of the draw to interpret")
    tone: str = Field(default="philosophical", pattern="^(philosophical|psychological)$")
    question: str | None = None
