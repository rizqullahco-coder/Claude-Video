// Scene mode ("data story"): each scene = a short voice line + an animated visual
// (stat dot-grid, counter, people row, garage, growing idea...). Calm pacing,
// small subtitles, visuals carry the message. Renders locally with HyperFrames.
//
// project.json:
//   "mode": "scenes", "theme": "gold-pop", "scenes": [ { "say": ["..."], "visual": { "type": "...", ... } } ]
import fs from "node:fs";
import path from "node:path";
import { run, escapeHtml as h, ROOT } from "./util.mjs";
import { brandKit, taglineHtml } from "./brands.mjs";
import { tts, plain, chunk } from "./script.mjs";
import { THEMES, TEMPLATES } from "./shorts.mjs";

const n3 = (x) => (+x).toFixed(3);
const LOGO = { dark: "logo-dark-ink.png", light: "logo-light-ink.png", mono: "logo-mono-dark.png" };
// Serif-italic emphasis for *words*.
const rich = (s) => h(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');

/** Voice: one TTS clip per sentence, laid out scene by scene. */
export async function buildSceneVoice(p, workDir) {
  const cacheDir = p.ttsCacheDir ? path.resolve(ROOT, p.ttsCacheDir) : path.join(workDir, "tts-cache");
  fs.mkdirSync(cacheDir, { recursive: true });
  const v = { voice: p.voice || "af_heart", speed: p.voiceSpeed || 0.94 };
  const gap = p.pacing?.sentenceGap ?? 0.45, lead = p.pacing?.sceneLead ?? 0.5, hold = p.pacing?.sceneHold ?? 0.9;
  let t = 0.2;
  const pieces = [], scenes = [];
  for (const [i, sc] of p.scenes.entries()) {
    const start = t;
    t += i === 0 ? 0.3 : lead;
    const lines = [];
    for (const text of sc.say) {
      let speak = plain(text);
      for (const [from, to] of Object.entries(p.pronounce || {})) speak = speak.split(from).join(to);
      const { file, dur } = await tts(speak, cacheDir, v);
      pieces.push({ file, start: t });
      lines.push({ text, start: t, dur });
      t += dur + gap;
    }
    t += hold - gap + (sc.extraHold || 0);
    scenes.push({ ...sc, i, start, end: t, lines });
  }
  const outro = { start: t, dur: p.outro?.duration ?? 3.4 };
  const total = +(outro.start + outro.dur).toFixed(3);
  const voiceFile = path.join(workDir, "voice.wav");
  const args = ["-y", "-hide_banner", "-loglevel", "error"];
  pieces.forEach((pc) => args.push("-i", pc.file));
  const f = pieces.map((pc, i) => `[${i}:a]aresample=48000,adelay=${Math.round(pc.start * 1000)}:all=1[a${i}]`);
  f.push(`${pieces.map((_, i) => `[a${i}]`).join("")}amix=inputs=${pieces.length}:normalize=0,apad=whole_dur=${total},loudnorm=I=-16:TP=-1.5:LRA=11[out]`);
  fs.writeFileSync(path.join(workDir, "mix.filter"), f.join(";\n"));
  args.push("-filter_complex_script", path.join(workDir, "mix.filter"), "-map", "[out]", "-ar", "48000", "-ac", "2", "-t", String(total), voiceFile);
  await run("ffmpeg", args, { verbose: false });
  return { voiceFile, scenes, outro, total };
}

const PERSON = (cls = "") => `<svg class="person ${cls}" viewBox="0 0 60 100"><circle cx="30" cy="20" r="16"/><path d="M6 96 V62 a24 24 0 0 1 48 0 V96 z"/></svg>`;

/** Visual renderers: return { html, js } for a scene. `c` = colours for this scene. */
const VISUALS = {
  question(sc, c, W) {
    const lines = sc.visual.lines.map((l, k) => `<div class="ql" id="s${sc.i}q${k}">${rich(l)}</div>`).join("");
    const js = sc.visual.lines.map((_, k) => `tl.fromTo("#s${sc.i}q${k}", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, ${n3(sc.lines[0].start + k * 0.55)});`).join("\n  ");
    return { html: `<div class="kicker">${h(sc.visual.kicker || "")}</div><div class="question">${lines}</div>`, js };
  },
  dotgrid(sc, c) {
    const { value, title, caption, source } = sc.visual;
    const dots = Array.from({ length: 100 }, (_, k) => `<i class="dot${k < value ? " on" : ""}"></i>`).join("");
    const t0 = sc.lines[0].start + 0.4;
    const js = [
      `tl.fromTo("#s${sc.i} .vtitle", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, ${n3(sc.start + 0.2)});`,
      `tl.fromTo("#s${sc.i} .dot", { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(2)", stagger: { each: 0.006, from: "start" } }, ${n3(sc.start + 0.35)});`,
      `tl.to("#s${sc.i} .dot.on", { backgroundColor: "${c.fill}", duration: 0.2, stagger: ${n3(1.8 / value)} }, ${n3(t0)});`,
      `const s${sc.i}n = { v: 0 }; tl.to(s${sc.i}n, { v: ${value}, duration: 1.8, ease: "power1.out", onUpdate: () => { document.querySelector("#s${sc.i} .bignum").textContent = Math.round(s${sc.i}n.v) + "%"; } }, ${n3(t0)});`,
      `tl.fromTo("#s${sc.i} .bignum", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, ${n3(t0)});`,
      `tl.fromTo("#s${sc.i} .vcap, #s${sc.i} .source", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.2 }, ${n3((sc.lines[1] || sc.lines[0]).start)});`,
    ].join("\n  ");
    return { html: `<div class="vtitle">${rich(title)}</div><div class="statrow"><div class="grid">${dots}</div><div class="bignum">0%</div></div><div class="vcap">${rich(caption)}</div><div class="source">${h(source)}</div>`, js };
  },
  counter(sc, c) {
    const { to, decimals = 1, suffix = "", label, ratio = 8, highlight = 1, ratioLabel, source } = sc.visual;
    const people = Array.from({ length: ratio }, (_, k) => PERSON(k < highlight ? "on" : "")).join("");
    const t0 = sc.lines[0].start;
    const js = [
      `const s${sc.i}n = { v: 0 }; tl.to(s${sc.i}n, { v: ${to}, duration: 2.0, ease: "power2.out", onUpdate: () => { document.querySelector("#s${sc.i} .counter").textContent = s${sc.i}n.v.toFixed(${decimals}) + "${suffix}"; } }, ${n3(t0)});`,
      `tl.fromTo("#s${sc.i} .counter", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, ${n3(t0)});`,
      `tl.fromTo("#s${sc.i} .clabel", { opacity: 0 }, { opacity: 1, duration: 0.6 }, ${n3(t0 + 0.6)});`,
      `tl.fromTo("#s${sc.i} .person", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power3.out" }, ${n3(t0 + 1.6)});`,
      `tl.fromTo("#s${sc.i} .person.on", { scale: 1 }, { scale: 1.18, duration: 0.4, ease: "back.out(3)" }, ${n3(t0 + 2.5)});`,
      `tl.fromTo("#s${sc.i} .rlabel, #s${sc.i} .source", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.2 }, ${n3(t0 + 2.6)});`,
    ].join("\n  ");
    return { html: `<div class="counter">0${suffix}</div><div class="clabel">${rich(label)}</div><div class="people">${people}</div><div class="rlabel">${rich(ratioLabel)}</div><div class="source">${h(source)}</div>`, js };
  },
  statement(sc) {
    const { lines, punch } = sc.visual;
    const js = [
      ...lines.map((_, k) => `tl.fromTo("#s${sc.i}l${k}", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, ${n3(sc.lines[0].start + k * 0.35)});`),
      `tl.fromTo("#s${sc.i} .punch", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" }, ${n3(sc.lines[sc.lines.length - 1].start)});`,
      `tl.fromTo("#s${sc.i} .uline", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, ${n3(sc.lines[sc.lines.length - 1].start + 0.4)});`,
    ].join("\n  ");
    return { html: `<div class="statement">${lines.map((l, k) => `<div id="s${sc.i}l${k}">${rich(l)}</div>`).join("")}</div><div class="punch">${rich(punch)}<span class="uline"></span></div>`, js };
  },
  garage(sc) {
    const cards = sc.visual.cards.map((cd, k) => `<div class="gcard" id="s${sc.i}c${k}"><b>${h(cd.name)}</b><span>${h(cd.detail)}</span></div>`).join("");
    const t0 = sc.lines[0].start;
    const js = [
      `tl.fromTo("#s${sc.i} .garage", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, ${n3(sc.start + 0.25)});`,
      `tl.fromTo("#s${sc.i} .door", { scaleY: 1 }, { scaleY: 0.08, duration: 1.2, ease: "power2.inOut" }, ${n3(t0 + 0.2)});`,
      `tl.fromTo("#s${sc.i} .glow", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" }, ${n3(t0 + 1.0)});`,
      ...sc.visual.cards.map((_, k) => `tl.fromTo("#s${sc.i}c${k}", { x: ${k % 2 ? 80 : -80}, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, ${n3(t0 + 1.3 + k * 0.35)});`),
    ].join("\n  ");
    const svg = `<svg class="garage" viewBox="0 0 400 300"><path class="roof" d="M20 120 L200 20 L380 120" /><rect class="wall" x="50" y="110" width="300" height="180" rx="6"/><rect class="opening" x="95" y="150" width="210" height="140"/><circle class="glow" cx="200" cy="245" r="26"/><rect class="door" x="95" y="150" width="210" height="140"/><g class="slats"><line x1="95" x2="305" y1="185" y2="185"/><line x1="95" x2="305" y1="220" y2="220"/><line x1="95" x2="305" y1="255" y2="255"/></g></svg>`;
    return { html: `${svg}<div class="gcards">${cards}</div>`, js: js + `\n  tl.to("#s${sc.i} .slats", { opacity: 0, duration: 0.3 }, ${n3(t0 + 0.2)});` };
  },
  grow(sc) {
    const t0 = sc.lines[0].start;
    const last = sc.lines[sc.lines.length - 1].start;
    const js = [
      `tl.fromTo("#s${sc.i} .seed", { scale: 0.06 }, { scale: 0.06, duration: 0.01 }, ${n3(sc.start)});`,
      `tl.fromTo("#s${sc.i} .seedlabel.small", { opacity: 0 }, { opacity: 1, duration: 0.5 }, ${n3(t0)});`,
      `tl.fromTo("#s${sc.i} .seed", { scale: 0.06 }, { scale: 1, duration: 1.8, ease: "power3.inOut" }, ${n3(t0 + 0.9)});`,
      `tl.to("#s${sc.i} .seedlabel.small", { opacity: 0, duration: 0.3 }, ${n3(t0 + 0.9)});`,
      `tl.fromTo("#s${sc.i} .seedlabel.big", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, ${n3(t0 + 2.2)});`,
      `tl.fromTo("#s${sc.i} .finale", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, ${n3(last)});`,
    ].join("\n  ");
    return { html: `<div class="seedwrap"><div class="seed"></div><div class="seedlabel small">${h(sc.visual.small)}</div><div class="seedlabel big">${rich(sc.visual.big)}</div></div><div class="finale">${rich(sc.visual.finale)}</div>`, js };
  },
  receipt(sc) {
    const { title, items, footer } = sc.visual;
    const t0 = sc.lines[0].start;
    const rows = items.map((it, k) => `<div class="rrow" id="s${sc.i}r${k}"><svg class="tick" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg><b>${h(it.label)}</b><span>${h(it.note || "")}</span></div>`).join("");
    const js = [
      `tl.fromTo("#s${sc.i} .receipt", { y: 80, opacity: 0, rotation: -3 }, { y: 0, opacity: 1, rotation: -1.5, duration: 0.8, ease: "power3.out" }, ${n3(sc.start + 0.2)});`,
      ...items.map((_, k) => `tl.fromTo("#s${sc.i}r${k}", { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, ${n3(t0 + 0.3 + k * 0.6)});
  tl.fromTo("#s${sc.i}r${k} .tick path", { strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: 0.35 }, ${n3(t0 + 0.55 + k * 0.6)});`),
      `tl.fromTo("#s${sc.i} .rfoot", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, ${n3(t0 + 0.6 + items.length * 0.6)});`,
    ].join("\n  ");
    return { html: `<div class="receipt"><div class="rhead">${rich(title)}</div>${rows}<div class="rfoot">${rich(footer)}</div></div>`, js };
  },
  budget(sc) {
    const { quote = 100, budget = 65, chips = [], fit } = sc.visual;
    const t0 = sc.lines[0].start, t1 = (sc.lines[1] || sc.lines[0]).start;
    const js = [
      `tl.fromTo("#s${sc.i} .bq .fill", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power3.out" }, ${n3(t0 + 0.2)});`,
      `tl.fromTo("#s${sc.i} .bb .fill", { scaleX: 0 }, { scaleX: ${budget / quote}, duration: 0.8, ease: "power3.out" }, ${n3(t0 + 0.7)});`,
      `tl.fromTo("#s${sc.i} .bar", { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.4 }, ${n3(t0)});`,
      `tl.to("#s${sc.i} .bq .fill", { scaleX: ${budget / quote}, duration: 1.2, ease: "power2.inOut" }, ${n3(t1 + 0.6)});`,
      `tl.fromTo("#s${sc.i} .fit", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, ${n3(t1 + 1.5)});`,
      `tl.fromTo("#s${sc.i} .chip", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.3, ease: "back.out(2.4)" }, ${n3(t1)});`,
    ].join("\n  ");
    const bar = (cls, label) => `<div class="bar ${cls}"><span>${h(label)}</span><div class="track"><div class="fill"></div></div></div>`;
    return { html: `<div class="bars">${bar("bq", "Quotation")}${bar("bb", "Your budget")}</div><div class="chips">${chips.map((c) => `<span class="chip">${h(c)}</span>`).join("")}</div><div class="fit">${rich(fit)}</div>`, js };
  },
  checklist(sc) {
    const { title, items } = sc.visual;
    const each = (sc.lines.reduce((a, l) => a + l.dur, 0)) / (items.length + 0.5);
    const t0 = sc.lines[0].start;
    const js = [
      `tl.fromTo("#s${sc.i} .vtitle", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, ${n3(sc.start + 0.2)});`,
      ...items.map((_, k) => `tl.fromTo("#s${sc.i}k${k}", { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, ${n3(t0 + 0.2 + k * each)});
  tl.fromTo("#s${sc.i}k${k} .cbox", { scale: 0.4 }, { scale: 1, duration: 0.4, ease: "back.out(3)" }, ${n3(t0 + 0.35 + k * each)});`),
    ].join("\n  ");
    return { html: `${title ? `<div class="vtitle">${rich(title)}</div>` : ""}<div class="checks">${items.map((it, k) => `<div class="crow" id="s${sc.i}k${k}"><span class="cbox"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg></span><span>${rich(it)}</span></div>`).join("")}</div>`, js };
  },
  spreadsheet(sc) {
    const { headers, rows, totalLabel = "Total", note } = sc.visual;
    const t0 = sc.lines[0].start;
    const total = rows.reduce((a, r) => a + r[r.length - 1], 0);
    const fmt = (v) => (typeof v === "number" ? v.toLocaleString("en-US") : h(v));
    const js = [
      `tl.fromTo("#s${sc.i} .sheet", { y: 60, opacity: 0, rotationX: 25 }, { y: 0, opacity: 1, rotationX: 0, duration: 0.8, ease: "power3.out" }, ${n3(sc.start + 0.2)});`,
      ...rows.map((_, k) => `tl.fromTo("#s${sc.i}row${k} td", { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.08 }, ${n3(t0 + 0.3 + k * 0.45)});`),
      `const s${sc.i}n = { v: 0 }; tl.to(s${sc.i}n, { v: ${total}, duration: 1.0, ease: "power2.out", onUpdate: () => { document.querySelector("#s${sc.i} .tot").textContent = Math.round(s${sc.i}n.v).toLocaleString("en-US"); } }, ${n3(t0 + 0.4 + rows.length * 0.45)});`,
      `tl.fromTo("#s${sc.i} tfoot td", { backgroundColor: "rgba(0,0,0,0)" }, { backgroundColor: "rgba(168,147,94,.35)", duration: 0.4 }, ${n3(t0 + 0.4 + rows.length * 0.45)});`,
      `tl.fromTo("#s${sc.i} .sbar", { scaleY: 0 }, { scaleY: 1, duration: 0.5, stagger: 0.12, ease: "back.out(1.6)" }, ${n3(t0 + 0.6 + rows.length * 0.45)});`,
      note ? `tl.fromTo("#s${sc.i} .snote", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ${n3(t0 + 1.2 + rows.length * 0.45)});` : "",
    ].join("\n  ");
    const max = Math.max(...rows.map((r) => r[r.length - 1]));
    const bars = rows.map((r) => `<i class="sbar" style="height:${Math.round((r[r.length - 1] / max) * 100)}%"></i>`).join("");
    return { html: `<div class="sheet"><table><thead><tr>${headers.map((x) => `<th>${h(x)}</th>`).join("")}</tr></thead><tbody>${rows.map((r, k) => `<tr id="s${sc.i}row${k}">${r.map((c) => `<td>${fmt(c)}</td>`).join("")}</tr>`).join("")}</tbody><tfoot><tr><td colspan="${headers.length - 1}">${h(totalLabel)}</td><td class="tot">0</td></tr></tfoot></table><div class="sbars">${bars}</div></div>${note ? `<div class="snote">${h(note)}</div>` : ""}`, js };
  },
  cards(sc, c, W) {
    const { cards, badge } = sc.visual;
    const t0 = sc.lines[0].start;
    const js = [
      ...cards.map((_, k) => `tl.fromTo("#s${sc.i}cd${k}", { y: 260, x: 0, opacity: 0, rotation: 0 }, { y: ${Math.abs(k - (cards.length - 1) / 2) * 40}, x: ${Math.round((k - (cards.length - 1) / 2) * W * 0.3)}, opacity: 1, rotation: ${(k - (cards.length - 1) / 2) * 9}, duration: 0.7, ease: "back.out(1.4)" }, ${n3(t0 + 0.2 + k * 0.3)});`),
      `tl.fromTo("#s${sc.i} .badge", { scale: 0, rotation: -20 }, { scale: 1, rotation: -8, duration: 0.5, ease: "back.out(3)" }, ${n3(t0 + 0.4 + cards.length * 0.3)});`,
    ].join("\n  ");
    return { html: `<div class="fan">${cards.map((c, k) => `<div class="tcard" id="s${sc.i}cd${k}" style="z-index:${10 - Math.round(Math.abs(k - (cards.length - 1) / 2) * 2)}"><svg viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="5"/><path d="M4 14h32M4 24h32M16 4v32"/></svg><b>${h(c)}</b><span>Excel template</span></div>`).join("")}<div class="badge">${h(badge)}</div></div>`, js };
  },
};

export function buildScenesComposition(buildDir, p, { scenes, outro, total }, { width: W, height: H, hasMusic }) {
  const th = THEMES[p.theme || "gold-pop"];
  const tp = TEMPLATES[p.template || "bold-slam"];
  const pal = {
    a: { ...th.a, fill: th.outro.accent, empty: "rgba(18,18,18,.12)", card: "#ffffff" },
    b: { ...th.b, fill: th.a.ink, empty: "rgba(255,255,255,.38)", card: "rgba(255,255,255,.5)" },
  };
  const S = (x) => Math.round(W * x);
  const sc2 = scenes.map((sc) => ({ ...sc, theme: sc.i % 2 === 0 ? "a" : "b" }));

  // Subtitles: sentence split into short chunks timed proportionally.
  const subs = [];
  const NO_SUBS = new Set(["question", "statement", "grow"]); // big on-screen text already says it
  for (const sc of sc2) if (sc.subtitles ?? !NO_SUBS.has(sc.visual.type)) for (const ln of sc.lines) {
    const parts = chunk(ln.text, 6), tot = parts.reduce((a, x) => a + plain(x.join(" ")).length, 0);
    let t = ln.start;
    for (const part of parts) {
      const d = (ln.dur * plain(part.join(" ")).length) / tot;
      subs.push({ id: `sub${subs.length}`, text: plain(part.join(" ")), start: t, dur: d + 0.05, theme: sc.theme });
      t += d;
    }
  }

  const css = `
@font-face { font-family:"Inter"; font-weight:600; src:url(assets/inter-600.woff2) format("woff2"); }
@font-face { font-family:"Inter"; font-weight:800; src:url(assets/inter-800.woff2) format("woff2"); }
@font-face { font-family:"Serif"; font-weight:800; font-style:italic; src:url(assets/serif-800i.woff2) format("woff2"); }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:${W}px; height:${H}px; overflow:hidden; background:${th.a.bg}; font-family:"Inter", sans-serif; }
#root { position:relative; width:100%; height:100%; overflow:hidden; }
.clip { position:absolute; inset:0; }
em { font-family:"Serif", Georgia, serif; font-style:italic; font-weight:800; letter-spacing:-0.01em; }
${["a", "b"].map((k) => `.scene.${k} { background:${pal[k].bg}; color:${pal[k].ink}; } .scene.${k} em { color:${k === "a" ? (th.a.bg === "#121212" ? th.outro.accent : "#8c6d2f") : th.b.em}; }`).join("\n")}
.scene { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:${S(0.3)}px ${S(0.08)}px ${S(0.42)}px; gap:${S(0.04)}px; }
.scene .logo { position:absolute; top:${Math.round(H * 0.075)}px; left:50%; width:${S(0.17)}px; transform:translateX(-50%); }
.kicker { font-size:${S(0.03)}px; font-weight:600; letter-spacing:.3em; text-transform:uppercase; opacity:.6; }
.question { font-size:${S(0.105)}px; font-weight:800; line-height:1.08; letter-spacing:-0.04em; }
.vtitle { font-size:${S(0.058)}px; font-weight:800; line-height:1.15; letter-spacing:-0.03em; }
.statrow { display:flex; align-items:center; gap:${S(0.05)}px; }
.grid { display:grid; grid-template-columns:repeat(10, ${S(0.038)}px); gap:${S(0.012)}px; }
.dot { width:${S(0.038)}px; height:${S(0.038)}px; border-radius:50%; display:block; }
${["a", "b"].map((k) => `.scene.${k} .dot { background:${pal[k].empty}; }`).join(" ")}
.bignum { font-size:${S(0.16)}px; font-weight:800; letter-spacing:-0.05em; min-width:${S(0.28)}px; text-align:left; }
.vcap { font-size:${S(0.05)}px; font-weight:600; line-height:1.2; max-width:90%; }
.source { font-size:${S(0.024)}px; font-weight:600; opacity:.55; letter-spacing:.04em; }
.counter { font-size:${S(0.23)}px; font-weight:800; letter-spacing:-0.06em; line-height:1; }
.clabel { font-size:${S(0.052)}px; font-weight:600; line-height:1.2; max-width:90%; }
.people { display:flex; gap:${S(0.022)}px; margin-top:${S(0.02)}px; }
.person { width:${S(0.075)}px; height:${S(0.125)}px; fill:currentColor; opacity:.28; transform-origin:50% 100%; }
.person.on { opacity:1; }
${["a", "b"].map((k) => `.scene.${k} .person.on { fill:${k === "a" ? th.outro.accent : th.b.em}; }`).join(" ")}
.rlabel { font-size:${S(0.05)}px; font-weight:800; }
.statement { font-size:${S(0.085)}px; font-weight:800; line-height:1.1; letter-spacing:-0.035em; }
.punch { position:relative; font-family:"Serif", serif; font-style:italic; font-weight:800; font-size:${S(0.16)}px; line-height:1.05; }
.punch em { color:inherit !important; }
.uline { position:absolute; left:4%; right:4%; bottom:-${S(0.012)}px; height:${S(0.016)}px; border-radius:99px; background:currentColor; transform-origin:left center; transform:scaleX(0); }
.garage { width:${S(0.62)}px; overflow:visible; }
.garage .roof { fill:none; stroke:currentColor; stroke-width:12; stroke-linecap:round; stroke-linejoin:round; }
.garage .wall { fill:none; stroke:currentColor; stroke-width:10; }
.garage .opening { fill:rgba(18,18,18,.88); }
.garage .glow { fill:#f8e3a8; transform-box:fill-box; transform-origin:center; filter:drop-shadow(0 0 18px #f8e3a8); }
.garage .door { fill:currentColor; transform-box:fill-box; transform-origin:top center; }
.garage .slats line { stroke:${th.b.bg}; stroke-width:5; }
.gcards { display:flex; gap:${S(0.04)}px; }
.gcard { display:flex; flex-direction:column; gap:${S(0.008)}px; padding:${S(0.03)}px ${S(0.05)}px; border-radius:${S(0.03)}px; background:rgba(255,255,255,.45); }
.gcard b { font-size:${S(0.07)}px; font-weight:800; letter-spacing:-0.03em; }
.gcard span { font-size:${S(0.03)}px; font-weight:600; opacity:.75; }
.seedwrap { position:relative; width:${S(0.62)}px; height:${S(0.62)}px; display:flex; align-items:center; justify-content:center; }
.seed { position:absolute; inset:0; border-radius:50%; background:currentColor; }
.seedlabel { position:relative; font-weight:800; }
.seedlabel.small { position:absolute; top:58%; font-size:${S(0.034)}px; letter-spacing:.2em; text-transform:uppercase; opacity:0; }
.seedlabel.big { font-size:${S(0.075)}px; opacity:0; line-height:1.05; }
${["a", "b"].map((k) => `.scene.${k} .seedlabel.big, .scene.${k} .seedlabel.big em { color:${pal[k].bg} !important; }`).join(" ")}
.finale { font-size:${S(0.09)}px; font-weight:800; letter-spacing:-0.035em; line-height:1.08; opacity:0; }
.sub { display:flex; align-items:flex-end; justify-content:center; padding:0 ${S(0.12)}px ${Math.round(H * 0.2)}px; opacity:0; }
.sub p { font-size:${S(0.042)}px; font-weight:600; line-height:1.25; text-align:center; padding:${S(0.012)}px ${S(0.03)}px; border-radius:${S(0.02)}px; }
.sub.a p { color:${th.a.ink}; background:rgba(255,255,255,.55); } .sub.b p { color:${th.b.ink}; background:rgba(255,255,255,.28); }
.tr { overflow:hidden; } .tr i { position:absolute; top:-20%; bottom:-20%; width:55%; transform:skewX(-18deg); }
.tr i:nth-child(1) { left:0; background:${th.outro.accent}; } .tr i:nth-child(2) { left:-12%; background:${th.outro.bg}; }

/* template decor */
.deco { position:absolute; inset:0; pointer-events:none; z-index:0; }
.scene > *:not(.deco) { position:relative; z-index:1; }
.scene .logo { position:absolute !important; }
.ring { position:absolute; width:${S(1.3)}px; height:${S(1.3)}px; left:50%; top:50%; margin:-${S(0.65)}px 0 0 -${S(0.65)}px; border-radius:50%; border:2px solid currentColor; opacity:.12; }
.blob { position:absolute; border-radius:50%; filter:blur(${S(0.08)}px); opacity:.45; }
.blob.one { width:${S(0.8)}px; height:${S(0.8)}px; left:-${S(0.25)}px; top:${Math.round(H * 0.1)}px; background:${th.outro.accent}; }
.blob.two { width:${S(0.7)}px; height:${S(0.7)}px; right:-${S(0.3)}px; bottom:${Math.round(H * 0.08)}px; background:#ffffff; opacity:.55; }
.frame { position:absolute; inset:${S(0.045)}px; border:2px solid currentColor; opacity:.22; border-radius:${S(0.02)}px; }
/* transitions */
.tr.wipe { background:${th.outro.accent}; transform:translateX(-101%); }
.tr.slide { background:${th.outro.bg}; transform:translateY(101%); }
.tr.iris { display:flex; align-items:center; justify-content:center; } .tr.iris b { width:${Math.round(H * 1.25)}px; height:${Math.round(H * 1.25)}px; border-radius:50%; background:${th.outro.accent}; flex:none; transform:scale(0); }
/* receipt */
.receipt { width:${S(0.78)}px; background:#fffdf8; color:#1a1414; border-radius:${S(0.03)}px; padding:${S(0.05)}px; box-shadow:0 ${S(0.03)}px ${S(0.08)}px rgba(0,0,0,.12); text-align:left; display:flex; flex-direction:column; gap:${S(0.028)}px; }
.rhead { font-size:${S(0.05)}px; font-weight:800; letter-spacing:-0.02em; border-bottom:2px dashed rgba(0,0,0,.15); padding-bottom:${S(0.025)}px; }
.rhead em { color:${th.outro.accent} !important; }
.rrow { display:grid; grid-template-columns:${S(0.06)}px 1fr; column-gap:${S(0.025)}px; align-items:center; }
.rrow b { font-size:${S(0.042)}px; font-weight:800; } .rrow span { grid-column:2; font-size:${S(0.03)}px; font-weight:600; opacity:.6; }
.tick { width:${S(0.06)}px; height:${S(0.06)}px; grid-row:span 2; } .tick path, .cbox path { fill:none; stroke:${th.outro.accent}; stroke-width:3.2; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:30; }
.rfoot { margin-top:${S(0.01)}px; align-self:flex-start; font-size:${S(0.036)}px; font-weight:800; padding:${S(0.014)}px ${S(0.03)}px; border-radius:99px; background:${th.outro.bg}; color:${th.outro.ink}; }
.rfoot em { color:${th.outro.accent} !important; }
/* budget */
.bars { width:${S(0.82)}px; display:flex; flex-direction:column; gap:${S(0.045)}px; text-align:left; }
.bar span { font-size:${S(0.036)}px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; opacity:.75; }
.track { margin-top:${S(0.015)}px; height:${S(0.075)}px; border-radius:99px; background:rgba(0,0,0,.08); overflow:hidden; }
.fill { height:100%; border-radius:99px; transform-origin:left center; }
.bq .fill { background:currentColor; } .bb .fill { background:${th.outro.accent}; }
.chips { display:flex; flex-wrap:wrap; justify-content:center; gap:${S(0.02)}px; max-width:${S(0.86)}px; }
.chip { font-size:${S(0.034)}px; font-weight:800; padding:${S(0.016)}px ${S(0.034)}px; border-radius:99px; border:2px solid currentColor; }
.fit { font-size:${S(0.065)}px; font-weight:800; letter-spacing:-0.03em; }
/* checklist */
.checks { display:flex; flex-direction:column; gap:${S(0.04)}px; text-align:left; width:${S(0.82)}px; }
.crow { display:flex; align-items:center; gap:${S(0.035)}px; font-size:${S(0.058)}px; font-weight:800; letter-spacing:-0.025em; line-height:1.1; }
.cbox { flex:none; width:${S(0.1)}px; height:${S(0.1)}px; border-radius:${S(0.028)}px; background:${th.outro.bg}; display:flex; align-items:center; justify-content:center; }
.cbox svg { width:62%; height:62%; } .cbox path { stroke-dasharray:none; }
/* spreadsheet */
.sheet { width:${S(0.86)}px; background:#ffffff; color:#1a1a1a; border-radius:${S(0.022)}px; padding:${S(0.03)}px; box-shadow:0 ${S(0.03)}px ${S(0.08)}px rgba(0,0,0,.12); display:flex; flex-direction:column; gap:${S(0.03)}px; }
.sheet table { width:100%; border-collapse:collapse; font-size:${S(0.034)}px; text-align:left; }
.sheet th { background:${th.outro.bg}; color:${th.outro.ink}; font-weight:800; padding:${S(0.016)}px; }
.sheet td { padding:${S(0.016)}px; border-bottom:1px solid rgba(0,0,0,.08); font-weight:600; }
.sheet td:last-child, .sheet th:last-child { text-align:right; }
.sheet tfoot td { font-weight:800; font-size:${S(0.04)}px; border:none; }
.sbars { display:flex; align-items:flex-end; gap:${S(0.02)}px; height:${S(0.16)}px; padding:0 ${S(0.02)}px; }
.sbar { flex:1; background:${th.outro.accent}; border-radius:${S(0.01)}px ${S(0.01)}px 0 0; transform-origin:bottom center; display:block; }
.snote { font-size:${S(0.026)}px; font-weight:600; opacity:.55; }
/* cards */
.fan { position:relative; width:${S(0.86)}px; height:${S(0.62)}px; }
.tcard { position:absolute; left:50%; top:0; width:${S(0.34)}px; margin-left:-${S(0.17)}px; height:${S(0.46)}px; background:#ffffff; color:#1a1a1a; border-radius:${S(0.03)}px; box-shadow:0 ${S(0.02)}px ${S(0.06)}px rgba(0,0,0,.15); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:${S(0.02)}px; }
.tcard svg { width:${S(0.16)}px; } .tcard svg rect { fill:none; stroke:${th.outro.accent}; stroke-width:2.5; } .tcard svg path { stroke:${th.outro.accent}; stroke-width:2; }
.tcard b { font-size:${S(0.044)}px; font-weight:800; } .tcard span { font-size:${S(0.028)}px; font-weight:600; opacity:.55; }
.badge { position:absolute; z-index:20; right:-${S(0.02)}px; top:-${S(0.05)}px; font-size:${S(0.036)}px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; background:${th.outro.bg}; color:${th.outro.accent}; padding:${S(0.018)}px ${S(0.034)}px; border-radius:99px; }
#progress-track { inset:0 0 auto 0; height:10px; background:rgba(128,128,128,.18); }
#progress { position:absolute; inset:0; background:${th.outro.bg}; transform-origin:left center; transform:scaleX(0); }
#outro { background:${th.outro.bg}; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:${Math.round(H * 0.022)}px; text-align:center; opacity:0; }
#outro .wordmark { font-size:30px; font-weight:600; letter-spacing:.45em; margin-right:-.45em; opacity:.75; color:${th.outro.ink}; }
#outro img { width:${S(0.46)}px; }
#outro .tag { font-family:"Serif", serif; font-style:italic; font-weight:800; font-size:${S(0.075)}px; color:${th.outro.ink}; }
#outro .cta { font-size:${S(0.045)}px; font-weight:800; color:${th.outro.ctaInk}; background:${th.outro.accent}; padding:${S(0.026)}px ${S(0.06)}px; border-radius:${tp.outro === "slam" ? 8 : 99}px; ${tp.outro === "slam" ? "text-transform:uppercase; letter-spacing:.04em;" : ""} }`;

  const DECOR = { ring: `<div class="deco"><div class="ring"></div></div>`, blobs: `<div class="deco"><div class="blob one"></div><div class="blob two"></div></div>`, frame: `<div class="deco"><div class="frame"></div></div>`, giant: "" };
  const vis = sc2.map((sc) => ({ sc, ...VISUALS[sc.visual.type](sc, pal[sc.theme], W) }));
  const trKind = tp.transition;
  const trDur = { wipe: 0.5, stripes: 0.64, iris: 0.62, slide: 0.56 }[trKind];
  const trHtml = (t, i) => `<div id="tr${i}" class="clip tr ${trKind}" data-start="${n3(Math.max(0, t - trDur / 2))}" data-duration="${trDur}" data-track-index="2">${trKind === "stripes" ? "<i></i><i></i>" : trKind === "iris" ? "<b></b>" : ""}</div>`;
  const trJs = (t, i) => {
    const at = n3(Math.max(0, t - trDur / 2));
    return {
      wipe: `tl.fromTo("#tr${i}", { xPercent: -101 }, { xPercent: 101, duration: ${trDur}, ease: "power3.inOut" }, ${at});`,
      stripes: `tl.fromTo("#tr${i} i", { xPercent: -190 }, { xPercent: 260, duration: ${trDur}, ease: "power2.inOut", stagger: 0.05 }, ${at});`,
      iris: `tl.fromTo("#tr${i} b", { scale: 0, opacity: 1 }, { scale: 1, duration: 0.32, ease: "power3.in" }, ${at}); tl.to("#tr${i} b", { opacity: 0, duration: 0.28 }, ${n3(Math.max(0, t))});`,
      slide: `tl.fromTo("#tr${i}", { yPercent: 101 }, { yPercent: -101, duration: ${trDur}, ease: "power3.inOut" }, ${at});`,
    }[trKind];
  };
  const decoJs = sc2.map((sc) => ({
    ring: `tl.fromTo("#s${sc.i} .ring", { scale: 0.7 }, { scale: 1.15, duration: ${n3(sc.end - sc.start)}, ease: "sine.out" }, ${n3(sc.start)});`,
    blobs: `tl.fromTo("#s${sc.i} .blob.one", { x: 0, y: 0 }, { x: ${Math.round(W * 0.3)}, y: ${Math.round(H * 0.06)}, duration: ${n3(sc.end - sc.start)}, ease: "sine.inOut" }, ${n3(sc.start)}); tl.fromTo("#s${sc.i} .blob.two", { x: 0, y: 0 }, { x: -${Math.round(W * 0.25)}, y: -${Math.round(H * 0.08)}, duration: ${n3(sc.end - sc.start)}, ease: "sine.inOut" }, ${n3(sc.start)});`,
    frame: `tl.fromTo("#s${sc.i} .frame", { scale: 1.04, opacity: 0 }, { scale: 1, opacity: 0.22, duration: 0.6, ease: "power3.out" }, ${n3(sc.start)});`,
    giant: "",
  })[tp.decor] || "").join("\n  ");
  const cuts = [...sc2.slice(1).map((s) => s.start), outro.start];
  const kit = brandKit(p);
  const o = { ...(p.outro || {}) };
  if (o.tag === undefined) o.tag = kit.tagline;
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
${vis.map(({ sc, html }) => `  <section id="s${sc.i}" class="clip scene ${sc.theme}" data-start="${n3(sc.start)}" data-duration="${n3(sc.end - sc.start)}" data-track-index="0">${DECOR[tp.decor] || ""}<img class="logo" src="assets/${LOGO[th[sc.theme].logo]}" alt="" />${html}</section>`).join("\n")}
${subs.map((s) => `  <div id="${s.id}" class="clip sub ${s.theme}" data-start="${n3(s.start)}" data-duration="${n3(s.dur)}" data-track-index="1"><p>${h(s.text)}</p></div>`).join("\n")}
${cuts.map((t, i) => "  " + trHtml(t, i)).join("\n")}
  <section id="outro" class="clip" data-start="${n3(outro.start)}" data-duration="${n3(outro.dur)}" data-track-index="0">
    <img src="assets/${LOGO[th.outro.logo]}" alt="RIZQ" />
    ${kit.wordmark ? `<div class="wordmark">${h(kit.wordmark)}</div>` : ""}
    ${o.tag ? `<div class="tag">${taglineHtml(o.tag, h)}</div>` : ""}
    ${o.cta ? `<div class="cta">${h(o.cta)}</div>` : ""}
  </section>
  <div id="progress-track" class="clip" data-start="0" data-duration="${total}" data-track-index="3"><div id="progress"></div></div>
  <audio id="voice" src="assets/voice.wav" data-start="0" data-duration="${total}" data-volume="1"></audio>
${cuts.map((t, i) => `  <audio id="whoosh${i}" src="assets/whoosh.wav" data-start="${n3(Math.max(0, t - 0.35))}" data-duration="0.45" data-volume="${p.sfxVolume ?? 0.4}"></audio>`).join("\n")}
${hasMusic ? `  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${n3(outro.start)}" data-media-start="${p.music?.startAt ?? 0}" data-volume="${p.music?.duckedVolume ?? 0.2}" data-fade-in="0.5" data-fade-out="0.4"></audio>
  <audio id="music-outro" src="assets/music.mp3" data-start="${n3(outro.start)}" data-duration="${n3(outro.dur)}" data-media-start="${n3((p.music?.startAt ?? 0) + outro.start)}" data-volume="${p.music?.volume ?? 0.6}" data-fade-in="0.3" data-fade-out="1.6"></audio>` : ""}
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${n3(outro.start)}, ease: "none" }, 0);
  ${vis.map((v) => v.js).join("\n  ")}
  ${subs.map((s) => `tl.fromTo("#${s.id}", { opacity: 0 }, { opacity: 1, duration: 0.15 }, ${n3(s.start)}); tl.set("#${s.id}", { opacity: 0 }, ${n3(s.start + s.dur)});`).join("\n  ")}
  ${cuts.map((t, i) => trJs(t, i)).join("\n  ")}
  ${decoJs}
  tl.fromTo("#outro", { opacity: 0 }, { opacity: 1, duration: 0.25 }, ${n3(outro.start)});
  ${{
    pop: `tl.fromTo("#outro img", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.6)" }, ${n3(outro.start + 0.15)});
  tl.fromTo("#outro .wordmark, #outro .tag, #outro .cta", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.25, ease: "power3.out" }, ${n3(outro.start + 0.7)});`,
    slam: `tl.fromTo("#outro img", { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "power4.out" }, ${n3(outro.start + 0.1)});
  tl.fromTo("#outro .wordmark, #outro .tag, #outro .cta", { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, stagger: 0.3, ease: "power4.out" }, ${n3(outro.start + 0.6)});`,
    rise: `tl.fromTo("#outro img, #outro .wordmark, #outro .tag, #outro .cta", { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.25, ease: "power4.out" }, ${n3(outro.start + 0.15)});`,
    slide: `tl.fromTo("#outro img, #outro .wordmark, #outro .tag, #outro .cta", { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, stagger: 0.16, ease: "power3.out" }, ${n3(outro.start + 0.2)});`,
  }[tp.outro]}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script>
</body>
</html>
`;
  const A = path.join(buildDir, "assets");
  fs.mkdirSync(A, { recursive: true });
  const cp = (from, to) => fs.copyFileSync(path.join(ROOT, from), path.join(A, to));
  cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
  cp("node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", "inter-600.woff2");
  cp("node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2", "inter-800.woff2");
  cp("node_modules/@fontsource/playfair-display/files/playfair-display-latin-800-italic.woff2", "serif-800i.woff2");
  cp(kit.logo.darkInk, LOGO.dark);
  cp(kit.logo.lightInk, LOGO.light);
  cp(kit.logo.mono, LOGO.mono);
  const sfx = p.sfxDir || "media/music/generated";
  cp(`${sfx}/whoosh.wav`, "whoosh.wav");
  fs.writeFileSync(path.join(buildDir, "index.html"), html);
  fs.writeFileSync(path.join(buildDir, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
  fs.writeFileSync(path.join(buildDir, "meta.json"), JSON.stringify({ id: p.name, name: p.title }, null, 2));
  return { scenes: scenes.length, subtitles: subs.length };
}
