"""Test fixtures for EtherTarot API tests."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    """Provide a FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def card_ids(client: TestClient) -> list[str]:
    """All 78 card IDs."""
    r = client.get("/api/v1/cards/")
    return [c["id"] for c in r.json()]


@pytest.fixture
def three_card_draw(client: TestClient) -> dict:
    """A sample three-card draw."""
    r = client.post("/api/v1/draw/", json={"spread_type": "three-card"})
    assert r.status_code == 200
    return r.json()
