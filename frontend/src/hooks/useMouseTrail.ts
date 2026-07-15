import { useRef, useEffect, useCallback } from 'react';
import { useSpring, useMotionValue } from 'framer-motion';

interface TrailPoint {
  x: number;
  y: number;
  age: number;       // ms since this point was captured
}

const MAX_TRAIL_LENGTH = 40;
const TRAIL_LIFETIME = 800;     // ms before a point fully fades
const CAPTURE_INTERVAL = 16;    // ~60fps capture rate

export function useMouseTrail(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const trailRef = useRef<TrailPoint[]>([]);
  const lastCaptureRef = useRef(0);
  const animFrameRef = useRef(0);
  const mousePosRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMove);

    const animate = (now: number) => {
      const { x, y } = mousePosRef.current;

      // Capture point at ~60fps
      if (now - lastCaptureRef.current > CAPTURE_INTERVAL && x > 0 && y > 0) {
        trailRef.current.push({ x, y, age: 0 });
        lastCaptureRef.current = now;
      }

      // Update ages and expire old points
      const dt = now - lastCaptureRef.current;
      for (const p of trailRef.current) {
        p.age += dt || 16;
      }
      trailRef.current = trailRef.current.filter(
        (p) => p.age < TRAIL_LIFETIME
      );

      // Limit trail length
      if (trailRef.current.length > MAX_TRAIL_LENGTH) {
        trailRef.current.splice(0, trailRef.current.length - MAX_TRAIL_LENGTH);
      }

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw trail with additive blending for natural glow
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 1; i < trailRef.current.length; i++) {
        const prev = trailRef.current[i - 1];
        const curr = trailRef.current[i];
        const lifeRatio = Math.max(0, 1 - curr.age / TRAIL_LIFETIME);

        // Exponential fade — trail brightens near cursor
        const positionAlpha = Math.pow(i / trailRef.current.length, 0.6);
        const alpha = lifeRatio * positionAlpha * 0.7;

        if (alpha < 0.01) continue;

        const gradient = ctx.createLinearGradient(prev.x, prev.y, curr.x, curr.y);
        gradient.addColorStop(0, `rgba(228, 199, 107, ${alpha * 0.2})`);
        gradient.addColorStop(0.5, `rgba(228, 199, 107, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(228, 199, 107, ${alpha * 0.8})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5 + alpha * 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);
}
