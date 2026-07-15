"""Card library API endpoints."""

from fastapi import APIRouter, HTTPException, Query

from app.data.loader import get_card_repository

router = APIRouter()


@router.get("/")
async def list_cards(
    arcana: str | None = Query(None, description="Filter by arcana: major or minor"),
    suit: str | None = Query(None, description="Filter by suit: wands, cups, swords, pentacles"),
):
    """List all tarot cards, optionally filtered by arcana or suit.

    Returns a simplified card list (id, name, arcana, suit, number, keywords)
    for the card library browser. For full card data, use the single card endpoint.
    """
    repo = get_card_repository()
    cards = repo.get_all()

    if arcana:
        cards = [c for c in cards if c.arcana.value == arcana]

    if suit:
        cards = [c for c in cards if c.suit and c.suit.value == suit]

    # Return lightweight card summaries
    return [
        {
            "id": c.id,
            "name_en": c.name_en,
            "name_zh": c.name_zh,
            "arcana": c.arcana.value,
            "suit": c.suit.value if c.suit else None,
            "number": c.number,
            "keywords_upright": c.keywords_upright[:5],
            "element": c.element,
            "psychological_archetype": c.psychological_archetype.value,
        }
        for c in sorted(cards, key=lambda c: (c.arcana.value, c.suit or "", c.number))
    ]


@router.get("/{card_id}")
async def get_card(card_id: str):
    """Get a single tarot card with full metadata and meanings."""
    repo = get_card_repository()
    try:
        card = repo.get_by_id(card_id)
        return card.model_dump()
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Card '{card_id}' not found")


@router.get("/spreads/list")
async def list_spreads():
    """List all available tarot spread types."""
    repo = get_card_repository()
    return repo.get_all_spreads()


@router.get("/spreads/{spread_type}")
async def get_spread(spread_type: str):
    """Get a specific spread definition with full position details."""
    repo = get_card_repository()
    spread = repo.get_spread(spread_type)
    if spread is None:
        raise HTTPException(status_code=404, detail=f"Spread '{spread_type}' not found")
    return spread
