#!/usr/bin/env python3
"""Generate rich ambient background music as WAV via additive synthesis."""

import math
import struct
import wave
import os

OUT = '/Users/isabella/vscode/EtherTarot/frontend/public/audio'
os.makedirs(OUT, exist_ok=True)

SAMPLE_RATE = 44100

def sine(freq: float, t: float, a: float = 1.0) -> float:
    return a * math.sin(2 * math.pi * freq * t)

def fading_sine(freq: float, t: float, start_a: float, end_a: float, duration: float) -> float:
    a = start_a + (end_a - start_a) * (t / duration)
    return a * math.sin(2 * math.pi * freq * t)

def write_wav(frames: list[float], path: str) -> None:
    with wave.open(path, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        packed = []
        for f in frames:
            val = max(-32767, min(32767, int(f * 0.4)))  # 0.4 master volume
            packed.append(struct.pack('<h', val))
        w.writeframes(b''.join(packed))

def generate_mystical_ambient() -> list[float]:
    """Deep, slow ambient drone. Think: underground temple, subtle echoes."""
    duration = 60  # seconds — loopable
    total_samples = int(SAMPLE_RATE * duration)
    frames = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE

        # Root drone — very low D (~36.7 Hz, octave of D2 73.4)
        root = sine(36.71, t, 0.15)
        # Fifth above — A (~55 Hz)
        fifth = sine(55.0, t, 0.08)
        # Octave D2 (~73.4 Hz) with slow tremolo
        tremolo = 0.5 + 0.5 * math.sin(2 * math.pi * 0.12 * t)
        octave = sine(73.42, t, 0.06 * tremolo)

        # Slow pad swell — D3 (~146.8 Hz)
        swell = (math.sin(2 * math.pi * 0.03 * t) + 1) * 0.5
        pad = sine(146.83, t, 0.04 * swell)

        # Gentle shimmer — very high harmonic D6 (~1174 Hz), barely audible
        shimmer = sine(1174.7, t, 0.003 * swell)

        # Random subtle crackle — like old vinyl (every ~2000 samples)
        crackle = 0
        if i % 2147 == 0:
            crackle = (0.5 - (i % 3) / 3) * 0.01

        v = root + fifth + octave + pad + shimmer + crackle
        frames.append(v)

    # Fade in/out
    fade_samples = int(SAMPLE_RATE * 5)
    for i in range(fade_samples):
        frames[i] *= i / fade_samples
        frames[-i - 1] *= i / fade_samples

    return frames


def generate_dark_mystical() -> list[float]:
    """Darker, more mysterious. Slow pulsing D minor drone with harmonic overtones."""
    duration = 60
    total_samples = int(SAMPLE_RATE * duration)
    frames = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE

        # Slow pulse — LFO at ~0.08 Hz
        pulse = 0.5 + 0.5 * math.sin(2 * math.pi * 0.08 * t)

        # Root D2
        root = sine(73.42, t, 0.12 * pulse)
        # Minor third — F2
        minor = sine(87.31, t, 0.06 * pulse)
        # Fifth
        fifth = sine(110.0, t, 0.05 * pulse)
        # Low D
        sub = sine(36.71, t, 0.1 * pulse)

        # Slow phasing harmonic D4
        phase = math.sin(2 * math.pi * 0.05 * t) * 0.3
        harmonic = sine(293.66 + phase, t, 0.015 * pulse)

        v = root + minor + fifth + sub + harmonic
        frames.append(v)

    return frames


def generate_sfx_sprite() -> list[float]:
    """Synthesize a complete 5-second audio sprite:
    [0-1000ms] Draw: whoosh + rustle
    [1200-1800ms] Flip: crisp paper snap
    [2000-3800ms] Reveal: shimmering chime
    [4000-4300ms] Click: subtle tap
    """
    duration = 5.0
    total = int(SAMPLE_RATE * duration)
    frames = [0.0] * total

    # ── Draw (0-1000ms) — rising filtered noise whoosh + low thump ──
    for i in range(int(SAMPLE_RATE * 0.8)):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 3)  # Decay envelope
        # Band-pass-ish: multiple sines around 400-800 Hz with slight detune
        whoosh = (
            fading_sine(420 + 60 * math.sin(t * 40), t, 0.3 * (1 - math.exp(-t * 10)), 0.05, 0.8)
            + sine(600, t, 0.15 * env * (1 - math.exp(-t * 8)))
            + sine(350, t, 0.1 * env)
        )
        frames[i] = whoosh

    # ── Flip (1200-1800ms) — short crisp transient ──
    offset = int(SAMPLE_RATE * 1.2)
    for i in range(int(SAMPLE_RATE * 0.15)):
        idx = offset + i
        t = i / SAMPLE_RATE
        env = math.exp(-t * 25)  # Very fast decay
        snap = sine(1200, t, 0.5 * env) + sine(800, t, 0.3 * env) + sine(1800, t, 0.2 * env)
        if idx < len(frames):
            frames[idx] += snap * 0.5

    # ── Reveal (2000-3800ms) — shimmering chime cascade ──
    offset = int(SAMPLE_RATE * 2.0)
    chime_freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5]  # C5 E5 G5 C6 E6
    for j, freq in enumerate(chime_freqs):
        start = offset + int(SAMPLE_RATE * j * 0.25)  # Stagger each chime
        for i in range(int(SAMPLE_RATE * 1.5)):
            idx = start + i
            if idx >= len(frames):
                break
            t = i / SAMPLE_RATE
            fade_start = j * 0.15
            if t < fade_start:
                continue
            env = math.exp(-(t - fade_start) * 2.5) * (0.4 - j * 0.06)
            chime = sine(freq, t, env)
            # Add octave overtone
            overtone = sine(freq * 2, t, env * 0.3)
            frames[idx] += (chime + overtone) * 0.3

    # ── Click (4000-4300ms) — tiny tap ──
    offset = int(SAMPLE_RATE * 4.0)
    for i in range(int(SAMPLE_RATE * 0.03)):
        idx = offset + i
        t = i / SAMPLE_RATE
        env = math.exp(-t * 80)
        click = sine(2000, t, 0.6 * env) + sine(3000, t, 0.3 * env)
        if idx < len(frames):
            frames[idx] += click * 0.3

    return frames


# ═══════════════════════════════════════════════════════
print('正在生成神秘氛围音乐 (Deep Temple Ambient, 60秒)...')
write_wav(generate_mystical_ambient(), os.path.join(OUT, 'bg-music-mystical.wav'))
print('✅ bg-music-mystical.wav')

print('正在生成暗黑氛围音乐 (D Minor Drone, 60秒)...')
write_wav(generate_dark_mystical(), os.path.join(OUT, 'bg-music-ambient.wav'))
print('✅ bg-music-ambient.wav')

print('正在生成音效精灵 (Draw/Flip/Reveal/Click, 5秒)...')
write_wav(generate_sfx_sprite(), os.path.join(OUT, 'sfx-sprite.wav'))
print('✅ sfx-sprite.wav')

print('\n全部音频已生成 ✓')
print(f'  {OUT}/bg-music-mystical.wav — 神秘氛围 (低音D嗡鸣+谐波泛音)')
print(f'  {OUT}/bg-music-ambient.wav — 暗黑氛围 (D小调嗡鸣+脉动)')
print(f'  {OUT}/sfx-sprite.wav — 音效精灵 (抽牌/翻牌/揭示/点击)')
