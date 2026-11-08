// "Ant-Man or Spider-Man?" comedy Reel (9:16, 30s). Template: karaoke-flow · blush-luxe (random pick).
// Footage pre-cut (slow-mo + freezes) into projects/antbite/master.mp4 (personal, git-ignored).
import fs from "node:fs";
import path from "node:path";
import { hyperframes, render } from "../../lib/hyperframes.mjs";
import { prepMusic } from "../../lib/ffmpeg.mjs";
import { brandKit } from "../../lib/brands.mjs";
import { THEMES } from "../../lib/shorts.mjs";
import { ROOT, run, escapeHtml as h, log } from "../../lib/util.mjs";

const work = path.join(ROOT, "projects/antbite");
const W = 1080, H = 1920, FOOT = 27.0, TOTAL = 30.0;
const th = THEMES["blush-luxe"], pill = "#ecd3c8", gold = th.outro.accent, ink = "#1a1414";
const kit = brandKit({ brandKit: "rizco" });
const n3 = (x) => (+x).toFixed(3);
const rich = (s) => h(s).replace(/\*([^*]+)\*([.,!?…]*)/g, '<em>$1</em>$2');

// karaoke captions [start, end, text]
const caps = [
  [0.3, 2.6, "POV: your friend got bitten by *red ants*"], [2.8, 5.25, "…in *multiple* areas."],
  [9.6, 11.3, "his hand is… *changing*"],
  [15.0, 17.4, "trying the *web shooters*"], [17.6, 19.7, "…*nothing*. not even a thread."],
  [19.95, 21.95, "but the *confidence*?"], [22.2, 23.6, "*unmatched*."],
];
const capHtml = caps.map(([s, e, t], i) => {
  const ws = t.split(/(\*[^*]+\*[.,!?…]*|\s+)/).filter((x) => x && !/^\s+$/.test(x));
  return `<div id="cap${i}" class="clip cap" data-start="${s}" data-duration="${n3(e - s)}" data-track-index="3"><p>${ws.map((w, k) => `<span class="w" id="c${i}w${k}">${rich(w)}</span>`).join(" ")}</p></div>`;
}).join("\n");

const bites = [0.7, 1.15, 1.6, 2.05, 2.5, 3.0, 3.5, 4.0, 4.6];
const scanRes = [["ANT DNA", "73%"], ["SPIDER DNA", "0%"], ["ITCHINESS", "100%"]];
const ant = `<svg viewBox="0 0 64 40" class="icon"><g fill="${ink}"><ellipse cx="14" cy="22" rx="9" ry="7"/><ellipse cx="30" cy="22" rx="7" ry="6"/><ellipse cx="47" cy="21" rx="11" ry="9"/></g><g stroke="${ink}" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M26 27l-6 10M30 28v10M34 27l6 10M26 17l-6-9M34 17l6-9M10 16l-6-8M12 15l2-9"/></g></svg>`;
const web = `<svg viewBox="0 0 64 64" class="icon"><g stroke="${ink}" stroke-width="2.5" fill="none"><path d="M32 4v56M4 32h56M12 12l40 40M52 12L12 52"/><circle cx="32" cy="32" r="8"/><circle cx="32" cy="32" r="17"/><circle cx="32" cy="32" r="26"/></g></svg>`;

const js = [];
const T = (x) => js.push(x);
T(`tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${FOOT}, ease: "none" }, 0);`);
// karaoke: line slides up, words light up one by one
caps.forEach(([s, e, t], i) => {
  const n = t.split(/(\*[^*]+\*[.,!?…]*|\s+)/).filter((x) => x && !/^\s+$/.test(x)).length;
  const each = Math.min(0.32, (e - s - 0.5) / n);
  T(`tl.fromTo("#cap${i} p", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: "power3.out" }, ${s});`);
  T(`tl.fromTo("#cap${i} .w", { opacity: 0.32 }, { opacity: 1, duration: 0.1, stagger: ${n3(each)} }, ${n3(s + 0.12)});`);
  T(`tl.fromTo("#cap${i} em", { scale: 0.85 }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, ${n3(s + 0.12 + each * Math.max(0, n - 2))});`);
  T(`tl.to("#cap${i} p", { opacity: 0, duration: 0.15 }, ${n3(e - 0.15)});`);
});
// bite counter
T(`tl.fromTo("#bites", { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "back.out(2)" }, 0.5);`);
bites.forEach((b, i) => { T(`tl.set("#bn", { textContent: "${i + 1}" }, ${b}); tl.fromTo("#bites", { scale: 1.25 }, { scale: 1, duration: 0.25, ease: "back.out(3)" }, ${b});`); });
T(`tl.to("#bites", { opacity: 0, x: -60, duration: 0.3 }, 5.1);`);
// scanner
T(`tl.fromTo("#scan", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 5.45);`);
T(`tl.fromTo("#scanbar", { y: -40 }, { y: ${H}, duration: 1.3, ease: "none", repeat: 3 }, 5.5);`);
T(`tl.fromTo("#scan .brk", { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.08 }, 5.6);`);
T(`tl.fromTo("#scanfill", { scaleX: 0 }, { scaleX: 1, duration: 2.3, ease: "power1.inOut" }, 5.7);`);
T(`tl.to("#scanlbl", { opacity: 0, duration: 0.1 }, 8.0);`);
T(`tl.fromTo("#glitchfx", { opacity: 0 }, { keyframes: [{ opacity: 0.7, x: 14 }, { opacity: 0, x: -10 }, { opacity: 0.5, x: 6 }, { opacity: 0, x: 0 }], duration: 0.35 }, 8.0);`);
scanRes.forEach((_, i) => T(`tl.fromTo("#res${i}", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.3 }, ${n3(8.3 + i * 0.5)});`));
T(`tl.to("#scan", { opacity: 0, duration: 0.3 }, 11.1);`);
// debate
T(`tl.fromTo("#dim", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 11.4);`);
T(`tl.fromTo("#me", { x: -1100 }, { x: 0, duration: 0.5, ease: "power3.out" }, 11.5);`);
T(`tl.fromTo("#him", { x: 1100 }, { x: 0, duration: 0.5, ease: "power3.out" }, 12.6);`);
T(`tl.fromTo("#vs", { scale: 0, rotation: -30 }, { scale: 1, rotation: -8, duration: 0.45, ease: "back.out(3)" }, 13.4);`);
T(`tl.to("#me, #him, #vs, #dim", { opacity: 0, duration: 0.25 }, 14.55);`);
// web shooter attempts (from his hand, mid-frame)
[[15.5, 0], [16.6, 1]].forEach(([t0, k]) => {
  T(`tl.fromTo("#web${k} path", { strokeDashoffset: 900 }, { strokeDashoffset: 0, duration: 0.25, ease: "power2.out" }, ${t0});`);
  T(`tl.fromTo("#thwip${k}", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(3)" }, ${t0});`);
  T(`tl.to("#web${k}", { y: 260, rotation: 8, opacity: 0, duration: 0.7, ease: "power2.in", transformOrigin: "50% 0%" }, ${n3(t0 + 0.45)});`);
  T(`tl.to("#thwip${k}", { opacity: 0, duration: 0.3 }, ${n3(t0 + 0.8)});`);
});
// record scratch + freeze zoom + verdict
T(`tl.fromTo("#freeze", { scale: 1, filter: "saturate(1)" }, { scale: 1.32, filter: "saturate(0.35)", duration: 1.4, ease: "power3.out", transformOrigin: "50% 38%" }, 22.0);`);
T(`tl.fromTo("#flash", { opacity: 0.85 }, { opacity: 0, duration: 0.35 }, 22.0);`);
T(`tl.fromTo("#verdict", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 23.7);`);
T(`tl.fromTo("#verdict .vt", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 23.8);`);
["#v0", "#v1"].forEach((id, i) => {
  T(`tl.fromTo("${id}", { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35 }, ${n3(24.2 + i * 0.6)});`);
  T(`tl.fromTo("${id} .strike", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.out" }, ${n3(24.5 + i * 0.6)});`);
});
T(`tl.fromTo("#v2", { scale: 2.4, opacity: 0, rotation: -14 }, { scale: 1, opacity: 1, rotation: -4, duration: 0.3, ease: "power4.in" }, 25.6);`);
T(`tl.fromTo("#verdict", { x: -14 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" }, 25.9);`);
// end card
T(`tl.fromTo("#outro", { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: "power3.out" }, ${FOOT});`);
T(`tl.fromTo("#outro img, #outro .wordmark, #outro .tag, #outro .cta", { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.14, ease: "power3.out" }, ${n3(FOOT + 0.35)});`);

const css = `
@font-face{font-family:"Inter";font-weight:600;src:url(assets/inter-600.woff2) format("woff2")}
@font-face{font-family:"Inter";font-weight:800;src:url(assets/inter-800.woff2) format("woff2")}
@font-face{font-family:"Serif";font-weight:800;font-style:italic;src:url(assets/serif-800i.woff2) format("woff2")}
@font-face{font-family:"Mono";font-weight:600;src:url(assets/inter-600.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000;font-family:Inter,sans-serif}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
#foot{width:100%;height:100%;object-fit:cover}
#shade{background:linear-gradient(180deg,rgba(26,20,20,.5) 0%,rgba(26,20,20,0) 20%,rgba(26,20,20,0) 55%,rgba(26,20,20,.55) 85%)}
#shade .logo{position:absolute;top:92px;left:50%;height:56px;transform:translateX(-50%)}
.cap{display:flex;align-items:flex-start;justify-content:center;padding:${Math.round(H * 0.66)}px 70px 0;opacity:1}
.cap p{font-weight:800;font-size:76px;line-height:1.15;letter-spacing:-0.03em;color:#fff;text-align:center;text-shadow:0 5px 26px rgba(0,0,0,.45);opacity:0}
.w{display:inline-block}
.cap em{font-family:Serif,Georgia,serif;font-style:italic;color:${ink};background:${pill};padding:0 .22em .04em;border-radius:99px;text-shadow:none;display:inline-block}
#bites{inset:auto;top:200px;left:70px;display:flex;align-items:center;gap:14px;background:${pill};color:${ink};font-weight:800;font-size:44px;padding:14px 30px;border-radius:99px;opacity:0;transform-origin:left center}
#bites .dot{width:22px;height:22px;border-radius:50%;background:#c0392b}
#scan{opacity:0}
#scan .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(212,181,122,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(212,181,122,.12) 1px,transparent 1px);background-size:60px 60px}
#scanbar{position:absolute;left:0;right:0;top:0;height:40px;background:linear-gradient(180deg,rgba(212,181,122,0),rgba(212,181,122,.55),rgba(212,181,122,0))}
.brk{position:absolute;width:120px;height:120px;border-color:${gold};border-style:solid;border-width:0}
#b0{left:200px;top:640px;border-top-width:8px;border-left-width:8px}#b1{right:200px;top:640px;border-top-width:8px;border-right-width:8px}
#b2{left:200px;top:1220px;border-bottom-width:8px;border-left-width:8px}#b3{right:200px;top:1220px;border-bottom-width:8px;border-right-width:8px}
#panel{position:absolute;left:70px;right:70px;top:1420px;background:rgba(26,20,20,.82);border:2px solid ${gold};border-radius:24px;padding:26px 34px;color:#fff;font-weight:600;font-size:38px;letter-spacing:.06em}
#scanlbl{display:flex;flex-direction:column;gap:16px}
.pbar{height:16px;border-radius:99px;background:rgba(255,255,255,.15);overflow:hidden}#scanfill{height:100%;background:${gold};transform-origin:left center}
.res{display:flex;justify-content:space-between;opacity:0;margin-top:6px}.res b{color:${gold}}
#results{position:absolute;inset:26px 34px}
#glitchfx{background:linear-gradient(90deg,rgba(255,0,80,.35),rgba(0,255,220,.25));mix-blend-mode:screen;opacity:0}
#dim{background:rgba(26,20,20,.45);opacity:0}
.side{position:absolute;left:60px;right:60px;bottom:auto;border-radius:34px;padding:34px 40px;display:flex;align-items:center;gap:30px;box-shadow:0 20px 60px rgba(0,0,0,.3)}
#me{top:420px;background:${pill};color:${ink}}#him{top:1180px;background:#fff8f1;color:${ink}}
.side .who{font-weight:800;font-size:34px;letter-spacing:.14em;opacity:.6}
.side .say{font-weight:800;font-size:60px;line-height:1.05;letter-spacing:-0.025em}
.side .say em{font-family:Serif,serif;font-style:italic;color:#8a4b3c}
.icon{width:120px;height:90px;flex:none}
#vs{inset:auto;top:900px;left:50%;margin-left:-110px;width:220px;height:220px;border-radius:50%;background:${ink};color:${gold};display:flex;align-items:center;justify-content:center;font-family:Serif,serif;font-style:italic;font-weight:800;font-size:110px}
.webs{overflow:visible}.webs path{fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round;stroke-dasharray:900;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4))}
.thwip{inset:auto;font-family:Serif,serif;font-style:italic;font-weight:800;font-size:110px;color:#fff;text-shadow:0 6px 24px rgba(0,0,0,.4);opacity:0}
#thwip0{top:430px;left:600px}#thwip1{top:600px;left:120px}
#flash{background:#fff;opacity:0}
#verdict{background:rgba(26,20,20,.72);display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:0 100px;gap:26px;opacity:0;color:#fff8f1}
#verdict .vt{font-weight:800;font-size:52px;letter-spacing:.22em;color:${gold}}
.vl{position:relative;font-weight:800;font-size:96px;letter-spacing:-0.035em;line-height:1.05}
.strike{position:absolute;left:-6px;right:-6px;top:52%;height:12px;border-radius:6px;background:#c0392b;transform-origin:left center;transform:scaleX(0)}
#v2{font-size:108px;margin-top:20px;padding:10px 34px;border:6px solid ${gold};border-radius:20px;transform-origin:30% 50%}
#v2 em{font-family:Serif,serif;font-style:italic;color:${pill}}
#progress-track{inset:auto 0 0 0;height:10px;background:rgba(255,255,255,.18)}
#progress{position:absolute;inset:0;background:${pill};transform-origin:left center;transform:scaleX(0)}
#outro{background:${th.outro.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;text-align:center;color:#f6f1ea}
#outro img{height:170px}
#outro .wordmark{font-weight:800;font-size:30px;letter-spacing:.42em;margin-right:-.42em;color:${gold}}
#outro .tag{font-family:Serif,serif;font-style:italic;font-weight:800;font-size:66px;line-height:1.12}
#outro .cta{font-weight:800;font-size:40px;color:${ink};background:${pill};padding:20px 50px;border-radius:99px}`;

const webPath = (pts) => `M${pts.map((p) => p.join(" ")).join(" L")}`;
const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  <video id="foot" class="clip" src="assets/master.mp4" data-start="0" data-duration="${FOOT}" data-has-audio="true" data-volume="0.18" data-track-index="0"></video>
  <img id="freezeC" class="clip" src="assets/freezeC.png" style="width:100%;height:100%;object-fit:cover" data-start="11.4" data-duration="3.4" data-track-index="1" alt=""/>
  <img id="freeze" class="clip" src="assets/freezeF.png" style="width:100%;height:100%;object-fit:cover" data-start="22.0" data-duration="${n3(FOOT - 22.0)}" data-track-index="1" alt=""/>
  <div id="shade" class="clip" data-start="0" data-duration="${FOOT}" data-track-index="1"><img class="logo" src="assets/logo-light.png" alt=""/></div>
  <div id="bites" class="clip" data-start="0.4" data-duration="5.1" data-track-index="2"><span class="dot"></span>BITES: <span id="bn">0</span></div>
  <section id="scan" class="clip" data-start="5.4" data-duration="6.0" data-track-index="2"><div class="grid"></div><div id="scanbar"></div>
    ${[0, 1, 2, 3].map((i) => `<div class="brk" id="b${i}"></div>`).join("")}
    <div id="panel"><div id="scanlbl"><span>SCANNING SUBJECT…</span><div class="pbar"><div id="scanfill"></div></div></div>
      <div id="results">${scanRes.map(([k, v], i) => `<div class="res" id="res${i}"><span>${k}</span><b>${v}</b></div>`).join("")}</div></div></section>
  <div id="glitchfx" class="clip" data-start="7.95" data-duration="0.5" data-track-index="4"></div>
  <div id="dim" class="clip" data-start="11.4" data-duration="3.4" data-track-index="2"></div>
  <div id="me" class="clip side" data-start="11.4" data-duration="3.4" data-track-index="3">${ant}<div><div class="who">ME:</div><div class="say">he's turning into <em>Ant-Man</em></div></div></div>
  <div id="him" class="clip side" data-start="11.4" data-duration="3.4" data-track-index="3">${web}<div><div class="who">HIM:</div><div class="say">nah, I'm <em>Spider-Man</em></div></div></div>
  <div id="vs" class="clip" data-start="11.4" data-duration="3.4" data-track-index="4">vs</div>
  <svg id="web0" class="clip webs" data-start="15.5" data-duration="1.3" data-track-index="2" viewBox="0 0 ${W} ${H}"><path d="${webPath([[540, 800], [980, 250]])}"/><path d="${webPath([[540, 800], [1060, 420]])}"/><path d="${webPath([[540, 800], [900, 160]])}"/></svg>
  <svg id="web1" class="clip webs" data-start="16.6" data-duration="1.3" data-track-index="2" viewBox="0 0 ${W} ${H}"><path d="${webPath([[540, 820], [80, 300]])}"/><path d="${webPath([[540, 820], [20, 480]])}"/></svg>
  <div id="thwip0" class="clip thwip" data-start="15.5" data-duration="1.3" data-track-index="3">thwip?</div>
  <div id="thwip1" class="clip thwip" data-start="16.6" data-duration="1.3" data-track-index="3">thwip??</div>
${capHtml}
  <div id="flash" class="clip" data-start="22.0" data-duration="0.4" data-track-index="4"></div>
  <section id="verdict" class="clip" data-start="23.7" data-duration="${n3(FOOT - 23.7)}" data-track-index="3">
    <div class="vt">VERDICT:</div>
    <div class="vl" id="v0">not Ant-Man.<span class="strike"></span></div>
    <div class="vl" id="v1">not Spider-Man.<span class="strike"></span></div>
    <div class="vl" id="v2">just <em>Itchy-Man</em>.</div>
  </section>
  <section id="outro" class="clip" data-start="${FOOT}" data-duration="${TOTAL - FOOT}" data-track-index="5">
    <img src="assets/logo-light.png" alt="Riz.co"/><div class="wordmark">${h(kit.wordmark)}</div>
    <div class="tag">${h(kit.tagline).replace(". ", ".<br>")}</div><div class="cta">Tag your Itchy-Man</div>
  </section>
  <div id="progress-track" class="clip" data-start="0" data-duration="${FOOT}" data-track-index="6"><div id="progress"></div></div>
  <audio id="music1" src="assets/music.mp3" data-start="0" data-duration="22.0" data-media-start="0" data-volume="1" data-fade-in="0.1" data-fade-out="0.05"></audio>
  <audio id="music2" src="assets/music.mp3" data-start="23.7" data-duration="${n3(TOTAL - 23.7)}" data-media-start="23.7" data-volume="1" data-fade-in="0.2" data-fade-out="1.6"></audio>
  ${bites.map((b, i) => `<audio id="bp${i}" src="assets/pop.wav" data-start="${b}" data-duration="0.09" data-volume="0.4"></audio>`).join("\n  ")}
  <audio id="glitch" src="assets/glitch.wav" data-start="7.95" data-duration="0.5" data-volume="0.45"></audio>
  ${scanRes.map((_, i) => `<audio id="bep${i}" src="assets/beep.wav" data-start="${n3(8.3 + i * 0.5)}" data-duration="0.09" data-volume="0.4"></audio>`).join("\n  ")}
  <audio id="boing" src="assets/boing.wav" data-start="13.4" data-duration="0.35" data-volume="0.55"></audio>
  <audio id="tw0" src="assets/thwip.wav" data-start="15.5" data-duration="0.12" data-volume="0.6"></audio>
  <audio id="tw1" src="assets/thwip.wav" data-start="16.6" data-duration="0.12" data-volume="0.6"></audio>
  <audio id="scratch" src="assets/scratch.wav" data-start="21.98" data-duration="0.75" data-volume="0.8"></audio>
  <audio id="stamp" src="assets/stamp.wav" data-start="25.85" data-duration="0.6" data-volume="0.8"></audio>
  <audio id="wh" src="assets/whoosh.wav" data-start="${n3(FOOT - 0.1)}" data-duration="0.45" data-volume="0.5"></audio>
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
cp("node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2", "inter-800.woff2");
cp("node_modules/@fontsource/playfair-display/files/playfair-display-latin-800-italic.woff2", "serif-800i.woff2");
cp(kit.logo.lightInk, "logo-light.png");
for (const s of ["beep", "glitch", "scratch", "stamp", "boing", "thwip"]) cp(`media/sfx/${s}.wav`, `${s}.wav`);
cp("media/music/beats/quirky/pop.wav", "pop.wav");
cp("media/music/beats/quirky/whoosh.wav", "whoosh.wav");
cp(path.join(work, "master.mp4"), "master.mp4");
cp(path.join(work, "seg/freezeF.png"), "freezeF.png");
cp(path.join(work, "seg/freezeC.png"), "freezeC.png");
await prepMusic(path.join(ROOT, "media/music/beats/quirky/fun.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "itchy-man", name: "Ant-Man or Spider-Man?" }, null, 2));
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(work, "raw-render.mp4"), out = path.join(work, "out"), mp4 = path.join(out, "itchy-man.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log(path.relative(ROOT, mp4));
