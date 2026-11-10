// Personal doa + reflection Reel (Rizq & Aida). No branding. Slides land on bars of
// Maher Zain "Paradise" (listed 175 BPM -> felt as 87.5 BPM ballad, bar = 2.743s).
// Usage: node projects/doa-reel/build.mjs [--no-music] [--skip-render]
import fs from "node:fs";
import path from "node:path";
import { hyperframes, render } from "../../lib/hyperframes.mjs";
import { prepMusic } from "../../lib/ffmpeg.mjs";
import { ROOT, run, escapeHtml as h, log } from "../../lib/util.mjs";

const NO_MUSIC = process.argv.includes("--no-music");
const work = path.join(ROOT, "projects/doa");
const W = 1080, H = 1920, BAR = 4 * 60 / 87.5;
const n3 = (x) => (+x).toFixed(3);
const gold = "#d8b878", cream = "#f7f1e3";

// slides: { ar?, tr?, en?, ms?, bars, img? }
const S = [
  { kind: "dua", ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنِّي أَشْهَدُ أَنَّكَ أَنْتَ اللَّهُ", tr: "Allaahumma innee as-aluka bi annee ashhadu annaka ant-allaahu,", en: "O Allah, indeed, I ask You by my testifying that You are Allah,", bars: 2.5 },
  { kind: "dua", ar: "لاَ إِلَهَ إِلاَّ أَنْتَ، الأَحَدُ، الصَّمَدُ", tr: "laa ilaaha illaa ant, al-ahad us-samad,", en: "there is none worthy of worship except You, the One, as-Samad,", bars: 2.875 },
  { kind: "dua", ar: "الَّذِي لَمْ يَلِدْ، وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ", tr: "alladhee lam yalid wa lam yoolad, wa lam yakullahu kufuwan ahad.", en: "who does not beget, nor was begotten, and there is none who is like Him.", bars: 2.625 },
  { ms: "Kematian itu jauh lebih *pasti* daripada sebuah pernikahan.", bars: 2, big: true },
  { ms: "Mengapa terburu-buru mengejar *pelaminan*, sedangkan duduk di antara *dua sujud* pun masih kita lalaikan?", bars: 2 },
  { ms: "Sebelum mengejar bahagia bersama manusia, ada hubungan yang lebih utama untuk aku perbaiki: *hubungan dengan Allah*.", bars: 2 },
  { ms: "Aku tidak berhenti berharap, tetapi aku belajar untuk tidak *menggenggam* sesuatu yang belum tentu milikku.", bars: 2 },
  { ms: "Jika benar *Aida* jodoh yang Engkau tetapkan untukku, Ya Allah, satukanlah kami melalui jalan yang *paling indah*.", bars: 2, img: "illo" },
  { ms: "In shaa Allah, aku percaya pada *aturan-Mu*.", bars: 1.5, big: true, img: "photo" },
  { kind: "end", bars: 1.5 },
];
let t = 0;
for (const s of S) { s.start = +(t * BAR).toFixed(3); s.dur = +(s.bars * BAR).toFixed(3); t += s.bars; }
const TOTAL = +(t * BAR).toFixed(3);
const rich = (x) => h(x).replace(/\*([^*]+)\*/g, "<em>$1</em>");

const js = [];
const T = (x) => js.push(x);
T(`tl.fromTo("#bgstars", { rotation: 0 }, { rotation: 18, duration: ${TOTAL}, ease: "none", transformOrigin: "50% 50%" }, 0);`);
T(`tl.fromTo("#glow", { scale: 0.9 }, { scale: 1.15, duration: ${TOTAL}, ease: "sine.inOut" }, 0);`);
for (let b = 0; b < t; b++) T(`tl.fromTo("#pulse", { opacity: 0.22 }, { opacity: 0, duration: ${n3(BAR * 0.9)}, ease: "power2.out" }, ${n3(b * BAR)});`);
S.forEach((s, i) => {
  const a = s.start, e = a + s.dur, id = `#sl${i}`;
  T(`tl.fromTo("${id}", { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power1.out" }, ${n3(a)});`);
  T(`tl.fromTo("${id} .r", { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", stagger: 0.35 }, ${n3(a + 0.1)});`);
  T(`tl.to("${id}", { opacity: 0, duration: 0.6, ease: "power1.in" }, ${n3(e - 0.6)});`);
  if (s.img) T(`tl.fromTo("#im${i}", { scale: 1.08 }, { scale: 1.0, duration: ${n3(s.dur)}, ease: "sine.out" }, ${n3(a)});`);
});

const arFont = (sz) => `font-family:Amiri,serif;font-size:${sz}px;line-height:1.9;direction:rtl;color:${gold}`;
const slideHtml = (s, i) => {
  let inner;
  if (s.kind === "dua") inner = `${i === 0 ? `<div class="r kicker">doa</div>` : ""}<div class="r ar">${h(s.ar)}</div><div class="r tr">${h(s.tr)}</div><div class="r en">${h(s.en)}</div>`;
  else if (s.kind === "end") inner = `<div class="r names">Rizq <em>&amp;</em> Aida</div><div class="r heart">🤍🤲🏻</div><div class="r ar2">حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ</div><div class="r tr2">Hasbunallahu wa ni'mal wakeel.</div>`;
  else inner = `<div class="r ms${s.big ? " big" : ""}">${rich(s.ms)}</div>`;
  const img = s.img ? `<img id="im${i}" class="bgimg" src="assets/${s.img}.jpg" alt=""/><div class="imshade"></div>` : "";
  return `<section id="sl${i}" class="clip slide${s.img ? " withimg" : ""} ${s.kind || "ms"}" data-start="${n3(s.start)}" data-duration="${n3(s.dur)}" data-track-index="2">${img}<div class="box">${inner}</div></section>`;
};

// original 8-point star lattice
const star = (cx, cy, r) => { const p = []; for (let k = 0; k < 16; k++) { const rr = k % 2 ? r * 0.62 : r, a = (Math.PI * 2 * k) / 16; p.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`); } return `<polygon points="${p.join(" ")}"/>`; };
let stars = ""; for (let y = -200; y < H + 300; y += 260) for (let x = -200; x < W + 300; x += 260) stars += star(x + ((y / 260) % 2 ? 130 : 0), y, 70);

const css = `
@font-face{font-family:"Amiri";src:url(assets/amiri-ar-400.woff2) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:"Amiri";src:url(assets/amiri-ar-700.woff2) format("woff2");font-weight:700;unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:"Gar";font-weight:500;src:url(assets/g-500.woff2) format("woff2")}
@font-face{font-family:"Gar";font-weight:500;font-style:italic;src:url(assets/g-500i.woff2) format("woff2")}
@font-face{font-family:"Gar";font-weight:600;font-style:italic;src:url(assets/g-600i.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#0a1512;font-family:Gar,Georgia,serif;color:${cream}}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
#bg{background:radial-gradient(110% 70% at 50% 42%, #173229 0%, #0c1a16 55%, #070e0c 100%)}
#bgstars{position:absolute;left:50%;top:50%;width:${W * 2}px;height:${H * 1.5}px;margin:-${H * 0.75}px 0 0 -${W}px;opacity:.07}
#bgstars polygon{fill:none;stroke:${gold};stroke-width:2}
#glow{position:absolute;left:50%;top:40%;width:1300px;height:1300px;margin:-650px 0 0 -650px;border-radius:50%;background:radial-gradient(circle, rgba(216,184,120,.18), rgba(216,184,120,0) 60%)}
#pulse{background:radial-gradient(70% 45% at 50% 45%, rgba(255,236,200,.5), rgba(255,236,200,0) 70%);opacity:0}
.slide{display:flex;align-items:center;justify-content:center;opacity:0}
.box{position:relative;width:100%;padding:0 96px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:34px}
.kicker{font-style:italic;font-weight:500;font-size:44px;letter-spacing:.25em;margin-right:-.25em;color:${gold};opacity:.85}
.ar{${arFont(78)}}
.tr{font-style:italic;font-weight:500;font-size:40px;line-height:1.35;color:#cfc6b2}
.en{font-weight:500;font-size:52px;line-height:1.3}
.ms{font-weight:500;font-size:64px;line-height:1.32}
.ms.big{font-size:82px;line-height:1.22}
.ms em,.names em{font-style:italic;font-weight:600;color:${gold}}
.withimg{align-items:flex-end;padding-bottom:300px}
.bgimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
#sl7 .bgimg{object-fit:contain;background:#f7f0e0}
.imshade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,14,12,.15) 0%,rgba(7,14,12,.2) 40%,rgba(7,14,12,.88) 72%,rgba(7,14,12,.95) 100%)}
.withimg .ms{font-size:56px;text-shadow:0 4px 24px rgba(0,0,0,.5)}
.end{background:#000}
.end .box{gap:26px}
.names{font-style:italic;font-weight:600;font-size:120px;line-height:1}
.heart{font-size:64px}
.ar2{${arFont(76)}}
.tr2{font-style:italic;font-weight:500;font-size:46px;color:#d9d0bc}`;

const html = `<!doctype html><html lang="ms"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  <div id="bg" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="0"><svg id="bgstars" viewBox="0 0 ${W} ${H}">${stars}</svg><div id="glow"></div></div>
  <div id="pulse" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="1"></div>
  ${S.map(slideHtml).join("\n  ")}
  <audio id="voice" src="assets/voice.wav" data-start="0.25" data-duration="21.6" data-volume="1"></audio>
  ${NO_MUSIC ? "" : `<audio id="music" src="assets/music.mp3" data-start="${n3(S[3].start)}" data-duration="${n3(TOTAL - S[3].start)}" data-media-start="0" data-volume="0.55" data-fade-in="1.6" data-fade-out="2.5"></audio>`}
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
const cp = (f, to) => fs.copyFileSync(path.isAbsolute(f) ? f : path.join(ROOT, f), path.join(A, to));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
cp("node_modules/@fontsource/amiri/files/amiri-arabic-400-normal.woff2", "amiri-ar-400.woff2");
cp("node_modules/@fontsource/amiri/files/amiri-arabic-700-normal.woff2", "amiri-ar-700.woff2");
for (const [w, s, n] of [[500, "normal", "g-500"], [500, "italic", "g-500i"], [600, "italic", "g-600i"]]) cp(`node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-${w}-${s}.woff2`, `${n}.woff2`);
cp("projects/future-goal-is-you/assets-src/illustration.jpg", "illo.jpg");
cp(path.join(work, "voice/voice-clean.wav"), "voice.wav");
cp("projects/future-goal-is-you/assets-src/photo.jpg", "photo.jpg");
if (!NO_MUSIC) await prepMusic(path.join(ROOT, "media/music/beats/luxury/hope.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "rizq-aida-doa", name: "Rizq & Aida doa" }, null, 2));
log(`total ${TOTAL}s, ${t} bars`);
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(work, "raw.mp4"), out = path.join(work, "out"), mp4 = path.join(out, `rizq-aida-doa${NO_MUSIC ? "-voice-only" : ""}.mp4`);
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", ...(NO_MUSIC ? ["-c:a", "aac", "-b:a", "192k", "-ar", "48000"] : ["-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]), "-movflags", "+faststart", mp4]);
log("RENDER COMPLETE " + path.relative(ROOT, mp4));
