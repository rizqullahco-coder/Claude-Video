// Personal (no branding): original sad story Reel ("Asal dia tak perlu risau"). Moody drawn backgrounds (rain, bokeh,
// lamp glow, grain), serif text, slides on the bars of a 72 BPM minor piano score. Riz.co branded.
import fs from "node:fs";
import path from "node:path";
import { hyperframes, render } from "../../lib/hyperframes.mjs";
import { prepMusic } from "../../lib/ffmpeg.mjs";
import { brandKit } from "../../lib/brands.mjs";
import { ROOT, run, escapeHtml as h, log } from "../../lib/util.mjs";

const kit = brandKit({ brandKit: "rizco" });
const W = 1080, H = 1920, BAR = 4 * 60 / 72;
const n3 = (x) => (+x).toFixed(3);
const work = path.join(ROOT, "projects/story-reel");

// tint: [top, bottom, glow]
const S = [
  { hd: "Dulu aku malu dengan pekerjaan suamiku.", bars: 1.5, tint: ["#1a1f2b", "#07090d", "#6f7fa0"], fx: "rain" },
  { hd: "Bila dia hilang kerja,", bd: "aku lebih risau apa kata orang daripada apa yang dia rasa.", bars: 2, tint: ["#22201f", "#0a0908", "#a88a63"], fx: "bokeh" },
  { hd: "Dia pulang lewat malam, penat.", bd: "Dan aku… diam saja.", bars: 1.5, tint: ["#141c22", "#050708", "#5d7a8c"], fx: "rain" },
  { hd: "Satu malam, aku terjumpa sebuah buku nota kecil dalam begnya.", bars: 1.5, tint: ["#2a2118", "#0b0806", "#d9a25c"], fx: "lamp" },
  { note: true, bd: "Senarai perbelanjaan rumah. Hutang yang dia bayar diam-diam. Dan satu ayat di bawahnya:", hand: "Asal dia tak perlu risau.", bars: 2, tint: ["#2a2118", "#0b0806", "#d9a25c"], fx: "lamp" },
  { hd: "Rupanya selama ini,", bd: "dia memikul semuanya seorang diri — demi aku.", bars: 1.5, tint: ["#1b1d26", "#060709", "#7d6f9c"], fx: "bokeh" },
  { hd: "Malam itu aku peluk dia lama.", bd: "Dan buat pertama kali, aku minta maaf.", bars: 1.5, tint: ["#26201c", "#0a0807", "#c49270"], fx: "bokeh" },
  { hd: "Cintai pasanganmu apa pun keadaannya.", bd: "Jangan tunggu sampai dia hilang untuk menghargainya.", rule: true, bars: 2, tint: ["#181b22", "#060708", "#8a96ad"], fx: "rain" },
];
let t = 0;
for (const s of S) { s.start = +(t * BAR).toFixed(3); s.dur = +(s.bars * BAR).toFixed(3); t += s.bars; }
const END = 1.8, FOOT = +(t * BAR).toFixed(3), TOTAL = +(FOOT + END).toFixed(3);

let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const fx = (s, i) => {
  if (s.fx === "rain") return Array.from({ length: 70 }, (_, k) => `<i class="drop" id="r${i}_${k}" style="left:${(rnd() * W).toFixed(0)}px;top:${(-rnd() * 400 - 200).toFixed(0)}px;height:${(60 + rnd() * 120).toFixed(0)}px;opacity:${(0.08 + rnd() * 0.22).toFixed(2)}"></i>`).join("");
  if (s.fx === "bokeh") return Array.from({ length: 14 }, (_, k) => { const r = 40 + rnd() * 140; return `<i class="bk" id="b${i}_${k}" style="left:${(rnd() * W - r).toFixed(0)}px;top:${(rnd() * H - r).toFixed(0)}px;width:${(2 * r).toFixed(0)}px;height:${(2 * r).toFixed(0)}px;background:${s.tint[2]};opacity:${(0.06 + rnd() * 0.12).toFixed(2)}"></i>`; }).join("");
  return `<i class="lampglow"></i><i class="lampcone"></i>`;
};
const slideHtml = (s, i) => {
  const text = s.note
    ? `<div class="cardwrap r"><div class="card"><div class="lines"></div><p class="nb">${h(s.bd)}</p><p class="hand">“${h(s.hand)}”</p></div></div>`
    : `<div class="hd r">${h(s.hd)}</div>${s.rule ? `<div class="rule r"></div>` : ""}${s.bd ? `<div class="bd r">${h(s.bd)}</div>` : ""}`;
  return `<section id="s${i}" class="clip slide" data-start="${n3(s.start)}" data-duration="${n3(s.dur + 0.6)}" data-track-index="0" style="background:linear-gradient(180deg,${s.tint[0]},${s.tint[1]})"><div class="fx" id="fx${i}">${fx(s, i)}</div><div class="vig"></div><div class="txt">${text}</div></section>`;
};

const js = [];
const T = (x) => js.push(x);
S.forEach((s, i) => {
  const a = s.start, e = a + s.dur;
  T(`tl.fromTo("#s${i}", { opacity: 0 }, { opacity: 1, duration: ${i ? 0.9 : 1.2}, ease: "sine.inOut" }, ${n3(a)});`);
  T(`tl.fromTo("#s${i} .txt", { scale: 1.0 }, { scale: 1.035, duration: ${n3(s.dur + 0.6)}, ease: "none" }, ${n3(a)});`);
  T(`tl.fromTo("#s${i} .r", { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ease: "power2.out", stagger: 0.7 }, ${n3(a + 0.3)});`);
  if (s.fx === "rain") T(`tl.fromTo("#fx${i} .drop", { y: 0 }, { y: ${H + 600}, duration: 1.6, ease: "none", stagger: { each: 0.03, repeat: ${Math.ceil(s.dur / 1.6) + 1} } }, ${n3(a)});`);
  if (s.fx === "bokeh") T(`tl.fromTo("#fx${i} .bk", { x: 0, y: 0 }, { x: 60, y: -90, duration: ${n3(s.dur + 0.6)}, ease: "sine.inOut", stagger: 0.05 }, ${n3(a)});`);
  if (s.fx === "lamp") T(`tl.to("#fx${i} .lampglow", { opacity: 0.85, duration: 0.5, yoyo: true, repeat: ${Math.round(s.dur / 1.0)}, ease: "sine.inOut" }, ${n3(a)});`);
  if (s.note) T(`tl.fromTo("#s${i} .hand", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1.4, ease: "power2.out" }, ${n3(a + 2.2)});`);
});
T(`tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${FOOT}, ease: "none" }, 0);`);
T(`tl.fromTo("#end", { opacity: 0 }, { opacity: 1, duration: 1.8, ease: "sine.inOut" }, ${n3(FOOT - 1.2)});`);

const css = `
@font-face{font-family:"PF";font-weight:700;src:url(assets/pf-700.woff2) format("woff2")}
@font-face{font-family:"PF";font-weight:500;font-style:italic;src:url(assets/pf-500i.woff2) format("woff2")}
@font-face{font-family:"CG";font-weight:500;src:url(assets/cg-500.woff2) format("woff2")}
@font-face{font-family:"CG";font-weight:600;font-style:italic;src:url(assets/cg-600i.woff2) format("woff2")}
@font-face{font-family:"Inter";font-weight:600;src:url(assets/inter-600.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000;color:#f3eee6}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
.slide{opacity:0;overflow:hidden}
.fx{position:absolute;inset:0}
.drop{position:absolute;width:2px;background:linear-gradient(180deg,rgba(220,230,255,0),rgba(220,230,255,.9))}
.bk{position:absolute;border-radius:50%;filter:blur(18px)}
.lampglow{position:absolute;left:-200px;top:-260px;width:1100px;height:1100px;border-radius:50%;background:radial-gradient(circle,rgba(255,190,110,.32),rgba(255,190,110,0) 62%);opacity:.65}
.lampcone{position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(160deg,rgba(255,200,130,.12),rgba(255,200,130,0) 45%)}
.vig{position:absolute;inset:0;background:radial-gradient(110% 80% at 50% 48%,rgba(0,0,0,0) 45%,rgba(0,0,0,.7) 100%)}
.slide::after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.035) 1px,transparent 1px);background-size:4px 4px}
.txt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 110px;gap:40px}
.hd{font-family:PF,serif;font-weight:700;font-size:76px;line-height:1.18;text-shadow:0 4px 30px rgba(0,0,0,.6)}
.bd{font-family:CG,serif;font-weight:500;font-size:62px;line-height:1.28;color:#e4ddd2;text-shadow:0 4px 24px rgba(0,0,0,.6)}
.rule{width:560px;height:2px;background:rgba(243,238,230,.7)}
.cardwrap{width:820px}
.card{position:relative;width:820px;padding:70px 70px 80px;background:#efe6d3;color:#2e2620;transform:rotate(-2.5deg);box-shadow:0 30px 80px rgba(0,0,0,.6);text-align:left}
.lines{position:absolute;inset:0;background-image:linear-gradient(transparent 62px,rgba(80,110,160,.25) 63px);background-size:100% 64px;opacity:.8}
.nb{position:relative;font-family:CG,serif;font-weight:500;font-size:50px;line-height:1.28}
.hand{position:relative;margin-top:36px;font-family:PF,serif;font-style:italic;font-weight:500;font-size:64px;color:#3a2a6a}
#progress-track{inset:auto 0 0 0;height:6px;background:rgba(255,255,255,.08)}
#progress{position:absolute;inset:0;background:rgba(243,238,230,.6);transform-origin:left center;transform:scaleX(0)}
#logo{position:absolute;top:96px;left:50%;height:52px;transform:translateX(-50%);opacity:.8}
#end{background:#0b0b0d;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;text-align:center;opacity:0}
#end img{height:130px}
#end .wm{font-family:Inter,sans-serif;font-weight:600;font-size:28px;letter-spacing:.45em;margin-right:-.45em;color:#b9c28e}
#end .tg{font-family:CG,serif;font-style:italic;font-weight:600;font-size:66px;line-height:1.12}`;

const html = `<!doctype html><html lang="ms"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  ${S.map(slideHtml).join("\n  ")}
  <div id="progress-track" class="clip" data-start="0" data-duration="${FOOT}" data-track-index="2"><div id="progress"></div></div>
  <section id="end" class="clip" data-start="${n3(FOOT - 1.2)}" data-duration="${n3(END + 1.2)}" data-track-index="3" style="background:#000"></section>
  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-volume="0.95" data-fade-in="1.0" data-fade-out="3"></audio>
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
cp("node_modules/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2", "pf-700.woff2");
cp("node_modules/@fontsource/playfair-display/files/playfair-display-latin-500-italic.woff2", "pf-500i.woff2");
cp("node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2", "cg-500.woff2");
cp("node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2", "cg-600i.woff2");
cp("node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", "inter-600.woff2");
await prepMusic(path.join(ROOT, "media/music/beats/luxury/sad.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "asal-dia-tak-perlu-risau", name: "Asal dia tak perlu risau" }, null, 2));
log(`total ${TOTAL}s`);
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(work, "raw.mp4"), out = path.join(work, "out"), mp4 = path.join(out, "asal-dia-tak-perlu-risau.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log("RENDER COMPLETE " + path.relative(ROOT, mp4));
