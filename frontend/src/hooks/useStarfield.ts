import { useCallback, useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;         // Depth layer (0-1): controls parallax speed and size
  size: number;
  opacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
  vx: number;
  vy: number;
}

const PARTICLE_COUNT = 180;
const GOLD = '228, 199, 107';      // --gold-light RGB
const AMBER = '201, 168, 76';      // --gold RGB

export function useStarfield(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const z = Math.random();
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z,
        size: 0.4 + Math.random() * 2.6,
        opacity: 0.15 + Math.random() * 0.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.003 + Math.random() * 0.015,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15 - 0.08 * (1 - z),
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true })!;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(window.innerWidth, window.innerHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMouse);

    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Dim trail for motion blur
      ctx.fillStyle = 'rgba(13, 10, 11, 0.18)';
      ctx.fillRect(0, 0, w, h);

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];

        // Parallax drift toward mouse with depth multiplier
        const parallaxStrength = 0.3 * p.z;
        p.vx += (mx - 0.5) * parallaxStrength * 0.001;
        p.vy += (my - 0.5) * parallaxStrength * 0.001;

        // Apply velocity
        p.x += p.vx * dt * 0.06;
        p.y += p.vy * dt * 0.06;

        // Gentle friction
        p.vx *= 0.999;
        p.vy *= 0.999;

        // Wrap around edges
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Twinkle
        const twinkle = Math.sin(now * p.twinkleSpeed + p.twinklePhase) * 0.4 + 0.6;
        const alpha = p.opacity * twinkle * (0.4 + 0.6 * p.z);

        // Draw as radial gradient — soft star
        const radius = p.size * (0.5 + 0.5 * p.z) * 2;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        const color = p.z > 0.6 ? GOLD : AMBER;
        gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);
}
