// Romantic Reel: "My future goal is you" (9:16, ~25s). Music + on-screen text, no voice.
// Personal photos live in assets-src/ (git-ignored). Renders locally with HyperFrames.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hyperframes, render } from "../../lib/hyperframes.mjs";
import { prepMusic } from "../../lib/ffmpeg.mjs";
import { brandKit } from "../../lib/brands.mjs";
import { ROOT, run, escapeHtml as h, log } from "../../lib/util.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const W = 1080, H = 1920, TOTAL = 28.5;
const C = { bg: "#fbf3e6", ink: "#5a3a22", blush: "#e3a093", soft: "#9a7a62", olive: "#4b531e" };
const kit = brandKit({ brandKit: "rizco" });
const n3 = (x) => (+x).toFixed(3);

const goals = ["a home full of laughter", "a business that grows", "a life full of barakah"];
const title = "my future goals:";
// timing (seconds)
const T = { title: 0.4, goal0: 2.6, gap: 1.5, but: 8.2, illo: 10.4, isyou: 12.6, photo: 17.6, end: 23.6 };

const hearts = Array.from({ length: 14 }, (_, i) => {
  const x = 90 + ((i * 137) % 900), size = 26 + ((i * 53) % 30), delay = T.illo + 0.3 + (i % 7) * 0.45, dur = 4.5 + (i % 4) * 0.6;
  return { x, size, delay, dur, drift: ((i % 3) - 1) * 40 };
});
const SC = 1000 / 1448; // illustration display scale
const P = (x, y) => [Math.round(x * SC), Math.round(y * SC)];
const eyes = [ // [x, y, w, h, skin]
  [475, 460, 56, 60, "#fbe3c8"], [585, 467, 52, 56, "#fbe3c8"],
  [915, 410, 48, 58, "#f8cfa6"], [1032, 387, 52, 62, "#f8cfa6"],
];
const crit = { bunny: [440, 905, 500, 965], mouse: [395, 950, 460, 1010], soot: [1160, 925, 1230, 990] };
const blinkAt = [T.illo + 1.6, T.illo + 3.9, T.illo + 5.8];
const heart = (s) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.6 6.6 4.6c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.6 0 5.7 3.8 4.2 7.2C19.5 16.4 12 21 12 21z" fill="${C.blush}"/></svg>`;

const css = `
@font-face{font-family:"Garamond";font-weight:500;font-style:italic;src:url(assets/g-500i.woff2) format("woff2")}
@font-face{font-family:"Garamond";font-weight:600;font-style:italic;src:url(assets/g-600i.woff2) format("woff2")}
@font-face{font-family:"Garamond";font-weight:500;src:url(assets/g-500.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.bg};font-family:Garamond,Georgia,serif;color:${C.ink}}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
#paper{background:radial-gradient(110% 80% at 50% 45%, ${C.bg} 60%, #f1e2c9 100%)}
#paper::after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(90,58,34,.05) 1px, transparent 1px);background-size:5px 5px}
#list{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:0 130px;gap:46px;opacity:0}
#list .title{font-style:italic;font-weight:600;font-size:118px;line-height:1;margin-bottom:24px}
#list .title span{display:inline-block;opacity:0}
.goal{display:flex;align-items:center;gap:30px;font-style:italic;font-weight:500;font-size:70px;opacity:0}
.box{position:relative;flex:none;width:62px;height:62px;border:4px solid ${C.ink};border-radius:12px}
.box svg{position:absolute;left:-6px;top:-18px;width:80px;height:80px}
.box path{fill:none;stroke:${C.blush};stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:40;stroke-dashoffset:40}
#but{display:flex;align-items:center;justify-content:center;text-align:center;padding:0 90px;font-style:italic;font-weight:500;font-size:92px;line-height:1.12;opacity:0}
#illo{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;opacity:0}
#stage{position:relative;width:1000px;height:${Math.round(1086 * SC)}px}
#stage .lay{position:absolute;inset:0;width:100%;height:100%}
#glow{position:absolute;left:50%;top:46%;width:900px;height:900px;margin:-450px 0 0 -450px;border-radius:50%;background:radial-gradient(circle, rgba(227,160,147,.35), rgba(227,160,147,0) 65%)}
.crit{position:absolute;transform-origin:50% 100%}
.lid{position:absolute;border-radius:50%;transform-origin:50% 0;transform:scaleY(0);border-bottom:3px solid #4a2c18}
#steam{position:absolute;left:${P(1050, 0)[0]}px;top:${P(0, 790)[1]}px;width:80px;height:90px;overflow:visible}
#steam path{fill:none;stroke:rgba(140,110,90,.55);stroke-width:4;stroke-linecap:round}
.spark{position:absolute;width:44px;height:44px;opacity:0}
.spark path{fill:${C.blush}}
#illo .isyou{font-style:italic;font-weight:600;font-size:150px;line-height:1;opacity:0}
#illo .isyou em{color:${C.blush};font-style:italic}
.heart{position:absolute;bottom:-60px;opacity:0}
#photo{display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0}
#photo{background:#000}
#photo .pl{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 40%}
#pbg{filter:blur(3px) brightness(.92)}
#photo .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 60%,rgba(60,30,20,.45))}
#doodle{position:absolute;inset:0;overflow:visible}
#doodle .d{fill:none;stroke:#fffaf2;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
#doodle .trail{fill:none;stroke:#fffaf2;stroke-width:5;stroke-linecap:round;stroke-dasharray:4 22}
#photo .cap{position:absolute;left:0;right:0;bottom:250px;text-align:center;font-style:italic;font-weight:600;font-size:92px;color:#fffaf2;text-shadow:0 4px 30px rgba(0,0,0,.35);opacity:0}
#photo .cap small{display:block;font-size:52px;font-weight:500;margin-top:6px}
#end{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:34px;opacity:0}
#end .line{font-style:italic;font-weight:600;font-size:124px;line-height:1.05}
#end .line em{color:${C.blush}}
#end .hrt{opacity:0}
#brand{position:absolute;left:0;right:0;top:auto;bottom:130px;display:flex;flex-direction:column;align-items:center;gap:10px;opacity:0}
#brand img{height:52px} #brand span{font-style:italic;font-weight:500;font-size:30px;color:${C.soft}}`;

const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  <div id="paper" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="0"></div>
  <section id="list" class="clip" data-start="0" data-duration="${T.but}" data-track-index="1">
    <div class="title">${[...title].map((ch) => `<span>${ch === " " ? "&nbsp;" : h(ch)}</span>`).join("")}</div>
    ${goals.map((g, i) => `<div class="goal" id="g${i}"><span class="box"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L21 4"/></svg></span><span>${h(g)}</span></div>`).join("")}
  </section>
  <section id="but" class="clip" data-start="${T.but}" data-duration="${n3(T.illo - T.but + 0.4)}" data-track-index="1">but the goal<br>I'm most sure of…</section>
  <section id="illo" class="clip" data-start="${T.illo}" data-duration="${n3(T.photo - T.illo + 0.6)}" data-track-index="1">
    <div id="stage"><div id="glow"></div>
      <img class="lay" id="lw" src="assets/woman.png" alt=""/>
      <img class="lay" id="lm" src="assets/man.png" alt=""/>
      <img class="lay" id="lt" src="assets/table.png" alt=""/>
      ${Object.entries(crit).map(([k, [x0, y0, x1, y1]]) => `<img class="crit" id="${k}" src="assets/${k}.png" style="left:${P(x0, y0)[0]}px;top:${P(x0, y0)[1]}px;width:${Math.round((x1 - x0) * SC)}px;height:${Math.round((y1 - y0) * SC)}px" alt=""/>`).join("")}
      ${eyes.map(([x, y, w, hh, skin], i) => `<div class="lid" id="lid${i}" style="left:${Math.round((x - w / 2) * SC)}px;top:${Math.round((y - hh / 2) * SC)}px;width:${Math.round(w * SC)}px;height:${Math.round(hh * SC)}px;background:${skin}"></div>`).join("")}
      <svg id="steam" viewBox="0 0 80 90"><path d="M20 85 C 8 70, 32 60, 20 45 S 30 20, 22 5"/><path d="M42 85 C 30 70, 54 60, 42 45 S 52 20, 44 5"/><path d="M62 85 C 50 70, 74 60, 62 45 S 72 20, 64 5"/></svg>
      ${[[360, 230], [1150, 170], [700, 120], [260, 520], [1240, 560]].map(([x, y], i) => `<svg class="spark" id="sp${i}" viewBox="0 0 24 24" style="left:${P(x, y)[0]}px;top:${P(x, y)[1]}px"><path d="M12 1l2.2 8.8L23 12l-8.8 2.2L12 23l-2.2-8.8L1 12l8.8-2.2z"/></svg>`).join("")}
    </div><div class="isyou">is <em>you.</em></div>
  </section>
  ${hearts.map((ht, i) => `<div id="h${i}" class="clip heart" style="left:${ht.x}px;right:auto;top:auto;width:${ht.size}px;height:${ht.size}px" data-start="${n3(ht.delay)}" data-duration="${n3(ht.dur)}" data-track-index="2">${heart(ht.size)}</div>`).join("\n  ")}
  <section id="photo" class="clip" data-start="${T.photo}" data-duration="${n3(T.end - T.photo + 0.6)}" data-track-index="1">
    <img class="pl" id="pbg" src="assets/photo.jpg" alt=""/>
    <img class="pl" id="pfg" src="assets/couple.png" alt=""/>
    <div class="shade"></div>
    <svg id="doodle" viewBox="0 0 ${W} ${H}">
      <path class="trail" id="trail" d="M-40 470 C 200 330, 420 520, 640 360 S 940 250, 1140 300"/>
      <g id="plane" transform="translate(0,0)"><path class="d" d="M0 0 L46 -14 L18 4 Z M18 4 L22 20 L30 0 M0 0 L18 4"/></g>
      <path class="d dh" id="dh0" d="M960 470 c -14 -22 -48 -10 -40 16 c 6 20 40 36 40 36 s 34 -16 40 -36 c 8 -26 -26 -38 -40 -16 z"/>
      <path class="d dh" id="dh1" d="M160 760 c -10 -16 -34 -7 -28 11 c 4 14 28 25 28 25 s 24 -11 28 -25 c 6 -18 -18 -27 -28 -11 z"/>
      <path class="d dh" id="dh2" d="M890 560 c -8 -12 -26 -6 -22 9 c 3 11 22 19 22 19 s 19 -8 22 -19 c 4 -15 -14 -21 -22 -9 z"/>
      <path class="d" id="sq0" d="M330 330 l14 30 M300 345 l32 8 M372 318 l-8 32"/>
    </svg>
    <div class="cap">the real us ♡<small>future goals, in progress</small></div>
  </section>
  <section id="end" class="clip" data-start="${T.end}" data-duration="${n3(TOTAL - T.end)}" data-track-index="1">
    <div class="hrt">${heart(110)}</div><div class="line">My future goal<br>is <em>you.</em></div>
  </section>
  <div id="brand" class="clip" data-start="${T.end}" data-duration="${n3(TOTAL - T.end)}" data-track-index="3"><img src="assets/logo.png" alt=""/><span>${h(kit.tagline)}</span></div>
  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-volume="0.9" data-fade-in="0.6" data-fade-out="3"></audio>
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  tl.set("#list", { opacity: 1 }, 0);
  tl.to("#list .title span", { opacity: 1, duration: 0.05, stagger: 0.09 }, ${T.title});
  ${goals.map((_, i) => `tl.fromTo("#g${i}", { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, ${n3(T.goal0 + i * T.gap)});
  tl.to("#g${i} .box path", { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, ${n3(T.goal0 + i * T.gap + 0.7)});`).join("\n  ")}
  tl.to("#list", { opacity: 0, y: -40, duration: 0.6, ease: "power2.in" }, ${n3(T.but - 0.6)});
  tl.fromTo("#but", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, ${T.but});
  tl.to("#but", { opacity: 0, duration: 0.6 }, ${n3(T.illo - 0.2)});
  tl.fromTo("#illo", { opacity: 0 }, { opacity: 1, duration: 0.6 }, ${T.illo});
  tl.fromTo("#stage", { y: 140, scale: 0.92 }, { y: 0, scale: 1, duration: 1.2, ease: "power3.out" }, ${T.illo});
  tl.fromTo("#glow", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: "power2.out" }, ${T.illo});
  // characters come alive: gentle sway + bob, out of phase
  tl.to("#lw", { rotation: 1.2, y: -4, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: 5, transformOrigin: "31% 80%" }, ${n3(T.illo + 0.8)});
  tl.to("#lm", { rotation: -1.0, y: -6, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 7, transformOrigin: "72% 82%" }, ${n3(T.illo + 1.0)});
  // blinks
  ${blinkAt.map((bt, j) => eyes.map((_, i) => `tl.to("#lid${i}", { scaleY: 1, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut" }, ${n3(bt + (i < 2 ? 0 : 0.25 + j * 0.1))});`).join(" ")).join("\n  ")}
  // little critters squish & stretch
  ${Object.keys(crit).map((k, i) => `tl.to("#${k}", { scaleY: 1.22, scaleX: 1.08, duration: 0.18, yoyo: true, repeat: 5, repeatDelay: 0.55, ease: "power2.out" }, ${n3(T.illo + 1.5 + i * 0.35)});`).join("\n  ")}
  // coffee steam rising
  tl.fromTo("#steam path", { y: 10, opacity: 0 }, { y: -16, opacity: 1, duration: 1.4, ease: "sine.inOut", stagger: { each: 0.35, repeat: 3, yoyo: true } }, ${n3(T.illo + 0.9)});
  // sparkles twinkle
  ${[0, 1, 2, 3, 4].map((i) => `tl.fromTo("#sp${i}", { scale: 0, rotation: 0, opacity: 0 }, { scale: 1, rotation: 90, opacity: 1, duration: 0.45, ease: "back.out(3)", yoyo: true, repeat: 3, repeatDelay: 0.4 }, ${n3(T.illo + 1.2 + i * 0.5)});`).join("\n  ")}
  // dolly-in toward the couple before the photo
  tl.to("#stage", { scale: 1.5, y: 40, duration: 1.0, ease: "power3.in" }, ${n3(T.photo - 0.8)});
  tl.fromTo("#illo .isyou", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.6)" }, ${T.isyou});
  tl.to("#illo", { opacity: 0, duration: 0.6 }, ${n3(T.photo)});
  ${hearts.map((ht, i) => `tl.fromTo("#h${i}", { y: 0, x: 0, opacity: 0, scale: 0.6 }, { y: -${Math.round(H * 0.75)}, x: ${ht.drift}, opacity: 0.85, scale: 1, duration: ${n3(ht.dur)}, ease: "sine.out" }, ${n3(ht.delay)}); tl.to("#h${i}", { opacity: 0, duration: 0.8 }, ${n3(ht.delay + ht.dur - 0.8)});`).join("\n  ")}
  tl.fromTo("#photo", { opacity: 0 }, { opacity: 1, duration: 0.5 }, ${n3(T.photo - 0.2)});
  // 2.5D parallax: background drifts back faster than the cut-out couple
  tl.fromTo("#pbg", { scale: 1.16, x: 20 }, { scale: 1.02, x: -20, duration: ${n3(T.end - T.photo + 0.6)}, ease: "sine.out", transformOrigin: "50% 55%" }, ${T.photo});
  tl.fromTo("#pfg", { scale: 1.16, y: 30 }, { scale: 1.07, y: 0, duration: ${n3(T.end - T.photo + 0.6)}, ease: "sine.out", transformOrigin: "50% 60%" }, ${T.photo});
  // paper plane flies along a dotted path
  tl.fromTo("#trail", { strokeDashoffset: 0, opacity: 0 }, { opacity: 1, duration: 0.4 }, ${n3(T.photo + 0.6)});
  tl.fromTo("#plane", { x: -60, y: 470, rotation: -18 }, { keyframes: [{ x: 200, y: 340, rotation: -22 }, { x: 420, y: 470, rotation: 6 }, { x: 640, y: 360, rotation: -20 }, { x: 940, y: 260, rotation: -8 }, { x: 1160, y: 290, rotation: 8 }], duration: 3.2, ease: "none" }, ${n3(T.photo + 0.6)});
  // doodle hearts pop around the couple
  tl.fromTo(".dh", { scale: 0, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(3)", stagger: 0.45 }, ${n3(T.photo + 1.6)});
  tl.to(".dh", { scale: 1.12, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 3, transformOrigin: "50% 50%" }, ${n3(T.photo + 3.0)});
  tl.fromTo("#sq0", { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(3)" }, ${n3(T.photo + 1.3)});
  tl.fromTo("#photo .cap", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, ${n3(T.photo + 2.2)});
  tl.to("#photo", { opacity: 0, duration: 0.6 }, ${n3(T.end)});
  tl.fromTo("#end", { opacity: 0 }, { opacity: 1, duration: 0.8 }, ${n3(T.end + 0.2)});
  tl.fromTo("#end .line", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" }, ${n3(T.end + 0.3)});
  tl.fromTo("#end .hrt", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(2.4)" }, ${n3(T.end + 1.1)});
  tl.to("#end .hrt", { scale: 1.12, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 3 }, ${n3(T.end + 1.8)});
  tl.fromTo("#brand", { opacity: 0 }, { opacity: 0.9, duration: 0.8 }, ${n3(T.end + 1.6)});
  window.__timelines["main"] = tl;
  tl.seek(0);
</script></body></html>`;

const bd = path.join(here, "build", "vertical"), A = path.join(bd, "assets");
fs.mkdirSync(A, { recursive: true });
fs.writeFileSync(path.join(bd, "index.html"), html);
const cp = (f, t) => fs.copyFileSync(path.join(ROOT, f), path.join(A, t));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
for (const [w, s, t] of [[500, "italic", "g-500i"], [600, "italic", "g-600i"], [500, "normal", "g-500"]]) cp(`node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-${w}-${s}.woff2`, `${t}.woff2`);
cp(kit.logo.darkInk, "logo.png");
for (const f of ["woman", "man", "table", "bunny", "mouse", "soot", "couple"]) fs.copyFileSync(path.join(here, "layers", `${f}.png`), path.join(A, `${f}.png`));
fs.copyFileSync(path.join(here, "assets-src/photo.jpg"), path.join(A, "photo.jpg"));
await prepMusic(path.join(ROOT, "media/music/beats/romance/lovesong.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "future-goal-is-you", name: "My future goal is you" }, null, 2));
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(here, "build", "raw.mp4"), out = path.join(here, "out"), mp4 = path.join(out, "my-future-goal-is-you.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "copy", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log(path.relative(ROOT, mp4));
