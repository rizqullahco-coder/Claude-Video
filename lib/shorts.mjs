// Shorts style (Instagram Reels / TikTok, 9:16): fast, Gen Z kinetic captions.
//
// One family, four templates. Every template shares: the brand logo on every scene,
// big kinetic captions timed to the voice, serif-italic highlight words, sound effects
// on cuts, a progress bar and a logo end card. Each template has its own layout,
// motion language, transitions, background decor and end-card animation.
// Everything renders locally with HyperFrames.
import fs from "node:fs";
import path from "node:path";
import { escapeHtml as h, ROOT } from "./util.mjs";
import { brandKit, taglineHtml } from "./brands.mjs";
import { chunk, plain } from "./script.mjs";

// Colour themes from the RIZQ logo (ivory #f2efe6, charcoal #121212, gold #a8935e).
// Scenes alternate "a" / "b". logo: dark | light | mono (all-ink, for coloured backgrounds).
export const THEMES = {
  "ivory-gold": {
    a: { bg: "#f2efe6", ink: "#121212", em: "#121212", marker: "#a8935e", logo: "dark" },
    b: { bg: "#121212", ink: "#f2efe6", em: "#c4a96b", logo: "light" },
    outro: { bg: "#121212", ink: "#f2efe6", accent: "#c4a96b", ctaInk: "#121212", logo: "light" },
  },
  "gold-pop": {
    a: { bg: "#f2efe6", ink: "#121212", em: "#121212", marker: "#c9a85c", logo: "dark" },
    b: { bg: "#c9a85c", ink: "#121212", em: "#f8f5ee", logo: "mono" },
    outro: { bg: "#121212", ink: "#f2efe6", accent: "#c9a85c", ctaInk: "#121212", logo: "light" },
  },
  "sage-luxe": {
    a: { bg: "#f2efe6", ink: "#1d231d", em: "#1d231d", marker: "#b9a46f", logo: "dark" },
    b: { bg: "#c9d1bd", ink: "#1d231d", em: "#5e4a1c", logo: "mono" },
    outro: { bg: "#2c352b", ink: "#f2efe6", accent: "#c9b27a", ctaInk: "#1d231d", logo: "light" },
  },
  "blush-luxe": {
    a: { bg: "#f6f1ea", ink: "#1a1414", em: "#1a1414", marker: "#d8b98a", logo: "dark" },
    b: { bg: "#ecd3c8", ink: "#1a1414", em: "#4a3410", logo: "mono" },
    outro: { bg: "#1a1414", ink: "#f6f1ea", accent: "#d4b57a", ctaInk: "#1a1414", logo: "light" },
  },
};

// Templates: layout + motion language.
export const TEMPLATES = {
  "editorial-pop": { maxWords: 3, size: 0.125, align: "center", upper: false, anim: "pop", transition: "wipe", decor: "ring", outro: "pop" },
  "bold-slam": { maxWords: 2, size: 0.135, align: "center", upper: true, anim: "slam", transition: "stripes", decor: "giant", outro: "slam" },
  "soft-rise": { maxWords: 4, size: 0.11, align: "left", upper: false, anim: "rise", transition: "iris", decor: "frame", outro: "rise" },
  "karaoke-flow": { maxWords: 6, size: 0.1, align: "center", upper: false, anim: "karaoke", transition: "slide", decor: "blobs", outro: "slide" },
};

const LOGO_FILE = { dark: "logo-dark-ink.png", light: "logo-light-ink.png", mono: "logo-mono-dark.png" };
const n3 = (x) => (+x).toFixed(3);

export function buildShortsComposition(buildDir, p, { timeline, total }, { width: W, height: H, hasMusic }) {
  const b = { name: "", ...(p.brand || {}) };
  const th = THEMES[p.theme || "ivory-gold"] || bad("theme", p.theme, THEMES);
  const tp = TEMPLATES[p.template || "editorial-pop"] || bad("template", p.template, TEMPLATES);
  const fs_ = Math.round(W * tp.size);

  const labels = timeline.filter((x) => x.type === "label");
  const outro = timeline.find((x) => x.type === "outro");
  const spans = labels.map((l, i) => ({
    i, title: l.title, start: i === 0 ? 0 : l.start, end: i + 1 < labels.length ? labels[i + 1].start : outro.start,
    theme: i % 2 === 0 ? "a" : "b",
  }));
  const themeAt = (t) => (spans.find((s) => t >= s.start && t < s.end) || spans[spans.length - 1]).theme;
  const cuts = [...spans.slice(1).map((s) => s.start), outro.start];

  // Captions with per-word timing (proportional to word length within each sentence).
  const caps = [];
  for (const s of timeline.filter((x) => x.type === "sentence")) {
    const chunks = chunk(s.text, tp.maxWords);
    const allWords = chunks.flat();
    const weight = (w) => plain(w).length + 1;
    const totalW = allWords.reduce((a, w) => a + weight(w), 0);
    let t = s.start, open = false;
    chunks.forEach((words, ci) => {
      const id = `c${caps.length}`;
      const ws = words.map((w, k) => {
        const opens = w.startsWith("*"), closes = /\*[^\w]*$/.test(w);
        const em = open || opens;
        if (opens) open = true;
        if (closes) open = false;
        const ww = { id: `${id}w${k}`, text: plain(w), em, start: +t.toFixed(3) };
        t += (s.dur * weight(w)) / totalW;
        return ww;
      });
      const last = ci === chunks.length - 1;
      const start = ws[0].start;
      caps.push({ id, words: ws, start, dur: +(t - start + (last ? 0.12 : 0)).toFixed(3), theme: themeAt(start + 0.01), hasEm: ws.some((w) => w.em) });
    });
  }
  const pops = spans.map((s) => caps.find((c) => c.start >= s.start - 0.01)).filter(Boolean).map((c) => c.start);
  const capHtml = (c) => c.words.map((w) => `<span id="${w.id}" class="w${w.em ? " em" : ""}"><span class="wi">${h(tp.upper && !w.em ? w.text.toUpperCase() : w.text)}</span></span>`).join(" ");

  const kit = brandKit(p);
  const o = { ...(p.outro || {}) };
  if (o.tag === undefined) o.tag = kit.tagline;
  const logoTop = Math.round(H * 0.085), logoW = Math.round(W * 0.2);
  const css = `
@font-face { font-family:"Inter"; font-weight:600; src:url(assets/inter-600.woff2) format("woff2"); }
@font-face { font-family:"Inter"; font-weight:800; src:url(assets/inter-800.woff2) format("woff2"); }
@font-face { font-family:"Serif"; font-weight:800; font-style:italic; src:url(assets/serif-800i.woff2) format("woff2"); }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:${W}px; height:${H}px; overflow:hidden; background:${th.a.bg}; font-family:"Inter", sans-serif; }
#root { position:relative; width:100%; height:100%; overflow:hidden; }
.clip { position:absolute; inset:0; }
.bg.a { background:${th.a.bg}; color:${th.a.ink}; } .bg.b { background:${th.b.bg}; color:${th.b.ink}; }
.bg .logo { position:absolute; top:${logoTop}px; left:50%; width:${logoW}px; transform:translateX(-50%); }
.bg .grain { position:absolute; inset:0; background-image:radial-gradient(currentColor 1px, transparent 1px); background-size:6px 6px; opacity:.05; }
/* decor */
.ring { position:absolute; width:${Math.round(W * 1.3)}px; height:${Math.round(W * 1.3)}px; left:50%; top:50%; margin:-${Math.round(W * 0.65)}px 0 0 -${Math.round(W * 0.65)}px; border-radius:50%; border:2px solid currentColor; opacity:.15; }
.giant { position:absolute; top:${Math.round(H * 0.62)}px; left:0; white-space:nowrap; font-size:${Math.round(W * 0.42)}px; font-weight:800; letter-spacing:-0.05em; text-transform:uppercase; color:transparent; -webkit-text-stroke:5px currentColor; opacity:.2; line-height:1; }
.frame { position:absolute; inset:${Math.round(W * 0.045)}px; border:2px solid currentColor; opacity:.25; border-radius:${Math.round(W * 0.02)}px; }
.counter { position:absolute; top:${logoTop + Math.round(W * 0.03)}px; left:${Math.round(W * 0.09)}px; font-size:${Math.round(W * 0.03)}px; font-weight:600; letter-spacing:.2em; opacity:.7; }
.stitle { position:absolute; top:${logoTop + Math.round(W * 0.03)}px; right:${Math.round(W * 0.09)}px; font-family:"Serif", serif; font-style:italic; font-weight:800; font-size:${Math.round(W * 0.034)}px; opacity:.75; }
.blob { position:absolute; border-radius:50%; filter:blur(${Math.round(W * 0.08)}px); opacity:.45; }
.blob.one { width:${Math.round(W * 0.8)}px; height:${Math.round(W * 0.8)}px; left:-${Math.round(W * 0.25)}px; top:${Math.round(H * 0.12)}px; background:${th.outro.accent}; }
.blob.two { width:${Math.round(W * 0.7)}px; height:${Math.round(W * 0.7)}px; right:-${Math.round(W * 0.3)}px; bottom:${Math.round(H * 0.1)}px; background:#ffffff; opacity:.5; }
/* captions */
.cap { display:flex; align-items:center; justify-content:${tp.align === "left" ? "flex-start" : "center"}; padding:0 ${tp.align === "left" ? 10 : 6}%; opacity:0; }
.cap p { font-size:${fs_}px; font-weight:800; line-height:${tp.anim === "karaoke" ? 1.18 : 1.02}; letter-spacing:-0.04em; text-align:${tp.align}; max-width:${tp.align === "left" ? 84 : 92}%; }
${tp.align === "left" ? `.cap { align-items:flex-start; padding-top:${Math.round(H * 0.42)}px; }` : ""}
.cap.a p { color:${th.a.ink}; } .cap.b p { color:${th.b.ink}; }
.w { display:inline-block; ${tp.anim === "rise" ? "overflow:hidden; vertical-align:top; padding-bottom:.08em; margin-bottom:-.08em;" : ""} }
.wi { display:inline-block; }
.em { font-family:"Serif", Georgia, serif; font-style:italic; font-weight:800; letter-spacing:-0.01em; text-transform:none; }
${["a", "b"].map((k) => tp.anim === "karaoke"
    ? `.cap.${k} .em .wi { color:${th[k].em}; } .cap.${k} .em { position:relative; } .cap.${k} .em::before { content:""; position:absolute; inset:.06em -.18em; border-radius:99px; background:${th[k].marker || th.outro.accent}; opacity:.42; z-index:-1; }`
    : `.cap.${k} .em .wi { color:${th[k].em};${th[k].marker ? ` background:linear-gradient(transparent 60%, ${th[k].marker}cc 60%, ${th[k].marker}cc 92%, transparent 92%);` : ""} }`).join("\n")}
/* transitions */
.tr { pointer-events:none; }
.wipe { background:${th.outro.accent}; transform:translateX(-101%); }
.stripes { overflow:hidden; } .stripes i { position:absolute; top:-20%; bottom:-20%; width:45%; transform:skewX(-18deg); }
.stripes i:nth-child(1) { left:0; background:${th.outro.accent}; } .stripes i:nth-child(2) { left:-10%; background:${th.outro.bg}; } .stripes i:nth-child(3) { left:-20%; background:${th.a.bg}; }
.iris { display:flex; align-items:center; justify-content:center; } .iris i { width:${Math.round(H * 1.25)}px; height:${Math.round(H * 1.25)}px; border-radius:50%; background:${th.outro.accent}; flex:none; transform:scale(0); }
.slide { background:${th.outro.bg}; transform:translateY(101%); }
#progress-track { inset:0 0 auto 0; height:10px; background:rgba(128,128,128,.18); }
#progress { position:absolute; inset:0; background:${th.outro.accent}; transform-origin:left center; transform:scaleX(0); }
/* outro */
#outro { background:${th.outro.bg}; display:flex; flex-direction:column; align-items:${tp.outro === "rise" ? "flex-start" : "center"}; justify-content:center; gap:${Math.round(H * 0.022)}px; text-align:${tp.outro === "rise" ? "left" : "center"}; padding:0 10%; opacity:0; }
#outro .wordmark { font-size:30px; font-weight:600; letter-spacing:.45em; margin-right:-.45em; opacity:.75; color:${th.outro.ink}; }
#outro img { width:${Math.round(W * 0.46)}px; }
#outro .kicker { font-size:${Math.round(W * 0.034)}px; font-weight:600; letter-spacing:.22em; text-transform:uppercase; color:${th.outro.accent}; }
#outro .tag { font-family:"Serif", Georgia, serif; font-style:italic; font-weight:800; font-size:${Math.round(W * 0.075)}px; line-height:1.1; color:${th.outro.ink}; }
#outro .cta { margin-top:${Math.round(H * 0.012)}px; font-size:${Math.round(W * 0.045)}px; font-weight:800; color:${th.outro.ctaInk}; background:${th.outro.accent}; padding:${Math.round(W * 0.026)}px ${Math.round(W * 0.06)}px; border-radius:${tp.outro === "slam" ? 8 : 99}px; ${tp.outro === "slam" ? "text-transform:uppercase; letter-spacing:.04em;" : ""} }`;

  const decor = (s) => ({
    ring: `<div class="ring"></div>`,
    giant: `<div class="giant">${h(s.title)} · ${h(s.title)}</div>`,
    frame: `<div class="frame"></div><div class="counter">${String(s.i + 1).padStart(2, "0")} / ${String(spans.length).padStart(2, "0")}</div><div class="stitle">${h(s.title)}</div>`,
    blobs: `<div class="blob one"></div><div class="blob two"></div>`,
  })[tp.decor];
  const trHtml = (i, t) => ({
    wipe: `<div id="tr${i}" class="clip tr wipe" data-start="${n3(Math.max(0, t - 0.22))}" data-duration="0.45" data-track-index="2"></div>`,
    stripes: `<div id="tr${i}" class="clip tr stripes" data-start="${n3(Math.max(0, t - 0.25))}" data-duration="0.55" data-track-index="2"><i></i><i></i><i></i></div>`,
    iris: `<div id="tr${i}" class="clip tr iris" data-start="${n3(Math.max(0, t - 0.25))}" data-duration="0.6" data-track-index="2"><i></i></div>`,
    slide: `<div id="tr${i}" class="clip tr slide" data-start="${n3(Math.max(0, t - 0.25))}" data-duration="0.5" data-track-index="2"></div>`,
  })[tp.transition];
  const trAnim = (i, t) => ({
    wipe: `tl.fromTo("#tr${i}", { xPercent: -101 }, { xPercent: 101, duration: 0.45, ease: "power3.inOut" }, ${n3(Math.max(0, t - 0.22))});`,
    stripes: `tl.fromTo("#tr${i} i", { xPercent: -160 }, { xPercent: 330, duration: 0.5, ease: "power2.inOut", stagger: 0.03 }, ${n3(Math.max(0, t - 0.25))});`,
    iris: `tl.fromTo("#tr${i} i", { scale: 0, opacity: 1 }, { scale: 1, duration: 0.3, ease: "power3.in" }, ${n3(Math.max(0, t - 0.25))});
  tl.to("#tr${i} i", { opacity: 0, duration: 0.25, ease: "power2.out" }, ${n3(Math.max(0, t + 0.05))});`,
    slide: `tl.fromTo("#tr${i}", { yPercent: 101 }, { yPercent: -101, duration: 0.5, ease: "power3.inOut" }, ${n3(Math.max(0, t - 0.25))});`,
  })[tp.transition];

  const capAnim = (c, i) => {
    const out = [`tl.set("#${c.id}", { opacity: 1 }, ${c.start});`];
    const end = c.start + c.dur;
    if (tp.anim === "pop") {
      const tilt = [-2, 1.5, -1, 2, 0][i % 5];
      out.push(`tl.fromTo("#${c.id} p", { scale: 0.55, rotation: ${tilt * 2}, y: 30 }, { scale: 1, rotation: ${tilt}, y: 0, duration: 0.2, ease: "back.out(2.6)" }, ${c.start});`);
      out.push(`tl.to("#${c.id} p", { scale: 1.06, duration: ${n3(Math.max(0.1, c.dur - 0.2))}, ease: "none" }, ${n3(c.start + 0.2)});`);
      if (c.hasEm) out.push(`tl.fromTo("#${c.id} .em", { scale: 1.35 }, { scale: 1, duration: 0.25, ease: "back.out(3)" }, ${n3(c.start + 0.04)});`);
    } else if (tp.anim === "slam") {
      out.push(`tl.fromTo("#${c.id} p", { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.16, ease: "power4.out" }, ${c.start});`);
      out.push(`tl.to("#${c.id} p", { scale: 1.04, duration: ${n3(Math.max(0.1, c.dur - 0.16))}, ease: "none" }, ${n3(c.start + 0.16)});`);
      if (c.hasEm) out.push(`tl.fromTo("#${c.id}", { x: -18, y: 8 }, { x: 0, y: 0, duration: 0.35, ease: "elastic.out(1, 0.3)" }, ${n3(c.start + 0.12)});`);
    } else if (tp.anim === "rise") {
      c.words.forEach((w) => out.push(`tl.fromTo("#${w.id} .wi", { yPercent: 110 }, { yPercent: 0, duration: 0.38, ease: "power4.out" }, ${n3(Math.max(c.start, w.start - 0.05))});`));
      out.push(`tl.to("#${c.id} p", { y: -${Math.round(fs_ * 0.15)}, opacity: 0, duration: 0.14, ease: "power2.in" }, ${n3(end - 0.14)});`);
    } else if (tp.anim === "karaoke") {
      out.push(`tl.fromTo("#${c.id} .wi", { opacity: 0.22 }, { opacity: 0.22, duration: 0.01 }, ${c.start});`);
      out.push(`tl.fromTo("#${c.id} p", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18, ease: "power3.out" }, ${c.start});`);
      c.words.forEach((w) => {
        out.push(`tl.to("#${w.id} .wi", { opacity: 1, duration: 0.12 }, ${n3(w.start)});`);
        if (w.em) out.push(`tl.fromTo("#${w.id}", { scale: 0.9 }, { scale: 1, duration: 0.25, ease: "back.out(3)" }, ${n3(w.start)});`);
      });
    }
    out.push(`tl.set("#${c.id}", { opacity: 0 }, ${n3(end)});`);
    return "  " + out.join("\n  ");
  };

  const outroAnim = {
    pop: `tl.fromTo("#outro img", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.8)" }, ${n3(outro.start + 0.15)});
  tl.fromTo("#outro .kicker, #outro .wordmark, #outro .tag", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.18, ease: "power3.out" }, ${n3(outro.start + 0.6)});
  tl.fromTo("#outro .cta", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2.4)" }, ${n3(outro.start + 1.1)});`,
    slam: `tl.fromTo("#outro img", { scale: 2.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: "power4.out" }, ${n3(outro.start + 0.1)});
  tl.fromTo("#outro", { x: -20 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" }, ${n3(outro.start + 0.3)});
  tl.fromTo("#outro .kicker, #outro .wordmark, #outro .tag, #outro .cta", { scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: "power4.out", stagger: 0.25 }, ${n3(outro.start + 0.6)});`,
    rise: `tl.fromTo("#outro img", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power4.out" }, ${n3(outro.start + 0.15)});
  tl.fromTo("#outro .kicker, #outro .wordmark, #outro .tag, #outro .cta", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.2, ease: "power4.out" }, ${n3(outro.start + 0.5)});`,
    slide: `tl.fromTo("#outro img, #outro .kicker, #outro .wordmark, #outro .tag, #outro .cta", { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.14, ease: "power3.out" }, ${n3(outro.start + 0.2)});`,
  }[tp.outro];

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
${spans.map((s) => `  <div id="bg${s.i}" class="clip bg ${s.theme}" data-start="${n3(s.start)}" data-duration="${n3(s.end - s.start)}" data-track-index="0"><div class="grain"></div>${decor(s)}<img class="logo" src="assets/${LOGO_FILE[th[s.theme].logo]}" alt="" /></div>`).join("\n")}
${caps.map((c) => `  <div id="${c.id}" class="clip cap ${c.theme}" data-start="${c.start}" data-duration="${c.dur}" data-track-index="1"><p>${capHtml(c)}</p></div>`).join("\n")}
${cuts.map((t, i) => "  " + trHtml(i, t)).join("\n")}
  <section id="outro" class="clip" data-start="${n3(outro.start)}" data-duration="${n3(outro.dur)}" data-track-index="1">
    <img src="assets/${LOGO_FILE[th.outro.logo]}" alt="${h(b.name)}" />
    ${o.kicker ? `<div class="kicker">${h(o.kicker)}</div>` : ""}
    ${kit.wordmark ? `<div class="wordmark">${h(kit.wordmark)}</div>` : ""}
    ${o.tag ? `<div class="tag">${taglineHtml(o.tag, h)}</div>` : ""}
    ${o.cta ? `<div class="cta">${h(o.cta)}</div>` : ""}
  </section>
  <div id="progress-track" class="clip" data-start="0" data-duration="${total}" data-track-index="3"><div id="progress"></div></div>
  <audio id="voice" src="assets/voice.wav" data-start="0" data-duration="${total}" data-volume="1"></audio>
${cuts.map((t, i) => `  <audio id="whoosh${i}" src="assets/whoosh.wav" data-start="${n3(Math.max(0, t - 0.3))}" data-duration="0.45" data-volume="${p.sfxVolume ?? 0.5}"></audio>`).join("\n")}
${[...pops, outro.start + 0.35].map((t, i) => `  <audio id="pop${i}" src="assets/pop.wav" data-start="${n3(t)}" data-duration="0.09" data-volume="${n3((p.sfxVolume ?? 0.5) * 0.8)}"></audio>`).join("\n")}
${hasMusic ? musicClips(p, outro, total) : ""}
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${n3(outro.start)}, ease: "none" }, 0);
${spans.map((s) => {
    const d = n3(s.end - s.start);
    return {
      ring: `  tl.fromTo("#bg${s.i} .ring", { scale: 0.7 }, { scale: 1.15, duration: ${d}, ease: "sine.out" }, ${n3(s.start)});`,
      giant: `  tl.fromTo("#bg${s.i} .giant", { x: 0 }, { x: -${Math.round(W * 1.2)}, duration: ${d}, ease: "none" }, ${n3(s.start)});`,
      frame: `  tl.fromTo("#bg${s.i} .frame", { scale: 1.04, opacity: 0 }, { scale: 1, opacity: 0.25, duration: 0.6, ease: "power3.out" }, ${n3(s.start)});`,
      blobs: `  tl.fromTo("#bg${s.i} .blob.one", { x: 0, y: 0 }, { x: ${Math.round(W * 0.3)}, y: ${Math.round(H * 0.08)}, duration: ${d}, ease: "sine.inOut" }, ${n3(s.start)});
  tl.fromTo("#bg${s.i} .blob.two", { x: 0, y: 0 }, { x: -${Math.round(W * 0.25)}, y: -${Math.round(H * 0.1)}, duration: ${d}, ease: "sine.inOut" }, ${n3(s.start)});`,
    }[tp.decor];
  }).join("\n")}
${cuts.map((t, i) => "  " + trAnim(i, t)).join("\n")}
${caps.map(capAnim).join("\n")}
  tl.fromTo("#outro", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${n3(outro.start)});
  ${outroAnim}
  tl.to("#outro .cta", { scale: 1.06, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: ${Math.max(1, Math.floor((outro.dur - 1.8) / 0.5))} }, ${n3(outro.start + 1.7)});
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
  cp(kit.logo.darkInk, LOGO_FILE.dark);
  cp(kit.logo.lightInk, LOGO_FILE.light);
  cp(kit.logo.mono, LOGO_FILE.mono);
  const sfx = p.sfxDir || "media/music/generated";
  cp(`${sfx}/whoosh.wav`, "whoosh.wav");
  cp(`${sfx}/pop.wav`, "pop.wav");
  fs.writeFileSync(path.join(buildDir, "index.html"), html);
  fs.writeFileSync(path.join(buildDir, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
  fs.writeFileSync(path.join(buildDir, "meta.json"), JSON.stringify({ id: p.name, name: p.title }, null, 2));
  return { captions: caps.length };
}

function bad(kind, name, map) { throw new Error(`Unknown ${kind} "${name}". Options: ${Object.keys(map).join(", ")}`); }

function musicClips(p, outro, total) {
  const m = p.music || {};
  const bed = m.duckedVolume ?? 0.2, full = m.volume ?? 0.6, off = m.startAt ?? 0;
  return [
    `  <audio id="music-bed" src="assets/music.mp3" data-start="0" data-duration="${n3(outro.start)}" data-media-start="${off}" data-volume="${bed}" data-fade-in="0.05" data-fade-out="0.3"></audio>`,
    `  <audio id="music-outro" src="assets/music.mp3" data-start="${n3(outro.start)}" data-duration="${n3(total - outro.start)}" data-media-start="${n3(off + outro.start)}" data-volume="${full}" data-fade-in="0.3" data-fade-out="1.6"></audio>`,
  ].join("\n");
}
