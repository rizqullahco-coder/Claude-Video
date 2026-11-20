"""Extra money SFX, generated locally (numpy). Usage: python3 -I sfx.py <out_dir>"""
import sys, wave
import numpy as np
SR = 48000; out = sys.argv[1]; rng = np.random.default_rng(9)
t_of = lambda d: np.arange(int(d * SR)) / SR
def write(name, x):
    x = np.clip(x / (np.max(np.abs(x)) + 1e-9) * 0.9, -1, 1); x = np.stack([x, x], 1)
    with wave.open(f"{out}/{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype("<i2").tobytes())
def bell(t, f, dec): return sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * dec * k) / k for k in (1, 2.76, 5.4))
# ka-ching: drawer clack + two bright bells
t = t_of(1.1); x = np.zeros(len(t)); n = int(0.06 * SR)
x[:n] += rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 80) * 0.8
for d, f in ((0.08, 2093), (0.2, 2637)):
    i = int(d * SR); tt = t[: len(t) - i]; x[i:] += bell(tt, f, 4.5)
write("chaching", x)
# coin: short metallic ping
t = t_of(0.35); write("coin", bell(t, 3136, 14) + bell(t, 4186, 18) * 0.5)
# key tick
t = t_of(0.04); write("tick", rng.standard_normal(len(t)) * np.exp(-t * 180) + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 200))
# drain: descending sweep + noise swoosh
t = t_of(1.6); f = 1400 * np.exp(-t * 2.2) + 60
write("drain", np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.6 * np.exp(-t * 1.2) + np.convolve(rng.standard_normal(len(t)), np.ones(30) / 30, "same") * np.sin(np.pi * t / 1.6) * 1.5)
# riser: rising noise + tone into a hit
t = t_of(1.5); f = 200 + 1600 * (t / 1.5) ** 2
write("riser", (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + np.convolve(rng.standard_normal(len(t)), np.ones(8) / 8, "same")) * (t / 1.5) ** 2)
# error buzz
t = t_of(0.35); write("buzz", np.sign(np.sin(2 * np.pi * 110 * t)) * 0.5 * np.exp(-t * 4) + np.sin(2 * np.pi * 220 * t) * 0.3)
print("ok")
