// "Words to video" mode: turn a written script into a finished, on-brand video.
// Everything runs locally: HyperFrames TTS (Kokoro, on-device) for the voice,
// HyperFrames (Chrome) for the motion graphics, FFmpeg for audio and finishing.
//
// Script format (script.md):
//   ## Section title
//   One line per beat. Wrap words in *asterisks* to highlight them.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { run, log, probeDuration, escapeHtml as h, ROOT } from "./util.mjs";
import { hyperframes } from "./hyperframes.mjs";

const DEFAULT_SENTENCE_GAP = 0.28; // pause between sentences (s)
const DEFAULT_LINE_GAP = 0.45; // pause between lines
const DEFAULT_SECTION_CARD = 1.6; // section title card length (s); 0 = no card (shorts)

/** Parse script.md into sections -> lines -> sentences (keeping *emphasis*). */
export function parseScript(md) {
  const sections = [];
  let cur = null;
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) { cur = { title: line.slice(3).trim(), lines: [] }; sections.push(cur); continue; }
    if (!cur) { cur = { title: "", lines: [] }; sections.push(cur); }
    const sentences = line.match(/[^.!?]+[.!?]+["')\]*]*|[^.!?]+$/g).map((s) => s.trim()).filter((s) => plain(s).replace(/["'\s]/g, "").length > 0);
    cur.lines.push(sentences);
  }
  return sections;
}

export const plain = (s) => s.replace(/\*/g, "");

/** Split a sentence into on-screen chunks of at most maxWords, preferring punctuation breaks. */
export function chunk(sentence, maxWords) {
  const words = sentence.split(/\s+/);
  if (words.length <= maxWords) return [words];
  const out = [];
  let cur = [];
  words.forEach((w, i) => {
    cur.push(w);
    const left = words.length - i - 1;
    const atPunct = /[,;:]$/.test(plain(w)) && cur.length >= Math.ceil(maxWords / 2);
    if ((cur.length >= maxWords || atPunct) && left > 1) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
}

/** Local TTS with a cache keyed by text+voice+speed, so re-renders don't re-synthesise. */
async function tts(text, cacheDir, { voice, speed }) {
  const key = crypto.createHash("sha1").update(`${voice}|${speed}|${text}`).digest("hex").slice(0, 16);
  const out = path.join(cacheDir, `${key}.wav`);
  if (!fs.existsSync(out)) {
    await hyperframes(["tts", text, "-o", out, "-v", voice, "-s", String(speed)], { verbose: false, stdio: ["ignore", "ignore", "inherit"] });
  }
  return { file: out, dur: probeDuration(out) };
}

/**
 * Synthesise the voice track and lay out the timeline.
 * Returns { voiceFile, timeline: [{type, start, dur, ...}], total }.
 */
export async function buildVoice(p, sections, workDir) {
  const cacheDir = path.join(workDir, "tts-cache");
  fs.mkdirSync(cacheDir, { recursive: true });
  const voice = { voice: p.voice || "af_heart", speed: p.voiceSpeed || 1 };
  const intro = p.intro?.duration ?? 2.2;
  const SENTENCE_GAP = p.pacing?.sentenceGap ?? DEFAULT_SENTENCE_GAP;
  const LINE_GAP = p.pacing?.lineGap ?? DEFAULT_LINE_GAP;
  const SECTION_CARD = p.pacing?.sectionCard ?? DEFAULT_SECTION_CARD;
  const pieces = []; // { file, start }
  const timeline = [];
  let t = intro;
  let n = 0;
  const totalSentences = sections.reduce((a, s) => a + s.lines.flat().length, 0) + (p.outro?.spoken ? 1 : 0);

  for (const [si, sec] of sections.entries()) {
    if (sec.title) { timeline.push({ type: "section", index: si + 1, title: sec.title, start: t, dur: SECTION_CARD }); t += SECTION_CARD; }
    const secStart = t;
    for (const line of sec.lines) {
      for (const sentence of line) {
        n++;
        process.stdout.write(`\r› voiceover ${n}/${totalSentences}   `);
        const { file, dur } = await tts(plain(sentence), cacheDir, voice);
        pieces.push({ file, start: t });
        timeline.push({ type: "sentence", text: sentence, start: t, dur });
        t += dur + SENTENCE_GAP;
      }
      t += LINE_GAP - SENTENCE_GAP;
    }
    if (sec.title) timeline.push({ type: "label", index: si + 1, title: sec.title, start: secStart, dur: t - secStart });
  }
  const outroStart = t + 0.3;
  let outroDur = p.outro?.duration ?? 4.5;
  if (p.outro?.spoken) {
    n++;
    process.stdout.write(`\r› voiceover ${n}/${totalSentences}   `);
    const { file, dur } = await tts(p.outro.spoken, cacheDir, voice);
    pieces.push({ file, start: outroStart + 0.8 });
    outroDur = Math.max(outroDur, dur + 2.4);
  }
  process.stdout.write("\n");
  timeline.push({ type: "outro", start: outroStart, dur: outroDur });
  const total = +(outroStart + outroDur).toFixed(3);

  // Mix every sentence at its exact start time into one voice track (FFmpeg).
  const voiceFile = path.join(workDir, "voice.wav");
  const args = ["-y", "-hide_banner", "-loglevel", "error"];
  pieces.forEach((pc) => args.push("-i", pc.file));
  const filters = pieces.map((pc, i) => `[${i}:a]aresample=48000,adelay=${Math.round(pc.start * 1000)}:all=1[a${i}]`);
  filters.push(`${pieces.map((_, i) => `[a${i}]`).join("")}amix=inputs=${pieces.length}:normalize=0,apad=whole_dur=${total},loudnorm=I=-16:TP=-1.5:LRA=11[out]`);
  const fscript = path.join(workDir, "mix.filter");
  fs.writeFileSync(fscript, filters.join(";\n"));
  args.push("-filter_complex_script", fscript, "-map", "[out]", "-ar", "48000", "-ac", "2", "-t", String(total), voiceFile);
  await run("ffmpeg", args, { verbose: false });
  return { voiceFile, timeline, total, intro };
}

/** Build the HyperFrames composition for one canvas size. */
export function buildScriptComposition(buildDir, p, { timeline, total, intro }, { width: W, height: H, hasMusic }) {
  const vertical = H > W;
  const b = { bg: "#0a0f1f", bg2: "#131a33", ink: "#f5f7ff", accent: "#ffb547", accent2: "#3ee0c5", ...(p.brand || {}) };
  const base = Math.min(W, H);
  const fs_ = Math.round(base * (vertical ? 0.078 : 0.07));
  const maxWords = vertical ? 6 : 10;

  // Captions: each sentence becomes 1+ chunks; words reveal across the spoken time.
  const caps = [];
  for (const s of timeline.filter((x) => x.type === "sentence")) {
    const chunks = chunk(s.text, maxWords);
    const totalChars = chunks.reduce((a, c) => a + plain(c.join(" ")).length, 0);
    let t = s.start;
    chunks.forEach((words, ci) => {
      const share = plain(words.join(" ")).length / totalChars;
      const dur = s.dur * share;
      const isLast = ci === chunks.length - 1;
      caps.push({ id: `c${caps.length}`, words, start: +t.toFixed(3), dur: +(dur + (isLast ? 0.22 : 0)).toFixed(3) });
      t += dur;
    });
  }

  let emphasisOpen = false;
  const wordHtml = (w) => {
    const opens = w.startsWith("*"), closes = /\*[^\w]*$/.test(w);
    const em = emphasisOpen || opens;
    if (opens) emphasisOpen = true;
    if (closes) emphasisOpen = false;
    return `<span class="w${em ? " em" : ""}">${h(plain(w))}</span>`;
  };

  const sections = timeline.filter((x) => x.type === "section");
  const labels = timeline.filter((x) => x.type === "label");
  const outro = timeline.find((x) => x.type === "outro");
  const o = p.outro || {};

  const css = `
@font-face { font-family: "Inter"; font-weight: 400; src: url(assets/inter-400.woff2) format("woff2"); }
@font-face { font-family: "Inter"; font-weight: 600; src: url(assets/inter-600.woff2) format("woff2"); }
@font-face { font-family: "Inter"; font-weight: 800; src: url(assets/inter-800.woff2) format("woff2"); }
:root { --bg:${b.bg}; --bg2:${b.bg2}; --ink:${b.ink}; --accent:${b.accent}; --accent2:${b.accent2}; }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:${W}px; height:${H}px; overflow:hidden; background:var(--bg); font-family:"Inter", sans-serif; color:var(--ink); }
#root { position:relative; width:100%; height:100%; overflow:hidden; }
.clip { position:absolute; inset:0; }
#bg { background: radial-gradient(120% 90% at 50% 0%, var(--bg2) 0%, var(--bg) 60%); }
.blob { position:absolute; border-radius:50%; filter:blur(${Math.round(base * 0.09)}px); opacity:.35; }
#b1 { width:${Math.round(base * 0.7)}px; height:${Math.round(base * 0.7)}px; background:var(--accent); left:-${Math.round(base * 0.2)}px; top:-${Math.round(base * 0.15)}px; opacity:.24; }
#b2 { width:${Math.round(base * 0.8)}px; height:${Math.round(base * 0.8)}px; background:var(--accent2); right:-${Math.round(base * 0.25)}px; bottom:-${Math.round(base * 0.3)}px; opacity:.22; }
#grid { position:absolute; inset:0; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size:${Math.round(base / 12)}px ${Math.round(base / 12)}px; }
.cap { display:flex; align-items:center; justify-content:center; padding:0 ${vertical ? 8 : 12}%; opacity:0; }
.cap p { font-size:${fs_}px; font-weight:800; line-height:1.14; letter-spacing:-0.025em; text-align:center; max-width:${vertical ? 92 : 80}%; }
.w { display:inline-block; margin:0 .13em; opacity:0; }
.w.em { color:var(--accent); }
.sec { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:${Math.round(base * 0.02)}px; opacity:0; }
.sec .num { font-size:${Math.round(base * 0.04)}px; font-weight:600; color:var(--accent2); letter-spacing:.3em; }
.sec .title { font-size:${Math.round(base * 0.1)}px; font-weight:800; letter-spacing:-0.035em; text-align:center; padding:0 6%; }
.sec .rule { width:${Math.round(base * 0.12)}px; height:${Math.max(6, Math.round(base * 0.008))}px; border-radius:99px; background:var(--accent); }
.label { inset:${Math.round(base * 0.055)}px auto auto ${Math.round(base * 0.055)}px; font-size:${Math.round(base * 0.024)}px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:rgba(245,247,255,.6); opacity:0; }
.label b { color:var(--accent2); margin-right:.6em; }
#brand { inset:auto ${Math.round(base * 0.055)}px ${Math.round(base * 0.06)}px auto; display:flex; align-items:center; gap:${Math.round(base * 0.012)}px; font-size:${Math.round(base * 0.026)}px; font-weight:800; letter-spacing:.2em; }
#brand i { width:${Math.round(base * 0.022)}px; height:${Math.round(base * 0.022)}px; border-radius:50%; background:linear-gradient(135deg, var(--accent), var(--accent2)); display:block; }
#brand span { font-weight:400; letter-spacing:.05em; opacity:.6; font-size:.8em; }
#progress-track { inset:auto 0 0 0; height:${Math.max(5, Math.round(base * 0.006))}px; background:rgba(255,255,255,.08); }
#progress { position:absolute; left:0; top:0; bottom:0; width:100%; background:linear-gradient(90deg, var(--accent), var(--accent2)); transform-origin:left center; transform:scaleX(0); }
.card { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:${Math.round(base * 0.025)}px; padding:0 8%; opacity:0; }
.logo { display:flex; align-items:center; gap:${Math.round(base * 0.025)}px; font-size:${Math.round(base * 0.13)}px; font-weight:800; letter-spacing:.06em; }
.logo i { width:${Math.round(base * 0.09)}px; height:${Math.round(base * 0.09)}px; border-radius:50%; background:linear-gradient(135deg, var(--accent), var(--accent2)); display:block; }
.card .sub { font-size:${Math.round(base * 0.038)}px; font-weight:600; color:var(--accent2); letter-spacing:.12em; text-transform:uppercase; }
.card .tag { font-size:${Math.round(base * 0.045)}px; font-weight:600; opacity:.9; }
.card .cta { margin-top:${Math.round(base * 0.02)}px; font-size:${Math.round(base * 0.034)}px; font-weight:800; color:var(--bg); background:var(--accent); padding:${Math.round(base * 0.018)}px ${Math.round(base * 0.04)}px; border-radius:99px; }
#intro .title { font-size:${Math.round(base * (vertical ? 0.1 : 0.095))}px; font-weight:800; letter-spacing:-0.035em; line-height:1.05; }
#intro .title em { font-style:normal; color:var(--accent); }`;

  const words = (c) => c.words.map(wordHtml).join("");
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${W}, height=${H}" />
<script src="assets/gsap.min.js"></script>
<style>${css}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="${W}" data-height="${H}">
  <div id="bg" class="clip" data-start="0" data-duration="${total}" data-track-index="0"><div id="b1" class="blob"></div><div id="b2" class="blob"></div><div id="grid"></div></div>
  <section id="intro" class="clip card" data-start="0" data-duration="${intro}" data-track-index="1">
    <div class="sub">${h(p.intro?.kicker || p.brand?.name || "")}</div>
    <div class="title">${(p.intro?.title || p.title || "").split(/(\*[^*]+\*)/).map((s) => (s.startsWith("*") ? `<em>${h(plain(s))}</em>` : h(s))).join("")}</div>
  </section>
${sections.map((s) => `  <section id="sec${s.index}" class="clip sec" data-start="${s.start.toFixed(3)}" data-duration="${s.dur}" data-track-index="1"><div class="num">${String(s.index).padStart(2, "0")}</div><div class="title">${h(s.title)}</div><div class="rule"></div></section>`).join("\n")}
${labels.map((l) => `  <div id="lab${l.index}" class="clip label" data-start="${l.start.toFixed(3)}" data-duration="${l.dur.toFixed(3)}" data-track-index="2"><b>${String(l.index).padStart(2, "0")}</b>${h(l.title)}</div>`).join("\n")}
${caps.map((c) => `  <div id="${c.id}" class="clip cap" data-start="${c.start}" data-duration="${c.dur}" data-track-index="3"><p>${words(c)}</p></div>`).join("\n")}
  <section id="outro" class="clip card" data-start="${outro.start.toFixed(3)}" data-duration="${outro.dur.toFixed(3)}" data-track-index="1">
    <div class="logo"><i></i>${h(b.name || "")}</div>
    ${b.tagline ? `<div class="sub">${h(b.tagline)}</div>` : ""}
    ${o.tag ? `<div class="tag">${h(o.tag)}</div>` : ""}
    ${o.cta ? `<div class="cta">${h(o.cta)}</div>` : ""}
  </section>
  <div id="brand" class="clip" data-start="${intro}" data-duration="${(outro.start - intro).toFixed(3)}" data-track-index="4"><i></i>${h(b.name || "")}${b.tagline && !vertical ? `<span>${h(b.tagline)}</span>` : ""}</div>
  <div id="progress-track" class="clip" data-start="0" data-duration="${total}" data-track-index="4"><div id="progress"></div></div>
  <audio id="voice" src="assets/voice.wav" data-start="0" data-duration="${total}" data-volume="1"></audio>
${hasMusic ? musicClips(p, intro, outro, total) : ""}
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  // Background drift + progress bar
  tl.fromTo("#b1", { x: 0, y: 0 }, { x: ${Math.round(W * 0.25)}, y: ${Math.round(H * 0.2)}, duration: ${total}, ease: "sine.inOut" }, 0);
  tl.fromTo("#b2", { x: 0, y: 0 }, { x: ${-Math.round(W * 0.2)}, y: ${-Math.round(H * 0.25)}, duration: ${total}, ease: "sine.inOut" }, 0);
  tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${total}, ease: "none" }, 0);
  // Intro
  tl.fromTo("#intro", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
  tl.fromTo("#intro .sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.1);
  tl.fromTo("#intro .title", { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power4.out" }, 0.25);
  tl.to("#intro", { opacity: 0, duration: 0.35 }, ${(intro - 0.35).toFixed(3)});
  // Section cards + corner labels
${sections.map((s) => `  tl.fromTo("#sec${s.index}", { opacity: 0 }, { opacity: 1, duration: 0.25 }, ${s.start.toFixed(3)});
  tl.fromTo("#sec${s.index} .title", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power4.out" }, ${(s.start + 0.1).toFixed(3)});
  tl.fromTo("#sec${s.index} .rule", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.out" }, ${(s.start + 0.35).toFixed(3)});
  tl.to("#sec${s.index}", { opacity: 0, duration: 0.25 }, ${(s.start + s.dur - 0.25).toFixed(3)});`).join("\n")}
${labels.map((l) => `  tl.fromTo("#lab${l.index}", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4 }, ${l.start.toFixed(3)});
  tl.to("#lab${l.index}", { opacity: 0, duration: 0.3 }, ${(l.start + l.dur - 0.3).toFixed(3)});`).join("\n")}
  // Captions: words pop in as they're spoken
${caps.map((c) => {
    const n = c.words.length;
    const reveal = Math.max(0.05, (c.dur * 0.8) / n);
    return `  tl.set("#${c.id}", { opacity: 1 }, ${c.start});
  tl.fromTo("#${c.id} .w", { opacity: 0, y: ${Math.round(fs_ * 0.35)} }, { opacity: 1, y: 0, duration: 0.22, ease: "power3.out", stagger: ${reveal.toFixed(3)} }, ${c.start});
  tl.to("#${c.id}", { opacity: 0, duration: 0.12 }, ${(c.start + c.dur - 0.12).toFixed(3)});`;
  }).join("\n")}
  // Outro
  tl.fromTo("#outro", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ${outro.start.toFixed(3)});
  tl.fromTo("#outro .logo", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.6)" }, ${(outro.start + 0.15).toFixed(3)});
  tl.fromTo("#outro .sub, #outro .tag", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.2 }, ${(outro.start + 0.6).toFixed(3)});
  tl.fromTo("#outro .cta", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, ${(outro.start + 1.1).toFixed(3)});
  window.__timelines["main"] = tl;
  tl.seek(0);
</script>
</body>
</html>
`;
  fs.mkdirSync(path.join(buildDir, "assets"), { recursive: true });
  fs.copyFileSync(path.join(ROOT, "node_modules/gsap/dist/gsap.min.js"), path.join(buildDir, "assets/gsap.min.js"));
  for (const wgt of [400, 600, 800]) {
    fs.copyFileSync(path.join(ROOT, `node_modules/@fontsource/inter/files/inter-latin-${wgt}-normal.woff2`), path.join(buildDir, `assets/inter-${wgt}.woff2`));
  }
  fs.writeFileSync(path.join(buildDir, "index.html"), html);
  fs.writeFileSync(path.join(buildDir, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
  fs.writeFileSync(path.join(buildDir, "meta.json"), JSON.stringify({ id: p.name, name: p.title }, null, 2));
  return { captions: caps.length };
}

function musicClips(p, intro, outro, total) {
  const m = p.music || {};
  const full = m.volume ?? 0.45, duck = m.duckedVolume ?? 0.1, off = m.startAt ?? 0;
  const clip = (id, s, d, v, fi, fo) => `  <audio id="${id}" src="assets/music.mp3" data-start="${s.toFixed(3)}" data-duration="${d.toFixed(3)}" data-media-start="${(off + s).toFixed(3)}" data-volume="${v}" data-fade-in="${fi}" data-fade-out="${fo}"></audio>`;
  return [
    clip("music-intro", 0, intro, full, 0.4, 0.5),
    clip("music-bed", intro, outro.start - intro, duck, 0.5, 0.5),
    clip("music-outro", outro.start, total - outro.start, full, 0.5, 2.5),
  ].join("\n");
}
