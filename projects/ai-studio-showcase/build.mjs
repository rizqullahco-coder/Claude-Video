// Riz.co "AI Studio Showcase": a ~45 s 9:16 video that tests every connected tool.
// Template: karaoke-flow · blush-luxe. Voice = local Kokoro TTS; captions = Scriptivox word timings.
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
const C = { bg: "#f6f1ea", bg2: "#ecd3c8", ink: "#1a1414", mut: "#6d5f5a", gold: "#d4b57a", marker: "#d8b98a", em: "#4a3410",
  blush: "#e9c4b8", card: "#fffaf6", line: "#ead9cf", ok: "#3d7a52", bad: "#b8433a" };

const timing = JSON.parse(fs.readFileSync(path.join(here, "vo/timing.json"), "utf8"));
const TOTAL = timing.total; // 44.6
const SC = { hook: [0, 5.5], voice: [5.5, 8.85], caps: [8.85, 13.6], fonts: [13.6, 17.75], drop: [17.75, 21.1],
  build: [21.1, 28.5], locks: [28.5, 34.6], score: [34.6, 38.8], end: [38.8, TOTAL] };
const DESCRIPT = process.env.DESCRIPT_STATUS || "✓ 45 s transcribed";

const js = []; const T = (x) => js.push(x);

// ---------- karaoke captions from the Scriptivox SRT
const srt = fs.readFileSync(path.join(here, "captions-scriptivox.srt"), "utf8").trim().split(/\n\s*\n/).map((b) => {
  const l = b.split("\n"); const [a, z] = l[1].split(" --> ").map((s) => { const [hh, mm, r] = s.split(":"); return +hh * 3600 + +mm * 60 + +r.replace(",", "."); });
  return { a, z, text: l.slice(2).join(" ") };
}).filter((c) => c.a < SC.end[0] - 0.1);
let capHtml = "";
srt.forEach((c, i) => {
  const words = c.text.split(" ");
  capHtml += `<div class="kc" id="kc${i}">${words.map((w) => `<span class="kw">${h(w)}</span>`).join(" ")}</div>`;
  const next = srt[i + 1] ? Math.min(srt[i + 1].a, c.z + 0.6) : c.z + 0.5;
  T(`tl.fromTo("#kc${i}", { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.14, ease: "power2.out" }, ${n3(c.a)});`);
  const per = (c.z - c.a) / words.length;
  T(`tl.to("#kc${i} .kw", { color: "${C.ink}", backgroundSize: "100% 100%", duration: ${n3(Math.min(per, 0.2))}, stagger: ${n3(per)} }, ${n3(c.a)});`);
  T(`tl.to("#kc${i}", { opacity: 0, duration: 0.05 }, ${n3(next - 0.07)});`);
});

// ---------- scene builders
const logo = (v = "dark") => `<img class="logo" src="assets/logo-${v}.png" alt=""/>`;
const sec = (id, [a, b], inner, cls = "scene") => `<section id="${id}" class="clip ${cls}" data-start="${n3(a)}" data-duration="${n3(b - a)}" data-track-index="0">${inner}</section>`;
const blobs = (id) => `<div class="blob b1" id="${id}b1"></div><div class="blob b2" id="${id}b2"></div><div class="blob b3" id="${id}b3"></div>`;
const kick = (txt) => `<div class="kick">${txt}</div>`;
const pop = (sel, t, extra = "") => T(`tl.fromTo("${sel}", { scale: 0.6, opacity: 0${extra} }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.14, ease: "back.out(2.2)" }, ${n3(t)});`);
const rise = (sel, t, st = 0.12) => T(`tl.fromTo("${sel}", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: ${st}, ease: "power3.out" }, ${n3(t)});`);

// hook
const hook = `${logo()}${blobs("hk")}${kick("THE LIMIT TEST")}
<div class="big" id="hk1">Show me your <em>limits.</em></div>
<div class="big sm" id="hk2">Challenge<br>accepted.</div>
<div class="meter"><div class="mlab"><span>ACCESS CHECKED</span><span id="mpct">7 tools</span></div><div class="mtrack"><i id="mfill"></i></div></div>`;
rise("#hk1", 0.25); T(`tl.fromTo("#hk1 em", { scale: 1.5 }, { scale: 1, duration: 0.35, ease: "back.out(3)" }, 1.2);`);
T(`tl.fromTo("#hk2", { scale: 2.2, opacity: 0, rotation: -14 }, { scale: 1, opacity: 1, rotation: -5, duration: 0.24, ease: "power4.in" }, 2.75);`);
rise("#hook .meter", 3.3); T(`tl.fromTo("#mfill", { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 3.5);`);

// voice
const bars = Array.from({ length: 28 }, (_, i) => `<i style="height:${30 + Math.round(70 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)))}%"></i>`).join("");
const voice = `${logo()}${blobs("vo")}${kick("01 · THE VOICE")}
<div class="mic"><div class="ring" id="ring"></div><div class="mcore">AI</div></div>
<div class="wave" id="wave">${bars}</div>
<div class="chips"><span class="chip">Kokoro TTS · af_heart</span><span class="chip dark">Made on this machine</span></div>`;
pop("#voice .mic", SC.voice[0] + 0.1); T(`tl.fromTo("#ring", { scale: 1, opacity: 0.7 }, { scale: 1.6, opacity: 0, duration: 1, repeat: 2, ease: "power1.out" }, ${n3(SC.voice[0] + 0.3)});`);
T(`tl.fromTo("#wave i", { scaleY: 0.1 }, { scaleY: 1, duration: 0.22, stagger: { each: 0.03, repeat: 7, yoyo: true }, ease: "sine.inOut" }, ${n3(SC.voice[0] + 0.3)});`);
pop("#voice .chip", SC.voice[0] + 1.0);

// captions (Scriptivox + Descript)
const srtLines = ["00:00:08,880 → Scriptivox and Descript", "00:00:10,400 → both listened back", "00:00:12,080 → captions you're reading."];
const caps = `${logo()}${blobs("cp")}${kick("02 · THE CAPTIONS")}
<div class="cards">
 <div class="app"><div class="ah" style="background:#2d2a4a">SCRIPTIVOX</div><div class="ab"><b>✓ 45 s transcribed</b><span>37 word-timed captions</span><span>Exported as .srt</span></div></div>
 <div class="app"><div class="ah" style="background:#1d1d1d">DESCRIPT</div><div class="ab"><b>${h(DESCRIPT)}</b><span>Project in Rizq's Drive</span><span>Same voice, second opinion</span></div></div>
</div>
<div class="code">${srtLines.map((l) => `<div class="cl">${h(l)}</div>`).join("")}</div>`;
pop("#caps .app", SC.caps[0] + 0.2); rise("#caps .cl", SC.caps[0] + 1.4, 0.4);

// fonts
const fonts = `${logo()}${blobs("ft")}${kick("03 · THE TYPE")}
<div class="aa" id="aa">Aa</div>
<div class="fname">Adobe Fonts picked <em>Poppins.</em></div>
<div class="weights"><div class="wt" style="font-weight:500">Medium — Build your rizq</div><div class="wt" style="font-weight:800">ExtraBold — Build your rizq</div><div class="wt" style="font-weight:900">Black — Build your rizq</div></div>
<div class="credit">Poppins by Ninad Kale &amp; Jonny Pinhorn</div>`;
T(`tl.fromTo("#aa", { scale: 0.3, opacity: 0, rotation: -12 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.55, ease: "back.out(2)" }, ${n3(SC.fonts[0] + 0.15)});`);
rise("#fonts .fname", SC.fonts[0] + 0.7); rise("#fonts .wt", SC.fonts[0] + 1.3, 0.35); rise("#fonts .credit", SC.fonts[0] + 2.6);

// dropbox
const drop = `${logo()}${blobs("db")}${kick("04 · THE BACKUP")}
<div class="folder"><div class="fh"><span class="dbx">DROPBOX</span><b>/Riz.co AI Studio Showcase</b></div>
 <div class="frow" id="fr0"><span class="ic">MD</span><span class="fn">script.md</span><span class="fs">1.0 KB</span><span class="tick">✓</span></div>
 <div class="frow" id="fr1"><span class="ic">SRT</span><span class="fn">captions.srt</span><span class="fs">938 B</span><span class="tick">✓</span></div>
</div>
<div class="note">Saved straight into your account.</div>`;
rise("#drop .folder", SC.drop[0] + 0.15); rise("#drop .frow", SC.drop[0] + 0.8, 0.5); pop("#drop .tick", SC.drop[0] + 1.3); rise("#drop .note", SC.drop[0] + 2.0);

// build (HyperFrames + FFmpeg)
const tracks = [["VIDEO", "#d8b98a", [[0, 30], [31, 22], [54, 26], [81, 19]]], ["VOICE", "#c98f86", [[2, 14], [18, 20], [40, 30], [72, 24]]],
  ["MUSIC", "#8f9a6c", [[0, 100]]], ["SFX", "#4a3410", [[8, 3], [30, 3], [52, 3], [63, 3], [80, 3], [92, 3]]]];
const build = `${logo()}${blobs("bd")}${kick("05 · THE EDIT")}
<div class="tl"><div class="tlh"><span>HyperFrames</span><span>+</span><span>FFmpeg</span></div>
${tracks.map(([n, c, cl], i) => `<div class="trk"><span class="tn">${n}</span><div class="lane">${cl.map(([a, w], k) => `<i class="cl${i}" style="left:${a}%;width:${w}%;background:${c}"></i>`).join("")}</div></div>`).join("")}
<div class="ph" id="ph"></div></div>
<div class="bill" id="bill"><span>RENDER BILL</span><b>$0.00</b></div>`;
rise("#build .tl", SC.build[0] + 0.15);
tracks.forEach((_, i) => T(`tl.fromTo("#build .cl${i}", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.35, stagger: 0.08, ease: "power2.out" }, ${n3(SC.build[0] + 0.6 + i * 0.35)});`));
T(`tl.fromTo("#ph", { x: 0 }, { x: 850, duration: 4.6, ease: "none" }, ${n3(SC.build[0] + 1.0)});`);
T(`tl.fromTo("#bill", { scale: 2.4, opacity: 0, rotation: 12 }, { scale: 1, opacity: 1, rotation: 4, duration: 0.24, ease: "power4.in" }, 26.55);`);

// locks
const tiles = [["Adobe photo tools", "Upload host blocked", 0], ["Canva AI images", "Disabled by your admin", 0], ["Scriptivox", "Transcribed", 1], ["Descript", "Transcribed", 1], ["Dropbox", "Files saved", 1], ["Adobe Fonts", "Font picked", 1]];
const locks = `${logo()}${blobs("lk")}${kick("06 · THE LIMITS")}
<div class="big sm2" id="lkt">Some doors <em>stayed locked.</em></div>
<div class="tiles">${tiles.map(([n, s, ok], i) => `<div class="tile ${ok ? "ok" : "no"}" id="tile${i}"><span class="tg">${ok ? "✓" : "✕"}</span><b>${h(n)}</b><span>${h(s)}</span></div>`).join("")}</div>`;
rise("#lkt", SC.locks[0] + 0.1); pop("#locks .tile.no", SC.locks[0] + 1.6); pop("#locks .tile.ok", SC.locks[0] + 3.6);
T(`tl.fromTo("#locks .tile.no", { x: -8 }, { x: 8, duration: 0.05, repeat: 7, yoyo: true }, ${n3(SC.locks[0] + 2.1)}); tl.set("#locks .tile.no", { x: 0 }, ${n3(SC.locks[0] + 2.5)});`);

// score
const score = `${logo()}${blobs("sc")}${kick("THE SCORE")}
<div class="nums"><div class="nm" id="nm0"><b>1</b><span>prompt</span></div><div class="nm" id="nm1"><b>6</b><span>tools</span></div><div class="nm" id="nm2"><b>0</b><span>editors</span></div></div>
<div class="big sm" id="nb"><em>Not bad.</em></div>`;
[34.76, 35.66, 36.7].forEach((t, i) => pop(`#nm${i}`, t - 0.05));
T(`tl.fromTo("#nb", { scale: 1.8, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: -3, duration: 0.25, ease: "power4.in" }, 37.55);`);

// end card
const end = `<img class="elogo" src="assets/logo-light.png" alt="Riz.co"/><div class="wm">${h(kit.wordmark)}</div><div class="tag">${h(kit.tagline).replace(". ", ".<br>")}</div><div class="cta">Follow for more</div>`;
pop("#end .elogo", SC.end[0] + 0.15); rise("#end .wm", SC.end[0] + 0.6); rise("#end .tag", SC.end[0] + 1.0); pop("#end .cta", SC.end[0] + 2.2);

// blob drift on every scene
["hk", "vo", "cp", "ft", "db", "bd", "lk", "sc"].forEach((k, i) => {
  const s = Object.values(SC)[i]; const d = s[1] - s[0];
  T(`tl.fromTo("#${k}b1", { x: -40, y: 0 }, { x: 60, y: 80, duration: ${n3(d)}, ease: "none" }, ${n3(s[0])}); tl.fromTo("#${k}b2", { x: 30, y: 40 }, { x: -70, y: -40, duration: ${n3(d)}, ease: "none" }, ${n3(s[0])}); tl.fromTo("#${k}b3", { scale: 0.9 }, { scale: 1.15, duration: ${n3(d)}, ease: "none" }, ${n3(s[0])});`);
});

// slide transitions
const cuts = Object.values(SC).slice(1).map((s) => s[0]);
cuts.forEach((t, i) => T(`tl.fromTo("#sl${i}", { xPercent: 101 }, { xPercent: -101, duration: 0.55, ease: "power3.inOut" }, ${n3(t - 0.27)});`));
T(`tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${n3(SC.end[0])}, ease: "none" }, 0);`);

const css = `
@font-face{font-family:"Poppins";font-weight:500;src:url(assets/poppins-500.woff2) format("woff2")}
@font-face{font-family:"Poppins";font-weight:800;src:url(assets/poppins-800.woff2) format("woff2")}
@font-face{font-family:"Poppins";font-weight:900;src:url(assets/poppins-900.woff2) format("woff2")}
@font-face{font-family:"Serif";font-weight:800;font-style:italic;src:url(assets/serif-800i.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.bg};font-family:Poppins,sans-serif;color:${C.ink}}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
.scene{background:${C.bg};overflow:hidden}
.blob{position:absolute;border-radius:50%;filter:blur(60px);opacity:.75}
.b1{width:620px;height:620px;left:-200px;top:180px;background:${C.bg2}}
.b2{width:560px;height:560px;right:-180px;top:820px;background:#f1dcc6}
.b3{width:420px;height:420px;left:260px;bottom:-160px;background:${C.blush};opacity:.5}
.logo{position:absolute;top:84px;left:50%;height:56px;transform:translateX(-50%);z-index:3}
.kick{position:absolute;top:200px;left:0;right:0;text-align:center;font-weight:800;font-size:30px;letter-spacing:.32em;color:${C.em};z-index:2}
em{font-family:Serif,serif;font-style:italic;color:${C.em};background:linear-gradient(transparent 62%,${C.marker} 62%,${C.marker} 92%,transparent 92%);padding:0 .06em}
.big{position:absolute;left:70px;right:70px;top:420px;text-align:center;font-weight:900;font-size:128px;line-height:1.02;letter-spacing:-0.045em;opacity:0;z-index:2}
.big.sm{top:800px;font-size:112px}
.big.sm2{top:300px;font-size:84px}
#hk2{color:${C.bad};border:10px solid ${C.bad};border-radius:24px;left:170px;right:170px;padding:18px 0;background:rgba(246,241,234,.92);font-size:96px}
.meter{position:absolute;left:110px;right:110px;top:1200px;opacity:0;z-index:2}
.mlab{display:flex;justify-content:space-between;font-weight:800;font-size:28px;letter-spacing:.12em;margin-bottom:14px}
.mtrack{height:30px;border-radius:99px;background:rgba(26,20,20,.1);overflow:hidden}
.mtrack i{display:block;height:100%;background:linear-gradient(90deg,${C.marker},${C.em});transform-origin:0 50%}
.mic{position:absolute;left:390px;top:360px;width:300px;height:300px;z-index:2;opacity:0}
.ring{position:absolute;inset:0;border-radius:50%;border:8px solid ${C.marker}}
.mcore{position:absolute;inset:30px;border-radius:50%;background:${C.ink};color:${C.bg};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:110px;letter-spacing:-0.04em}
.wave{position:absolute;left:90px;right:90px;top:740px;height:260px;display:flex;align-items:center;gap:10px;z-index:2}
.wave i{flex:1;background:${C.em};border-radius:99px;transform-origin:50% 50%}
.chips{position:absolute;left:0;right:0;top:1080px;display:flex;flex-direction:column;align-items:center;gap:20px;z-index:2}
.chip{font-weight:800;font-size:38px;padding:16px 34px;border-radius:99px;background:${C.card};border:3px solid ${C.ink};opacity:0}
.chip.dark{background:${C.ink};color:${C.bg}}
.cards{position:absolute;left:60px;right:60px;top:320px;display:grid;grid-template-columns:1fr 1fr;gap:28px;z-index:2}
.app{background:${C.card};border-radius:28px;overflow:hidden;box-shadow:0 24px 60px rgba(74,52,16,.16);opacity:0}
.ah{color:#fff;font-weight:900;font-size:34px;letter-spacing:.14em;padding:22px 26px}
.ab{display:flex;flex-direction:column;gap:14px;padding:26px}
.ab b{font-weight:900;font-size:36px;line-height:1.15;color:${C.ok}} .ab span{font-weight:500;font-size:28px;color:${C.mut}}
.code{position:absolute;left:60px;right:60px;top:860px;background:${C.ink};border-radius:24px;padding:30px 34px;display:flex;flex-direction:column;gap:16px;z-index:2}
.cl{font-family:monospace;font-size:30px;color:#f1dcc6;opacity:0;white-space:nowrap}
.aa{position:absolute;left:0;right:0;top:250px;text-align:center;font-weight:900;font-size:420px;line-height:1;letter-spacing:-0.05em;color:${C.ink};opacity:0;z-index:2}
.fname{position:absolute;left:60px;right:60px;top:760px;text-align:center;font-weight:800;font-size:64px;letter-spacing:-0.03em;opacity:0;z-index:2}
.weights{position:absolute;left:90px;right:90px;top:900px;display:flex;flex-direction:column;gap:18px;z-index:2}
.wt{font-size:46px;letter-spacing:-0.02em;background:${C.card};border-radius:20px;padding:16px 28px;opacity:0;box-shadow:0 12px 30px rgba(74,52,16,.1)}
.credit{position:absolute;left:0;right:0;top:1290px;text-align:center;font-weight:500;font-size:28px;color:${C.mut};opacity:0;z-index:2}
.folder{position:absolute;left:70px;right:70px;top:420px;background:${C.card};border-radius:30px;box-shadow:0 30px 70px rgba(74,52,16,.18);overflow:hidden;opacity:0;z-index:2}
.fh{display:flex;flex-direction:column;gap:10px;padding:34px 36px;background:#0061fe;color:#fff}
.dbx{font-weight:900;font-size:30px;letter-spacing:.2em;opacity:.85} .fh b{font-weight:800;font-size:40px}
.frow{display:flex;align-items:center;gap:24px;padding:30px 36px;border-top:2px solid ${C.line};opacity:0}
.ic{width:92px;height:92px;border-radius:18px;background:${C.bg2};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:26px}
.fn{flex:1;font-weight:800;font-size:42px} .fs{font-weight:500;font-size:28px;color:${C.mut}}
.tick{width:64px;height:64px;border-radius:50%;background:${C.ok};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:38px;opacity:0}
.note{position:absolute;left:0;right:0;top:1000px;text-align:center;font-weight:800;font-size:50px;letter-spacing:-0.02em;opacity:0;z-index:2}
.tl{position:absolute;left:50px;right:50px;top:330px;background:${C.ink};border-radius:30px;padding:30px 30px 40px;opacity:0;z-index:2}
.tlh{display:flex;justify-content:center;gap:22px;font-weight:900;font-size:50px;color:${C.bg};margin-bottom:26px}
.tlh span:nth-child(2){color:${C.gold}}
.trk{display:flex;align-items:center;gap:18px;margin-top:20px}
.tn{width:120px;font-weight:800;font-size:24px;letter-spacing:.1em;color:#bba9a2}
.lane{position:relative;flex:1;height:70px;background:rgba(255,255,255,.07);border-radius:12px}
.lane i{position:absolute;top:8px;bottom:8px;border-radius:10px}
.ph{position:absolute;top:100px;bottom:20px;left:150px;width:6px;background:#fff;border-radius:3px;box-shadow:0 0 18px #fff}
.bill{position:absolute;left:180px;right:180px;top:880px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:26px 0;border:12px solid ${C.ok};border-radius:28px;background:rgba(246,241,234,.95);color:${C.ok};opacity:0;z-index:3}
.bill span{font-weight:800;font-size:36px;letter-spacing:.2em} .bill b{font-weight:900;font-size:150px;line-height:1;letter-spacing:-0.04em}
.tiles{position:absolute;left:60px;right:60px;top:560px;display:grid;grid-template-columns:1fr 1fr;gap:22px;z-index:2}
.tile{border-radius:26px;padding:26px 26px 28px;display:flex;flex-direction:column;gap:8px;opacity:0;box-shadow:0 14px 34px rgba(74,52,16,.12)}
.tile.ok{background:${C.card}} .tile.no{background:${C.ink};color:${C.bg}}
.tile .tg{width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:34px;margin-bottom:6px}
.tile.ok .tg{background:${C.ok};color:#fff} .tile.no .tg{background:${C.bad};color:#fff}
.tile b{font-weight:800;font-size:38px;line-height:1.1;letter-spacing:-0.02em} .tile span:last-child{font-weight:500;font-size:27px;opacity:.75}
.nums{position:absolute;left:50px;right:50px;top:380px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:22px;z-index:2}
.nm{background:${C.card};border-radius:30px;padding:30px 0 34px;display:flex;flex-direction:column;align-items:center;box-shadow:0 18px 44px rgba(74,52,16,.14);opacity:0}
.nm b{font-weight:900;font-size:190px;line-height:1;letter-spacing:-0.05em} .nm span{font-weight:800;font-size:40px;color:${C.mut}}
#nb{top:860px}
#end{background:${C.ink};color:${C.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:30px;padding:0 80px}
.elogo{height:170px;opacity:0}
#end .wm{font-weight:800;font-size:34px;letter-spacing:.5em;margin-right:-.5em;color:${C.gold};opacity:0}
#end .tag{font-family:Serif,serif;font-style:italic;font-weight:800;font-size:76px;line-height:1.12;opacity:0}
#end .cta{margin-top:20px;font-weight:800;font-size:40px;color:${C.ink};background:${C.gold};padding:22px 50px;border-radius:99px;opacity:0}
#kar{position:absolute;left:0;right:0;top:1500px;height:260px;z-index:20;pointer-events:none}
.kc{position:absolute;left:60px;right:60px;top:0;text-align:center;font-weight:900;font-size:86px;line-height:1.18;letter-spacing:-0.035em;opacity:0}
.kw{color:rgba(26,20,20,.3);padding:0 .1em;border-radius:12px;background:linear-gradient(${C.marker},${C.marker}) no-repeat 0 85%/0% 38%}
.slide{position:absolute;inset:0;z-index:30;background:${C.bg2};transform:translateX(101%)}
#progress-track{position:absolute;inset:auto 0 0 0;height:12px;background:rgba(26,20,20,.08);z-index:25}
#progress{position:absolute;inset:0;background:${C.em};transform-origin:left center;transform:scaleX(0)}`;

const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${n3(TOTAL)}" data-width="${W}" data-height="${H}">
  ${sec("hook", SC.hook, hook)}
  ${sec("voice", SC.voice, voice)}
  ${sec("caps", SC.caps, caps)}
  ${sec("fonts", SC.fonts, fonts)}
  ${sec("drop", SC.drop, drop)}
  ${sec("build", SC.build, build)}
  ${sec("locks", SC.locks, locks)}
  ${sec("score", SC.score, score)}
  ${sec("end", SC.end, end, "")}
  <div id="kar" class="clip" data-start="0" data-duration="${n3(SC.end[0])}" data-track-index="2">${capHtml}</div>
  ${cuts.map((t, i) => `<div id="sl${i}" class="clip slide" data-start="${n3(t - 0.3)}" data-duration="0.62" data-track-index="3"></div>`).join("\n  ")}
  <div id="progress-track" class="clip" data-start="0" data-duration="${n3(SC.end[0])}" data-track-index="4"><div id="progress"></div></div>
  <audio id="vox" src="assets/voice.wav" data-start="0" data-duration="${n3(TOTAL)}" data-volume="1"></audio>
  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${n3(TOTAL)}" data-media-start="0" data-volume="0.2" data-fade-in="0.5" data-fade-out="2.5"></audio>
  ${cuts.map((t, i) => `<audio id="wh${i}" src="assets/whoosh.wav" data-start="${n3(t - 0.3)}" data-duration="0.45" data-volume="0.3"></audio>`).join("\n  ")}
  ${[[2.75, "stamp", 0.4], [5.05, "beep", 0.25], [9.1, "pop", 0.35], [17.0, "pop", 0.3], [19.05, "beep", 0.25], [19.55, "beep", 0.25], [26.55, "stamp", 0.45], [30.1, "glitch", 0.25], [32.1, "pop", 0.3], [34.71, "pop", 0.35], [35.61, "pop", 0.35], [36.65, "pop", 0.35], [37.55, "boing", 0.3]]
    .map(([t, s, v], i) => `<audio id="fx${i}" src="assets/${s}.wav" data-start="${t}" data-duration="0.5" data-volume="${v}"></audio>`).join("\n  ")}
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  ${js.join("\n  ")}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script></body></html>`;

// original music (regenerated if missing): 120 BPM, 24 bars, mood "pop", seed 7
if (!fs.existsSync(path.join(here, "beat/beat.wav"))) fs.mkdirSync(path.join(here, "beat"), { recursive: true }), await run("python3", [path.join(ROOT, "tools/beatgen.py"), "--bpm", "120", "--bars", "24", "--mood", "pop", "--seed", "7", path.join(here, "beat")]);
const bd = path.join(here, "build"), A = path.join(bd, "assets");
fs.mkdirSync(A, { recursive: true });
fs.writeFileSync(path.join(bd, "index.html"), html);
const cp = (f, to) => fs.copyFileSync(path.isAbsolute(f) ? f : path.join(ROOT, f), path.join(A, to));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
for (const w of [500, 800, 900]) cp(path.join(here, `font/poppins-latin-${w}-normal.woff2`), `poppins-${w}.woff2`);
cp("node_modules/@fontsource/playfair-display/files/playfair-display-latin-800-italic.woff2", "serif-800i.woff2");
cp(kit.logo.darkInk, "logo-dark.png"); cp(kit.logo.lightInk, "logo-light.png");
cp(path.join(here, "beat/whoosh.wav"), "whoosh.wav"); cp(path.join(here, "beat/pop.wav"), "pop.wav");
for (const s of ["beep", "glitch", "stamp", "boing"]) cp(`media/sfx/${s}.wav`, `${s}.wav`);
cp(path.join(here, "vo/voice.wav"), "voice.wav");
await prepMusic(path.join(here, "beat/beat.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "rizco-ai-studio-showcase", name: "AI Studio Showcase" }, null, 2));
log(`total ${TOTAL}s, ${srt.length} caption chunks`);
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(here, "raw.mp4"), out = path.join(here, "out"), mp4 = path.join(out, "rizco-ai-studio-showcase.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log("RENDER COMPLETE " + path.relative(ROOT, mp4));
