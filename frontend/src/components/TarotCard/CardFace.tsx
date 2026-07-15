import type { DrawnCard } from '../../types/tarot';
import styles from '../../pages/ReadingPage.module.css';

interface Props {
  card: DrawnCard;
}

const SUIT_GLYPHS: Record<string, string> = {
  wands: '🪄',
  cups: '🏆',
  swords: '⚔️',
  pentacles: '🪙',
  major: '✧',
};

export default function CardFace({ card }: Props) {
  const c = card.card;
  const suitKey = c.suit || 'major';
  const glyph = SUIT_GLYPHS[suitKey] || '✧';

  return (
    <div className={styles.cardFace}>
      {/* Placeholder art area */}
      <div style={{
        width: '100%',
        height: '55%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px 6px 0 0',
        background: `radial-gradient(ellipse at 50% 70%, rgba(201,168,76,0.06) 0%, transparent 60%), var(--bg-card)`,
        fontSize: '2.5rem',
        opacity: 0.2,
        marginBottom: 'var(--space-sm)',
      }}>
        <span>{glyph}</span>
      </div>

      <div className={styles.cardName}>{c.name_en}</div>
      <div className={styles.cardArchetype}>
        {c.psychological_archetype.replace(/_/g, ' ')}
      </div>
      <span
        className={`${styles.orientation} ${card.orientation === 'upright' ? styles.upright : styles.reversed}`}
      >
        {card.orientation}
      </span>
      <div className={styles.keywords}>
        {(card.orientation === 'upright'
          ? c.keywords_upright
          : c.keywords_reversed
        )
          .slice(0, 3)
          .map((kw) => (
            <span key={kw} className={styles.keyword}>{kw}</span>
          ))}
      </div>
    </div>
  );
}
