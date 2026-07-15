import { useRef, useCallback, useEffect } from 'react';

interface ShuffleState {
  points: { x: number; y: number; t: number }[];
  circleCount: number;
  energyLevel: number;
  isActive: boolean;
  lastAngle: number;
  angleAccum: number;
  center: { x: number; y: number } | null;
  centerStable: number;
}

const REQUIRED_CIRCLES = 5;
const SECTOR_COUNT = 16;
const CIRCULARITY_THRESHOLD = 0.45;
const COVERAGE_THRESHOLD = 0.6;

function getAngle(cx: number, cy: number, px: number, py: number): number {
  return Math.atan2(py - cy, px - cx);
}

function getSector(cx: number, cy: number, px: number, py: number): number {
  const angle = getAngle(cx, cy, px, py);
  const normalized = (angle + Math.PI) / (Math.PI * 2);
  return Math.floor(normalized * SECTOR_COUNT);
}

function computeCenter(
  points: { x: number; y: number }[]
): { x: number; y: number } {
  let cx = 0, cy = 0;
  for (const p of points) {
    cx += p.x;
    cy += p.y;
  }
  return { x: cx / points.length, y: cy / points.length };
}

function computeCircularity(
  points: { x: number; y: number }[],
  center: { x: number; y: number }
): { avgR: number; score: number } {
  let sumR = 0;
  for (const p of points) {
    sumR += Math.hypot(p.x - center.x, p.y - center.y);
  }
  const avgR = sumR / points.length;
  let variance = 0;
  for (const p of points) {
    variance += (Math.hypot(p.x - center.x, p.y - center.y) - avgR) ** 2;
  }
  variance /= points.length;
  const score = Math.max(0, 1 - Math.sqrt(variance) / (avgR + 0.01));
  return { avgR, score };
}

export function useShuffleTracking(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onThresholdReached: () => void
) {
  const stateRef = useRef<ShuffleState>({
    points: [],
    circleCount: 0,
    energyLevel: 0,
    isActive: false,
    lastAngle: 0,
    angleAccum: 0,
    center: null,
    centerStable: 0,
  });

  const sectorsHit = useRef(new Set<number>());
  const animFrame = useRef(0);
  const lastPointTime = useRef(0);
  const convergenceRef = useRef<{ t: number; from: { x: number; y: number }[] } | null>(null);

  // Draw the current state
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const state = stateRef.current;
    const now = performance.now();

    // Clear with fade trail
    ctx.fillStyle = 'rgba(13, 10, 11, 0.15)';
    ctx.fillRect(0, 0, w, h);

    // Convergence animation
    if (convergenceRef.current) {
      const conv = convergenceRef.current;
      conv.t += 16;
      const progress = Math.min(conv.t / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      for (let i = 0; i < conv.from.length; i++) {
        const from = conv.from[i];
        const cx = state.center?.x ?? w / 2;
        const cy = state.center?.y ?? h / 2;
        const x = from.x + (cx - from.x) * eased;
        const y = from.y + (cy - from.y) * eased;
        const alpha = (1 - eased) * 0.7;

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(228, 199, 107, ${alpha})`;
        ctx.fill();
      }

      // Center glow
      const cx = state.center?.x ?? w / 2;
      const cy = state.center?.y ?? h / 2;
      const glowR = 15 + eased * 80;
      const glowAlpha = eased * 0.5;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      grd.addColorStop(0, `rgba(228, 199, 107, ${glowAlpha})`);
      grd.addColorStop(0.5, `rgba(201, 168, 76, ${glowAlpha * 0.3})`);
      grd.addColorStop(1, 'rgba(201, 168, 76, 0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();

      if (progress < 1) return;
      convergenceRef.current = null;
    }

    // Draw active trail
    const recentPoints = state.points.filter(
      (p) => now - p.t < 3000
    );

    for (let i = 1; i < recentPoints.length; i++) {
      const prev = recentPoints[i - 1];
      const curr = recentPoints[i];
      const age = (now - curr.t) / 3000;
      const alpha = Math.max(0, 0.6 - age * 0.6);

      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.strokeStyle = `rgba(228, 199, 107, ${alpha})`;
      ctx.lineWidth = 1.5 + alpha * 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Energy ring indicator
    if (state.energyLevel > 0 && state.center) {
      const r = 60 + state.energyLevel * 40;
      const alpha = 0.2 + state.energyLevel * 0.4;

      ctx.beginPath();
      ctx.arc(state.center.x, state.center.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(228, 199, 107, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sector arc fill
      const fillAngle = (sectorsHit.current.size / SECTOR_COUNT) * Math.PI * 2;
      if (fillAngle > 0) {
        ctx.beginPath();
        ctx.arc(state.center.x, state.center.y, r + 8, -Math.PI / 2, -Math.PI / 2 + fillAngle);
        ctx.strokeStyle = `rgba(201, 168, 76, ${alpha * 1.5})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // Circle count display
    if (state.circleCount > 0 && state.center) {
      ctx.font = `${14 + state.circleCount * 2}px Cormorant Garamond, serif`;
      ctx.fillStyle = `rgba(228, 199, 107, ${0.3 + state.energyLevel * 0.7})`;
      ctx.textAlign = 'center';
      ctx.fillText(
        `${state.circleCount}/${REQUIRED_CIRCLES}`,
        state.center.x,
        state.center.y + 90
      );
    }
  }, []);

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

    const animate = () => {
      draw(ctx, window.innerWidth, window.innerHeight);
      animFrame.current = requestAnimationFrame(animate);
    };
    animFrame.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrame.current);
      window.removeEventListener('resize', resize);
    };
  }, [draw]);

  const startShuffle = useCallback(() => {
    stateRef.current = {
      points: [],
      circleCount: 0,
      energyLevel: 0,
      isActive: true,
      lastAngle: 0,
      angleAccum: 0,
      center: null,
      centerStable: 0,
    };
    sectorsHit.current.clear();
    convergenceRef.current = null;
  }, []);

  const addPoint = useCallback(
    (x: number, y: number) => {
      const state = stateRef.current;
      if (!state.isActive) return;

      const now = performance.now();
      if (now - lastPointTime.current < 16) return;
      lastPointTime.current = now;

      state.points.push({ x, y, t: now });

      // Keep last 500 points
      if (state.points.length > 500) {
        state.points.splice(0, state.points.length - 500);
      }

      // Prune old
      state.points = state.points.filter((p) => now - p.t < 5000);

      if (state.points.length < 15) return;

      // Compute center from recent points
      const recent = state.points.filter((p) => now - p.t < 2000);
      const center = computeCenter(recent);

      // Stabilization check
      if (state.center) {
        const drift = Math.hypot(center.x - state.center.x, center.y - state.center.y);
        if (drift < 30) {
          state.centerStable++;
        } else {
          state.centerStable = Math.max(0, state.centerStable - 1);
        }
      }
      state.center = state.centerStable > 5 ? state.center : center;

      // Track sectors
      if (state.center) {
        sectorsHit.current.add(getSector(state.center.x, state.center.y, x, y));
      }

      // Check circle completion
      if (state.center && recent.length > 20) {
        const { score } = computeCircularity(recent, state.center);
        const coverage = sectorsHit.current.size / SECTOR_COUNT;

        if (score > CIRCULARITY_THRESHOLD && coverage > COVERAGE_THRESHOLD) {
          state.circleCount++;
          state.energyLevel = Math.min(1, state.circleCount / REQUIRED_CIRCLES);
          sectorsHit.current.clear();

          if (state.circleCount >= REQUIRED_CIRCLES) {
            state.isActive = false;
            // Trigger convergence animation
            convergenceRef.current = {
              t: 0,
              from: state.points.map((p) => ({ x: p.x, y: p.y })),
            };
            onThresholdReached();
          }
        }
      }
    },
    [onThresholdReached]
  );

  const stopShuffle = useCallback(() => {
    stateRef.current.isActive = false;
  }, []);

  return { startShuffle, addPoint, stopShuffle, state: stateRef };
}
