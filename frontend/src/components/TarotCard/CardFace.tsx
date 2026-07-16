import type { DrawnCard } from '../../types/tarot';

interface Props { card: DrawnCard; }

const ELEMENT_LABELS: Record<string, string> = {
  fire: '🔥火', water: '💧水', air: '🌬风', earth: '⛰土',
};

export default function CardFace({ card }: Props) {
  const c = card.card;
  const isUpright = card.orientation === 'upright';
  const keywords = (isUpright ? c.keywords_upright : c.keywords_reversed).slice(0, 3);
  const suitLabel = c.suit || 'major';
  const archLabel = c.psychological_archetype.replace(/_/g, ' ');

  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 12,
      backfaceVisibility: 'hidden',
      transform: 'rotateY(180deg)',
      background: `radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.06) 0%, transparent 60%),
                   linear-gradient(180deg, #1a1416 0%, #0d0a0b 100%)`,
      border: '1px solid rgba(201,168,76,0.3)',
      boxShadow: '0 0 20px rgba(201,168,76,0.25), 0 0 60px rgba(74,14,46,0.2)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Archetype banner */}
      <div style={{ padding: '5px 8px', textAlign: 'center', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.55rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', opacity: 0.8 }}>{archLabel}</span>
      </div>
      {/* Glyph area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', width: 65, height: 65, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.07)' }} />
        <span style={{ fontSize: '1.8rem', opacity: 0.15, color: 'var(--gold)', textShadow: '0 0 30px var(--gold)' }}>
          {suitLabel === 'wands' ? '🪄' : suitLabel === 'cups' ? '🏆' : suitLabel === 'swords' ? '⚔️' : suitLabel === 'pentacles' ? '🪙' : '✧'}
        </span>
        <span style={{ position: 'absolute', bottom: 4, fontSize: '0.55rem', color: 'var(--text-secondary)', opacity: 0.4 }}>{c.number}</span>
      </div>
      {/* Card name */}
      <div style={{ padding: '4px 8px', textAlign: 'center', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--gold-light)', lineHeight: 1.2, letterSpacing: '0.03em' }}>{c.name_en}</div>
        <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', opacity: 0.6 }}>{c.name_zh}</div>
      </div>
      {/* Element & orientation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 8px', borderTop: '1px solid rgba(201,168,76,0.06)' }}>
        <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', opacity: 0.5 }}>{c.element ? (ELEMENT_LABELS[c.element] || c.element) : ''}</span>
        <span style={{ fontSize: '0.45rem', padding: '1px 6px', borderRadius: 99, letterSpacing: '0.04em', background: isUpright ? 'rgba(201,168,76,0.1)' : 'rgba(74,14,46,0.2)', color: isUpright ? 'var(--gold-light)' : 'var(--burgundy-light)' }}>
          {isUpright ? '正 UPRIGHT' : '逆 REVERSED'}
        </span>
      </div>
      {/* Keywords */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', padding: '2px 6px 4px' }}>
        {keywords.map((kw: string) => (
          <span key={kw} style={{ fontSize: '0.48rem', padding: '1px 5px', borderRadius: 99, border: '1px solid rgba(201,168,76,0.15)', color: 'var(--text-secondary)' }}>{kw}</span>
        ))}
      </div>
      {/* Soul question */}
      <div style={{ padding: '2px 8px 6px', textAlign: 'center', borderTop: '1px solid rgba(201,168,76,0.05)' }}>
        <p style={{ fontSize: '0.48rem', fontStyle: 'italic', color: 'var(--gold)', opacity: 0.65, lineHeight: 1.3, margin: 0 }}>{c.soul_question}</p>
      </div>
      {/* Bottom star */}
      <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', fontSize: '0.5rem', color: 'var(--gold)', opacity: 0.1 }}>✦</div>
    </div>
  );
}
