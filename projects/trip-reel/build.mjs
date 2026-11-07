// Trip Reel: "road trip gone wrong" (9:16, ~45s). Template: soft-rise · sage-luxe (random pick).
// Footage is pre-cut on the beat into projects/trip/master.mp4 (personal, git-ignored).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hyperframes, render } from "../../lib/hyperframes.mjs";
import { prepMusic } from "../../lib/ffmpeg.mjs";
import { brandKit } from "../../lib/brands.mjs";
import { THEMES } from "../../lib/shorts.mjs";
import { ROOT, run, escapeHtml as h, log } from "../../lib/util.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const trip = path.join(ROOT, "projects/trip");
const W = 1080, H = 1920, FOOT = 41.77, END = 3.8, TOTAL = +(FOOT + END).toFixed(2);
const th = THEMES["sage-luxe"], gold = "#e6d3a3";
const kit = brandKit({ brandKit: "rizco" });
const n3 = (x) => (+x).toFixed(3);
const rich = (s) => h(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");

const chapters = [[0, 5.1, "the plan"], [5.1, 14.267, "the twist"], [14.267, 28.534, "the wait"], [28.534, FOOT, "the rescue"]];
const caps = [
  [0.45, 2.9, "the plan:|a *chill* road trip"], [3.25, 5.0, "everything's fine…"],
  [5.35, 9.05, "…until the van|said *no*."], [9.45, 14.15, "plot twist:|*tow truck*."],
  [14.55, 18.25, "stuck?|*make it fun*."], [18.65, 23.35, "the gang,|*unbothered*."],
  [23.75, 28.45, "updating the|family *group chat*"], [28.85, 31.5, "*rescue*|has arrived"],
  [31.85, 35.55, "the van gets|a ride too"], [35.95, 41.6, "*first-class*|seat, please."],
];

const words = (line, ci, li) => line.split(/(\*[^*]+\*[.,!?…]*|\s+)/).filter((x) => x && !/^\s+$/.test(x)).map((wd, k) => `<span class="w" id="c${ci}l${li}w${k}"><span class="wi">${rich(wd)}</span></span>`).join(" ");
const capHtml = caps.map(([s, e, txt], i) => `<div id="cap${i}" class="clip cap" data-start="${s}" data-duration="${n3(e - s)}" data-track-index="2"><p>${txt.split("|").map((ln, li) => `<span class="ln">${words(ln, i, li)}</span>`).join("")}</p></div>`).join("\n");

const js = [];
const T = (x) => js.push(x);
T(`tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${FOOT}, ease: "none" }, 0);`);
caps.forEach(([s, e], i) => {
  T(`tl.set("#cap${i}", { opacity: 1 }, ${s});`);
  T(`tl.fromTo("#cap${i} .wi", { yPercent: 115 }, { yPercent: 0, duration: 0.5, ease: "power4.out", stagger: 0.09 }, ${s});`);
  T(`tl.to("#cap${i} p", { y: -24, opacity: 0, duration: 0.25, ease: "power2.in" }, ${n3(e - 0.25)});`);
});
chapters.forEach(([s, e], i) => {
  T(`tl.fromTo("#chap${i}", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5 }, ${n3(s + 0.15)});`);
  if (i > 0) {
    T(`tl.fromTo("#iris${i} b", { scale: 0, opacity: 1 }, { scale: 1, duration: 0.3, ease: "power3.in" }, ${n3(s - 0.3)});`);
    T(`tl.to("#iris${i} b", { opacity: 0, duration: 0.3 }, ${n3(s)});`);
  }
});
T(`tl.fromTo("#frame", { scale: 1.04, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.1);`);
T(`tl.fromTo("#irisEnd b", { scale: 0, opacity: 1 }, { scale: 1, duration: 0.35, ease: "power3.in" }, ${n3(FOOT - 0.35)});`);
T(`tl.fromTo("#outro", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${FOOT});`);
T(`tl.fromTo("#outro .big, #outro img, #outro .wordmark, #outro .tag, #outro .cta", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.18, ease: "power4.out" }, ${n3(FOOT + 0.2)});`);

const css = `
@font-face{font-family:"Inter";font-weight:600;src:url(assets/inter-600.woff2) format("woff2")}
@font-face{font-family:"Inter";font-weight:800;src:url(assets/inter-800.woff2) format("woff2")}
@font-face{font-family:"Serif";font-weight:800;font-style:italic;src:url(assets/serif-800i.woff2) format("woff2")}
@font-face{font-family:"Garamond";font-weight:600;font-style:italic;src:url(assets/g-600i.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000;font-family:Inter,sans-serif}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
#foot{width:100%;height:100%;object-fit:cover}
#shade{background:linear-gradient(180deg,rgba(20,26,20,.55) 0%,rgba(20,26,20,0) 22%,rgba(20,26,20,0) 50%,rgba(20,26,20,.6) 82%,rgba(20,26,20,.7) 100%)}
#frame{inset:48px;border:2px solid rgba(242,239,230,.55);border-radius:22px;opacity:0}
.logo{position:absolute;top:96px;left:50%;height:58px;transform:translateX(-50%)}
.chap{inset:auto;top:118px;left:96px;right:96px;display:flex;justify-content:space-between;align-items:center;color:#f2efe6;opacity:0}
.chap .num{font-weight:600;font-size:28px;letter-spacing:.2em;opacity:.85}
.chap .ttl{font-family:Garamond,serif;font-style:italic;font-weight:600;font-size:40px;color:${gold}}
.cap{display:flex;align-items:flex-start;padding:${Math.round(H * 0.6)}px 100px 0;opacity:0}
.cap p{display:flex;flex-direction:column;gap:4px;color:#fffaf0;font-weight:800;font-size:92px;line-height:1.02;letter-spacing:-0.035em;text-shadow:0 6px 30px rgba(0,0,0,.35)}
.ln{display:block}
.w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.1em;margin-bottom:-.1em}
.wi{display:inline-block}
.cap em{font-family:Serif,Georgia,serif;font-style:italic;color:${gold};letter-spacing:-0.01em}
.iris{display:flex;align-items:center;justify-content:center;pointer-events:none}
.iris b{width:2500px;height:2500px;border-radius:50%;background:${th.outro.accent};flex:none;transform:scale(0)}
#progress-track{inset:auto 0 0 0;height:10px;background:rgba(242,239,230,.18)}
#progress{position:absolute;inset:0;background:${gold};transform-origin:left center;transform:scaleX(0)}
#outro{background:${th.outro.bg};display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:34px;padding:0 110px;opacity:0;color:#f2efe6}
#outro .big{font-weight:800;font-size:120px;line-height:1;letter-spacing:-0.04em}
#outro .big em{font-family:Serif,serif;font-style:italic;color:${th.outro.accent}}
#outro img{height:110px;margin-top:30px}
#outro .wordmark{font-weight:800;font-size:28px;letter-spacing:.42em;color:${th.outro.accent}}
#outro .tag{font-family:Garamond,serif;font-style:italic;font-weight:600;font-size:56px;line-height:1.1}
#outro .cta{font-weight:800;font-size:34px;color:${th.outro.ctaInk};background:${th.outro.accent};padding:18px 44px;border-radius:99px}`;

const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  <video id="foot" class="clip" src="assets/master.mp4" data-start="0" data-duration="${FOOT}" data-has-audio="true" data-volume="0.14" data-track-index="0"></video>
  <div id="shade" class="clip" data-start="0" data-duration="${FOOT}" data-track-index="1"><img class="logo" src="assets/logo-light.png" alt=""/></div>
  <div id="frame" class="clip" data-start="0" data-duration="${FOOT}" data-track-index="1"></div>
  ${chapters.map(([s, e, t], i) => `<div id="chap${i}" class="clip chap" data-start="${s}" data-duration="${n3(e - s)}" data-track-index="1"><span class="num">${String(i + 1).padStart(2, "0")} / 04</span><span class="ttl">${h(t)}</span></div>`).join("\n  ")}
${capHtml}
  ${chapters.slice(1).map(([s], k) => `<div id="iris${k + 1}" class="clip iris" data-start="${n3(s - 0.3)}" data-duration="0.6" data-track-index="3"><b></b></div>`).join("\n  ")}
  <div id="irisEnd" class="clip iris" data-start="${n3(FOOT - 0.35)}" data-duration="0.35" data-track-index="3"><b></b></div>
  <section id="outro" class="clip" data-start="${FOOT}" data-duration="${END}" data-track-index="0">
    <div class="big">worst luck,<br><em>best trip.</em></div>
    <img src="assets/logo-light.png" alt="Riz.co"/><div class="wordmark">${h(kit.wordmark)}</div>
    <div class="tag">${h(kit.tagline).replace(". ", ".<br>")}</div><div class="cta">Follow for more</div>
  </section>
  <div id="progress-track" class="clip" data-start="0" data-duration="${FOOT}" data-track-index="4"><div id="progress"></div></div>
  ${chapters.slice(1).map(([s], k) => `<audio id="wh${k}" src="assets/whoosh.wav" data-start="${n3(s - 0.35)}" data-duration="0.45" data-volume="0.45"></audio>`).join("\n  ")}
  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${FOOT}" data-media-start="0" data-volume="1" data-fade-in="0.2" data-fade-out="0.3"></audio>
  <audio id="music-end" src="assets/music.mp3" data-start="${FOOT}" data-duration="${END}" data-media-start="${FOOT}" data-volume="1" data-fade-in="0.1" data-fade-out="2.4"></audio>
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  ${js.join("\n  ")}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script></body></html>`;

const bd = path.join(trip, "build"), A = path.join(bd, "assets");
fs.mkdirSync(A, { recursive: true });
fs.writeFileSync(path.join(bd, "index.html"), html);
const cp = (f, t) => fs.copyFileSync(path.isAbsolute(f) ? f : path.join(ROOT, f), path.join(A, t));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
cp("node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", "inter-600.woff2");
cp("node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2", "inter-800.woff2");
cp("node_modules/@fontsource/playfair-display/files/playfair-display-latin-800-italic.woff2", "serif-800i.woff2");
cp("node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2", "g-600i.woff2");
cp(kit.logo.lightInk, "logo-light.png");
cp("media/music/beats/trip/whoosh.wav", "whoosh.wav");
cp(path.join(trip, "master.mp4"), "master.mp4");
await prepMusic(path.join(ROOT, "media/music/beats/trip/tripsong.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "trip-reel", name: "Road trip gone wrong" }, null, 2));
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(trip, "raw-render.mp4"), out = path.join(trip, "out"), mp4 = path.join(out, "road-trip-gone-wrong.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "copy", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log(path.relative(ROOT, mp4));
