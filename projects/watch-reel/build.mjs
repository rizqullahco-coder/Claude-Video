// Luxury watch unboxing Reel (9:16, ~41s). Template: karaoke-flow · blush-luxe (random pick).
// Footage (personal, git-ignored) pre-cut, graded and dissolved into projects/watch/master.mp4.
import fs from "node:fs";
import path from "node:path";
import { hyperframes, render } from "../../lib/hyperframes.mjs";
import { prepMusic } from "../../lib/ffmpeg.mjs";
import { brandKit } from "../../lib/brands.mjs";
import { THEMES } from "../../lib/shorts.mjs";
import { ROOT, run, escapeHtml as h, log } from "../../lib/util.mjs";

const work = path.join(ROOT, "projects/watch");
const W = 1080, H = 1920, I = 3.4, CLIP = 33.93, FOOT = +(I + CLIP).toFixed(2), SPLIT = 3.6, END = 3.6, TOTAL = +(FOOT + SPLIT + END).toFixed(2);
const th = THEMES["blush-luxe"], gold = th.outro.accent, cream = "#f6f1ea", ink = "#1a1414";
const kit = brandKit({ brandKit: "rizco" });
const n3 = (x) => (+x).toFixed(3);
const rich = (s) => h(s).replace(/\*([^*]+)\*([.,!?…]*)/g, "<em>$1</em>$2");

const caps = [
  [6.2, 8.55, "two boxes. *one decision.*"], [9.2, 11.5, "first, *the green*."],
  [12.2, 14.5, "green sunburst dial"], [14.95, 17.4, "made to *catch the light*."],
  [17.75, 20.0, "automatic · day & date"], [20.45, 22.85, "*on the wrist.*"],
  [23.6, 27.3, "then, *the cream*."], [27.95, 30.35, "cream dial · Arabic numerals"],
  [30.9, 33.7, "blue hands. *quietly bold.*"],
];
const chapters = [[11.73, 23.07, "I", "The Green", "AL4785X1 · 41 mm"], [23.07, CLIP, "II", "The Cream", "AS9W05X1 · 42 mm"]].map(([s, e, ...r]) => [s + I, e + I, ...r]);
const sweeps = [15.1, 28.1, 21.0].map((t) => t + I);

for (const c of caps) { c[0] += I; c[1] += I; }
const tokens = (t) => t.split(/(\*[^*]+\*[.,!?…]*|\s+)/).filter((x) => x && !/^\s+$/.test(x));
const capHtml = caps.map(([s, e, t], i) => `<div id="cap${i}" class="clip cap" data-start="${s}" data-duration="${n3(e - s)}" data-track-index="3"><p>${tokens(t).map((w) => `<span class="w">${rich(w)}</span>`).join(" ")}</p></div>`).join("\n");

const js = [];
const T = (x) => js.push(x);
T(`tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${n3(CLIP + SPLIT)}, ease: "none" }, ${I});`);
// intro
T(`tl.fromTo("#intro .iline", { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0.25);`);
T(`tl.fromTo("#intro .ibrand", { opacity: 0, scale: 1.06, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 1.4, ease: "power3.out" }, 0.55);`);
T(`tl.fromTo("#intro .imodels", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9 }, 1.3);`);
T(`tl.fromTo("#intro .isub", { opacity: 0 }, { opacity: 1, duration: 0.9 }, 1.7);`);
T(`tl.fromTo("#isweep", { xPercent: -120 }, { xPercent: 120, duration: 1.8, ease: "power1.inOut" }, 1.2);`);
T(`tl.to("#intro", { opacity: 0, duration: 0.6, ease: "power1.in" }, ${n3(I - 0.2)});`);
// title
T(`tl.fromTo("#title .t1", { opacity: 0, y: 30, scale: 1.08 }, { opacity: 1, y: 0, scale: 1, duration: 1.6, ease: "power3.out" }, ${n3(0.7 + I)});`);
T(`tl.fromTo("#title .rule", { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: "power2.inOut" }, ${n3(1.6 + I)});`);
T(`tl.fromTo("#title .t2", { opacity: 0 }, { opacity: 1, duration: 1.0 }, ${n3(2.2 + I)});`);
T(`tl.to("#title", { opacity: 0, y: -20, duration: 0.8 }, ${n3(4.9 + I)});`);
// karaoke captions: words glow in slowly
caps.forEach(([s, e, t], i) => {
  const n = tokens(t).length, each = Math.min(0.42, (e - s - 0.8) / n);
  T(`tl.fromTo("#cap${i} p", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, ${s});`);
  T(`tl.fromTo("#cap${i} .w", { opacity: 0.22 }, { opacity: 1, duration: 0.35, stagger: ${n3(each)} }, ${n3(s + 0.2)});`);
  T(`tl.to("#cap${i} p", { opacity: 0, duration: 0.4 }, ${n3(e - 0.4)});`);
});
chapters.forEach(([s, e], i) => {
  T(`tl.fromTo("#ch${i} .num", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, ${n3(s + 0.1)});`);
  T(`tl.fromTo("#ch${i} .line", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, ${n3(s + 0.35)});`);
  T(`tl.fromTo("#ch${i} .name", { opacity: 0 }, { opacity: 1, duration: 0.8 }, ${n3(s + 0.6)});`);
  T(`tl.fromTo("#ch${i} .spec", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, ${n3(s + 1.0)});`);
  T(`tl.to("#ch${i}", { opacity: 0, duration: 0.6 }, ${n3(s + 3.6)});`);
});
sweeps.forEach((t, i) => T(`tl.fromTo("#sw${i}", { xPercent: -120 }, { xPercent: 120, duration: 1.5, ease: "power1.inOut" }, ${t});`));
// split ending: green | cream
T(`tl.fromTo("#sg", { xPercent: -100 }, { xPercent: 0, duration: 0.8, ease: "power3.out" }, ${FOOT});`);
T(`tl.fromTo("#sc", { xPercent: 100 }, { xPercent: 0, duration: 0.8, ease: "power3.out" }, ${n3(FOOT + 0.1)});`);
T(`tl.fromTo("#sg img, #sc img", { scale: 1.12 }, { scale: 1.02, duration: ${SPLIT}, ease: "sine.out" }, ${FOOT});`);
T(`tl.fromTo("#q .q1", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, ${n3(FOOT + 0.7)});`);
T(`tl.fromTo("#q .q2", { opacity: 0 }, { opacity: 1, duration: 0.6 }, ${n3(FOOT + 1.4)});`);
T(`tl.fromTo(".tagL, .tagR", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 }, ${n3(FOOT + 0.9)});`);
// end card
T(`tl.fromTo("#outro", { opacity: 0 }, { opacity: 1, duration: 0.6 }, ${n3(FOOT + SPLIT)});`);
T(`tl.fromTo("#outro img, #outro .wordmark, #outro .tag, #outro .cta", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }, ${n3(FOOT + SPLIT + 0.3)});`);

const css = `
@font-face{font-family:"Inter";font-weight:600;src:url(assets/inter-600.woff2) format("woff2")}
@font-face{font-family:"Gar";font-weight:500;src:url(assets/g-500.woff2) format("woff2")}
@font-face{font-family:"Gar";font-weight:600;font-style:italic;src:url(assets/g-600i.woff2) format("woff2")}
@font-face{font-family:"Gar";font-weight:500;font-style:italic;src:url(assets/g-500i.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000;font-family:Gar,Georgia,serif}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
#foot{width:100%;height:100%;object-fit:cover}
#shade{background:linear-gradient(180deg,rgba(10,8,8,.55) 0%,rgba(10,8,8,0) 18%,rgba(10,8,8,0) 58%,rgba(10,8,8,.65) 88%,rgba(10,8,8,.75) 100%)}
#shade .logo{position:absolute;top:96px;left:50%;height:54px;transform:translateX(-50%);opacity:.92}
#title{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:${Math.round(H * 0.66)}px;text-align:center;color:${cream}}
#title .t1{font-style:italic;font-weight:600;font-size:150px;line-height:1;text-shadow:0 6px 40px rgba(0,0,0,.5)}
#title .rule{width:220px;height:2px;background:${gold};margin:34px 0 26px;transform-origin:center}
#title .t2{font-family:Inter,sans-serif;font-weight:600;font-size:34px;letter-spacing:.5em;margin-right:-.5em;color:${gold}}
.cap{display:flex;align-items:flex-start;justify-content:center;padding:${Math.round(H * 0.72)}px 90px 0}
.cap p{font-weight:500;font-size:74px;line-height:1.12;color:${cream};text-align:center;text-shadow:0 4px 28px rgba(0,0,0,.55);opacity:0}
.w{display:inline-block}
.cap em{font-style:italic;font-weight:600;color:${gold}}
.chap{display:flex;flex-direction:column;align-items:center;padding-top:250px;color:${cream}}
.chap .num{font-weight:500;font-size:64px;letter-spacing:.12em;color:${gold};opacity:0}
.chap .line{width:140px;height:2px;background:${gold};margin:16px 0;transform-origin:center;transform:scaleX(0)}
.chap .name{font-style:italic;font-weight:600;font-size:72px;opacity:0;text-shadow:0 4px 24px rgba(0,0,0,.5)}
.chap .spec{font-family:Inter,sans-serif;font-weight:600;font-size:28px;letter-spacing:.32em;margin-right:-.32em;color:${gold};margin-top:18px;opacity:0;text-shadow:0 2px 14px rgba(0,0,0,.6)}
.sweep{background:linear-gradient(115deg,rgba(255,240,220,0) 38%,rgba(255,240,220,.28) 50%,rgba(255,240,220,0) 62%);mix-blend-mode:screen;transform:translateX(-120%)}
#split{background:${ink}}
#sg,#sc{position:absolute;top:0;bottom:0;width:50%;overflow:hidden}
#sg{left:0;border-right:2px solid ${gold}}#sc{right:0}
#sg img,#sc img{position:absolute;top:0;height:100%;width:1080px;object-fit:cover}
#sg img{left:-270px}#sc img{left:-270px}
.tagL,.tagR{position:absolute;top:300px;font-family:Inter,sans-serif;font-weight:600;font-size:30px;letter-spacing:.4em;color:${cream};text-shadow:0 2px 14px rgba(0,0,0,.6);opacity:0}
.tagL{left:0;width:540px;text-align:center}.tagR{right:0;width:540px;text-align:center}
#q{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:300px;text-align:center;background:linear-gradient(180deg,rgba(10,8,8,0) 50%,rgba(10,8,8,.75) 100%)}
#q .q1{font-style:italic;font-weight:600;font-size:120px;color:${cream};opacity:0;text-shadow:0 6px 30px rgba(0,0,0,.5)}
#q .q2{font-family:Inter,sans-serif;font-weight:600;font-size:32px;letter-spacing:.36em;color:${gold};margin-top:18px;opacity:0}
#intro{background:radial-gradient(90% 60% at 50% 48%, #221a18 0%, #0d0b0b 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:${cream};overflow:hidden}
#intro .ibrand{font-family:Inter,sans-serif;font-weight:600;font-size:150px;letter-spacing:.32em;margin-right:-.32em;opacity:0}
#intro .iline{width:520px;height:2px;background:${gold};margin:42px 0 30px;transform:scaleX(0)}
#intro .imodels{font-family:Inter,sans-serif;font-weight:600;font-size:30px;letter-spacing:.34em;margin-right:-.34em;color:${gold};opacity:0}
#intro .isub{font-style:italic;font-weight:500;font-size:64px;margin-top:26px;opacity:0}
#isweep{position:absolute;inset:0;background:linear-gradient(110deg,rgba(255,236,210,0) 42%,rgba(255,236,210,.22) 50%,rgba(255,236,210,0) 58%);mix-blend-mode:screen;transform:translateX(-120%)}
#progress-track{inset:auto 0 0 0;height:6px;background:rgba(246,241,234,.12)}
#progress{position:absolute;inset:0;background:${gold};transform-origin:left center;transform:scaleX(0)}
#outro{background:${ink};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;text-align:center;color:${cream};opacity:0}
#outro img{height:170px}
#outro .wordmark{font-family:Inter,sans-serif;font-weight:600;font-size:30px;letter-spacing:.45em;margin-right:-.45em;color:${gold}}
#outro .tag{font-style:italic;font-weight:600;font-size:72px;line-height:1.1}
#outro .cta{font-family:Inter,sans-serif;font-weight:600;font-size:32px;letter-spacing:.08em;color:${ink};background:${gold};padding:18px 46px;border-radius:99px}`;

const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  <section id="intro" class="clip" data-start="0" data-duration="${n3(I + 0.5)}" data-track-index="5">
    <div class="ibrand">ALBA</div><div class="iline"></div>
    <div class="imodels">AL4785X1 &nbsp;·&nbsp; AS9W05X1</div><div class="isub">the unboxing</div>
    <div id="isweep"></div>
  </section>
  <video id="foot" class="clip" src="assets/master.mp4" data-start="${I}" data-duration="${CLIP}" data-has-audio="true" data-volume="0.22" data-track-index="0"></video>
  ${sweeps.map((t, i) => `<div id="sw${i}" class="clip sweep" data-start="${t}" data-duration="1.5" data-track-index="1"></div>`).join("\n  ")}
  <div id="shade" class="clip" data-start="${I}" data-duration="${CLIP}" data-track-index="2"><img class="logo" src="assets/logo-light.png" alt=""/></div>
  <div id="title" class="clip" data-start="${n3(0.5 + I)}" data-duration="5.2" data-track-index="3"><div class="t1">Unboxing.</div><div class="rule"></div><div class="t2">ALBA × 2</div></div>
  ${chapters.map(([s, e, n, name, spec], i) => `<div id="ch${i}" class="clip chap" data-start="${s}" data-duration="4.2" data-track-index="3"><div class="num">${n}</div><div class="line"></div><div class="name">${h(name)}</div><div class="spec">${h(spec)}</div></div>`).join("\n  ")}
${capHtml}
  <section id="split" class="clip" data-start="${FOOT}" data-duration="${SPLIT}" data-track-index="0">
    <div id="sg"><img src="assets/green.png" alt=""/></div><div id="sc"><img src="assets/cream.png" alt=""/></div>
    <div class="tagL">GREEN</div><div class="tagR">CREAM</div>
  </section>
  <div id="q" class="clip" data-start="${FOOT}" data-duration="${SPLIT}" data-track-index="3"><div class="q1">green or cream?</div><div class="q2">TELL ME BELOW</div></div>
  <section id="outro" class="clip" data-start="${n3(FOOT + SPLIT)}" data-duration="${END}" data-track-index="0">
    <img src="assets/logo-light.png" alt="Riz.co"/><div class="wordmark">${h(kit.wordmark)}</div>
    <div class="tag">${h(kit.tagline).replace(". ", ".<br>")}</div><div class="cta">Follow for more</div>
  </section>
  <div id="progress-track" class="clip" data-start="${I}" data-duration="${n3(CLIP + SPLIT)}" data-track-index="4"><div id="progress"></div></div>
  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-volume="1" data-fade-in="0.4" data-fade-out="2.8"></audio>
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  ${js.join("\n  ")}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script></body></html>`;

const bd = path.join(work, "build"), A = path.join(bd, "assets");
fs.mkdirSync(A, { recursive: true });
fs.writeFileSync(path.join(bd, "index.html"), html);
const cp = (f, t) => fs.copyFileSync(path.isAbsolute(f) ? f : path.join(ROOT, f), path.join(A, t));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
cp("node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", "inter-600.woff2");
for (const [w, s, t] of [[500, "normal", "g-500"], [600, "italic", "g-600i"], [500, "italic", "g-500i"]]) cp(`node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-${w}-${s}.woff2`, `${t}.woff2`);
cp(kit.logo.lightInk, "logo-light.png");
cp(path.join(work, "master.mp4"), "master.mp4");
cp(path.join(work, "seg/green.png"), "green.png");
cp(path.join(work, "seg/cream.png"), "cream.png");
await prepMusic(path.join(ROOT, "media/music/beats/luxury/luxe.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "alba-unboxing", name: "ALBA × 2 unboxing" }, null, 2));
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(work, "raw-render.mp4"), out = path.join(work, "out"), mp4 = path.join(out, "alba-unboxing.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log("RENDER COMPLETE " + path.relative(ROOT, mp4));
