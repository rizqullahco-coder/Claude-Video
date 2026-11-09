"""Original, royalty-free romantic track (numpy only).
Piano arpeggios + warm pad + sub bass + soft percussion + bell melody + reverb.
Usage: python3 -I tools/lovesong.py <out.wav> [--bpm 78] [--bars 12] [--seed 3]
"""
import argparse, wave
import numpy as np

ap = argparse.ArgumentParser(); ap.add_argument("out"); ap.add_argument("--bpm", type=float, default=78)
ap.add_argument("--bars", type=int, default=12); ap.add_argument("--seed", type=int, default=3)
ap.add_argument("--groove", action="store_true", help="upbeat: four-on-the-floor kick + soft claps")
ap.add_argument("--luxe", action="store_true", help="luxury score: darker chords, sparse low piano, no drums")
a = ap.parse_args(); rng = np.random.default_rng(a.seed)
SR = 48000; beat = 60 / a.bpm; bar = 4 * beat; N = int(SR * (bar * a.bars + 4))
L = np.zeros(N); R = np.zeros(N)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
t_of = lambda dur: np.arange(int(dur * SR)) / SR

def put(x, at, g=1.0, pan=0.0):
    i = int(at * SR); j = min(N, i + len(x)); x = x[: j - i] * g
    L[i:j] += x * np.sqrt(0.5 * (1 - pan)); R[i:j] += x * np.sqrt(0.5 * (1 + pan))

def piano(f, dur=2.4):
    t = t_of(dur); x = np.zeros_like(t)
    for k, amp in enumerate([1, .55, .32, .2, .12, .07], 1):
        x += amp * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * (1.6 + 1.1 * k))
    return x * np.minimum(t / 0.004, 1)

def pad(freqs, dur):
    t = t_of(dur); x = np.zeros_like(t)
    for f in freqs:
        for det in (-0.004, 0, 0.004):
            ph = 2 * np.pi * f * (1 + det) * t
            x += sum(np.sin(ph * k) / k for k in range(1, 6)) * 0.33
    env = np.minimum(t / 0.9, 1) * np.minimum((dur - t) / 0.9, 1)
    y = np.zeros_like(x); s = 0.0                      # gentle low-pass
    for i in range(0, len(x)): s += 0.03 * (x[i] - s); y[i] = s
    return y * env / len(freqs)

def bell(f, dur=1.6):
    t = t_of(dur)
    return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)) * np.exp(-t * 2.2) * np.minimum(t / 0.003, 1)

def kick():
    t = t_of(0.4); f = 45 + 70 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

def snap():
    t = t_of(0.18); n = rng.standard_normal(len(t))
    return np.convolve(n, [1, -0.9], "same") * np.exp(-t * 38) * 0.6 + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 60) * 0.2

def shaker():
    t = t_of(0.07); n = np.diff(np.concatenate([[0], rng.standard_normal(len(t))]))
    return n * np.exp(-t * 70) * 0.25

# Cmaj7 - Am7 - Fmaj7 - G(sus) ... warm and hopeful
prog = [(48, [60, 64, 67, 71]), (45, [57, 60, 64, 67]), (41, [57, 60, 64, 69]), (43, [55, 59, 62, 67])]
melody = [(0, 76), (1.5, 74), (2, 72), (3, 71), (4, 72), (5.5, 71), (6, 69), (7, 67),
          (8, 69), (9.5, 71), (10, 72), (11, 74), (12, 76), (13, 79), (14, 77), (15, 76)]
if a.luxe:  # Am9 - Fmaj7 - Cmaj7/G - G6 : dark, elegant
    prog = [(45, [57, 60, 64, 71]), (41, [53, 57, 60, 64]), (43, [55, 59, 60, 64]), (43, [55, 59, 62, 64])]
    melody = [(0, 76), (2, 74), (3, 72), (4, 71), (6, 72), (8, 74), (10, 76), (11, 79), (12, 77), (14, 76)]
for b in range(a.bars):
    t0 = b * bar; root, ch = prog[b % 4]
    put(pad([midi(m - (12 if a.luxe else 0)) for m in ch[:3]], bar + 0.6), t0, 0.62 if a.luxe else 0.5)   # pad
    if a.luxe:                                                                       # sparse low piano
        for k, m in enumerate([ch[0] - 12, ch[2] - 12, ch[3] - 12, ch[1]]):
            put(piano(midi(m), 3.0), t0 + k * beat + (0.015 if k % 2 else 0), 0.34 if k == 0 else 0.26, -0.2 + 0.13 * k)
    else:
        arp = [ch[0], ch[1], ch[2], ch[3], ch[2] + 12, ch[3], ch[2], ch[1]]
        for k, m in enumerate(arp):                                                  # piano arpeggio
            put(piano(midi(m)), t0 + k * beat / 2 + (0.01 if k % 2 else 0), 0.30 if k else 0.36, -0.25 + 0.07 * k)
    if b >= 1:
        put(np.sin(2 * np.pi * midi(root - 12) * t_of(bar * 0.98)) * np.minimum(t_of(bar * 0.98) / 0.05, 1) * np.exp(-t_of(bar * 0.98) * 0.6), t0, 0.32)
    if 2 <= b < a.bars - 1 and not a.luxe:
        if a.groove:
            for q in range(4): put(kick(), t0 + q * beat, 0.5)
            if b >= 4: put(snap(), t0 + beat, 0.06, 0.1); put(snap(), t0 + 3 * beat, 0.06, -0.1)
        else:
            put(kick(), t0, 0.42); put(kick(), t0 + 2 * beat + beat / 2, 0.25)
    if False and 4 <= b < a.bars - 1:  # percussion off: piano leads
        put(snap(), t0 + beat, 0.07, 0.1); put(snap(), t0 + 3 * beat, 0.07, -0.1)
        for s16 in range(0, 16, 2): put(shaker(), t0 + s16 * beat / 4, 0.05, 0.4)
    if b >= 4:                                                                       # bell melody
        for at, m in melody:
            if b * 4 <= (b // 4) * 16 + at < b * 4 + 4 and (b // 4) % 2 == 1 or (4 <= b < 8 and int(at) // 4 == b % 4):
                put(bell(midi(m)), t0 + (at % 4) * beat, 0.17, 0.2)
# final chord ring-out
put(pad([midi(m) for m in prog[0][1][:3]], 4), a.bars * bar, 0.5)
for k, m in enumerate(prog[0][1]): put(piano(midi(m + 12), 3.5), a.bars * bar + k * 0.12, 0.25)

# reverb: convolve with a decaying-noise impulse (FFT)
def reverb(x, secs=2.2, mix=0.28):
    ir = rng.standard_normal(int(secs * SR)) * np.exp(-np.arange(int(secs * SR)) / SR * 3.2); ir /= np.sqrt((ir ** 2).sum())
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    wet = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[: len(x)]
    return x * (1 - mix) + wet * mix * 3
L, R = reverb(L), reverb(R)
mix = np.stack([L, R], 1); mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.05) / np.tanh(1.05) * 0.9
fade = np.ones(len(mix)); fl = int(SR * 2.5); fade[-fl:] = np.linspace(1, 0, fl); mix *= fade[:, None]
with wave.open(a.out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
print("ok", a.out, f"{len(mix) / SR:.1f}s")
