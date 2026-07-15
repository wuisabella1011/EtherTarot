import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { DrawResponse, InterpretationReport, CardNote, InterpretationTone } from '../types/tarot';
import { useAudio } from '../hooks/useAudio';
import CardBack from '../components/TarotCard/CardBack';
import CardFace from '../components/TarotCard/CardFace';
import InterpretationPanel from '../components/Interpretation/InterpretationPanel';
import styles from './ReadingPage.module.css';

export default function ReadingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { draw: DrawResponse; spreadType: string } | null;

  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [interpretation, setInterpretation] = useState<InterpretationReport | null>(null);
  const [cardNotes, setCardNotes] = useState<CardNote[]>([]);
  const [loadingInterpretation, setLoadingInterpretation] = useState(false);
  const { playMusic, playSfx, musicPlaying } = useAudio();

  // Start music on first card reveal
  const revealCard = (index: number, clickX: number) => {
    if (!musicPlaying) playMusic();
    playSfx('flip', clickX, window.innerWidth);

    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  if (!state) {
    return (
      <div className={styles.reading}>
        <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <h2>No reading in progress</h2>
          <button className={styles.backBtn} onClick={() => navigate('/')} style={{ marginTop: 24 }}>
            ← Return Home
          </button>
        </div>
      </div>
    );
  }

  const { draw } = state;
  const allRevealed = revealed.size === draw.cards.length;

  const revealAll = () => {
    playMusic();
    playSfx('reveal', window.innerWidth / 2, window.innerWidth);
    setRevealed(new Set(draw.cards.map((_, i) => i)));
  };

  const requestInterpretation = async (tone: InterpretationTone) => {
    setLoadingInterpretation(true);
    try {
      const qs = new URLSearchParams({
        spread_type: state.spreadType,
        client_seed: draw.seed,
        tone,
      });
      const res = await fetch(`/api/v1/interpret/?${qs}`, { method: 'POST' });
      if (!res.ok) throw new Error('Interpretation failed');
      const data = await res.json();
      setInterpretation(data.interpretation);
      setCardNotes(data.interpretation.card_notes || []);
    } catch (err) {
      console.error('Interpretation error:', err);
    } finally {
      setLoadingInterpretation(false);
    }
  };

  return (
    <div className={styles.reading}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ← New Reading
        </button>

        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Your Reading</h1>
          {!revealed.size && (
            <motion.button
              onClick={revealAll}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                marginTop: 20,
                padding: '14px 36px',
                borderRadius: 12,
                border: '1px solid rgba(201,168,76,0.3)',
                background: 'rgba(201,168,76,0.08)',
                color: 'var(--gold-light)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                letterSpacing: '0.06em',
              }}
            >
              Reveal All Cards
            </motion.button>
          )}
          <div className={styles.seed}>
            🔐 Seed: {draw.seed.slice(0, 20)}... <span style={{fontSize:'0.7rem',opacity:0.5}}>(SystemRandom · Verifiable)</span>
          </div>
        </div>

        <div className={styles.spread}>
          {draw.cards.map((dc, i) => {
            const isRevealed = revealed.has(i);
            const card = dc.card;

            return (
              <motion.div
                key={card.id}
                className={styles.cardSlot}
                initial={{ opacity: 0, y: 60, rotateY: 90 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.25,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <span className={styles.positionLabel}>{dc.position}</span>

                <motion.div
                  className={styles.card}
                  onClick={(e) => !isRevealed && revealCard(i, e.clientX)}
                  whileHover={isRevealed ? { scale: 1.03 } : { scale: 1.05 }}
                  style={{ cursor: isRevealed ? 'default' : 'pointer' }}
                >
                  <motion.div
                    className={styles.cardInner}
                    animate={{ rotateY: isRevealed ? 180 : 0 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Back */}
                    <CardBack />

                    {/* Front */}
                    <div className={styles.cardFrontWrap} style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 12 }}>
                      <CardFace card={dc} />
                    </div>
                  </motion.div>
                </motion.div>

                <span className={styles.positionLabel} style={{ fontSize: '0.65rem', marginTop: 4, maxWidth: 160, textAlign: 'center' }}>
                  {dc.position_description.slice(0, 50)}...
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Interpretation panel after all cards revealed */}
        {allRevealed && !interpretation && !loadingInterpretation && (
          <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              maxWidth: 720,
              margin: '0 auto',
              padding: 'var(--space-xl)',
              textAlign: 'center',
            }}
          >
            <h3 style={{ marginBottom: 12 }}>Your Cards Are Revealed</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
              The cards have been drawn and placed in their positions.
              Choose your reading tone to receive a personalized interpretation
              powered by the EtherTarot Oracle.
              <br />
              <span style={{ fontSize: '0.8rem' }}>
                Seed: {draw.seed.slice(0, 16)}... — verifiable and unique
              </span>
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => requestInterpretation('philosophical')}
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  border: '1px solid rgba(201,168,76,0.3)',
                  background: 'rgba(201,168,76,0.1)',
                  color: 'var(--gold-light)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.04em',
                  fontSize: '1rem',
                }}
              >
                🔮 Philosophical Reading
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => requestInterpretation('psychological')}
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  border: '1px solid rgba(201,168,76,0.3)',
                  background: 'rgba(201,168,76,0.05)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.04em',
                  fontSize: '1rem',
                }}
              >
                🧠 Psychological Reading
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {loadingInterpretation && (
          <motion.div
            className="glass-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              maxWidth: 720,
              margin: '0 auto',
              padding: 'var(--space-2xl)',
              textAlign: 'center',
            }}
          >
            <div className={styles.spinner} />
            <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>
              The Oracle is contemplating your cards...
            </p>
          </motion.div>
        )}

        {/* Interpretation panel */}
        {interpretation && (
          <InterpretationPanel
            report={interpretation}
            cardNotes={cardNotes}
            seed={draw.seed}
            onToneChange={(tone) => requestInterpretation(tone)}
          />
        )}
      </div>
    </div>
  );
}
