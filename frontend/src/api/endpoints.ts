const API_BASE = '/api/v1';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Cards ──

export function listCards(params?: { arcana?: string; suit?: string }) {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return fetchJSON<import('../types/tarot').TarotCard[]>(`${API_BASE}/cards/${qs ? `?${qs}` : ''}`);
}

export function getCard(cardId: string) {
  return fetchJSON<import('../types/tarot').TarotCard>(`${API_BASE}/cards/${cardId}`);
}

// ── Spreads ──

export function listSpreads() {
  return fetchJSON<import('../types/tarot').SpreadDefinition[]>(`${API_BASE}/cards/spreads/list`);
}

// ── Draw ──

export function drawCards(spreadType: string) {
  return fetchJSON<import('../types/tarot').DrawResponse>(`${API_BASE}/draw/`, {
    method: 'POST',
    body: JSON.stringify({ spread_type: spreadType }),
  });
}

// ── Interpret ──

export function interpret(params: {
  spread_type: string;
  question?: string;
  client_seed?: string;
  tone: string;
}) {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return fetchJSON<{ draw: import('../types/tarot').DrawResponse; interpretation: import('../types/tarot').InterpretationReport }>(
    `${API_BASE}/interpret/?${qs}`,
    { method: 'POST' }
  );
}
