// Hyper / Gen Z re-edit of the ALBA × 2 self-reward video (personal, no branding). 128 BPM grid.
// Usage: node projects/watch-hyper/build.mjs [--no-music] [--skip-render]
import fs from "node:fs";
import path from "node:path";
import { hyperframes, render } from "../../lib/hyperframes.mjs";
import { prepMusic } from "../../lib/ffmpeg.mjs";
import { ROOT, run, escapeHtml as h, log } from "../../lib/util.mjs";

const NO_MUSIC = process.argv.includes("--no-music");
const work = path.join(ROOT, "projects/watch");
const W = 1080, H = 1920, B = 60 / 128;
const segBeats = [2, 2, 2, 2, 1, 1, 4, 2, 2, 4, 4, 2, 2, 4, 4];
const starts = segBeats.reduce((a, b, i) => (a.push((a[i] ?? 0) + b), a), [0]).map((b) => +(b * B).toFixed(3));
const CLIP = starts[segBeats.length], FLICK = 8 * B, END = 4 * B, TOTAL = +(CLIP + FLICK + END).toFixed(3);
const n3 = (x) => (+x).toFixed(3);
const gold = "#e2c27d";

// [segment, big text, small tag, style]
const slams = [
  [0, "EARNED.", "", ""], [1, "NOT GIVEN.", "", ""], [2, "SELF-REWARD", "", ""], [3, "2026", "", "huge"],
  [4, "BOX 1", "", ""], [6, "THE *green*", "AL4785X1", ""], [7, "STEEL", "", ""], [8, "AUTOMATIC", "100M WR", ""],
  [9, "SUNBURST", "41 MM", ""], [10, "WORN.", "", "huge"], [11, "BOX 2", "", ""], [12, "THE *cream*", "AS9W05X1", ""],
  [13, "BOLD NUMBERS", "42 MM", ""], [14, "QUIETLY *bold.*", "", ""],
];
const rich = (s) => h(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");

const js = [];
const T = (x) => js.push(x);
slams.forEach(([k, big, tag], i) => {
  const s = starts[k], e = starts[k + 1];
  T(`tl.set("#s${i}", { opacity: 1 }, ${s});`);
  T(`tl.fromTo("#s${i} .big", { scale: 1.9, rotation: ${i % 2 ? 6 : -6}, opacity: 0 }, { scale: 1, rotation: ${i % 2 ? 2 : -2}, opacity: 1, duration: 0.12, ease: "power4.out" }, ${s});`);
  T(`tl.to("#s${i} .big", { scale: 1.06, duration: ${n3(e - s - 0.12)}, ease: "none" }, ${n3(s + 0.12)});`);
  if (tag) T(`tl.fromTo("#s${i} .tag", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.14, ease: "back.out(3)" }, ${n3(s + B)});`);
  T(`tl.set("#s${i}", { opacity: 0 }, ${n3(e)});`);
});
starts.slice(1, -1).forEach((t, i) => T(`tl.fromTo("#fl${i}", { opacity: ${[6, 12].includes(i + 1) ? 1 : 0.55} }, { opacity: 0, duration: ${[6, 12].includes(i + 1) ? 0.22 : 0.09} }, ${n3(t)});`));
// flicker ending: green / cream swap every beat
for (let b = 0; b < 8; b++) {
  const t = CLIP + b * B, img = b % 2 ? "cream" : "green";
  T(`tl.set("#fk-green", { opacity: ${img === "green" ? 1 : 0} }, ${n3(t)}); tl.set("#fk-cream", { opacity: ${img === "cream" ? 1 : 0} }, ${n3(t)});`);
  T(`tl.fromTo("#fk-${img}", { scale: 1.14 }, { scale: 1.02, duration: ${n3(B)}, ease: "power3.out" }, ${n3(t)});`);
  T(`tl.set("#fkl", { textContent: "${img.toUpperCase()}" }, ${n3(t)}); tl.fromTo("#fkl", { scale: 1.5 }, { scale: 1, duration: 0.12, ease: "power4.out" }, ${n3(t)});`);
}
T(`tl.fromTo("#fkq", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, ${n3(CLIP + 4 * B)});`);
T(`tl.fromTo("#endfl", { opacity: 1 }, { opacity: 0, duration: 0.25 }, ${n3(CLIP + FLICK)});`);
T(`tl.fromTo("#end .a", { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.14, ease: "power4.out" }, ${n3(CLIP + FLICK)});`);
T(`tl.fromTo("#end .b", { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.14, ease: "power4.out" }, ${n3(CLIP + FLICK + B)});`);
T(`tl.fromTo("#end .c", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${n3(CLIP + FLICK + 2 * B)});`);

const css = `
@font-face{font-family:"Inter";font-weight:800;src:url(assets/inter-800.woff2) format("woff2")}
@font-face{font-family:"Inter";font-weight:600;src:url(assets/inter-600.woff2) format("woff2")}
@font-face{font-family:"Serif";font-weight:800;font-style:italic;src:url(assets/serif-800i.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000;font-family:Inter,sans-serif}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
#foot{width:100%;height:100%;object-fit:cover}
#vig{background:radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)}
.slam{display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:${Math.round(H * 0.38)}px;opacity:0;text-align:center}
.slam .big{font-weight:800;font-size:150px;line-height:.95;letter-spacing:-0.045em;color:#fff;text-shadow:0 8px 40px rgba(0,0,0,.55);padding:0 50px}
.slam.huge .big{font-size:260px}
.slam .big em{font-family:Serif,serif;font-style:italic;color:${gold};letter-spacing:-0.01em;text-transform:none}
.slam .tag{margin-top:26px;font-weight:600;font-size:40px;letter-spacing:.3em;margin-right:-.3em;color:#000;background:${gold};padding:12px 26px;opacity:0}
.flash{background:#fff;opacity:0;pointer-events:none}
#fk img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0}
#fkl{position:absolute;left:0;right:0;top:${Math.round(H * 0.38)}px;text-align:center;font-weight:800;font-size:220px;letter-spacing:-0.05em;color:#fff;text-shadow:0 10px 50px rgba(0,0,0,.6)}
#fkq{position:absolute;left:0;right:0;top:${Math.round(H * 0.56)}px;text-align:center;font-family:Serif,serif;font-style:italic;font-weight:800;font-size:96px;color:${gold};opacity:0;text-shadow:0 6px 30px rgba(0,0,0,.6)}
#end{background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff}
#end .a{font-weight:800;font-size:150px;letter-spacing:-0.045em;line-height:.95}
#end .b{font-family:Serif,serif;font-style:italic;font-weight:800;font-size:240px;color:${gold};line-height:1}
#end .c{margin-top:30px;font-weight:600;font-size:34px;letter-spacing:.3em;margin-right:-.3em;color:#bbb}
#endfl{background:#fff;opacity:0}`;

const sfx = [];
const A = (id, f, t, d, v) => sfx.push(`<audio id="${id}" src="assets/${f}.wav" data-start="${n3(Math.max(0, t))}" data-duration="${d}" data-volume="${v}"></audio>`);
[0, 2, 6, 11, 14].forEach((k, i) => A(`wh${i}`, "whoosh", starts[k] - 0.18, 0.45, 0.6));
[6, 12].forEach((k, i) => A(`st${i}`, "stamp", starts[k], 0.6, 0.7));
[4, 11].forEach((k, i) => A(`pp${i}`, "pop", starts[k], 0.09, 0.6));
A("gl", "glitch", CLIP, 0.5, 0.5);
A("st9", "stamp", CLIP + FLICK, 0.6, 0.8);

const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  <video id="foot" class="clip" src="assets/master.mp4" data-start="0" data-duration="${CLIP}" data-has-audio="true" data-volume="0" data-track-index="0"></video>
  <div id="vig" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="1"></div>
  ${slams.map(([k, big, tag, st], i) => `<div id="s${i}" class="clip slam ${st}" data-start="${starts[k]}" data-duration="${n3(starts[k + 1] - starts[k])}" data-track-index="2"><div class="big">${rich(big)}</div>${tag ? `<div class="tag">${h(tag)}</div>` : ""}</div>`).join("\n  ")}
  ${starts.slice(1, -1).map((t, i) => `<div id="fl${i}" class="clip flash" data-start="${n3(t)}" data-duration="0.25" data-track-index="3"></div>`).join("\n  ")}
  <section id="fk" class="clip" data-start="${n3(CLIP)}" data-duration="${n3(FLICK)}" data-track-index="0"><img id="fk-green" src="assets/green.png" alt=""/><img id="fk-cream" src="assets/cream.png" alt=""/><div id="fkl">GREEN</div><div id="fkq">or…?</div></section>
  <section id="end" class="clip" data-start="${n3(CLIP + FLICK)}" data-duration="${n3(END)}" data-track-index="0"><div class="a">SELF-REWARD</div><div class="b">2026</div><div class="c">ALBA × 2</div></section>
  <div id="endfl" class="clip" data-start="${n3(CLIP + FLICK)}" data-duration="0.3" data-track-index="3"></div>
  ${sfx.join("\n  ")}
  ${NO_MUSIC ? "" : `<audio id="music" src="assets/music.mp3" data-start="0" data-duration="${TOTAL}" data-media-start="3.75" data-volume="1" data-fade-in="0.02" data-fade-out="0.8"></audio>`}
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  ${js.join("\n  ")}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script></body></html>`;

const bd = path.join(work, "build-hyper"), As = path.join(bd, "assets");
fs.mkdirSync(As, { recursive: true });
fs.writeFileSync(path.join(bd, "index.html"), html);
const cp = (f, t) => fs.copyFileSync(path.isAbsolute(f) ? f : path.join(ROOT, f), path.join(As, t));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
cp("node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2", "inter-800.woff2");
cp("node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", "inter-600.woff2");
cp("node_modules/@fontsource/playfair-display/files/playfair-display-latin-800-italic.woff2", "serif-800i.woff2");
for (const s of ["glitch", "stamp"]) cp(`media/sfx/${s}.wav`, `${s}.wav`);
cp("media/music/beats/quirky/whoosh.wav", "whoosh.wav");
cp("media/music/beats/quirky/pop.wav", "pop.wav");
cp(path.join(work, "master-hyper.mp4"), "master.mp4");
cp(path.join(work, "seg/green.png"), "green.png");
cp(path.join(work, "seg/cream.png"), "cream.png");
if (!NO_MUSIC) await prepMusic(path.join(ROOT, "media/music/beats/quirky/hype.wav"), path.join(As, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "alba-hyper", name: "ALBA × 2 hyper edit" }, null, 2));
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(work, "raw-hyper.mp4"), out = path.join(work, "out"), mp4 = path.join(out, `self-reward-2026-alba-hyper${NO_MUSIC ? "-no-music" : ""}.mp4`);
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log("RENDER COMPLETE " + path.relative(ROOT, mp4));
