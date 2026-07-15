import styles from '../../pages/ReadingPage.module.css';

export default function CardBack() {
  return (
    <div className={styles.cardBack}>
      <div className={styles.cardBackPattern}>
        <svg width="60" height="80" viewBox="0 0 60 80">
          {/* Outer diamond */}
          <rect x="8" y="6" width="44" height="68" rx="4" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.5" />
          {/* Inner diamond */}
          <rect x="14" y="12" width="32" height="56" rx="3" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="0.5" />
          {/* Center star */}
          <polygon
            points="30,18 33,27 42,27 35,33 37,42 30,37 23,42 25,33 18,27 27,27"
            fill="none"
            stroke="rgba(201,168,76,0.25)"
            strokeWidth="0.6"
          />
          {/* Corner circles */}
          <circle cx="20" cy="20" r="2" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.4" />
          <circle cx="40" cy="20" r="2" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.4" />
          <circle cx="20" cy="60" r="2" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.4" />
          <circle cx="40" cy="60" r="2" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.4" />
          {/* Top ornament */}
          <path d="M22,14 L30,10 L38,14" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="0.4" />
          {/* Bottom ornament */}
          <path d="M22,66 L30,70 L38,66" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="0.4" />
        </svg>
      </div>
    </div>
  );
}
