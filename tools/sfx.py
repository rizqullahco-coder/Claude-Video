"""Comedy / UI sound effects, generated locally (numpy). Usage: python3 -I tools/sfx.py <out_dir>"""
import sys, wave
import numpy as np
SR = 48000; out = sys.argv[1]; rng = np.random.default_rng(4)
t_of = lambda d: np.arange(int(d * SR)) / SR
def write(name, x):
    x = np.clip(x / (np.max(np.abs(x)) + 1e-9) * 0.9, -1, 1); x = np.stack([x, x], 1)
    with wave.open(f"{out}/{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype("<i2").tobytes())
t = t_of(0.09); write("beep", np.sin(2 * np.pi * 1760 * t) * np.exp(-t * 30))                       # scanner beep
t = t_of(0.5); g = np.sign(np.sin(2 * np.pi * (300 + 900 * (t * 7 % 1)) * t)) * (rng.random(len(t)) > 0.3)
write("glitch", np.round(g * 4) / 4 * np.exp(-t * 4))                                                   # digital glitch
t = t_of(0.75); f = 900 * np.exp(-t * 3.2) + 120; n = rng.standard_normal(len(t))
scr = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.6 + np.convolve(n, np.ones(6) / 6, "same") * 0.5
write("scratch", scr * np.minimum(t / 0.01, 1) * np.exp(-t * 2.5))                                     # record scratch
t = t_of(0.6); f = 70 + 120 * np.exp(-t * 25)
write("stamp", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + rng.standard_normal(len(t)) * np.exp(-t * 60) * 0.4)  # stamp thump
t = t_of(0.35); f = 260 + 500 * np.exp(-t * 9) * np.sin(2 * np.pi * 14 * t) ** 2
write("boing", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6))                               # cartoon boing
t = t_of(0.12); write("thwip", rng.standard_normal(len(t)) * np.exp(-t * 35) * np.sin(2 * np.pi * (3000 - 20000 * t) * t))  # thwip
print("ok")
