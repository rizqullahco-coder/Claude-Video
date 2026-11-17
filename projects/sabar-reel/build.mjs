// "Akan ada hari baik" — original night-cabin scene (drawn in SVG), Quran 94:5, Riz.co branding.
import fs from "node:fs";
import path from "node:path";
import { hyperframes, render } from "../../lib/hyperframes.mjs";
import { prepMusic } from "../../lib/ffmpeg.mjs";
import { brandKit } from "../../lib/brands.mjs";
import { ROOT, run, escapeHtml as h, log } from "../../lib/util.mjs";

const kit = brandKit({ brandKit: "rizco" });
const W = 1080, H = 1920, TOTAL = 22, END = 4.2, SCENE = TOTAL - END;
const n3 = (x) => (+x).toFixed(3);
const work = path.join(ROOT, "projects/sabar-reel");

// deterministic pseudo-random
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const flakes = Array.from({ length: 110 }, () => ({ x: rnd() * W, y: -rnd() * H, r: 1.5 + rnd() * 3.5, d: 9 + rnd() * 9, dx: (rnd() - 0.5) * 140, o: 0.35 + rnd() * 0.55 }));

// mountain silhouettes
const ridge = (pts, fill, extra = "") => `<path d="M0 ${H} L${pts.map((p) => p.join(" ")).join(" L")} L${W} ${H} Z" fill="${fill}" ${extra}/>`;
const farR = [[0, 1080], [120, 980], [230, 1030], [360, 900], [470, 960], [560, 880], [700, 1000], [820, 940], [940, 1010], [1080, 960]];
const midL = [[0, 820], [90, 760], [170, 900], [260, 980], [330, 1080], [430, 1190], [520, 1300], [560, 1420]];
const scene = `
<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="sc">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2027"/><stop offset=".55" stop-color="#2a3038"/><stop offset="1" stop-color="#3a414a"/></linearGradient>
    <radialGradient id="moon" cx=".72" cy=".08" r=".45"><stop offset="0" stop-color="#dfe6ee" stop-opacity=".22"/><stop offset="1" stop-color="#dfe6ee" stop-opacity="0"/></radialGradient>
    <linearGradient id="rock" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3d434b"/><stop offset="1" stop-color="#1f2328"/></linearGradient>
    <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d0d8"/><stop offset="1" stop-color="#8a929c"/></linearGradient>
    <radialGradient id="win" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#moon)"/>
  <g id="far">${ridge(farR, "#2f353d")}</g>
  <g id="mid">
    <path d="M0 ${H} L0 760 L90 700 L160 820 L240 900 L300 1010 L380 1100 L470 1230 L540 1380 L600 1520 L640 ${H} Z" fill="url(#rock)"/>
    <path d="M0 900 L80 860 L150 930 L230 1000 L300 1100 L380 1190 L460 1320 L520 1460 L560 1600 L380 1640 L160 1560 L0 1500 Z" fill="url(#snow)" opacity=".85"/>
    <path d="M40 1000 L120 1060 M200 1120 L280 1200 M330 1260 L420 1350 M120 1300 L220 1380" stroke="#2a2f36" stroke-width="10" stroke-linecap="round" opacity=".5"/>
  </g>
  <g id="cabin">
    <path d="M520 ${H} L540 1580 L600 1510 L700 1480 L800 1500 L880 1560 L930 1640 L960 ${H} Z" fill="url(#rock)"/>
    <path d="M560 1600 L620 1540 L700 1515 L790 1530 L860 1580 L900 1650 L800 1690 L640 1690 Z" fill="url(#snow)" opacity=".7"/>
    <rect x="690" y="1340" width="40" height="190" fill="#15181c"/>
    <rect x="560" y="1240" width="400" height="110" rx="6" fill="#14171b"/>
    <rect x="600" y="1180" width="280" height="64" rx="4" fill="#1a1e23"/>
    <rect x="540" y="1350" width="440" height="10" fill="#0e1013"/>
    <line x1="640" y1="1180" x2="640" y2="900" stroke="#15181c" stroke-width="5"/><line x1="820" y1="1180" x2="820" y2="1000" stroke="#15181c" stroke-width="4"/><line x1="900" y1="1240" x2="900" y2="1090" stroke="#15181c" stroke-width="3"/>
    <circle cx="640" cy="900" r="5" fill="#ff6a5a" id="beacon"/>
    <circle cx="660" cy="1295" r="120" fill="url(#win)" id="glow"/>
    <rect x="610" y="1265" width="96" height="58" rx="3" fill="#f2b65e" id="w1"/>
    <rect x="730" y="1265" width="70" height="58" rx="3" fill="#2c3238"/>
    <rect x="820" y="1270" width="40" height="70" rx="2" fill="#e9a74f" id="w2"/>
    <rect x="640" y="1196" width="60" height="30" rx="2" fill="#d99a4a" opacity=".85" id="w3"/>
    <path d="M610 1294 h96 M658 1265 v58" stroke="#3a2a14" stroke-width="3"/>
  </g>
  <g id="fore">
    <path d="M0 ${H} L0 1700 L160 1650 L320 1720 L500 1690 L700 1760 L900 1700 L1080 1740 L1080 ${H} Z" fill="#8f97a1"/>
    <path d="M0 ${H} L0 1800 L260 1770 L560 1820 L820 1790 L1080 1830 L1080 ${H} Z" fill="#b8c0c9"/>
  </g>
  <g id="flakes">${flakes.map((f, i) => `<circle id="f${i}" cx="${f.x.toFixed(1)}" cy="${f.y.toFixed(1)}" r="${f.r.toFixed(1)}" fill="#fff" opacity="${f.o.toFixed(2)}"/>`).join("")}</g>
</svg>`;

const js = [];
const T = (x) => js.push(x);
T(`tl.fromTo("#cam", { scale: 1.0, y: 0 }, { scale: 1.08, y: 0, duration: ${SCENE}, ease: "sine.inOut", transformOrigin: "62% 80%" }, 0);`);
T(`tl.fromTo("#far", { x: 0 }, { x: -25, duration: ${SCENE}, ease: "none" }, 0);`);
T(`tl.fromTo("#fore", { x: 0 }, { x: 30, duration: ${SCENE}, ease: "none" }, 0);`);
flakes.forEach((f, i) => T(`tl.fromTo("#f${i}", { y: 0, x: 0 }, { y: ${Math.round(H * 1.4)}, x: ${Math.round(f.dx)}, duration: ${n3(f.d)}, ease: "none", repeat: ${Math.ceil(TOTAL / f.d)} }, 0);`));
for (let k = 0; k < 9; k++) {
  T(`tl.to("#w1, #glow", { opacity: ${[0.82, 1, 0.9, 1, 0.85, 1, 0.93, 1, 0.88][k]}, duration: 0.6, ease: "sine.inOut" }, ${n3(1.2 + k * 1.9)});`);
  T(`tl.to("#beacon", { opacity: ${k % 2 ? 1 : 0.15}, duration: 0.25 }, ${n3(0.8 + k * 1.6)});`);
}
const lines = [["#t1", 1.0], ["#t2", 3.4], ["#t3", 5.2], ["#t4", 7.6]];
lines.forEach(([id, t]) => T(`tl.fromTo("${id}", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.4, ease: "power2.out" }, ${t});`));
T(`tl.to("#txt", { opacity: 0, duration: 1.0 }, ${n3(SCENE - 1.2)});`);
T(`tl.fromTo("#end", { opacity: 0 }, { opacity: 1, duration: 0.9 }, ${n3(SCENE - 0.2)});`);
T(`tl.fromTo("#end img, #end .wm, #end .tg", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.0, stagger: 0.3, ease: "power2.out" }, ${n3(SCENE + 0.3)});`);

const css = `
@font-face{font-family:"Amiri";src:url(assets/amiri-ar-400.woff2) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:"Inter";font-weight:400;src:url(assets/inter-400.woff2) format("woff2")}
@font-face{font-family:"Inter";font-weight:600;src:url(assets/inter-600.woff2) format("woff2")}
@font-face{font-family:"Gar";font-weight:600;font-style:italic;src:url(assets/g-600i.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#1b2027;color:#eef2f6;font-family:Inter,sans-serif}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
#cam{position:absolute;inset:0}
.sc{position:absolute;inset:0}
#vig{background:radial-gradient(120% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)}
#logo{position:absolute;top:96px;left:50%;height:52px;transform:translateX(-50%);opacity:.85}
#txt{position:absolute;left:380px;right:60px;top:${Math.round(H * 0.25)}px;display:flex;flex-direction:column;gap:30px;text-shadow:0 2px 18px rgba(0,0,0,.55)}
#t1{font-weight:400;font-size:38px;letter-spacing:.09em;line-height:1.4}
#t2{font-family:Amiri,serif;font-size:76px;direction:rtl;text-align:left;line-height:1.5}
#t3{font-weight:400;font-size:36px;letter-spacing:.09em}
#t4{font-weight:400;font-size:28px;letter-spacing:.06em;line-height:1.45;color:#c9d1da;margin-top:10px}
#end{background:#14171b;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;text-align:center}
#end img{height:130px}
#end .wm{font-weight:600;font-size:28px;letter-spacing:.45em;margin-right:-.45em;color:#b9c28e}
#end .tg{font-family:Gar,serif;font-style:italic;font-weight:600;font-size:64px;line-height:1.12;color:#eef2f6}`;

const html = `<!doctype html><html lang="ms"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  <div id="scene" class="clip" data-start="0" data-duration="${SCENE}" data-track-index="0"><div id="cam">${scene}</div></div>
  <div id="vig" class="clip" data-start="0" data-duration="${SCENE}" data-track-index="1"><img id="logo" src="assets/logo-light.png" alt=""/>
    <div id="txt"><div id="t1">Akan ada hari baik,<br>bersabarlah</div><div id="t2">فَإِنَّ مَعَ الْعُسْرِ يُسْرًا</div><div id="t3">Fa inna ma'al usri yusra.</div><div id="t4">"Maka sesungguhnya bersama kesulitan ada kemudahan."<br>— Al-Insyirah 94:5</div></div>
  </div>
  <section id="end" class="clip" data-start="${n3(SCENE - 0.2)}" data-duration="${n3(END + 0.2)}" data-track-index="2"><img src="assets/logo-light.png" alt="Riz.co"/><div class="wm">${h(kit.wordmark)}</div><div class="tg">${h(kit.tagline).replace(". ", ".<br>")}</div></section>
  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-volume="0.8" data-fade-in="1.2" data-fade-out="2.5"></audio>
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
const cp = (f, to) => fs.copyFileSync(path.join(ROOT, f), path.join(A, to));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
cp("node_modules/@fontsource/amiri/files/amiri-arabic-400-normal.woff2", "amiri-ar-400.woff2");
cp("node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2", "inter-400.woff2");
cp("node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", "inter-600.woff2");
cp("node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2", "g-600i.woff2");
cp(kit.logo.lightInk, "logo-light.png");
await prepMusic(path.join(ROOT, "media/music/beats/luxury/hope.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "sabar", name: "Akan ada hari baik" }, null, 2));
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(work, "raw.mp4"), out = path.join(work, "out"), mp4 = path.join(out, "rizco-akan-ada-hari-baik.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log("RENDER COMPLETE " + path.relative(ROOT, mp4));
