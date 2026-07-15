"""Tests for the draw API."""


def test_draw_single(client):
    """Should draw exactly 1 card."""
    r = client.post("/api/v1/draw/", json={"spread_type": "single"})
    assert r.status_code == 200
    data = r.json()
    assert len(data["cards"]) == 1
    assert "seed" in data
    assert len(data["seed"]) == 64  # 32 bytes hex
    assert "timestamp" in data


def test_draw_three_card(client):
    """Should draw exactly 3 cards with correct positions."""
    r = client.post("/api/v1/draw/", json={"spread_type": "three-card"})
    assert r.status_code == 200
    data = r.json()
    assert len(data["cards"]) == 3

    positions = [c["position"] for c in data["cards"]]
    assert positions == ["past", "present", "future"]

    # Each drawn card should have position description
    for card in data["cards"]:
        assert card["position_description"]


def test_draw_celtic_cross(client):
    """Should draw exactly 10 cards."""
    r = client.post("/api/v1/draw/", json={"spread_type": "celtic-cross"})
    assert r.status_code == 200
    data = r.json()
    assert len(data["cards"]) == 10


def test_draw_orientation(client):
    """Each drawn card should have a valid orientation."""
    r = client.post("/api/v1/draw/", json={"spread_type": "three-card"})
    assert r.status_code == 200
    for card in r.json()["cards"]:
        assert card["orientation"] in ("upright", "reversed")


def test_draw_uniqueness(client):
    """Multiple draws should be unique (probabilistic — fails 1 in ~10^30)."""
    r1 = client.post("/api/v1/draw/", json={"spread_type": "three-card"})
    r2 = client.post("/api/v1/draw/", json={"spread_type": "three-card"})
    seed1 = r1.json()["seed"]
    seed2 = r2.json()["seed"]
    assert seed1 != seed2, "Two draws produced the same seed (astronomically unlikely)"


def test_draw_seed_reproducibility(client):
    """The same seed should produce the same draw every time."""
    r1 = client.post("/api/v1/draw/", json={"spread_type": "three-card"})
    seed = r1.json()["seed"]

    r2 = client.post(
        "/api/v1/draw/verify",
        params={"seed": seed, "spread_type": "three-card"},
    )
    assert r2.status_code == 200

    cards1 = [
        (c["card"]["id"], c["orientation"]) for c in r1.json()["cards"]
    ]
    cards2 = [
        (c["card"]["id"], c["orientation"]) for c in r2.json()["cards"]
    ]
    assert cards1 == cards2, (
        f"Same seed produced different results!\n"
        f"First:  {cards1}\n"
        f"Second: {cards2}"
    )


def test_draw_invalid_spread(client):
    """Should return 400 for unknown spread type."""
    r = client.post("/api/v1/draw/", json={"spread_type": "invalid"})
    assert r.status_code == 400 or r.status_code == 422


def test_draw_all_unique_cards(client):
    """All cards in a draw should be unique (no duplicates in a single draw)."""
    r = client.post("/api/v1/draw/", json={"spread_type": "celtic-cross"})
    assert r.status_code == 200
    card_ids = [c["card"]["id"] for c in r.json()["cards"]]
    assert len(card_ids) == len(set(card_ids)), "Duplicate cards found in draw"


def test_draw_each_card_has_meaning(client):
    """Drawn cards should include meaning text."""
    r = client.post("/api/v1/draw/", json={"spread_type": "three-card"})
    for card in r.json()["cards"]:
        c = card["card"]
        assert len(c["upright_meaning"]) > 50
        assert len(c["reversed_meaning"]) > 50
        assert len(c["keywords_upright"]) >= 3
