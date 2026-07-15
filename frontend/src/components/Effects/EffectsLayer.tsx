import { useRef } from 'react';
import { useStarfield } from '../../hooks/useStarfield';
import { useMouseTrail } from '../../hooks/useMouseTrail';

export default function EffectsLayer() {
  const starfieldRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<HTMLCanvasElement>(null);

  useStarfield(starfieldRef);
  useMouseTrail(trailRef);

  return (
    <>
      <canvas
        ref={starfieldRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <canvas
        ref={trailRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
