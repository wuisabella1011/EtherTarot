"""Tests for card API endpoints."""


def test_list_all_cards(client):
    """Should return all 78 cards."""
    r = client.get("/api/v1/cards/")
    assert r.status_code == 200
    cards = r.json()
    assert len(cards) == 78, f"Expected 78 cards, got {len(cards)}"

    # Verify card structure
    card = cards[0]
    assert "id" in card
    assert "name_en" in card
    assert "name_zh" in card
    assert "arcana" in card
    assert "keywords_upright" in card


def test_filter_by_major_arcana(client):
    """Should return only Major Arcana cards."""
    r = client.get("/api/v1/cards/?arcana=major")
    assert r.status_code == 200
    cards = r.json()
    assert len(cards) == 22
    assert all(c["arcana"] == "major" for c in cards)


def test_filter_by_suit_swords(client):
    """Should return 14 Swords cards."""
    r = client.get("/api/v1/cards/?suit=swords")
    assert r.status_code == 200
    cards = r.json()
    assert len(cards) == 14
    assert all(c["suit"] == "swords" for c in cards)


def test_get_single_card(client):
    """Should return full card details."""
    r = client.get("/api/v1/cards/major-00")
    assert r.status_code == 200
    card = r.json()
    assert card["name_en"] == "The Fool"
    assert card["name_zh"] == "愚者"
    assert card["arcana"] == "major"
    assert card["number"] == 0
    assert "psychological_archetype" in card
    assert len(card["keywords_upright"]) >= 3
    assert len(card["upright_meaning"]) > 100


def test_get_nonexistent_card(client):
    """Should return 404."""
    r = client.get("/api/v1/cards/nonexistent-99")
    assert r.status_code == 404


def test_list_spreads(client):
    """Should return all available spread types."""
    r = client.get("/api/v1/cards/spreads/list")
    assert r.status_code == 200
    spreads = r.json()
    assert len(spreads) == 3
    types = [s["type"] for s in spreads]
    assert "single" in types
    assert "three-card" in types
    assert "celtic-cross" in types
