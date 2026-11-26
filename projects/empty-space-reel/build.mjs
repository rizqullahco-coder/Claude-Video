// Riz.co reminder reel: "The Empty Space" (49.5 s, 9:16, editorial-pop · ivory-gold).
// Original script and visuals (no third-party footage or quotes). An empty ring, the space left behind
// after letting go for Allah, fills piece by piece with what lasts. Hadith: Musnad Ahmad (sahih). Quran 13:28.
// Voice: local Kokoro (am_michael, 0.95x). Word timings: Scriptivox. Music (luxe piano) + SFX: generated locally.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hyperframes, render } from "../../lib/hyperframes.mjs";
import { prepMusic } from "../../lib/ffmpeg.mjs";
import { brandKit } from "../../lib/brands.mjs";
import { ROOT, run, escapeHtml as h, log } from "../../lib/util.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const kit = brandKit({ brandKit: "rizco" });
const W = 1080, H = 1920;
const n3 = (x) => (+x).toFixed(3);
// ivory-gold
const C = { iv: "#f2efe6", ink: "#121212", gold: "#a8935e", gold2: "#c4a96b", mut: "#6b665c", card: "#fbfaf5", dim: "#2a2824" };
const TOTAL = 49.5;
const SC = { s1: [0, 8.8], s2: [8.8, 14.8], s3: [14.8, 20.1], s4: [20.1, 31.3], s5: [31.3, 39.5], s6: [39.5, 44.2], end: [44.2, TOTAL] };
const DARK = new Set(["s2", "s4", "s6", "end"]);
const js = []; const T = (x) => js.push(x);
const fx = []; const sfx = (t, s, v = 0.3, d = 0.6) => fx.push([t, s, v, d]);
const pop = (sel, t, st = 0.1) => T(`tl.fromTo("${sel}", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, stagger: ${st}, ease: "back.out(2.2)" }, ${n3(t)});`);
const up = (sel, t, st = 0.1) => T(`tl.fromTo("${sel}", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: ${st}, ease: "power3.out" }, ${n3(t)});`);
const ws = (txt) => txt.split(" ").map((w) => { const m = w.match(/^\*(.+)\*([.,!?…”]*)$/); return `<span class="w">${m ? `<em>${h(m[1])}</em>${h(m[2])}` : h(w)}</span>`; }).join(" ");
const popWords = (sel, times) => times.forEach((t, i) => T(`tl.fromTo("${sel} .w:nth-child(${i + 1})", { scale: 0.5, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(2.6)" }, ${n3(t - 0.05)});`));

// ---------- captions (editorial-pop: ≤3 words, centred, pop) for s1–s4
const wl = fs.readFileSync(path.join(here, "vo/words.tsv"), "utf8").trim().split("\n").map((l) => { const [a, z, w] = l.split("\t"); return { a: +a, z: +z, w }; });
const wt = (word, after = 0) => wl.find((x) => x.a >= after && x.w.replace(/[^\w']/g, "").toLowerCase() === word.toLowerCase()).a;
const chunks = []; let cur = [];
wl.forEach((w, i) => { cur.push(w); const nx = wl[i + 1]; if (cur.length === 3 || /[.,!?]$/.test(w.w) || !nx || nx.a - w.z > 0.35) { chunks.push(cur); cur = []; } });
let capHtml = "";
chunks.splice(0, chunks.length, ...chunks.filter((c) => c[0].a < SC.s4[0] - 0.1));
chunks.forEach((c, i) => {
  const a = c[0].a, z = c[c.length - 1].z, next = chunks[i + 1] ? chunks[i + 1][0].a : z + 0.6;
  capHtml += `<div class="cap" id="cp${i}">${c.map((w) => `<span class="${/allah/i.test(w.w) ? "hl" : ""}">${h(w.w)}</span>`).join(" ")}</div>`;
  T(`tl.fromTo("#cp${i}", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2.4)" }, ${n3(a - 0.06)});`);
  T(`tl.to("#cp${i}", { opacity: 0, duration: 0.12 }, ${n3(Math.min(next, z + 0.8) - 0.12)});`);
});

const logo = (k) => `<img class="logo" src="assets/logo-${DARK.has(k) ? "light" : "dark"}.png" alt=""/>`;
const sec = (id, inner) => `<section id="${id}" class="clip scene ${DARK.has(id) ? "dk" : ""}" data-start="${n3(SC[id][0])}" data-duration="${n3(SC[id][1] - SC[id][0])}" data-track-index="0">${logo(id)}${inner}</section>`;

// ---------- the ring (its own track, centred at 540,900): empty dashed ring -> three gold segments
const RC = 320, RR = 250;
const segs = [0, 1, 2].map((k) => `<circle class="seg" id="sg${k}" cx="${RC}" cy="${RC}" r="${RR}" pathLength="300" fill="none" stroke="${C.gold2}" stroke-width="26" stroke-linecap="round" stroke-dasharray="0 300" opacity="0" transform="rotate(${-88 + k * 120} ${RC} ${RC})"/>`).join("");
const ring = `<div id="ringBox"><div id="glow"></div><svg viewBox="0 0 640 640" width="640" height="640">
<circle cx="${RC}" cy="${RC}" r="${RR}" fill="none" stroke="${C.gold}" stroke-width="6" stroke-dasharray="4 18" stroke-linecap="round" opacity=".7"/>${segs}</svg></div>`;
T(`tl.fromTo("#ringBox", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: "power3.out" }, 4.35);`);
// heartbeat in s2
[9.1, 9.9, 11.0, 11.8].forEach((t) => { T(`tl.fromTo("#ringBox", { scale: 1 }, { scale: 1.05, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, ${n3(t)});`); sfx(t, "thump", 0.4, 0.4); });
// fill segments with each remedy
const segT = [wt("talk"), wt("sit"), wt("marriage") - 0.6];
segT.forEach((t, k) => { T(`tl.set("#sg${k}", { opacity: 1 }, ${n3(t)}); tl.to("#sg${k}", { strokeDasharray: "94 300", duration: 1.0, ease: "power2.inOut" }, ${n3(t)});`); sfx(t + 0.2, "chime", 0.3, 1.2); });
T(`tl.to("#ringBox", { opacity: 0.12, scale: 0.92, duration: 0.6 }, 31.4);`);
T(`tl.to("#ringBox", { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }, 39.6); tl.fromTo("#glow", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out" }, 39.8);`);
T(`tl.fromTo("#ringBox svg", { rotation: 0 }, { rotation: 300, duration: 40, ease: "none" }, 4.35);`);

// ---------- scenes
const s1 = `<div class="hd" id="h1a">${ws("You let go.")}</div><div class="sub" id="h1b">${ws("For the sake of *Allah.*")}</div>
<div class="dot me" id="dme"></div><div class="dot them" id="dthem"></div><div class="hd lo" id="h1c">${ws("An *empty* space.")}</div>`;
popWords("#h1a", [wt("you"), wt("let"), wt("go")]);
popWords("#h1b", [wt("for"), wt("the"), wt("sake"), wt("of", 2.5), wt("allah")]);
pop("#s1 .dot", 0.5, 0.15);
T(`tl.to("#dthem", { x: 360, y: -60, opacity: 0, scale: 0.6, duration: 2.2, ease: "power2.in" }, 1.7);`); sfx(1.7, "drift", 0.25, 2.0);
T(`tl.to("#h1a, #h1b", { opacity: 0.25, duration: 0.4 }, 4.3);`); popWords("#h1c", [wt("an"), wt("empty"), wt("space")]);
T(`tl.to("#dme", { scale: 0.7, opacity: 0.8, duration: 1.2 }, 4.4);`);

const s2 = `<div class="hd" id="h2a">${ws("That ache isn't *weakness.*")}</div><div class="hd sm lo2" id="h2b">${ws("It's proof you chose *Allah.*")}</div>`;
popWords("#h2a", [wt("that", 8.9), wt("ache"), wt("isn't"), wt("weakness")]);
popWords("#h2b", [wt("it's"), wt("proof"), wt("chose") - 0.25, wt("chose"), wt("allah", 12)]);

const dis = ["Endless scrolling", "One more chat", "Old photos", "Late nights"];
const s3 = `<div class="hd" id="h3a">${ws("Don't fill it with…")}</div>
<div class="chips">${dis.map((d, i) => `<span class="chip" id="ch${i}">${h(d)}<i class="strike"></i></span>`).join("")}</div>
<div class="hd lo3" id="h3b">${ws("Fill it with what *lasts.*")}</div>`;
popWords("#h3a", [wt("don't"), wt("fill"), wt("that", 15) , wt("with", 15)]);
dis.forEach((_, i) => { pop(`#ch${i}`, 16.1 + i * 0.3); sfx(16.1 + i * 0.3, "pop", 0.22, 0.3); });
dis.forEach((_, i) => T(`tl.fromTo("#ch${i} .strike", { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: "power2.out" }, ${n3(17.4 + i * 0.12)});`));
sfx(17.4, "strike", 0.3, 0.3);
T(`tl.to("#s3 .chip", { y: 260, opacity: 0, rotation: (i) => (i % 2 ? 12 : -12), duration: 0.6, stagger: 0.08, ease: "power2.in" }, 17.95);`);
T(`tl.to("#h3a", { opacity: 0.25, duration: 0.3 }, 17.9);`); popWords("#h3b", [wt("fill", 17.8), wt("it", 17.8), wt("with", 17.8), wt("what", 17.8), wt("lasts")]);

const rem = [["01", "Talk to Allah", "the way you used to talk to them"], ["02", "Keep good company", "people who remind you of Him"], ["03", "Seek marriage", "the halal way, if your heart wants it"]];
const s4 = `<div class="kick">FILL THE SPACE WITH</div>
<div class="rows">${rem.map(([n, t, s], i) => `<div class="row" id="rw${i}"><b>${n}</b><div><span>${h(t)}</span><i>${h(s)}</i></div></div>`).join("")}</div>`;
up("#s4 .kick", 20.2); rem.forEach((_, i) => up(`#rw${i}`, segT[i] + 0.1));

const s5 = `<div class="hcard"><div class="q">“</div><div class="ht" id="ht">${ws("Whoever leaves something for Allah, Allah will replace it with something *better.*")}</div>
<div class="src"><span class="ar">ﷺ</span> The Prophet · Musnad Ahmad (sahih)</div></div>`;
const hw = ["whoever", "leaves", "something", "for", "allah", "allah", "will", "replace", "it", "with", "something", "better"];
popWords("#ht", [34.32, 34.72, 35.2, 35.44, 35.76, 36.48, 36.88, 37.04, 37.6, 37.84, 38.16, 38.48]); // Scriptivox timings
up("#s5 .hcard", 31.5); up("#s5 .src", 38.9);

const s6 = `<div class="en" id="en">${ws("Truly, in the remembrance of Allah, hearts find *rest.*")}</div>
<div class="ar13" id="ar13">أَلَا بِذِكْرِ ٱللَّهِ<br>تَطْمَئِنُّ ٱلْقُلُوبُ</div><div class="ref" id="ref">Ar-Ra‘d 13:28</div>`;
popWords("#en", [39.68, 40.32, 40.48, 40.56, 41.36, 41.36, 41.84, 42.56, 42.88]);
up("#ar13", 40.4); up("#ref", 42.0);

const end = `<img class="elogo" src="assets/logo-light.png" alt="Riz.co"/><div class="wm">${h(kit.wordmark)}</div><div class="tg">${h(kit.tagline).replace(". ", ".<br>")}</div><div class="cta">Send this to someone who needs it</div>`;
pop("#end .elogo", 44.45); up("#end .wm", 44.9); up("#end .tg", 45.3); pop("#end .cta", 46.6);

// wipes (editorial-pop)
const cuts = Object.values(SC).slice(1).map((s) => s[0]);
cuts.forEach((t, i) => { T(`tl.fromTo("#wp${i}", { xPercent: -101 }, { xPercent: 101, duration: 0.55, ease: "power3.inOut" }, ${n3(t - 0.28)});`); sfx(t - 0.28, "whoosh", 0.2, 0.5); });
T(`tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${n3(SC.end[0])}, ease: "none" }, 0);`);

const css = `
@font-face{font-family:"Inter";font-weight:600;src:url(assets/inter-600.woff2) format("woff2")}
@font-face{font-family:"Inter";font-weight:800;src:url(assets/inter-800.woff2) format("woff2")}
@font-face{font-family:"Serif";font-weight:800;font-style:italic;src:url(assets/serif-800i.woff2) format("woff2")}
@font-face{font-family:"Amiri";font-weight:700;src:url(assets/amiri-700.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.iv};font-family:Inter,sans-serif;color:${C.ink}}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
.scene{background:${C.iv};color:${C.ink};overflow:hidden}
.scene.dk{background:radial-gradient(90% 60% at 50% 47%, #22201c 0%, ${C.ink} 70%);color:${C.iv}}
.logo{position:absolute;top:84px;left:50%;height:58px;transform:translateX(-50%);z-index:5}
em{font-family:Serif,serif;font-style:italic;font-weight:800;background:linear-gradient(transparent 60%,${C.gold}99 60%,${C.gold}99 90%,transparent 90%);padding:0 .06em}
.dk em{color:${C.gold2};background:none}
.w{display:inline-block;opacity:0}
.hd{position:absolute;left:70px;right:70px;top:250px;text-align:center;font-weight:800;font-size:104px;line-height:1.04;letter-spacing:-0.045em;z-index:3}
.hd.sm{font-size:84px}
.sub{position:absolute;left:70px;right:70px;top:380px;text-align:center;font-weight:600;font-size:56px;letter-spacing:-0.02em;z-index:3}
.lo{top:1240px} .lo2{top:1250px} .lo3{top:1240px}
.dot{position:absolute;width:64px;height:64px;border-radius:50%;top:868px;opacity:0;z-index:3}
.dot.me{left:476px;background:${C.gold}} .dot.them{left:540px;background:${C.ink}}
#ringBox{position:absolute;left:220px;top:580px;width:640px;height:640px;z-index:2}
#ringBox svg{position:absolute;inset:0}
#glow{position:absolute;inset:-60px;border-radius:50%;background:radial-gradient(circle, rgba(196,169,107,.45) 0%, rgba(196,169,107,0) 62%);opacity:0}
.chips{position:absolute;left:250px;right:250px;top:690px;display:flex;flex-direction:column;align-items:center;gap:18px;z-index:3}
.chip{position:relative;font-weight:800;font-size:38px;padding:14px 28px;border-radius:99px;background:${C.card};border:3px solid ${C.ink};opacity:0;white-space:nowrap}
.strike{position:absolute;left:12px;right:12px;top:50%;height:6px;margin-top:-3px;background:#b8433a;border-radius:3px;transform-origin:0 50%;transform:scaleX(0)}
.kick{position:absolute;left:0;right:0;top:250px;text-align:center;font-weight:800;font-size:30px;letter-spacing:.34em;color:${C.gold2};opacity:0;z-index:3}
.rows{position:absolute;left:90px;right:90px;top:1250px;display:flex;flex-direction:column;gap:14px;z-index:3}
.row{display:flex;align-items:center;gap:24px;opacity:0}
.row b{flex:none;width:62px;height:62px;border-radius:50%;background:${C.gold2};color:${C.ink};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:24px}
.row span{display:block;font-weight:800;font-size:44px;letter-spacing:-0.03em;line-height:1.05}
.row i{display:block;font-family:Serif,serif;font-style:italic;font-weight:800;font-size:30px;color:#bdb6a6;margin-top:2px}
.hcard{position:absolute;left:70px;right:70px;top:600px;background:${C.card};border-radius:34px;padding:56px 56px 50px;box-shadow:0 30px 80px rgba(0,0,0,.12);border:2px solid ${C.gold}66;opacity:0;z-index:3}
.q{font-family:Serif,serif;font-style:italic;font-weight:800;font-size:200px;line-height:.6;color:${C.gold};height:90px}
.ht{font-weight:800;font-size:76px;line-height:1.1;letter-spacing:-0.035em}
.src{margin-top:36px;font-weight:600;font-size:30px;color:${C.mut};opacity:0}
.src .ar{font-family:Amiri,serif;font-size:40px;color:${C.gold}}
.en{position:absolute;left:80px;right:80px;top:300px;text-align:center;font-family:Serif,serif;font-style:italic;font-weight:800;font-size:66px;line-height:1.15;z-index:3}
.en em{color:${C.gold2}}
.ar13{position:absolute;left:220px;width:640px;top:780px;text-align:center;font-family:Amiri,serif;font-weight:700;font-size:70px;line-height:1.75;color:${C.iv};direction:rtl;opacity:0;z-index:3}
.ref{position:absolute;left:0;right:0;top:1300px;text-align:center;font-weight:800;font-size:30px;letter-spacing:.3em;color:${C.gold2};opacity:0;z-index:3}
#end{background:${C.ink};color:${C.iv};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:30px;padding:0 80px}
#end .logo{display:none}
.elogo{height:180px;opacity:0}
#end .wm{font-weight:800;font-size:34px;letter-spacing:.5em;margin-right:-.5em;color:${C.gold2};opacity:0}
#end .tg{font-family:Serif,serif;font-style:italic;font-weight:800;font-size:80px;line-height:1.1;opacity:0}
#end .cta{margin-top:24px;font-weight:800;font-size:36px;color:${C.ink};background:${C.gold2};padding:24px 44px;border-radius:99px;opacity:0}
#caps{position:absolute;left:0;right:0;top:1560px;height:200px;z-index:20;pointer-events:none}
.cap{position:absolute;left:60px;right:60px;top:0;text-align:center;font-weight:800;font-size:78px;letter-spacing:-0.04em;opacity:0;color:${C.gold}}
.cap .hl{font-family:Serif,serif;font-style:italic}
.wipe{background:${C.gold};z-index:30}
#progress-track{position:absolute;inset:auto 0 0 0;height:12px;background:rgba(168,147,94,.2);z-index:25}
#progress{position:absolute;inset:0;background:${C.gold};transform-origin:left center;transform:scaleX(0)}`;

const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${n3(TOTAL)}" data-width="${W}" data-height="${H}">
  ${sec("s1", s1)}
  ${sec("s2", s2)}
  ${sec("s3", s3)}
  ${sec("s4", s4)}
  ${sec("s5", s5)}
  ${sec("s6", s6)}
  ${sec("end", end)}
  <div id="ringTrack" class="clip" data-start="4.3" data-duration="${n3(SC.end[0] - 4.3)}" data-track-index="1">${ring}</div>
  <div id="caps" class="clip" data-start="0" data-duration="${n3(SC.s4[0])}" data-track-index="2">${capHtml}</div>
  ${cuts.map((t, i) => `<div id="wp${i}" class="clip wipe" data-start="${n3(t - 0.3)}" data-duration="0.62" data-track-index="3"></div>`).join("\n  ")}
  <div id="progress-track" class="clip" data-start="0" data-duration="${n3(SC.end[0])}" data-track-index="4"><div id="progress"></div></div>
  <audio id="vox" src="assets/voice.wav" data-start="0" data-duration="${n3(TOTAL)}" data-volume="1"></audio>
  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${n3(TOTAL)}" data-media-start="0" data-volume="0.34" data-fade-in="1.2" data-fade-out="3"></audio>
  ${fx.map(([t, s, v, d], i) => `<audio id="fx${i}" src="assets/${s}.wav" data-start="${n3(t)}" data-duration="${n3(d)}" data-volume="${v}"></audio>`).join("\n  ")}
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  ${js.join("\n  ")}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script></body></html>`;

// soft SFX, generated locally (numpy)
const sfxDir = path.join(here, "sfx");
if (!fs.existsSync(path.join(sfxDir, "thump.wav"))) {
  fs.mkdirSync(sfxDir, { recursive: true });
  await run("python3", ["-I", "-c", `
import sys, wave, numpy as np
SR=48000; out=sys.argv[1]; rng=np.random.default_rng(7)
t_of=lambda d: np.arange(int(d*SR))/SR
def write(n,x):
    x=np.clip(x/(np.max(np.abs(x))+1e-9)*0.9,-1,1); x=np.stack([x,x],1)
    w=wave.open(f"{out}/{n}.wav","wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype("<i2").tobytes()); w.close()
t=t_of(1.3); write("chime", sum(np.sin(2*np.pi*f*t)*np.exp(-t*d)*a for f,d,a in ((1318.5,3,1),(1975.5,4.5,.45),(2637,6,.2))))
t=t_of(0.35); f=55+40*np.exp(-t*30); write("thump", np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*12))
t=t_of(0.18); f=520+800*t/0.18; write("pop", np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*28))
t=t_of(0.25); n=rng.standard_normal(len(t)); write("strike", np.convolve(n,np.ones(5)/5,"same")*np.exp(-t*14))
t=t_of(2.0); n=np.convolve(rng.standard_normal(len(t)),np.ones(80)/80,"same"); write("drift", n*np.sin(np.pi*t/2.0)**2+np.sin(2*np.pi*(660-200*t/2.0)*t)*0.08*np.exp(-t*1.2))
t=t_of(0.5); n=np.convolve(rng.standard_normal(len(t)),np.ones(14)/14,"same"); write("whoosh", n*np.sin(np.pi*t/0.5)**2)
`, sfxDir]);
}
if (!fs.existsSync(path.join(here, "music/luxe.wav"))) { fs.mkdirSync(path.join(here, "music"), { recursive: true }); await run("python3", [path.join(ROOT, "tools/lovesong.py"), "--luxe", "--bpm", "72", "--bars", "16", "--seed", "8", path.join(here, "music/luxe.wav")]); }

const bd = path.join(here, "build"), A = path.join(bd, "assets");
fs.mkdirSync(A, { recursive: true });
fs.writeFileSync(path.join(bd, "index.html"), html);
const cp = (f, to) => fs.copyFileSync(path.isAbsolute(f) ? f : path.join(ROOT, f), path.join(A, to));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
cp("node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", "inter-600.woff2");
cp("node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2", "inter-800.woff2");
cp("node_modules/@fontsource/playfair-display/files/playfair-display-latin-800-italic.woff2", "serif-800i.woff2");
cp("node_modules/@fontsource/amiri/files/amiri-arabic-700-normal.woff2", "amiri-700.woff2");
cp(kit.logo.darkInk, "logo-dark.png"); cp(kit.logo.lightInk, "logo-light.png");
for (const s of ["chime", "thump", "pop", "strike", "drift", "whoosh"]) cp(path.join(sfxDir, `${s}.wav`), `${s}.wav`);
cp(path.join(here, "vo/voice.wav"), "voice.wav");
await prepMusic(path.join(here, "music/luxe.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "rizco-empty-space", name: "The Empty Space" }, null, 2));
log(`total ${TOTAL}s, ${chunks.length} caption chunks, ${fx.length} sfx`);
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(here, "raw.mp4"), out = path.join(here, "out"), mp4 = path.join(out, "rizco-the-empty-space.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log("RENDER COMPLETE " + path.relative(ROOT, mp4));
