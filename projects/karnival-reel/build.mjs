// Personal short-trip Reel: BIBD Mega Karnival. 125 BPM grid ("Jomblo Happy" - Gamma1). No branding.
// Footage pre-cut frame-exact by projects/karnival/cut.py. Delivered without music (add the song in-app).
import fs from "node:fs";
import path from "node:path";
import { hyperframes, render } from "../../lib/hyperframes.mjs";
import { ROOT, run, escapeHtml as h, log } from "../../lib/util.mjs";

const work = path.join(ROOT, "projects/karnival");
const W = 1080, H = 1920, B = 60 / 125;
const { starts, beats } = JSON.parse(fs.readFileSync(path.join(work, "timing.json"), "utf8"));
const CLIP = beats * B, END = 8 * B, TOTAL = +(CLIP + END).toFixed(3);
const n3 = (x) => (+x).toFixed(3);
const gold = "#ffd34d";
const rich = (s) => h(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");

// [beat, lenBeats, text, tag, style]
const slams = [
  [0, 2, "SHORT", "", "huge"], [2, 2, "TRIP.", "", "huge"],
  [4, 2, "BIBD MEGA", "", ""], [6, 2, "KARNIVAL", "18–22 NOV 2026", ""],
  [8, 2, "NOW", "", "huge"], [10, 2, "*boarding*", "ARRIVALS · DEPARTURES", ""],
  [12, 2, "AROUND", "", ""], [14, 2, "THE *world*", "", ""], [16, 4, "IN ONE NIGHT.", "", ""],
  [20, 2, "AFRICA", "", ""], [22, 2, "MAIN STAGE", "", ""],
  [24, 2, "TEST DRIVE?", "", ""], [26, 2, "*just looking*", "(for now)", ""],
  [28, 4, "SCREEN *goals*", "", ""],
  [32, 4, "SHORT TRIP,", "", ""], [36, 4, "*big vibes.*", "", "huge"],
];
const js = [];
const T = (x) => js.push(x);
slams.forEach(([b, len, , tag], i) => {
  const s = b * B, e = (b + len) * B;
  T(`tl.set("#s${i}", { opacity: 1 }, ${n3(s)});`);
  T(`tl.fromTo("#s${i} .big", { scale: 1.9, rotation: ${i % 2 ? 5 : -5}, opacity: 0 }, { scale: 1, rotation: ${i % 2 ? 2 : -2}, opacity: 1, duration: 0.12, ease: "power4.out" }, ${n3(s)});`);
  T(`tl.to("#s${i} .big", { scale: 1.07, duration: ${n3(e - s - 0.12)}, ease: "none" }, ${n3(s + 0.12)});`);
  if (tag) T(`tl.fromTo("#s${i} .tag", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.15, ease: "back.out(3)" }, ${n3(s + B)});`);
  T(`tl.set("#s${i}", { opacity: 0 }, ${n3(e)});`);
});
const cuts = starts.slice(1, -1);
cuts.forEach((t, i) => T(`tl.fromTo("#fl${i}", { opacity: 0.6 }, { opacity: 0, duration: 0.12 }, ${n3(t)});`));
// beat pulse on the vignette (every beat)
for (let b = 0; b < beats; b++) T(`tl.fromTo("#vig", { opacity: 1 }, { opacity: 0.75, duration: ${n3(B * 0.9)}, ease: "power2.out" }, ${n3(b * B)});`);
T(`tl.fromTo("#endfl", { opacity: 1 }, { opacity: 0, duration: 0.3 }, ${n3(CLIP)});`);
T(`tl.fromTo("#end .a", { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.14, ease: "power4.out" }, ${n3(CLIP)});`);
T(`tl.fromTo("#end .b", { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.14, ease: "power4.out" }, ${n3(CLIP + 2 * B)});`);
T(`tl.fromTo("#end .c", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, ${n3(CLIP + 4 * B)});`);
T(`tl.to("#end", { opacity: 0, duration: 0.5 }, ${n3(TOTAL - 0.5)});`);

const css = `
@font-face{font-family:"Inter";font-weight:800;src:url(assets/inter-800.woff2) format("woff2")}
@font-face{font-family:"Inter";font-weight:600;src:url(assets/inter-600.woff2) format("woff2")}
@font-face{font-family:"Serif";font-weight:800;font-style:italic;src:url(assets/serif-800i.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000;font-family:Inter,sans-serif}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
#foot{width:100%;height:100%;object-fit:cover}
#vig{background:radial-gradient(120% 90% at 50% 45%,rgba(0,0,0,0) 50%,rgba(0,0,0,.55) 100%),linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.45) 100%)}
.slam{display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:${Math.round(H * 0.42)}px;opacity:0;text-align:center}
.slam .big{font-weight:800;font-size:150px;line-height:.95;letter-spacing:-0.045em;color:#fff;text-shadow:0 8px 40px rgba(0,0,0,.6);padding:0 40px}
.slam.huge .big{font-size:250px}
.slam .big em{font-family:Serif,serif;font-style:italic;color:${gold};letter-spacing:-0.01em;margin-left:.12em}
.slam .tag{margin-top:26px;font-weight:600;font-size:38px;letter-spacing:.24em;margin-right:-.24em;color:#000;background:${gold};padding:12px 26px;opacity:0}
.flash{background:#fff;opacity:0}
#end{background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff;gap:10px}
#end .a{font-weight:800;font-size:150px;letter-spacing:-0.045em;line-height:.95}
#end .b{font-family:Serif,serif;font-style:italic;font-weight:800;font-size:150px;color:${gold};line-height:1.05}
#end .c{margin-top:40px;font-weight:600;font-size:32px;letter-spacing:.32em;margin-right:-.32em;color:#bbb}
#endfl{background:#fff;opacity:0}`;

const sfx = [];
const A = (id, f, t, d, v) => sfx.push(`<audio id="${id}" src="assets/${f}.wav" data-start="${n3(Math.max(0, t))}" data-duration="${d}" data-volume="${v}"></audio>`);
[4, 12, 20, 32].forEach((b, i) => A(`wh${i}`, "whoosh", b * B - 0.18, 0.45, 0.55));
[8, 24, 36].forEach((b, i) => A(`pp${i}`, "pop", b * B, 0.09, 0.55));
A("st", "stamp", CLIP, 0.6, 0.7);

const html = `<!doctype html><html lang="ms"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  <video id="foot" class="clip" src="assets/master.mp4" data-start="0" data-duration="${n3(CLIP)}" muted data-track-index="0"></video>
  <div id="vig" class="clip" data-start="0" data-duration="${n3(CLIP)}" data-track-index="1"></div>
  ${slams.map(([b, len, t, tag, st], i) => `<div id="s${i}" class="clip slam ${st}" data-start="${n3(b * B)}" data-duration="${n3(len * B)}" data-track-index="2"><div class="big">${rich(t)}</div>${tag ? `<div class="tag">${h(tag)}</div>` : ""}</div>`).join("\n  ")}
  ${cuts.map((t, i) => `<div id="fl${i}" class="clip flash" data-start="${n3(t)}" data-duration="0.15" data-track-index="3"></div>`).join("\n  ")}
  <section id="end" class="clip" data-start="${n3(CLIP)}" data-duration="${n3(END)}" data-track-index="0"><div class="a">SHORT TRIP.</div><div class="b">big memories.</div><div class="c">BIBD MEGA KARNIVAL · 2026</div></section>
  <div id="endfl" class="clip" data-start="${n3(CLIP)}" data-duration="0.35" data-track-index="3"></div>
  ${sfx.join("\n  ")}
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  ${js.join("\n  ")}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script></body></html>`;

const bd = path.join(work, "build"), As = path.join(bd, "assets");
fs.mkdirSync(As, { recursive: true });
fs.writeFileSync(path.join(bd, "index.html"), html);
const cp = (f, t) => fs.copyFileSync(path.isAbsolute(f) ? f : path.join(ROOT, f), path.join(As, t));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
cp("node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2", "inter-800.woff2");
cp("node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", "inter-600.woff2");
cp("node_modules/@fontsource/playfair-display/files/playfair-display-latin-800-italic.woff2", "serif-800i.woff2");
cp("media/music/beats/quirky/whoosh.wav", "whoosh.wav");
cp("media/music/beats/quirky/pop.wav", "pop.wav");
cp("media/sfx/stamp.wav", "stamp.wav");
cp(path.join(work, "master.mp4"), "master.mp4");
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "karnival", name: "Short trip · BIBD Mega Karnival" }, null, 2));
log(`total ${TOTAL}s`);
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(work, "raw-render.mp4"), out = path.join(work, "out"), mp4 = path.join(out, "short-trip-bibd-karnival.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log("RENDER COMPLETE " + path.relative(ROOT, mp4));
