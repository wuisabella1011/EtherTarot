import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { drawCards } from '../api/endpoints';
import type { SpreadType, DrawResponse } from '../types/tarot';
import styles from './HomePage.module.css';

const spreads: { type: SpreadType; name: string; desc: string }[] = [
  { type: 'single', name: 'Single Card', desc: 'Immediate clarity for one question' },
  { type: 'three-card', name: 'Past · Present · Future', desc: 'The full arc of your situation' },
  { type: 'celtic-cross', name: 'Celtic Cross', desc: 'A complete map of forces at play' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SpreadType>('three-card');
  const [loading, setLoading] = useState(false);

  const handleDraw = async () => {
    setLoading(true);
    try {
      const result: DrawResponse = await drawCards(selected);
      navigate('/reading', { state: { draw: result, spreadType: selected } });
    } catch (err) {
      console.error('Draw failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.home}>
      <motion.h1
        className={styles.title}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        EtherTarot
      </motion.h1>

      <motion.p
        className={styles.subtitle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        The cards do not tell your future. They reveal what you already know but cannot yet speak.
      </motion.p>

      <motion.div
        className={styles.actions}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Spread selector */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {spreads.map((s) => (
            <motion.button
              key={s.type}
              onClick={() => setSelected(s.type)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                border: `1px solid ${selected === s.type ? 'var(--gold)' : 'rgba(201,168,76,0.2)'}`,
                background: selected === s.type ? 'rgba(201,168,76,0.1)' : 'transparent',
                color: selected === s.type ? 'var(--gold-light)' : 'var(--text-secondary)',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                minWidth: 140,
              }}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: 4 }}>{s.desc}</div>
            </motion.button>
          ))}
        </div>

        {/* Draw button */}
        <motion.button
          onClick={handleDraw}
          disabled={loading}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          animate={{
            boxShadow: loading
              ? '0 0 30px rgba(201,168,76,0.4)'
              : [
                  '0 0 15px rgba(201,168,76,0.4)',
                  '0 0 40px rgba(201,168,76,0.7)',
                  '0 0 15px rgba(201,168,76,0.4)',
                ],
          }}
          transition={{
            boxShadow: loading
              ? { duration: 0.3 }
              : { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            padding: '16px 48px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))',
            border: '1px solid rgba(201,168,76,0.3)',
            color: 'var(--gold-light)',
            fontSize: '1.2rem',
            letterSpacing: '0.08em',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Shuffling...' : 'Draw Cards'}
        </motion.button>
      </motion.div>
    </div>
  );
}
