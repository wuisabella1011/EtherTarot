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

  const revealCard = (index: number, clickX: number) => {
    if (!musicPlaying) playMusic();
    playSfx('flip', clickX, window.innerWidth);
    setRevealed(prev => { const next = new Set(prev); next.add(index); return next; });
  };

  if (!state) {
    return (
      <div className={styles.reading}>
        <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <h2>暂无解读 / No reading in progress</h2>
          <button className={styles.backBtn} onClick={() => navigate('/')} style={{ marginTop: 24 }}>
            ← 返回首页 / Return Home
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
      const qs = new URLSearchParams({ spread_type: state.spreadType, client_seed: draw.seed, tone });
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
        <button className={styles.backBtn} onClick={() => navigate('/')}>← 新解读 / New Reading</button>

        <div className={styles.header}>
          <h1 className={styles.headerTitle}>你的解读 / Your Reading</h1>
          {!revealed.size && (
            <motion.button onClick={revealAll} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              style={{ marginTop: 20, padding: '14px 36px', borderRadius: 12, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)', color: 'var(--gold-light)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.06em' }}>
              揭秘全部 / Reveal All
            </motion.button>
          )}
          <div className={styles.seed}>
            🔐 Seed: {draw.seed.slice(0, 20)}...
          </div>
        </div>

        {/* Card spread */}
        <div className={styles.spread}>
          {draw.cards.map((dc, i) => {
            const isRevealed = revealed.has(i);
            return (
              <motion.div key={dc.card.id} className={styles.cardSlot}
                initial={{ opacity: 0, y: 60, rotateY: 90 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.8, delay: i * 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>
                <span className={styles.positionLabel}>{dc.position}</span>
                <motion.div className={styles.card}
                  onClick={(e) => !isRevealed && revealCard(i, e.clientX)}
                  whileHover={isRevealed ? { scale: 1.02 } : { scale: 1.05 }}
                  whileTap={isRevealed ? {} : { scale: 0.97 }}
                  style={{ cursor: isRevealed ? 'default' : 'pointer' }}>
                  <motion.div className={styles.cardInner}
                    animate={{ rotateY: isRevealed ? 180 : 0 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}>
                    <CardBack />
                    <CardFace card={dc} />
                  </motion.div>
                </motion.div>
                <span className={styles.positionLabel} style={{ fontSize: '0.6rem', marginTop: 4, maxWidth: 170, textAlign: 'center', textTransform: 'none' }}>
                  {dc.position_description.slice(0, 50)}...
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Post-reveal interpretation panel */}
        {allRevealed && !interpretation && !loadingInterpretation && (
          <motion.div className="glass-panel" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-xl)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 12 }}>牌已揭示 / Cards Revealed</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
              你的牌已经置于各自的位置。选择一个解读语调，以太塔罗神谕将为你生成深度阅读。
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => requestInterpretation('philosophical')}
                style={{ padding: '12px 28px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.1)', color: 'var(--gold-light)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', fontSize: '1rem' }}>
                🔮 哲思解读 / Philosophical
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => requestInterpretation('psychological')}
                style={{ padding: '12px 28px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.05)', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', fontSize: '1rem' }}>
                🧠 心理分析 / Psychological
              </motion.button>
            </div>
          </motion.div>
        )}

        {loadingInterpretation && (
          <motion.div className="glass-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-2xl)', textAlign: 'center' }}>
            <div className={styles.spinner} />
            <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>神谕正在冥想你的牌面...</p>
          </motion.div>
        )}

        {interpretation && (
          <InterpretationPanel report={interpretation} cardNotes={cardNotes} seed={draw.seed}
            onToneChange={(tone) => requestInterpretation(tone)} />
        )}
      </div>
    </div>
  );
}
