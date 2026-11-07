// Animated version of the "80/20 Rule for Small Business Owners" poster (9:16).
// Voice: local TTS (buildSceneVoice). Visuals: HyperFrames + GSAP. Finish: FFmpeg.
// Usage: node projects/rizco-8020-video/build.mjs [--skip-render]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSceneVoice } from "../../lib/scenes.mjs";
import { hyperframes, render } from "../../lib/hyperframes.mjs";
import { prepMusic } from "../../lib/ffmpeg.mjs";
import { brandKit } from "../../lib/brands.mjs";
import { ROOT, run, escapeHtml as h, log } from "../../lib/util.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const W = 1080, H = 1920;
const C = { bg: "#eceee4", band: "#dde3cc", ink: "#1e2114", olive: "#4b531e", lite: "#a9b46f", seg: "#f6f7f1", line: "#c9cfb8", soft: "#5d6150" };
const kit = brandKit({ brandKit: "rizco" });
const n3 = (x) => (+x).toFixed(3);

const TIPS = [
  { t: "Serve Your Best Customers", say: "Serve your best customers first.", icon: `<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>` },
  { t: "Push Your Best Sellers", say: "Push the products that actually sell.", icon: `<path d="M5 20v-6M10 20v-10M15 20v-7M20 20V5"/><path d="M3 21h18"/>` },
  { t: "Find Your Biggest Costs", say: "Find the few costs eating most of your money.", icon: `<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20"/><path d="M10 7.5v5M8.5 8.5h2.2a1 1 0 0 1 0 2H9.3a1 1 0 0 0 0 2h2.2"/>` },
  { t: "Fix Cash Flow First", say: "Fix cash flow. Invoice fast, and follow up.", icon: `<path d="M4 12a8 8 0 0 1 13.7-5.6"/><path d="M20 12a8 8 0 0 1-13.7 5.6"/><path d="M18 3v4h-4M6 21v-4h4"/>` },
  { t: "Cut Busy Work", say: "Cut busy work that doesn't make money.", icon: `<circle cx="6" cy="7" r="2.6"/><circle cx="6" cy="17" r="2.6"/><path d="M8.2 8.6L20 18M8.2 15.4L20 6"/>` },
  { t: "Automate the Routine", say: "Automate routine work with templates.", icon: `<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>` },
  { t: "Review Your Prices", say: "Review your prices.", icon: `<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>` },
  { t: "Check Numbers Monthly", say: "And check your numbers every month.", icon: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>` },
];

const project = {
  name: "rizco-80-20-rule",
  voice: "af_heart", voiceSpeed: 0.96,
  pronounce: { rizq: "rizk", Rizq: "Rizk" },
  ttsCacheDir: "projects/rizco-8020-video/tts-cache",
  pacing: { sentenceGap: 0.35, sceneLead: 0.35, sceneHold: 0.55 },
  scenes: [
    { say: ["The eighty twenty rule.", "Roughly eighty percent of your results come from twenty percent of your effort."], extraHold: 0.4 },
    { say: ["Here's how to use it in your business."], extraHold: 0.6 },
    ...TIPS.map((x) => ({ say: [x.say], extraHold: 0.35 })),
    { say: ["Find your twenty percent.", "Build your rizq. Don't wait for it."], extraHold: 0.4 },
  ],
  outro: { duration: 3.6 },
};

// Wheel geometry (octagon, segment 1 at the top)
const cx = W / 2, cy = 820, R = 430, ringOut = 196, ringIn = 158, pieR = 132, N = 8;
const ang = (i) => ((-90 - 180 / N + (360 / N) * i) * Math.PI) / 180;
const mid = (i) => (ang(i) + ang(i + 1)) / 2;
const pt = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
const P = (pts) => pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");
const poly = (r) => P(Array.from({ length: N }, (_, i) => pt(r, ang(i))));

function composition({ scenes, outro, total }) {
  const intro = scenes[0], how = scenes[1], tipsSc = scenes.slice(2, 10), fin = scenes[10];
  const tWheel = how.start; // wheel assembles
  const segs = TIPS.map((x, i) => {
    const [ix, iy] = pt((ringOut + R) / 2 + 8, mid(i));
    return `<g class="seg" id="seg${i}"><polygon class="segp" points="${P([pt(ringOut, ang(i)), pt(R, ang(i)), pt(R, ang(i + 1)), pt(ringOut, ang(i + 1))])}"/>
      <g class="ico" transform="translate(${(ix - 34).toFixed(1)},${(iy - 34).toFixed(1)}) scale(2.85)">${x.icon}</g>
</g>`;
  }).join("");
  const [wx1, wy1] = pt(pieR, -Math.PI / 2), [wx2, wy2] = pt(pieR, ((-90 + 72) * Math.PI) / 180);
  const cards = tipsSc.map((sc, i) => `<div id="card${i}" class="clip card" data-start="${n3(sc.start)}" data-duration="${n3(sc.end - sc.start)}" data-track-index="2">
    <div class="badge">${String(i + 1).padStart(2, "0")}</div><svg class="cico" viewBox="0 0 24 24">${TIPS[i].icon}</svg><div class="ctitle">${h(TIPS[i].t)}</div></div>`).join("\n");
  const pops = tipsSc.map((sc, i) => `<audio id="pop${i}" src="assets/pop.wav" data-start="${n3(sc.start + 0.05)}" data-duration="0.09" data-volume="0.35"></audio>`).join("\n");

  // GSAP timeline
  const js = [];
  const T = (s) => js.push(s);
  T(`tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${n3(outro.start)}, ease: "none" }, 0);`);
  // intro: title + big pie
  T(`tl.fromTo("#title .t1", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power4.out" }, 0.15);`);
  T(`tl.fromTo("#title .t2", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.45);`);
  T(`tl.fromTo("#pie", { scale: 0, svgOrigin: "${cx} ${cy}", }, { scale: 2.05, svgOrigin: "${cx} ${cy}",  duration: 0.8, ease: "back.out(1.6)" }, ${n3(intro.lines[0].start)});`);
  T(`tl.fromTo("#wedge", { scale: 0, rotation: -40, svgOrigin: "${cx} ${cy}", }, { scale: 1, rotation: 0, svgOrigin: "${cx} ${cy}",  duration: 0.7, ease: "back.out(2)" }, ${n3(intro.lines[1].start + 0.6)});`);
  T(`tl.fromTo("#lab20", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, ${n3(intro.lines[1].start + 2.4)});`);
  T(`tl.fromTo("#lab80", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, ${n3(intro.lines[1].start + 0.6)});`);
  // wheel assembles
  T(`tl.to("#pie", { scale: 1, svgOrigin: "${cx} ${cy}", duration: 0.8, ease: "power3.inOut" }, ${n3(tWheel)});`);
  T(`tl.to("#lab20, #lab80", { opacity: 0, duration: 0.3 }, ${n3(tWheel)});`);
  T(`tl.fromTo("#ring", { scale: 0.6, opacity: 0, svgOrigin: "${cx} ${cy}", }, { scale: 1, opacity: 1, svgOrigin: "${cx} ${cy}",  duration: 0.6, ease: "back.out(1.6)" }, ${n3(tWheel + 0.4)});`);
  T(`tl.fromTo(".seg", { scale: 0.5, opacity: 0, svgOrigin: "${cx} ${cy}", }, { scale: 1, opacity: 1, svgOrigin: "${cx} ${cy}",  duration: 0.45, ease: "back.out(1.8)", stagger: 0.09 }, ${n3(tWheel + 0.6)});`);
  T(`tl.fromTo("#nums", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ${n3(tWheel + 1.2)});`);
  T(`tl.fromTo("#outline", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ${n3(tWheel + 1.3)});`);
  T(`tl.fromTo("#mini20, #mini80", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ${n3(tWheel + 1.0)});`);
  // tips: highlight one segment at a time
  tipsSc.forEach((sc, i) => {
    const [dx, dy] = [Math.cos(mid(i)) * 26, Math.sin(mid(i)) * 26];
    const s = sc.start, e = sc.end;
    if (i === 0) T(`tl.to(".seg", { opacity: 0.42, duration: 0.3 }, ${n3(s)});`);
    T(`tl.to("#seg${i}", { opacity: 1, x: ${dx.toFixed(1)}, y: ${dy.toFixed(1)}, duration: 0.4, ease: "back.out(2)" }, ${n3(s)});`);
    T(`tl.to("#seg${i} .segp", { fill: "${C.lite}", duration: 0.3 }, ${n3(s)});`);
    T(`tl.fromTo("#seg${i} .ico", { scale: 2.85 }, { scale: 3.2, duration: 0.3, yoyo: true, repeat: 1, ease: "sine.inOut", svgOrigin: "12 12" }, ${n3(s)});`);
    if (i < 7) T(`tl.to("#seg${i}", { opacity: 0.42, x: 0, y: 0, duration: 0.3 }, ${n3(e - 0.05)}); tl.to("#seg${i} .segp", { fill: "${C.seg}", duration: 0.3 }, ${n3(e - 0.05)});`);
    T(`tl.fromTo("#card${i}", { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, ${n3(s)});`);
    T(`tl.fromTo("#card${i} .cico", { scale: 0.4, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2.5)" }, ${n3(s + 0.1)});`);
    T(`tl.to("#card${i}", { y: -40, opacity: 0, duration: 0.25 }, ${n3(e - 0.25)});`);
  });
  // finale: all light up, then "Find your 20%"
  T(`tl.to(".seg", { opacity: 1, x: 0, y: 0, duration: 0.3 }, ${n3(fin.start)});`);
  T(`tl.to(".segp", { fill: "${C.lite}", duration: 0.25, stagger: 0.08 }, ${n3(fin.start + 0.1)});`);
  T(`tl.fromTo("#pie", { scale: 1, svgOrigin: "${cx} ${cy}", }, { scale: 1.12, svgOrigin: "${cx} ${cy}",  duration: 0.35, yoyo: true, repeat: 1, ease: "sine.inOut" }, ${n3(fin.start + 0.8)});`);
  T(`tl.fromTo("#find", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, ${n3(fin.lines[0].start)});`);
  T(`tl.fromTo("#find .tag", { opacity: 0 }, { opacity: 1, duration: 0.5 }, ${n3(fin.lines[1].start)});`);
  // end card
  T(`tl.fromTo("#outro", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${n3(outro.start)});`);
  T(`tl.fromTo("#outro img", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.6)" }, ${n3(outro.start + 0.15)});`);
  T(`tl.fromTo("#outro .wordmark, #outro .otag, #outro .cta", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.2, ease: "power3.out" }, ${n3(outro.start + 0.6)});`);

  const css = `
@font-face{font-family:"Inter";font-weight:600;src:url(assets/inter-600.woff2) format("woff2")}
@font-face{font-family:"Inter";font-weight:800;src:url(assets/inter-800.woff2) format("woff2")}
@font-face{font-family:"Garamond";font-weight:600;font-style:italic;src:url(assets/garamond-600i.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.bg};font-family:Inter,sans-serif;color:${C.ink}}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
#bg{background:radial-gradient(120% 80% at 50% 40%, ${C.bg} 60%, #dfe2d3 100%)}
#bg .band{position:absolute;left:-60px;right:-60px;top:0;height:400px;background:${C.band};border-radius:0 0 50% 50% / 0 0 90px 90px;border-bottom:3px solid ${C.olive}}
#bg .logo{position:absolute;top:96px;left:50%;height:64px;transform:translateX(-50%)}
#title{position:absolute;top:190px;left:0;right:0;text-align:center}
#title .t1{font-weight:800;font-size:112px;letter-spacing:-0.04em;line-height:1}
#title .t2{font-weight:600;font-size:40px;letter-spacing:.06em;margin-top:12px}
svg.wheel{position:absolute;inset:0;overflow:visible}
.segp{fill:${C.seg};stroke:${C.line};stroke-width:2}
.seg{opacity:0}
.ico{fill:none;stroke:${C.ink};stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.num{font-family:Inter;font-weight:800;font-size:24px;fill:${C.ink};text-anchor:middle;dominant-baseline:central}
#ring{opacity:0} #nums{opacity:0}
#outline{opacity:0}
.plab{position:absolute;transform:translate(-50%,-50%);text-align:center;font-weight:800;line-height:1.05;opacity:0}
.card{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:${Math.round(cy + R + 80)}px;gap:18px;opacity:0}
.card .badge{font-weight:800;font-size:28px;letter-spacing:.2em;color:${C.seg};background:${C.olive};padding:8px 22px;border-radius:99px}
.card .cico{width:96px;height:96px;fill:none;stroke:${C.olive};stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.card .ctitle{font-weight:800;font-size:66px;letter-spacing:-0.03em;line-height:1.04;text-align:center;padding:0 80px}
#find{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:${Math.round(cy + R + 110)}px;gap:20px;opacity:0;text-align:center}
#find .big{font-weight:800;font-size:84px;letter-spacing:-0.035em}
#find .big em{font-family:Garamond,serif;font-style:italic;color:${C.olive};font-size:1.12em}
#find .tag{font-family:Garamond,serif;font-style:italic;font-weight:600;font-size:46px;color:${C.soft}}
#progress-track{inset:0 0 auto 0;height:10px;background:rgba(30,33,20,.08)}
#progress{position:absolute;inset:0;background:${C.olive};transform-origin:left center;transform:scaleX(0)}
#outro{background:${C.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;text-align:center;opacity:0}
#outro img{width:500px}
#outro .wordmark{font-weight:800;font-size:30px;letter-spacing:.45em;margin-right:-.45em;color:${C.olive}}
#outro .otag{font-family:Garamond,serif;font-style:italic;font-weight:600;font-size:78px;line-height:1.08}
#outro .cta{font-weight:800;font-size:40px;color:${C.seg};background:${C.olive};padding:22px 56px;border-radius:99px}`;

  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="${W}" data-height="${H}">
  <div id="bg" class="clip" data-start="0" data-duration="${n3(outro.start)}" data-track-index="0"><div class="band"></div><img class="logo" src="assets/logo-dark.png" alt=""/>
    <div id="title"><div class="t1">THE 80/20 RULE</div><div class="t2">FOR SMALL BUSINESS OWNERS</div></div>
    <svg class="wheel" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${segs}
      <g id="ring"><polygon points="${poly(ringOut)}" fill="${C.lite}"/><circle cx="${cx}" cy="${cy}" r="${ringIn}" fill="${C.seg}"/></g>
      <g id="pie"><circle cx="${cx}" cy="${cy}" r="${pieR}" fill="${C.ink}"/>
        <path id="wedge" d="M${cx},${cy} L${wx1.toFixed(1)},${wy1.toFixed(1)} A${pieR},${pieR} 0 0 1 ${wx2.toFixed(1)},${wy2.toFixed(1)} Z" fill="${C.lite}" stroke="${C.seg}" stroke-width="5" stroke-linejoin="round"/>
        <text id="mini20" x="${cx + 44}" y="${cy - 64}" font-family="Inter" font-weight="800" font-size="24" text-anchor="middle" fill="${C.ink}" opacity="0">20%</text>
        <text id="mini80" x="${cx - 16}" y="${cy + 40}" font-family="Inter" font-weight="800" font-size="38" text-anchor="middle" fill="${C.seg}" opacity="0">80%</text></g>
      <g id="nums">${TIPS.map((_, i) => { const [x, y] = pt((ringIn + ringOut) / 2, mid(i)); return `<text class="num" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${i + 1}</text>`; }).join("")}</g>
      <polygon id="outline" points="${poly(R)}" fill="none" stroke="${C.ink}" stroke-width="3"/>
    </svg>
    <div id="lab20" class="plab" style="left:${cx + 150}px;top:${cy - 330}px;font-size:56px">20%<br><span style="font-size:34px;font-weight:600">effort</span></div>
    <div id="lab80" class="plab" style="left:${cx - 40}px;top:${cy + 70}px;font-size:84px;color:${C.seg}">80%<br><span style="font-size:44px;font-weight:600">results</span></div>
  </div>
${cards}
  <div id="find" class="clip" data-start="${n3(fin.start)}" data-duration="${n3(fin.end - fin.start)}" data-track-index="2"><div class="big">Find your <em>20%</em>.</div><div class="tag">${h(kit.tagline)}</div></div>
  <section id="outro" class="clip" data-start="${n3(outro.start)}" data-duration="${n3(outro.dur)}" data-track-index="0">
    <img src="assets/logo-dark.png" alt="Riz.co"/><div class="wordmark">${h(kit.wordmark)}</div><div class="otag">${h(kit.tagline).replace(". ", ".<br>")}</div><div class="cta">Save this · Follow for more</div>
  </section>
  <div id="progress-track" class="clip" data-start="0" data-duration="${total}" data-track-index="3"><div id="progress"></div></div>
  <audio id="voice" src="assets/voice.wav" data-start="0" data-duration="${total}" data-volume="1"></audio>
  <audio id="whoosh0" src="assets/whoosh.wav" data-start="${n3(Math.max(0, tWheel - 0.2))}" data-duration="0.45" data-volume="0.4"></audio>
  <audio id="whoosh1" src="assets/whoosh.wav" data-start="${n3(outro.start - 0.3)}" data-duration="0.45" data-volume="0.4"></audio>
${pops}
  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${n3(outro.start)}" data-media-start="4.8" data-volume="0.18" data-fade-in="0.5" data-fade-out="0.4"></audio>
  <audio id="music-outro" src="assets/music.mp3" data-start="${n3(outro.start)}" data-duration="${n3(outro.dur)}" data-media-start="${n3(4.8 + outro.start)}" data-volume="0.6" data-fade-in="0.3" data-fade-out="1.6"></audio>
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  ${js.join("\n  ")}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script></body></html>`;
}

const work = path.join(here, "build"), bd = path.join(work, "vertical"), A = path.join(bd, "assets");
fs.mkdirSync(A, { recursive: true });
const voice = await buildSceneVoice(project, work);
log(`voice ${voice.total.toFixed(1)}s`);
fs.writeFileSync(path.join(bd, "index.html"), composition(voice));
const cp = (f, t) => fs.copyFileSync(path.join(ROOT, f), path.join(A, t));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
cp("node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", "inter-600.woff2");
cp("node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2", "inter-800.woff2");
cp("node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2", "garamond-600i.woff2");
cp(kit.logo.darkInk, "logo-dark.png");
cp("media/music/beats/c/whoosh.wav", "whoosh.wav");
cp("media/music/beats/c/pop.wav", "pop.wav");
fs.copyFileSync(voice.voiceFile, path.join(A, "voice.wav"));
await prepMusic(path.join(ROOT, "media/music/beats/c/beat.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: project.name, name: "80/20 Rule" }, null, 2));
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(work, "raw.mp4"), out = path.join(here, "out"), mp4 = path.join(out, `${project.name}.mp4`);
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "copy", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-ss", "8", "-i", raw, "-frames:v", "1", "-q:v", "2", path.join(out, `${project.name}-thumbnail.jpg`)]);
log(path.relative(ROOT, mp4));
