"""Oracle Engine — the central interpretation pipeline for EtherTarot.

Two-stage architecture:
1. Intent Analysis (Haiku, temp=0.1) — classify the querent's concern
2. Deep Interpretation (Opus, temp=0.5-0.8) — generate the reading

Uses LangChain LCEL for composable, streaming-capable chains.
"""

from __future__ import annotations

from typing import Literal

try:
    from langchain_anthropic import ChatAnthropic
    from langchain_core.output_parsers import PydanticOutputParser
    from langchain_core.prompts import ChatPromptTemplate
    _LANGCHAIN_AVAILABLE = True
except ImportError:
    _LANGCHAIN_AVAILABLE = False

from pydantic import BaseModel, Field

from app.engine.prompts import (
    INTENT_ANALYSIS_PROMPT,
    INTERPRETATION_PROMPT,
    PHILOSOPHICAL_SYSTEM,
    PSYCHOLOGICAL_SYSTEM,
)
from app.models.draw import DrawnCard


# ── Stage 1 Output Schema ──

class IntentAnalysis(BaseModel):
    primary_intent: str = Field(
        description="Core concern category",
        enum=[
            "decision_conflict", "self_exploration", "relationship_dynamic",
            "career_crossroads", "emotional_healing", "spiritual_awakening",
            "creative_block", "life_transition",
        ],
    )
    emotional_tone: str = Field(
        enum=["anxious", "curious", "hopeful", "grieving", "determined", "confused", "resigned"],
    )
    readiness_level: str = Field(
        enum=["exploring", "committed", "resistant"],
    )
    suggested_focus: str = Field(description="What the reading should emphasize")


# ── Oracle Engine ──

class OracleEngine:
    """Two-stage tarot interpretation engine."""

    def __init__(self, api_key: str | None = None):
        if not _LANGCHAIN_AVAILABLE:
            raise ImportError(
                "LangChain is required for the Oracle engine. "
                "Install it with: pip install langchain langchain-anthropic"
            )
        # Stage 1: Fast, cheap classifier
        self.classifier = ChatAnthropic(
            model="claude-haiku-4-5-20251001",
            temperature=0.1,
            max_tokens=256,
            api_key=api_key,
        )

        # Stage 2: Deep interpreter
        self.interpreter = ChatAnthropic(
            model="claude-opus-4-5-20251101",
            temperature=0.7,
            max_tokens=4096,
            api_key=api_key,
        )

    def _format_cards_short(self, cards: list[DrawnCard]) -> str:
        """Format cards for the lightweight intent classifier."""
        lines = []
        for dc in cards:
            c = dc.card
            orientation = dc.orientation.value
            keywords = (
                c.keywords_upright if orientation == "upright"
                else c.keywords_reversed
            )
            lines.append(f"- {c.name_en} ({orientation}) in {dc.position}: {', '.join(keywords[:4])}")
        return "\n".join(lines)

    def _format_cards_rich(self, cards: list[DrawnCard]) -> str:
        """Format cards with full context for the deep interpreter."""
        lines = []
        for dc in cards:
            lines.append(dc.card.to_context_string(dc.position, dc.orientation.value))
            lines.append("")
        return "\n".join(lines)

    def analyze_intent(
        self, question: str, cards: list[DrawnCard], spread_type: str,
    ) -> IntentAnalysis:
        """Stage 1: Classify the querent's intent and emotional landscape."""
        prompt = ChatPromptTemplate.from_template(INTENT_ANALYSIS_PROMPT)
        parser = PydanticOutputParser(pydantic_object=IntentAnalysis)

        chain = prompt | self.classifier | parser

        result = chain.invoke({
            "question": question or "General life guidance",
            "cards_summary": self._format_cards_short(cards),
            "spread_type": spread_type,
        })
        return result

    def interpret(
        self,
        cards: list[DrawnCard],
        spread_type: str,
        question: str | None = None,
        tone: Literal["philosophical", "psychological"] = "philosophical",
    ) -> dict:
        """Full two-stage interpretation pipeline."""
        # Stage 1: Analyze intent
        intent = self.analyze_intent(
            question or "General life guidance", cards, spread_type,
        )

        # Stage 2: Deep interpretation
        system_prompt = (
            PHILOSOPHICAL_SYSTEM if tone == "philosophical"
            else PSYCHOLOGICAL_SYSTEM
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", INTERPRETATION_PROMPT),
        ])

        # Use structured output for reliable JSON
        structured_llm = self.interpreter.with_structured_output(method="json_mode")

        chain = prompt | structured_llm

        result = chain.invoke({
            "question": question or "General life guidance",
            "primary_intent": intent.primary_intent,
            "emotional_tone": intent.emotional_tone,
            "readiness_level": intent.readiness_level,
            "card_context": self._format_cards_rich(cards),
        })
        return result


# ── Module-level singleton ──

_oracle: OracleEngine | None = None


def get_oracle_engine(api_key: str | None = None) -> OracleEngine:
    global _oracle
    if _oracle is None:
        _oracle = OracleEngine(api_key=api_key)
    return _oracle
