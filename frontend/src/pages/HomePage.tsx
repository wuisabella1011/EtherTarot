import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { drawCards } from '../api/endpoints';
import type { SpreadType, DrawResponse } from '../types/tarot';
import styles from './HomePage.module.css';

const spreads: { type: SpreadType; name: string; desc: string }[] = [
  { type: 'single', name: '单张指引 / Single Card', desc: '当下最直接的答案' },
  { type: 'three-card', name: '时间之箭 / Past·Present·Future', desc: '过去、现在与未来的完整弧线' },
  { type: 'celtic-cross', name: '凯尔特十字 / Celtic Cross', desc: '十张牌，完整映射人生棋局' },
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
        以太塔罗
      </motion.h1>

      <motion.p
        className={styles.subtitle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        牌不预言未来，它映照你已知却尚未言说的真相
      </motion.p>

      <motion.div
        className={styles.actions}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Spread selector */}
        <div className={styles.spreadRow}>
          {spreads.map((s) => (
            <motion.button
              key={s.type}
              onClick={() => setSelected(s.type)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`${styles.spreadBtn} ${selected === s.type ? styles.spreadBtnActive : ''}`}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: 4 }}>{s.desc}</div>
            </motion.button>
          ))}
        </div>

        {/* Draw button */}
        <motion.button
          onClick={handleDraw}
          disabled={loading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={styles.drawBtn}
          animate={{
            boxShadow: loading
              ? '0 0 30px rgba(201,168,76,0.4)'
              : [
                  '0 0 20px rgba(201,168,76,0.3)',
                  '0 0 50px rgba(201,168,76,0.6)',
                  '0 0 20px rgba(201,168,76,0.3)',
                ],
          }}
          transition={{
            boxShadow: loading
              ? { duration: 0.3 }
              : { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? '洗牌中...' : '开始抽牌'}
        </motion.button>
      </motion.div>
    </div>
  );
}
