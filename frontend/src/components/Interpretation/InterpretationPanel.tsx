import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InterpretationReport, InterpretationTone, CardNote } from '../../types/tarot';
import styles from './InterpretationPanel.module.css';

interface Props {
  report: InterpretationReport;
  cardNotes: CardNote[];
  seed: string;
  onToneChange?: (tone: InterpretationTone) => void;
}

export default function InterpretationPanel({ report, cardNotes, seed, onToneChange }: Props) {
  const [tone, setTone] = useState<InterpretationTone>('philosophical');
  const [expandedDim, setExpandedDim] = useState<string | null>(null);

  const handleToneChange = (newTone: InterpretationTone) => {
    setTone(newTone);
    onToneChange?.(newTone);
  };

  return (
    <motion.div
      className={styles.panel}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Your Reading</h2>
        <div className={styles.panelSeed}>
          🔐 Seed: {seed.slice(0, 16)}... • SystemRandom • Verifiable
        </div>
      </div>

      {/* Tone toggle */}
      <div className={styles.toneToggle}>
        <button
          className={`${styles.toneBtn} ${tone === 'philosophical' ? styles.toneBtnActive : ''}`}
          onClick={() => handleToneChange('philosophical')}
        >
          🔮 Philosophical
        </button>
        <button
          className={`${styles.toneBtn} ${tone === 'psychological' ? styles.toneBtnActive : ''}`}
          onClick={() => handleToneChange('psychological')}
        >
          🧠 Psychological
        </button>
      </div>

      {/* Overview */}
      <motion.p
        className={styles.overview}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {report.overview}
      </motion.p>

      {/* Three Dimensions */}
      <div className={styles.dimensions}>
        {(['situation', 'dynamics', 'transcendence'] as const).map((key, i) => {
          const dim = report.three_dimensions[key];
          const icons = { situation: '🌅', dynamics: '⚡', transcendence: '🕊️' };
          const labels = {
            situation: 'The Landscape',
            dynamics: 'The Forces',
            transcendence: 'The Path',
          };
          const isExpanded = expandedDim === key;

          return (
            <motion.div
              key={key}
              className={styles.dimension}
              onClick={() => setExpandedDim(isExpanded ? null : key)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
            >
              <div className={styles.dimHeader}>
                <span className={styles.dimIcon}>{icons[key]}</span>
                <div>
                  <div className={styles.dimLabel}>{labels[key]}</div>
                  <div className={styles.dimTitle}>{dim.title}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {isExpanded ? '▾' : '▸'}
                </span>
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className={styles.dimNarrative}>{dim.narrative}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Synthesis — the reading's motto */}
      <motion.div
        className={styles.synthesis}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <p className={styles.synthesisText}>{report.synthesis}</p>
      </motion.div>

      {/* Individual card notes */}
      <div className={styles.cardNotes}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em',
            marginBottom: 'var(--space-md)',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
          }}
        >
          Card-by-Card Notes
        </h3>
        {cardNotes.map((note, i) => (
          <motion.div
            key={note.card_id}
            className={styles.cardNote}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            <div className={styles.cardNoteHeader}>
              <span className={styles.cardNoteName}>
                {note.card_name}
                <span style={{ fontSize: '0.75rem', marginLeft: 8, opacity: 0.5 }}>
                  ({note.orientation})
                </span>
              </span>
              <span className={styles.cardNotePosition}>{note.position}</span>
            </div>
            <p className={styles.cardNoteMeaning}>{note.positional_meaning}</p>
            <p className={styles.cardNoteSymbol}>Key symbol: {note.key_symbol}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
