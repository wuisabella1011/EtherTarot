"""Cryptographically secure card drawing service.

Seeds generated via secrets module (cryptographic entropy from OS).
Draws use random.Random for deterministic, verifiable reproduction:
  - Same seed → same cards, same positions, same orientations
  - This is the correct pattern for transparency/verification
"""

import hashlib
import random
import secrets
from datetime import datetime, timezone

from app.data.loader import get_card_repository
from app.models.draw import DrawnCard, DrawRequest, DrawResponse, Orientation


def _seed_to_int(seed_str: str) -> int:
    """Convert seed string to deterministic integer for Random seeding."""
    return int.from_bytes(hashlib.sha256(seed_str.encode()).digest()[:8])


class DrawService:

    @staticmethod
    def _shuffle_and_draw(deck, card_count: int, seed: str, positions: list):
        seed_int = _seed_to_int(seed)
        rng = random.Random(seed_int)
        pool = list(deck)

        # Fisher-Yates
        for i in range(len(pool) - 1, 0, -1):
            j = rng.randint(0, i)
            pool[i], pool[j] = pool[j], pool[i]

        drawn = pool[:card_count]
        result = []
        for i, card in enumerate(drawn):
            pos = positions[i] if i < len(positions) else positions[-1]
            orientation = Orientation.UPRIGHT if rng.random() < 0.5 else Orientation.REVERSED
            result.append(DrawnCard(
                card=card,
                position=pos["id"],
                position_description=pos.get("description", ""),
                orientation=orientation,
            ))
        return result

    @staticmethod
    def draw(request: DrawRequest) -> DrawResponse:
        repo = get_card_repository()
        spread = repo.get_spread(request.spread_type.value)
        if spread is None:
            raise ValueError(f"Unknown spread type: {request.spread_type}")

        deck = repo.get_all()
        positions = spread["positions"]
        card_count: int = spread["card_count"]

        # Generate seed with cryptographic entropy
        if request.client_seed:
            server_nonce = secrets.token_hex(16)
            seed = hashlib.sha256(
                f"{request.client_seed}:{server_nonce}".encode()
            ).hexdigest()
        else:
            seed = secrets.token_hex(32)

        cards = DrawService._shuffle_and_draw(deck, card_count, seed, positions)

        return DrawResponse(
            cards=cards,
            seed=seed,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    @staticmethod
    def verify_draw(seed: str, spread_type: str) -> DrawResponse:
        repo = get_card_repository()
        spread = repo.get_spread(spread_type)
        if spread is None:
            raise ValueError(f"Unknown spread type: {spread_type}")

        deck = repo.get_all()
        positions = spread["positions"]
        card_count: int = spread["card_count"]

        cards = DrawService._shuffle_and_draw(deck, card_count, seed, positions)

        return DrawResponse(
            cards=cards,
            seed=seed,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
