"""JSON data loader and in-memory card repository."""

import json
from pathlib import Path
from typing import Optional

from app.models.tarot import ArcanaType, Suit, TarotCard


class CardRepository:
    """
    In-memory repository of all 78 tarot cards.
    Loaded once at application startup. Read-only after initialization.
    """

    def __init__(self, data_dir: Optional[Path] = None):
        if data_dir is None:
            data_dir = Path(__file__).parent

        self._cards: dict[str, TarotCard] = {}
        self._by_arcana: dict[ArcanaType, list[TarotCard]] = {a: [] for a in ArcanaType}
        self._by_suit: dict[Suit, list[TarotCard]] = {s: [] for s in Suit}
        self._by_element: dict[str, list[TarotCard]] = {}
        self._spreads: dict = {}

        self._load_cards(data_dir)
        self._load_spreads(data_dir)
        self._build_indexes()

    def _load_cards(self, data_dir: Path) -> None:
        """Load all card JSON files into validated Pydantic models."""
        # Load Major Arcana
        major_path = data_dir / "major_arcana.json"
        if not major_path.exists():
            raise FileNotFoundError(f"Major Arcana data not found at {major_path}")

        with open(major_path) as f:
            raw = json.load(f)
        for card_data in raw:
            card = TarotCard(**card_data)
            self._cards[card.id] = card

        # Load Minor Arcana from individual suit files
        minor_dir = data_dir / "minor_arcana"
        for suit_file in sorted(minor_dir.glob("*.json")):
            with open(suit_file) as f:
                raw = json.load(f)
            for card_data in raw:
                card = TarotCard(**card_data)
                self._cards[card.id] = card

        # Verify completeness
        if len(self._cards) != 78:
            raise ValueError(
                f"Expected 78 tarot cards, loaded {len(self._cards)}. "
                "Check your data files."
            )

    def _load_spreads(self, data_dir: Path) -> None:
        spreads_path = data_dir / "spreads.json"
        if spreads_path.exists():
            with open(spreads_path) as f:
                self._spreads = json.load(f)

    def _build_indexes(self) -> None:
        """Build secondary indexes for fast lookup."""
        for card in self._cards.values():
            self._by_arcana[card.arcana].append(card)
            if card.suit:
                self._by_suit[card.suit].append(card)
            if card.element:
                self._by_element.setdefault(card.element, []).append(card)

    # ── Queries ──

    def get_all(self) -> list[TarotCard]:
        """Return all 78 cards."""
        return list(self._cards.values())

    def get_by_id(self, card_id: str) -> TarotCard:
        """Get a single card by its ID."""
        if card_id not in self._cards:
            raise KeyError(f"Card '{card_id}' not found")
        return self._cards[card_id]

    def get_by_arcana(self, arcana: ArcanaType) -> list[TarotCard]:
        """Get all cards of a given arcana type."""
        return self._by_arcana.get(arcana, [])

    def get_by_suit(self, suit: Suit) -> list[TarotCard]:
        """Get all cards of a given suit."""
        return self._by_suit.get(suit, [])

    def get_major_arcana_sorted(self) -> list[TarotCard]:
        """Return Major Arcana in numbered order (The Fool's Journey)."""
        return sorted(self._by_arcana[ArcanaType.MAJOR], key=lambda c: c.number)

    def get_spread(self, spread_type: str) -> dict | None:
        """Return spread definition by type."""
        return self._spreads.get(spread_type)

    def get_all_spreads(self) -> list[dict]:
        """Return all available spread types with metadata."""
        return [
            {
                "type": key,
                "name": val["name"],
                "name_zh": val["name_zh"],
                "description": val["description"],
                "card_count": val["card_count"],
            }
            for key, val in self._spreads.items()
        ]

    def __len__(self) -> int:
        return len(self._cards)


# Module-level singleton — initialized once at startup
_repository: Optional[CardRepository] = None


def get_card_repository() -> CardRepository:
    """
    Return the singleton CardRepository.
    On first call, loads all card data from disk.
    Subsequent calls return the cached instance.
    """
    global _repository
    if _repository is None:
        _repository = CardRepository()
    return _repository
