import { useRef, useCallback } from 'react';
import { useShuffleTracking } from '../../hooks/useShuffleTracking';
import { useAudio } from '../../hooks/useAudio';

interface Props {
  onThresholdReached: () => void;
}

export default function ShuffleCanvas({ onThresholdReached }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startShuffle, addPoint, stopShuffle } = useShuffleTracking(canvasRef, onThresholdReached);
  const { playSfx } = useAudio();

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startShuffle();
    addPoint(e.clientX, e.clientY);
    canvasRef.current!.setPointerCapture(e.pointerId);
  }, [startShuffle, addPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    addPoint(e.clientX, e.clientY);
  }, [addPoint]);

  const handlePointerUp = useCallback(() => {
    stopShuffle();
  }, [stopShuffle]);

  return (
    <>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          cursor: 'crosshair',
          touchAction: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 101,
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          letterSpacing: '0.06em',
          pointerEvents: 'none',
          opacity: 0.7,
        }}
      >
        Draw circles with your cursor to shuffle • 5 circles to draw
      </div>
    </>
  );
}
