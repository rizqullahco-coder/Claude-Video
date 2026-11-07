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
const W = 1080, H = 1920, TOTAL = 25;
const C = { bg: "#fbf3e6", ink: "#5a3a22", blush: "#e3a093", soft: "#9a7a62", olive: "#4b531e" };
const kit = brandKit({ brandKit: "rizco" });
const n3 = (x) => (+x).toFixed(3);

const goals = ["a home full of laughter", "a business that grows", "a life full of barakah"];
const title = "my future goals:";
// timing (seconds)
const T = { title: 0.4, goal0: 2.6, gap: 1.5, but: 8.2, illo: 10.6, isyou: 12.2, photo: 16.4, end: 20.6 };

const hearts = Array.from({ length: 14 }, (_, i) => {
  const x = 90 + ((i * 137) % 900), size = 26 + ((i * 53) % 30), delay = T.illo + 0.3 + (i % 7) * 0.45, dur = 4.5 + (i % 4) * 0.6;
  return { x, size, delay, dur, drift: ((i % 3) - 1) * 40 };
});
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
#illo img{width:1000px;border-radius:40px;box-shadow:0 30px 80px rgba(90,58,34,.15)}
#illo .isyou{font-style:italic;font-weight:600;font-size:150px;line-height:1;opacity:0}
#illo .isyou em{color:${C.blush};font-style:italic}
.heart{position:absolute;bottom:-60px;opacity:0}
#photo{display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0}
.polaroid{background:#fffdf8;padding:28px 28px 120px;box-shadow:0 30px 90px rgba(90,58,34,.22);transform:rotate(-3deg);position:relative}
.polaroid img{display:block;width:640px;height:1000px;object-fit:cover;object-position:50% 35%}
.polaroid .cap{position:absolute;left:0;right:0;bottom:30px;text-align:center;font-style:italic;font-weight:600;font-size:60px;color:${C.ink}}
.tape{position:absolute;top:-26px;left:50%;width:220px;height:56px;margin-left:-110px;background:rgba(227,160,147,.55);transform:rotate(2deg)}
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
    <img src="assets/illustration.jpg" alt=""/><div class="isyou">is <em>you.</em></div>
  </section>
  ${hearts.map((ht, i) => `<div id="h${i}" class="clip heart" style="left:${ht.x}px;right:auto;top:auto;width:${ht.size}px;height:${ht.size}px" data-start="${n3(ht.delay)}" data-duration="${n3(ht.dur)}" data-track-index="2">${heart(ht.size)}</div>`).join("\n  ")}
  <section id="photo" class="clip" data-start="${T.photo}" data-duration="${n3(T.end - T.photo + 0.6)}" data-track-index="1">
    <div class="polaroid"><div class="tape"></div><img src="assets/photo.jpg" alt=""/><div class="cap">the real us ♡</div></div>
  </section>
  <section id="end" class="clip" data-start="${T.end}" data-duration="${n3(TOTAL - T.end)}" data-track-index="1">
    <div class="hrt">${heart(110)}</div><div class="line">My future goal<br>is <em>you.</em></div>
  </section>
  <div id="brand" class="clip" data-start="${T.end}" data-duration="${n3(TOTAL - T.end)}" data-track-index="3"><img src="assets/logo.png" alt=""/><span>${h(kit.tagline)}</span></div>
  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-volume="0.7" data-fade-in="1.2" data-fade-out="3"></audio>
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
  tl.fromTo("#illo img", { y: 120, scale: 0.94 }, { y: 0, scale: 1, duration: 1.2, ease: "power3.out" }, ${T.illo});
  tl.to("#illo img", { y: -14, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: 2 }, ${n3(T.illo + 1.2)});
  tl.fromTo("#illo .isyou", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.6)" }, ${T.isyou});
  tl.to("#illo", { opacity: 0, duration: 0.6 }, ${n3(T.photo)});
  ${hearts.map((ht, i) => `tl.fromTo("#h${i}", { y: 0, x: 0, opacity: 0, scale: 0.6 }, { y: -${Math.round(H * 0.75)}, x: ${ht.drift}, opacity: 0.85, scale: 1, duration: ${n3(ht.dur)}, ease: "sine.out" }, ${n3(ht.delay)}); tl.to("#h${i}", { opacity: 0, duration: 0.8 }, ${n3(ht.delay + ht.dur - 0.8)});`).join("\n  ")}
  tl.fromTo("#photo", { opacity: 0 }, { opacity: 1, duration: 0.8 }, ${T.photo});
  tl.fromTo("#photo .polaroid", { y: 160, rotation: -9, scale: 0.92 }, { y: 0, rotation: -3, scale: 1, duration: 1.3, ease: "power3.out" }, ${T.photo});
  tl.fromTo("#photo .cap", { opacity: 0 }, { opacity: 1, duration: 0.8 }, ${n3(T.photo + 1.4)});
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
fs.copyFileSync(path.join(here, "assets-src/illustration.jpg"), path.join(A, "illustration.jpg"));
fs.copyFileSync(path.join(here, "assets-src/photo.jpg"), path.join(A, "photo.jpg"));
await prepMusic(path.join(ROOT, "media/music/beats/romance/beat.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "future-goal-is-you", name: "My future goal is you" }, null, 2));
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(here, "build", "raw.mp4"), out = path.join(here, "out"), mp4 = path.join(out, "my-future-goal-is-you.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "copy", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log(path.relative(ROOT, mp4));
