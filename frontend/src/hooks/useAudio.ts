import { useRef, useCallback, useEffect, useState } from 'react';
import { Howl } from 'howler';

// Audio sprite layout — all sounds in one file:
// [0ms-800ms]=draw, [1000ms-1600ms]=flip, [1800ms-3300ms]=reveal, [3500ms-3700ms]=click
const SFX_SPRITE = {
  draw: [0, 800],
  flip: [1000, 600],
  reveal: [1800, 1500],
  click: [3500, 200],
} as const;

type SfxName = keyof typeof SFX_SPRITE;

const FADE_MS = 2500;

export function useAudio() {
  const bgMusicRef = useRef<Howl | null>(null);
  const sfxRef = useRef<Howl | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const initializedRef = useRef(false);

  // Lazy init — requires user gesture for AudioContext
  const init = useCallback(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Background music — html5 mode for streaming efficiency
    bgMusicRef.current = new Howl({
      src: ['/audio/bg-music-ambient.wav'],
      html5: true,
      loop: true,
      volume: 0,
    });

    // Sound effects — Web Audio mode for low latency
    sfxRef.current = new Howl({
      src: ['/audio/sfx-sprite.wav'],
      sprite: SFX_SPRITE,
      volume: 0.5,
      preload: true,
    });
  }, []);

  // Play background music with fade-in
  const playMusic = useCallback(() => {
    init();
    const bgm = bgMusicRef.current!;
    if (!bgm.playing()) {
      bgm.play();
    }
    bgm.fade(bgm.volume(), muted ? 0 : 0.25, FADE_MS);
    setMusicPlaying(true);
  }, [init, muted]);

  // Stop music with fade-out
  const stopMusic = useCallback(() => {
    const bgm = bgMusicRef.current;
    if (!bgm) return;
    bgm.fade(bgm.volume(), 0, FADE_MS);
    setTimeout(() => bgm.stop(), FADE_MS + 200);
    setMusicPlaying(false);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = !muted;
    Howler.mute(newMuted);
    setMuted(newMuted);
  }, [muted]);

  // Play a sound effect — with optional positional frequency modulation
  const playSfx = useCallback(
    (name: SfxName, clickX?: number, viewportWidth?: number) => {
      init();
      const sfx = sfxRef.current!;
      const id = sfx.play(name);

      // Subtle pitch variation based on click position (if provided)
      // Range: 0.93 - 1.07 (±7% pitch shift)
      if (clickX !== undefined && viewportWidth) {
        const rate = 0.93 + (clickX / viewportWidth) * 0.14;
        sfx.rate(rate, id);
      }
    },
    [init],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      bgMusicRef.current?.unload();
      sfxRef.current?.unload();
    };
  }, []);

  return {
    init,
    playMusic,
    stopMusic,
    toggleMute,
    playSfx,
    musicPlaying,
    muted,
    isReady: initializedRef.current,
  };
}
