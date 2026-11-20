"""Lesson video engine: narration (Piper TTS) -> timed HTML scenes -> frames -> MP4.

A lesson module defines SCENES: a list of dicts
    {"id": str, "lines": [caption_text | (caption_text, spoken_text)], "html": str,
     "pre": seconds before first line, "post": seconds after last line, "min": minimum length}
Inside "html", animated elements carry data-fx / data-c (cue = line index) / data-o (offset s) / data-d (duration s).

Requirements: ffmpeg, python packages piper-tts + numpy, node with playwright.
Voice: Piper "en-us-libritts-high" (LibriTTS, CC BY 4.0) - set VOICE_MODEL to the .onnx path.
"""
import json
import os
import re
import subprocess
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
VOICE_MODEL = os.environ.get("VOICE_MODEL", "voice/en-us-libritts-high.onnx")
SPEAKER = int(os.environ.get("VOICE_SPEAKER", "250"))
SR = 22050
FPS = int(os.environ.get("FPS", "30"))
GAP = 0.42


def tts(text, out):
    subprocess.run(["python3", "-m", "piper", "-m", VOICE_MODEL, "-s", str(SPEAKER), "--length-scale", "1.0",
                    "--sentence-silence", "0.25", "-f", str(out)], input=text.encode(), check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with wave.open(str(out)) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    # trim leading/trailing silence
    nz = np.where(np.abs(x) > 300)[0]
    if len(nz):
        x = x[max(0, nz[0] - 400): nz[-1] + 1200]
    return x


def chunk_caption(text, limit=64):
    words, chunks, cur = text.split(), [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > limit:
            chunks.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        chunks.append(cur)
    # avoid a lonely last word
    if len(chunks) > 1 and len(chunks[-1].split()) == 1:
        prev = chunks[-2].split()
        chunks[-2], chunks[-1] = " ".join(prev[:-1]), prev[-1] + " " + chunks[-1]
    return chunks


def build_audio(scenes, work):
    """Synthesize each line; return per-scene cue times, durations, captions, and full narration array."""
    work.mkdir(parents=True, exist_ok=True)
    out_scenes, all_audio, caps_global, t0 = [], [], [], 0.0
    for si, sc in enumerate(scenes):
        pre, post = sc.get("pre", 0.6), sc.get("post", 1.0)
        audio = [np.zeros(int(pre * SR), np.int16)]
        t, cues, caps = pre, [], []
        for li, line in enumerate(sc["lines"]):
            cap, say = (line, line) if isinstance(line, str) else line
            x = tts(say, work / f"{sc['id']}_{li}.wav")
            dur = len(x) / SR
            cues.append(round(t, 3))
            chunks = chunk_caption(cap)
            total = sum(len(c) for c in chunks)
            ct = t
            for c in chunks:
                cd = dur * len(c) / total
                caps.append({"s": round(ct, 3), "e": round(ct + cd, 3), "text": c})
                ct += cd
            audio += [x, np.zeros(int(GAP * SR), np.int16)]
            t += dur + GAP
        t += post - GAP if sc["lines"] else post
        dur = max(t, sc.get("min", 0))
        # pad audio to exact frame-aligned duration
        dur = round(dur * FPS) / FPS
        a = np.concatenate(audio)
        need = int(round(dur * SR))
        a = np.pad(a, (0, max(0, need - len(a))))[:need]
        all_audio.append(a)
        out_scenes.append({"id": sc["id"], "cues": cues, "caps": caps, "dur": dur, "start": round(t0, 3)})
        for c in caps:
            caps_global.append({"s": c["s"] + t0, "e": c["e"] + t0, "text": c["text"]})
        t0 += dur
    return out_scenes, np.concatenate(all_audio), caps_global


def write_wav(path, x, sr):
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1 if x.ndim == 1 else x.shape[1])
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(x.astype(np.int16).tobytes())


def srt(caps, path):
    def ts(s):
        h, r = divmod(s, 3600)
        m, r = divmod(r, 60)
        return f"{int(h):02d}:{int(m):02d}:{int(r):02d},{int(round((r % 1) * 1000)) % 1000:03d}"
    lines = []
    for i, c in enumerate(caps, 1):
        lines += [str(i), f"{ts(c['s'])} --> {ts(c['e'])}", c["text"], ""]
    Path(path).write_text("\n".join(lines))


# ------------------------------------------------------------------ music
def music(seconds, path, sr=44100, seed=7):
    """Original, royalty-free background bed: warm pad + soft plucked arpeggio, 84 bpm."""
    rng = np.random.default_rng(seed)
    n = int(seconds * sr)
    t = np.arange(n) / sr
    out = np.zeros(n)
    bpm = 84
    beat = 60 / bpm
    bar = beat * 4
    # chords (MIDI): Fmaj7, Am7, Dm7, Bbmaj7
    prog = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [46, 50, 53, 57]]
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    nb = int(np.ceil(seconds / bar)) + 1
    for b in range(nb):
        ch = prog[b % 4]
        s0 = int(b * bar * sr)
        if s0 >= n:
            break
        L = int(bar * sr * 1.15)
        seg = np.arange(L) / sr
        env = np.minimum(1, seg / 0.8) * np.minimum(1, np.maximum(0, (bar * 1.15 - seg) / 0.6))
        pad = np.zeros(L)
        for m in ch:
            f = hz(m)
            for det in (-0.12, 0.12):
                ff = f * 2 ** (det / 12)
                pad += 0.5 * np.sin(2 * np.pi * ff * seg) + 0.12 * np.sin(4 * np.pi * ff * seg)
        pad *= env * 0.05
        e = min(n, s0 + L)
        out[s0:e] += pad[: e - s0]
        # bass
        f = hz(ch[0] - 12)
        bl = int(beat * 2 * sr)
        for k in (0, 2):
            bs = s0 + int(k * beat * sr)
            seg2 = np.arange(bl) / sr
            tone = np.sin(2 * np.pi * f * seg2) * np.exp(-seg2 * 2.2) * 0.16
            e2 = min(n, bs + bl)
            if bs < n:
                out[bs:e2] += tone[: e2 - bs]
        # pluck arpeggio on 8ths
        pattern = [0, 2, 1, 3, 2, 1, 3, 2]
        for k in range(8):
            ps = s0 + int(k * beat / 2 * sr)
            m = ch[pattern[k]] + 12
            f = hz(m)
            pl = int(0.9 * sr)
            seg3 = np.arange(pl) / sr
            tone = (np.sin(2 * np.pi * f * seg3) + 0.3 * np.sin(4 * np.pi * f * seg3)) * np.exp(-seg3 * 5) * 0.07
            tone *= 0.8 + 0.4 * rng.random()
            e3 = min(n, ps + pl)
            if ps < n:
                out[ps:e3] += tone[: e3 - ps]
    # simple stereo widening via short delay, and fade in/out
    fade = np.minimum(1, t / 1.5) * np.minimum(1, (seconds - t) / 2.5)
    out *= fade
    L = out
    R = np.concatenate([np.zeros(int(0.012 * sr)), out])[:n]
    st = np.stack([L, R], axis=1)
    st = st / (np.abs(st).max() + 1e-9) * 0.7
    write_wav(path, (st * 32767), sr)


# ------------------------------------------------------------------ HTML
def scene_html(sc, meta, base_css, brand):
    tpl = (HERE / "scene_template.html").read_text()
    return (tpl.replace("/*CSS*/", base_css)
               .replace("__CUES__", json.dumps(meta["cues"]))
               .replace("__CAPS__", json.dumps(meta["caps"]))
               .replace("__DUR__", str(meta["dur"]))
               .replace("<!--BODY-->", sc["html"])
               .replace("__CAPTIONS__", "true" if sc.get("captions", True) else "false")
               .replace("<body>", f'<body class="{sc.get("cls", "")}">'))


def build(lesson_name, scenes, out_dir, work_dir):
    out_dir, work_dir = Path(out_dir), Path(work_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    work_dir.mkdir(parents=True, exist_ok=True)
    meta, narration, caps = build_audio(scenes, work_dir / "tts")
    total = sum(m["dur"] for m in meta)
    write_wav(work_dir / "narration.wav", narration, SR)
    music(total, work_dir / "music.wav")
    srt(caps, out_dir / f"{lesson_name}.srt")
    css = (HERE / "theme.css").read_text()
    jobs = []
    for sc, m in zip(scenes, meta):
        p = work_dir / f"scene_{m['id']}.html"
        p.write_text(scene_html(sc, m, css, None))
        jobs.append({"html": str(p), "dur": m["dur"], "out": str(work_dir / f"scene_{m['id']}.mp4")})
    (work_dir / "jobs.json").write_text(json.dumps({"fps": FPS, "jobs": jobs}))
    print(f"total {total:.1f}s, rendering {len(jobs)} scenes...", flush=True)
    subprocess.run(["node", str(HERE / "render.cjs"), str(work_dir / "jobs.json")], check=True)
    (work_dir / "concat.txt").write_text("".join(f"file '{j['out']}'\n" for j in jobs))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(work_dir / "concat.txt"),
                    "-c", "copy", str(work_dir / "video.mp4")], check=True)
    # music louder in intro & outro, ducked under voice elsewhere
    intro_end = meta[0]["dur"]
    outro_start = meta[-1]["start"]
    vol = f"if(lt(t,{intro_end - 0.5}),0.55,if(gt(t,{outro_start + 0.3}),0.55,0.13))"
    out = out_dir / f"{lesson_name}.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-v", "error", "-i", str(work_dir / "video.mp4"), "-i", str(work_dir / "narration.wav"),
        "-i", str(work_dir / "music.wav"),
        "-filter_complex",
        "[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,highpass=f=70,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,"
        "volume=1.6[v];"
        f"[2:a]volume='{vol}':eval=frame[m];"
        "[v]asplit[v1][v2];[m][v2]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=400[md];"
        "[v1][md]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]",
        "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-ar", "44100",
        "-movflags", "+faststart", "-shortest", str(out)], check=True)
    (out_dir / f"{lesson_name}.timing.json").write_text(json.dumps(meta, indent=1))
    return out, total
