// Shorts style (Instagram Reels / TikTok, 9:16): fast, Gen Z kinetic captions.
// - 1–3 words on screen at a time, huge, popping in on the voice
// - highlighted words in the brand's serif italic (gold), marker-style on light scenes
// - sections alternate brand light / dark backgrounds with a gold wipe + whoosh
// - logo on every scene, logo end card with CTA, thin progress bar
// Everything renders locally with HyperFrames.
import fs from "node:fs";
import path from "node:path";
import { escapeHtml as h, ROOT } from "./util.mjs";
import { chunk, plain } from "./script.mjs";

// Colour themes derived from the RIZQ logo (ivory #f2efe6, charcoal #121212, gold #a8935e).
// Scenes alternate between "a" and "b". logo: which logo ink to use on that background.
export const THEMES = {
  "ivory-gold": { // classic: the logo as-is, ivory and charcoal scenes
    a: { bg: "#f2efe6", ink: "#121212", em: "#121212", marker: "#a8935e", logo: "dark" },
    b: { bg: "#121212", ink: "#f2efe6", em: "#c4a96b", logo: "light" },
    outro: { bg: "#121212", ink: "#f2efe6", accent: "#c4a96b", ctaInk: "#121212", logo: "light" },
  },
  "gold-pop": { // bold: ivory and solid gold scenes, black type
    a: { bg: "#f2efe6", ink: "#121212", em: "#121212", marker: "#c9a85c", logo: "dark" },
    b: { bg: "#c9a85c", ink: "#121212", em: "#f8f5ee", logo: "dark" },
    outro: { bg: "#121212", ink: "#f2efe6", accent: "#c9a85c", ctaInk: "#121212", logo: "light" },
  },
  "sage-luxe": { // mild: ivory and soft sage, gold accents
    a: { bg: "#f2efe6", ink: "#1d231d", em: "#1d231d", marker: "#b9a46f", logo: "dark" },
    b: { bg: "#c9d1bd", ink: "#1d231d", em: "#5e4a1c", logo: "dark" },
    outro: { bg: "#2c352b", ink: "#f2efe6", accent: "#c9b27a", ctaInk: "#1d231d", logo: "light" },
  },
  "blush-luxe": { // light & soft: ivory and blush, gold accents
    a: { bg: "#f6f1ea", ink: "#1a1414", em: "#1a1414", marker: "#d8b98a", logo: "dark" },
    b: { bg: "#ecd3c8", ink: "#1a1414", em: "#7a5a24", logo: "dark" },
    outro: { bg: "#1a1414", ink: "#f6f1ea", accent: "#d4b57a", ctaInk: "#1a1414", logo: "light" },
  },
};

export function buildShortsComposition(buildDir, p, { timeline, total }, { width: W, height: H, hasMusic }) {
  const b = { name: "", ...(p.brand || {}) };
  const th = THEMES[p.theme || "ivory-gold"] || die_(p.theme);
  const fs_ = Math.round(W * 0.125);
  const maxWords = p.wordsPerBeat || 3;

  const labels = timeline.filter((x) => x.type === "label");
  const outro = timeline.find((x) => x.type === "outro");
  // Section spans for backgrounds (first one starts at 0, each runs until the next).
  const spans = labels.map((l, i) => ({
    i, start: i === 0 ? 0 : l.start, end: i + 1 < labels.length ? labels[i + 1].start : outro.start,
    theme: i % 2 === 0 ? "a" : "b",
  }));
  const themeAt = (t) => (spans.find((s) => t >= s.start && t < s.end) || spans[spans.length - 1]).theme;

  // Captions
  const caps = [];
  for (const s of timeline.filter((x) => x.type === "sentence")) {
    const chunks = chunk(s.text, maxWords);
    const totalChars = chunks.reduce((a, c) => a + plain(c.join(" ")).length, 0);
    let t = s.start, open = false;
    chunks.forEach((words, ci) => {
      const dur = s.dur * (plain(words.join(" ")).length / totalChars);
      const html = words.map((w) => {
        const opens = w.startsWith("*"), closes = /\*[^\w]*$/.test(w);
        const em = open || opens;
        if (opens) open = true;
        if (closes) open = false;
        return `<span class="w${em ? " em" : ""}">${h(plain(w))}</span>`;
      }).join(" ");
      const last = ci === chunks.length - 1;
      caps.push({ id: `c${caps.length}`, html, start: +t.toFixed(3), dur: +(dur + (last ? 0.12 : 0)).toFixed(3), theme: themeAt(t + 0.01), hasEm: html.includes(" em") });
      t += dur;
    });
  }
  // First caption of each section gets a pop.
  const pops = spans.map((s) => caps.find((c) => c.start >= s.start - 0.01)).filter(Boolean).map((c) => c.start);

  const o = p.outro || {};
  const css = `
@font-face { font-family:"Inter"; font-weight:600; src:url(assets/inter-600.woff2) format("woff2"); }
@font-face { font-family:"Inter"; font-weight:800; src:url(assets/inter-800.woff2) format("woff2"); }
@font-face { font-family:"Serif"; font-weight:800; font-style:italic; src:url(assets/serif-800i.woff2) format("woff2"); }
:root { --o-bg:${th.outro.bg}; --o-ink:${th.outro.ink}; --o-accent:${th.outro.accent}; --o-cta:${th.outro.ctaInk}; }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:${W}px; height:${H}px; overflow:hidden; background:${th.a.bg}; font-family:"Inter", sans-serif; }
#root { position:relative; width:100%; height:100%; overflow:hidden; }
.clip { position:absolute; inset:0; }
.bg.a { background:${th.a.bg}; } .bg.b { background:${th.b.bg}; }
.bg .logo { position:absolute; top:${Math.round(H * 0.085)}px; left:50%; width:${Math.round(W * 0.15)}px; transform:translateX(-50%); }
.bg .grain { position:absolute; inset:0; background-image:radial-gradient(rgba(0,0,0,.06) 1px, transparent 1px); background-size:6px 6px; opacity:.5; }
${["a", "b"].filter((k) => th[k].logo === "light").map((k) => `.bg.${k} .grain { background-image:radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px); }`).join("")}
.bg .ring { position:absolute; width:${Math.round(W * 1.3)}px; height:${Math.round(W * 1.3)}px; left:50%; top:50%; margin:-${Math.round(W * 0.65)}px 0 0 -${Math.round(W * 0.65)}px; border-radius:50%; border:2px solid currentColor; opacity:.16; }
.bg.a .ring { color:${th.a.ink}; } .bg.b .ring { color:${th.b.ink}; }
.cap { display:flex; align-items:center; justify-content:center; padding:0 6%; opacity:0; }
.cap p { font-size:${fs_}px; font-weight:800; line-height:1.02; letter-spacing:-0.04em; text-align:center; max-width:92%; }
.cap.a p { color:${th.a.ink}; } .cap.b p { color:${th.b.ink}; }
.w { display:inline-block; }
.em { font-family:"Serif", Georgia, serif; font-style:italic; font-weight:800; letter-spacing:-0.01em; padding:0 .06em; }
${["a", "b"].map((k) => `.cap.${k} .em { color:${th[k].em};${th[k].marker ? ` background:linear-gradient(transparent 58%, ${th[k].marker}cc 58%, ${th[k].marker}cc 92%, transparent 92%);` : ""} }`).join("\n")}
.wipe { background:${th.outro.accent}; transform:translateX(-101%); }
#progress-track { inset:0 0 auto 0; height:10px; background:rgba(128,128,128,.18); }
#progress { position:absolute; inset:0; background:${th.outro.accent}; transform-origin:left center; transform:scaleX(0); }
#outro { background:var(--o-bg); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:${Math.round(H * 0.022)}px; text-align:center; padding:0 9%; opacity:0; }
#outro img { width:${Math.round(W * 0.46)}px; }
#outro .kicker { font-size:${Math.round(W * 0.034)}px; font-weight:600; letter-spacing:.22em; text-transform:uppercase; color:var(--o-accent); }
#outro .tag { font-family:"Serif", Georgia, serif; font-style:italic; font-weight:800; font-size:${Math.round(W * 0.075)}px; line-height:1.1; color:var(--o-ink); }
#outro .cta { margin-top:${Math.round(H * 0.012)}px; font-size:${Math.round(W * 0.045)}px; font-weight:800; color:var(--o-cta); background:var(--o-accent); padding:${Math.round(W * 0.026)}px ${Math.round(W * 0.06)}px; border-radius:99px; }`;

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
${spans.map((s) => `  <div id="bg${s.i}" class="clip bg ${s.theme}" data-start="${s.start.toFixed(3)}" data-duration="${(s.end - s.start).toFixed(3)}" data-track-index="0"><div class="grain"></div><div class="ring"></div><img class="logo" src="assets/logo-${th[s.theme].logo}-ink.png" alt="" /></div>`).join("\n")}
${caps.map((c) => `  <div id="${c.id}" class="clip cap ${c.theme}" data-start="${c.start}" data-duration="${c.dur}" data-track-index="1"><p>${c.html}</p></div>`).join("\n")}
${[...spans.slice(1).map((s) => s.start), outro.start].map((t, i) => `  <div id="wipe${i}" class="clip wipe" data-start="${Math.max(0, t - 0.22).toFixed(3)}" data-duration="0.45" data-track-index="2"></div>`).join("\n")}
  <section id="outro" class="clip" data-start="${outro.start.toFixed(3)}" data-duration="${outro.dur.toFixed(3)}" data-track-index="1">
    <img src="assets/logo-${th.outro.logo}-ink.png" alt="${h(b.name)}" />
    ${o.kicker ? `<div class="kicker">${h(o.kicker)}</div>` : ""}
    ${o.tag ? `<div class="tag">${h(o.tag)}</div>` : ""}
    ${o.cta ? `<div class="cta">${h(o.cta)}</div>` : ""}
  </section>
  <div id="progress-track" class="clip" data-start="0" data-duration="${total}" data-track-index="3"><div id="progress"></div></div>
  <audio id="voice" src="assets/voice.wav" data-start="0" data-duration="${total}" data-volume="1"></audio>
${[...spans.slice(1).map((s) => s.start), outro.start].map((t, i) => `  <audio id="whoosh${i}" src="assets/whoosh.wav" data-start="${Math.max(0, t - 0.3).toFixed(3)}" data-duration="0.45" data-volume="${p.sfxVolume ?? 0.55}"></audio>`).join("\n")}
${[...pops, outro.start + 0.35].map((t, i) => `  <audio id="pop${i}" src="assets/pop.wav" data-start="${t.toFixed(3)}" data-duration="0.09" data-volume="${(p.sfxVolume ?? 0.55) * 0.8}"></audio>`).join("\n")}
${hasMusic ? musicClips(p, outro, total) : ""}
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${outro.start.toFixed(3)}, ease: "none" }, 0);
${spans.map((s) => `  tl.fromTo("#bg${s.i} .ring", { scale: 0.7 }, { scale: 1.15, duration: ${(s.end - s.start).toFixed(3)}, ease: "sine.out" }, ${s.start.toFixed(3)});`).join("\n")}
${[...spans.slice(1).map((s) => s.start), outro.start].map((t, i) => `  tl.fromTo("#wipe${i}", { xPercent: -101 }, { xPercent: 101, duration: 0.45, ease: "power3.inOut" }, ${Math.max(0, t - 0.22).toFixed(3)});`).join("\n")}
${caps.map((c, i) => {
    const tilt = [-2, 1.5, -1, 2, 0][i % 5];
    return `  tl.set("#${c.id}", { opacity: 1 }, ${c.start});
  tl.fromTo("#${c.id} p", { scale: 0.55, rotation: ${tilt * 2}, y: 30 }, { scale: 1, rotation: ${tilt}, y: 0, duration: 0.2, ease: "back.out(2.6)" }, ${c.start});
  tl.to("#${c.id} p", { scale: 1.06, duration: ${Math.max(0.1, c.dur - 0.2).toFixed(3)}, ease: "none" }, ${(c.start + 0.2).toFixed(3)});${c.hasEm ? `
  tl.fromTo("#${c.id} .em", { scale: 1.35 }, { scale: 1, duration: 0.25, ease: "back.out(3)" }, ${(c.start + 0.04).toFixed(3)});` : ""}
  tl.set("#${c.id}", { opacity: 0 }, ${(c.start + c.dur).toFixed(3)});`;
  }).join("\n")}
  tl.fromTo("#outro", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${outro.start.toFixed(3)});
  tl.fromTo("#outro img", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.8)" }, ${(outro.start + 0.15).toFixed(3)});
  tl.fromTo("#outro .kicker, #outro .tag", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.18, ease: "power3.out" }, ${(outro.start + 0.6).toFixed(3)});
  tl.fromTo("#outro .cta", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2.4)" }, ${(outro.start + 1.1).toFixed(3)});
  tl.to("#outro .cta", { scale: 1.06, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: ${Math.max(1, Math.floor((outro.dur - 1.6) / 0.5))} }, ${(outro.start + 1.5).toFixed(3)});
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
  cp(p.logo?.darkInk || "brand/rizq-logo-dark-ink.png", "logo-dark-ink.png");
  cp(p.logo?.lightInk || "brand/rizq-logo-light-ink.png", "logo-light-ink.png");
  const sfx = p.sfxDir || "media/music/generated";
  cp(`${sfx}/whoosh.wav`, "whoosh.wav");
  cp(`${sfx}/pop.wav`, "pop.wav");
  fs.writeFileSync(path.join(buildDir, "index.html"), html);
  fs.writeFileSync(path.join(buildDir, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
  fs.writeFileSync(path.join(buildDir, "meta.json"), JSON.stringify({ id: p.name, name: p.title }, null, 2));
  return { captions: caps.length };
}

function die_(name) { throw new Error(`Unknown theme "${name}". Options: ${Object.keys(THEMES).join(", ")}`); }

function musicClips(p, outro, total) {
  const m = p.music || {};
  const bed = m.duckedVolume ?? 0.2, full = m.volume ?? 0.6, off = m.startAt ?? 0;
  return [
    `  <audio id="music-bed" src="assets/music.mp3" data-start="0" data-duration="${outro.start.toFixed(3)}" data-media-start="${off}" data-volume="${bed}" data-fade-in="0.05" data-fade-out="0.3"></audio>`,
    `  <audio id="music-outro" src="assets/music.mp3" data-start="${outro.start.toFixed(3)}" data-duration="${(total - outro.start).toFixed(3)}" data-media-start="${(off + outro.start).toFixed(3)}" data-volume="${full}" data-fade-in="0.3" data-fade-out="1.6"></audio>`,
  ].join("\n");
}
