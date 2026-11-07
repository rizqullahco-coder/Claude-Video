"""Generate an original, royalty-free beat + SFX locally (numpy only).

Usage: python3 tools/beatgen.py <out_dir> [--bpm 118] [--bars 28] [--mood bright|drive]
Writes beat.wav, whoosh.wav, pop.wav (48 kHz stereo).
"""
import sys, wave, argparse
import numpy as np

SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument("out"); ap.add_argument("--bpm", type=float, default=118)
ap.add_argument("--bars", type=int, default=28); ap.add_argument("--mood", default="bright")
ap.add_argument("--seed", type=int, default=7)
a = ap.parse_args()
rng = np.random.default_rng(a.seed)
beat = 60 / a.bpm; bar = 4 * beat; n = int(SR * bar * a.bars) + SR
L = np.zeros(n); R = np.zeros(n)

def env(length, attack=0.003, decay=0.2):
    t = np.arange(length) / SR
    e = np.minimum(t / attack, 1) * np.exp(-t / decay)
    return e

def put(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR); j = min(n, i + len(sig)); s = sig[: j - i] * gain
    L[i:j] += s * (1 - max(0, pan)); R[i:j] += s * (1 + min(0, pan))

def kick():
    t = np.arange(int(0.45 * SR)) / SR
    f = 50 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) + 0.3 * np.sin(ph) * np.exp(-t * 40)

def clap():
    m = int(0.25 * SR); noise = rng.standard_normal(m)
    e = np.zeros(m)
    for k, d in enumerate([0, 0.008, 0.016]):
        i = int(d * SR); e[i:] += np.exp(-np.arange(m - i) / SR / (0.012 if k < 2 else 0.09))
    x = noise * e
    return np.convolve(x, [1, -0.85], "same") * 0.5  # crude highpass

def hat(open_=False):
    m = int((0.18 if open_ else 0.05) * SR); x = rng.standard_normal(m)
    x = np.diff(np.concatenate([[0], x]))  # brighten
    return x * env(m, 0.001, 0.06 if open_ else 0.012) * 0.2

def note(freq, dur, kind="saw", cutoff=0.15):
    m = int(dur * SR); t = np.arange(m) / SR
    if kind == "sub":
        x = np.sin(2 * np.pi * freq * t)
    else:
        x = sum(((-1) ** (k + 1)) * np.sin(2 * np.pi * freq * k * t) / k for k in range(1, 9))
        x += sum(((-1) ** (k + 1)) * np.sin(2 * np.pi * freq * 1.006 * k * t) / k for k in range(1, 9))
        x *= 0.5
        # one-pole lowpass
        y = np.zeros_like(x); s = 0
        for i in range(0, m):
            s += cutoff * (x[i] - s); y[i] = s
        x = y
    return x

midi = lambda m: 440 * 2 ** ((m - 69) / 12)
# progression: vi-IV-I-V in C (Am F C G) for "bright", i-VI-III-VII in A minor feel for "drive"
prog = [(57, [69, 72, 76]), (53, [65, 69, 72]), (48, [67, 72, 76]), (55, [67, 71, 74])]
if a.mood == "drive":
    prog = [(57, [69, 72, 76]), (53, [69, 72, 77]), (60, [67, 72, 76]), (55, [67, 71, 74])]

chord_cache = {}
for b in range(a.bars):
    t0 = b * bar
    root, chord = prog[b % 4]
    intro = b < 2
    breakdown = b % 8 == 7
    # drums
    if not intro:
        for q in range(4):
            if not (breakdown and q >= 2):
                put(kick(), t0 + q * beat, 0.9)
        if a.mood == "drive":
            put(kick(), t0 + 2.5 * beat, 0.6)
        put(clap(), t0 + beat, 0.38, 0.1); put(clap(), t0 + 3 * beat, 0.38, -0.1)
    for e8 in range(8):
        if intro and e8 % 2: continue
        put(hat(open_=(e8 % 4 == 2 and not intro)), t0 + e8 * beat / 2 + (0.012 if e8 % 2 else 0), 0.8 if e8 % 2 else 0.5, 0.35)
    if not intro and b % 2 == 1:
        for s16 in (13, 14, 15):
            put(hat(), t0 + s16 * beat / 4, 0.35, -0.35)
    # bass (sub, root, pumping eighths)
    if not intro:
        for e8 in range(8):
            if breakdown and e8 >= 4: break
            put(note(midi(root - 12), beat / 2 * 0.9, "sub") * env(int(beat / 2 * 0.9 * SR), 0.004, 0.25), t0 + e8 * beat / 2, 0.42)
    # chord stabs (offbeat), sidechain feel
    key = (root, tuple(chord))
    if key not in chord_cache:
        chord_cache[key] = sum(note(midi(m), beat * 0.45, "saw", 0.08) for m in chord) / 3
    stab = chord_cache[key] * env(int(beat * 0.45 * SR), 0.004, 0.12)
    for q in range(4):
        put(stab, t0 + q * beat + beat / 2, 0.45 if not intro else 0.3, 0.25 if q % 2 else -0.25)
    # simple lead hook every other 4 bars
    if not intro and (b // 4) % 2 == 1:
        melody = [chord[2] + 12, chord[1] + 12, chord[2] + 12, chord[0] + 12]
        for k, m in enumerate(melody):
            nd = note(midi(m), beat * 0.4, "saw", 0.12) * env(int(beat * 0.4 * SR), 0.005, 0.15)
            put(nd, t0 + k * beat + (beat * 0.75 if k % 2 else 0), 0.18, 0.15)

mix = np.stack([L, R], 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.4) / np.tanh(1.4) * 0.9

def write(path, x):
    x = np.clip(x, -1, 1)
    if x.ndim == 1: x = np.stack([x, x], 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())

write(f"{a.out}/beat.wav", mix[: int(SR * bar * a.bars)])
# whoosh: filtered noise swell
m = int(0.45 * SR); t = np.arange(m) / SR
x = rng.standard_normal(m); y = np.zeros(m); s = 0
for i in range(m):
    c = 0.02 + 0.25 * (i / m); s += c * (x[i] - s); y[i] = s
y *= np.sin(np.pi * t / t[-1]) ** 2; y /= np.max(np.abs(y)); write(f"{a.out}/whoosh.wav", y * 0.6)
# pop: short pitched blip
m = int(0.09 * SR); t = np.arange(m) / SR
p = np.sin(2 * np.pi * (900 - 4000 * t) * t) * np.exp(-t * 45); write(f"{a.out}/pop.wav", p * 0.5)
print("ok", a.out)
