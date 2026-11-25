// Riz.co "The Brand Tree" reel (48.5 s, 9:16, soft-rise · sage-luxe).
// An olive tree grows level by level (roots -> trunk -> branches -> fruit) while a calm voice explains.
// Voice: local Kokoro (af_heart, 0.95x). Word timings: Scriptivox. Music (soft piano) + SFX: generated locally.
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
// sage-luxe
const C = { a: "#f2efe6", b: "#c9d1bd", ink: "#1d231d", em: "#5e4a1c", gold: "#b9a46f", obg: "#2c352b", acc: "#c9b27a",
  olive: "#4b531e", leaf: "#6f7d3a", leaf2: "#8f9a5a", bark: "#5e4a1c", root: "#7a6236", mut: "#5d6150", card: "#fbfaf5" };
const TOTAL = 48.5;
const SC = { intro: [0, 8.0], tree: [8.0, 32.8], recap: [32.8, 41.0], end: [41.0, TOTAL] };
const LV = [ // left-panel level cards inside the tree scene
  { id: "l1", n: "01", name: "Roots", sub: "Know who you are.", at: 8.0, to: 14.2, items: [["Why you exist", 10.08], ["Who you serve", 11.12], ["What makes you different", 11.92]] },
  { id: "l2", n: "02", name: "Trunk", sub: "Look & sound the same, everywhere.", at: 14.2, to: 20.6, items: [["Same logo", 17.04], ["Same colours", 18.0], ["Same voice", 18.8]] },
  { id: "l3", n: "03", name: "Branches", sub: "Get found.", at: 20.6, to: 26.2, items: [["Social media & reels", 23.3], ["Google & your website", 23.95], ["Events & pop-ups", 24.6]] },
  { id: "l4", n: "04", name: "Fruit", sub: "Keep them coming back.", at: 26.2, to: 32.8, items: [["Reviews", 28.72], ["Rewards", 29.36], ["Real care after the sale", 30.24]] },
];
const js = []; const T = (x) => js.push(x);
const fx = []; const sfx = (t, s, v = 0.3, d = 0.6) => fx.push([t, s, v, d]);
const rise = (sel, t, st = 0.08, dur = 0.6) => T(`tl.fromTo("${sel}", { yPercent: 110 }, { yPercent: 0, duration: ${dur}, stagger: ${st}, ease: "power3.out" }, ${n3(t)});`);
const fadeUp = (sel, t, st = 0.1) => T(`tl.fromTo("${sel}", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: ${st}, ease: "power3.out" }, ${n3(t)});`);
// masked word-rise text: each word sits in an overflow-hidden box
const words = (txt) => txt.split(" ").map((w) => { const m = w.match(/^\*(.+)\*([.,!?…]*)$/); return `<span class="wm"><span class="wi">${m ? `<em>${h(m[1])}</em>${h(m[2])}` : h(w)}</span></span>`; }).join(" ");

// ---------- captions (soft-rise: ≤4 words, left aligned, masked word rise) from Scriptivox timings
const wl = fs.readFileSync(path.join(here, "vo/words.tsv"), "utf8").trim().split("\n").map((l) => { const [a, z, w] = l.split("\t"); return { a: +a, z: +z, w }; });
const chunks = []; let cur = [];
wl.forEach((w, i) => { cur.push(w); const nx = wl[i + 1]; if (cur.length === 4 || /[.,!?]$/.test(w.w) || !nx || nx.a - w.z > 0.35) { chunks.push(cur); cur = []; } });
let capHtml = "";
chunks.forEach((c, i) => {
  const a = c[0].a, z = c[c.length - 1].z, next = chunks[i + 1] ? chunks[i + 1][0].a : z + 0.6;
  capHtml += `<div class="cap" id="cp${i}">${c.map((w) => `<span class="wm"><span class="wi">${h(w.w)}</span></span>`).join(" ")}</div>`;
  T(`tl.set("#cp${i}", { opacity: 1 }, ${n3(a - 0.08)});`);
  c.forEach((w, k) => T(`tl.fromTo("#cp${i} .wm:nth-child(${k + 1}) .wi", { yPercent: 105 }, { yPercent: 0, duration: 0.32, ease: "power3.out" }, ${n3(w.a - 0.08)});`));
  T(`tl.to("#cp${i}", { opacity: 0, duration: 0.18 }, ${n3(Math.min(next, z + 0.9) - 0.2)});`);
});

const logo = (v = "dark") => `<img class="logo" src="assets/logo-${v}.png" alt=""/>`;
const frame = `<div class="frame"></div>`;
const sec = (id, [a, b], inner, cls = "scene") => `<section id="${id}" class="clip ${cls}" data-start="${n3(a)}" data-duration="${n3(b - a)}" data-track-index="0">${inner}</section>`;

// ---------- the olive tree (SVG 540 x 1040, ground at y=760)
const GX = 270, GY = 760;
const leaf = (x, y, r, c, i) => `<ellipse class="lf" cx="${x}" cy="${y}" rx="13" ry="30" fill="${c}" transform="rotate(${r} ${x} ${y})" data-i="${i}"/>`;
const leaves = [[150, 250, -50], [118, 300, -80], [182, 205, -20], [214, 170, 10], [300, 150, 25], [345, 185, 50], [392, 230, 70], [420, 290, 95], [250, 120, 5], [205, 290, -40], [330, 280, 40], [90, 360, -100], [445, 360, 110], [270, 210, 0], [160, 380, -70], [380, 380, 80]];
const olives = [[176, 270], [236, 230], [318, 228], [364, 262], [140, 340], [402, 330], [284, 300]];
const K = 600 / 540, px = (v) => Math.round(v * K);
const layer = (id, inner) => `<div class="layer" id="${id}"><svg viewBox="0 0 540 1040" width="600" height="1155">${inner}</svg></div>`;
const treeSvg = `${layer("soil", `<rect x="0" y="${GY}" width="540" height="280" fill="#e4dccb"/><line x1="0" y1="${GY}" x2="540" y2="${GY}" stroke="${C.ink}" stroke-width="4"/>`)}
${layer("roots", `<g fill="none" stroke="${C.root}" stroke-linecap="round">
    <path d="M${GX} ${GY} C 258 820, 220 860, 150 930" stroke-width="16"/><path d="M${GX} ${GY} C 276 830, 300 880, 330 980" stroke-width="16"/>
    <path d="M${GX} ${GY} C 300 800, 360 830, 440 880" stroke-width="12"/><path d="M${GX} ${GY} C 240 790, 170 800, 90 850" stroke-width="12"/>
    <path d="M200 890 C 190 920, 170 950, 175 990" stroke-width="7"/><path d="M320 930 C 350 950, 380 960, 400 1000" stroke-width="7"/><path d="M400 860 C 430 890, 470 900, 500 930" stroke-width="6"/></g>`)}
<div class="layer" id="crown">
${layer("trunk", `<path d="M228 ${GY} C 236 640, 246 520, 250 420 L 292 420 C 296 520, 304 640, 314 ${GY} Z" fill="${C.bark}"/>
    <path d="M262 700 C 266 640, 262 590, 268 540 M282 640 C 284 600, 280 560, 286 510" stroke="#3e3112" stroke-width="5" fill="none" stroke-linecap="round"/>`)}
${layer("branches", `<g fill="none" stroke="${C.bark}" stroke-linecap="round">
    <path d="M262 440 C 230 380, 190 330, 140 290" stroke-width="20"/><path d="M280 430 C 310 370, 350 320, 400 270" stroke-width="20"/>
    <path d="M268 430 C 262 340, 262 260, 258 160" stroke-width="16"/><path d="M256 470 C 200 450, 150 420, 100 370" stroke-width="12"/>
    <path d="M286 470 C 340 450, 400 420, 440 370" stroke-width="12"/></g>`)}
${leaves.map(([x, y, r], i) => `<i class="lf" data-r="${r}" style="left:${px(x) - 15}px;top:${px(y) - 34}px;background:${i % 3 === 0 ? C.leaf2 : i % 2 ? C.leaf : C.olive}"></i>`).join("")}
${olives.map(([x, y], i) => `<i class="ol" style="left:${px(x) - 17}px;top:${px(y) - 21}px;background:${i % 2 ? C.ink : C.olive}"></i>`).join("")}
</div>`;
// level tags pinned to tree parts (page coords inside .stage)
const k = 600 / 540;
const tags = [["t1", "01 · ROOTS", 370, 960], ["t2", "02 · TRUNK", 345, 640], ["t3", "03 · BRANCHES", 330, 480], ["t4", "04 · FRUIT", 360, 70]].map(([a, b, x, y]) => [a, b, Math.round(x * k), Math.round(y * k)]);

// ---------- scenes
const intro = `${logo()}${frame}
<div class="big" id="i1">${words("Customers only see the *fruit.*")}</div>
<div class="big sm" id="i2">${words("But every strong brand grows like a *tree.*")}</div>
<div class="up" id="i3"><span class="arr">↑</span> From the roots, up</div>
<svg class="sprig" id="sprig" viewBox="0 0 300 300" width="330" height="330"><path d="M40 270 C 100 200, 170 140, 270 40" stroke="${C.bark}" stroke-width="10" fill="none" stroke-linecap="round"/>
${[[95, 205, -60], [130, 170, 30], [160, 140, -55], [195, 112, 35], [225, 85, -50], [250, 62, 40]].map(([x, y, r], i) => `<ellipse class="sl" cx="${x}" cy="${y}" rx="14" ry="36" fill="${i % 2 ? C.leaf : C.olive}" transform="rotate(${r} ${x} ${y})"/>`).join("")}
${[[118, 215], [182, 150], [238, 100]].map(([x, y], i) => `<ellipse class="so" cx="${x}" cy="${y}" rx="17" ry="21" fill="${i % 2 ? C.ink : C.olive}"/>`).join("")}</svg>`;
rise("#i1 .wi", 0.45, 0.09); sfx(0.45, "whoosh", 0.18, 0.45);
T(`tl.fromTo("#sprig", { rotation: -8, opacity: 0, y: 40 }, { rotation: 0, opacity: 1, y: 0, duration: 0.8, ease: "power3.out", transformOrigin: "13% 90%" }, 0.6);`);
T(`tl.fromTo("#sprig .sl", { scale: 0 }, { scale: 1, duration: 0.4, stagger: 0.08, ease: "back.out(2)", transformOrigin: "50% 100%" }, 0.9);`);
T(`tl.fromTo("#sprig .so", { scale: 0 }, { scale: 1, duration: 0.4, stagger: 0.15, ease: "back.out(3)", transformOrigin: "50% 50%" }, 2.1);`); sfx(2.1, "chime", 0.25); sfx(2.4, "chime", 0.18);
T(`tl.to("#i1", { opacity: 0.25, duration: 0.4 }, 3.2);`);
rise("#i2 .wi", 3.25, 0.1);
fadeUp("#i3", 5.9); T(`tl.fromTo("#i3 .arr", { y: 12 }, { y: -12, duration: 0.5, repeat: 3, yoyo: true, ease: "sine.inOut" }, 6.3);`);

const levelCards = LV.map((L) => `<div class="lv" id="${L.id}"><div class="lk">LEVEL ${L.n} <i>/ 04</i></div>
<div class="ln"><span class="wm"><span class="wi"><em>${L.name}.</em></span></span></div><div class="ls">${words(L.sub)}</div>
<ul>${L.items.map(([t]) => `<li><span class="ck">✓</span>${h(t)}</li>`).join("")}</ul></div>`).join("");
const tree = `${logo()}${frame}<div class="panel">${levelCards}</div>
<div class="stage">${treeSvg}${tags.map(([id, t, x, y]) => `<div class="tag" id="${id}" style="left:${x}px;top:${y}px">${t}</div>`).join("")}</div>`;
LV.forEach((L, i) => {
  if (i > 0) T(`tl.to("#${LV[i - 1].id}", { opacity: 0, y: -40, duration: 0.35, ease: "power2.in" }, ${n3(L.at - 0.05)});`);
  T(`tl.set("#${L.id}", { opacity: 1 }, ${n3(L.at)});`);
  fadeUp(`#${L.id} .lk`, L.at + 0.15); rise(`#${L.id} .ln .wi`, L.at + 0.25, 0, 0.7); rise(`#${L.id} .ls .wi`, L.at + 0.7, 0.06);
  L.items.forEach(([, t], k) => { T(`tl.fromTo("#${L.id} li:nth-child(${k + 1})", { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, ${n3(t - 0.05)});`); sfx(t, "pop", 0.22, 0.3); });
  T(`tl.fromTo("#t${i + 1}", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2.4)" }, ${n3(L.at + 0.5)}); tl.to("#t${i + 1}", { backgroundColor: "${C.card}", color: "${C.ink}", duration: 0.3 }, ${n3(L.to - 0.1)});`);
});
// grow the tree with each level
T(`tl.fromTo("#soil", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 8.05);`);
T(`tl.fromTo("#roots", { scaleY: 0, scaleX: 0.4 }, { scaleY: 1, scaleX: 1, duration: 1.4, ease: "power2.out", transformOrigin: "${px(GX)}px ${px(GY)}px" }, 8.4);`); sfx(8.4, "grow", 0.25, 1.5);
T(`tl.fromTo("#trunk", { scaleY: 0 }, { scaleY: 1, duration: 1.4, ease: "power3.out", transformOrigin: "${px(GX)}px ${px(GY)}px" }, 14.6);`); sfx(14.6, "grow", 0.25, 1.5);
T(`tl.fromTo("#branches", { scale: 0 }, { scale: 1, duration: 1.1, ease: "power3.out", transformOrigin: "${px(GX)}px ${px(440)}px" }, 21.0);`); sfx(21.0, "grow", 0.25, 1.5);
leaves.forEach(([, , r], i) => T(`tl.fromTo("#crown .lf:nth-of-type(${i + 1})", { scale: 0, rotation: ${r} }, { scale: 1, rotation: ${r}, duration: 0.45, ease: "back.out(2.2)" }, ${n3(21.9 + i * 0.05)});`));
T(`tl.fromTo("#crown .ol", { scale: 0 }, { scale: 1, duration: 0.45, stagger: 0.16, ease: "back.out(3)" }, 26.6);`);
[26.6, 26.92, 27.24, 27.56].forEach((t, i) => sfx(t, "chime", 0.16 + i * 0.02, 0.4));
// gentle camera: the stage drifts up as the tree grows
T(`tl.fromTo(".stage", { y: 60 }, { y: 0, duration: 13, ease: "sine.inOut" }, 13.6);`);
T(`tl.to("#crown", { rotation: 1.5, duration: 2.2, yoyo: true, repeat: 2, ease: "sine.inOut", transformOrigin: "${px(GX)}px ${px(GY)}px" }, 26.2);`);

const recap = `${logo("mono")}${frame}
<div class="big rc" id="r1">${words("Most businesses start with the *branches…*")}</div>
<svg class="lone" id="lone" viewBox="0 0 300 300" width="340" height="340"><path d="M60 250 C 110 200, 170 150, 250 70" stroke="${C.bark}" stroke-width="12" fill="none" stroke-linecap="round"/>
${[[110, 200, -60], [150, 165, 30], [185, 135, -55], [220, 105, 35]].map(([x, y, r]) => `<ellipse class="ll" cx="${x}" cy="${y}" rx="14" ry="34" fill="${C.leaf}" transform="rotate(${r} ${x} ${y})"/>`).join("")}</svg>
<div class="why" id="r2">${words("…and wonder why nothing *grows.*")}</div>
<div class="big rc2" id="r3">${words("So, start at the *roots.*")}</div>
<div class="steps">${[...LV].reverse().map((L) => `<div class="stp"><b>${L.n}</b><span>${L.name}</span><i>${h(L.sub)}</i></div>`).join("")}</div>`;
rise("#r1 .wi", 32.95, 0.08);
T(`tl.fromTo("#lone", { y: -40, opacity: 0, rotation: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 33.6);`);
fadeUp("#r2", 35.45); T(`tl.to("#lone", { rotation: 28, y: 240, opacity: 0.2, duration: 1.4, ease: "power2.in", transformOrigin: "20% 83%" }, 36.0); tl.to("#lone .ll", { y: 90, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power1.in" }, 36.1);`); sfx(36.0, "fall", 0.22, 1.2);
T(`tl.to("#r1, #r2", { opacity: 0, y: -30, duration: 0.35 }, 37.85); tl.to("#lone", { opacity: 0, duration: 0.3 }, 37.85);`);
rise("#r3 .wi", 38.15, 0.1);
T(`tl.fromTo("#recap .stp", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: -0.18, ease: "power3.out" }, 38.9);`);
[39.44, 39.62, 39.8, 39.98].forEach((t) => sfx(t, "pop", 0.2, 0.3));

const end = `<img class="elogo" src="assets/logo-light.png" alt="Riz.co"/><div class="wm2">${h(kit.wordmark)}</div><div class="tg">${h(kit.tagline).replace(". ", ".<br>")}</div><div class="cta">Save this · Start at the roots</div>`;
T(`tl.fromTo("#end .elogo", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 41.25);`);
fadeUp("#end .wm2", 41.7); fadeUp("#end .tg", 42.2); fadeUp("#end .cta", 44.9); sfx(44.9, "chime", 0.25);

// iris transitions on the big cuts
const cuts = [SC.tree[0], SC.recap[0], SC.end[0]];
cuts.forEach((t, i) => { T(`tl.fromTo("#ir${i} i", { scale: 0 }, { scale: 1, duration: 0.32, ease: "power3.in" }, ${n3(t - 0.3)}); tl.to("#ir${i} i", { scale: 0, duration: 0.32, ease: "power3.out" }, ${n3(t + 0.02)});`); sfx(t - 0.3, "whoosh", 0.22, 0.45); });
T(`tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${n3(SC.end[0])}, ease: "none" }, 0);`);

const css = `
@font-face{font-family:"Inter";font-weight:500;src:url(assets/inter-500.woff2) format("woff2")}
@font-face{font-family:"Inter";font-weight:800;src:url(assets/inter-800.woff2) format("woff2")}
@font-face{font-family:"Serif";font-weight:600;font-style:italic;src:url(assets/serif-600i.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.a};font-family:Inter,sans-serif;color:${C.ink}}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
.scene{background:${C.a};overflow:hidden}
#recap{background:${C.b}}
.frame{position:absolute;inset:34px;border:2px solid rgba(29,35,29,.22);border-radius:28px;pointer-events:none;z-index:1}
.logo{position:absolute;top:82px;left:50%;height:60px;transform:translateX(-50%);z-index:5}
em{font-family:Serif,serif;font-style:italic;font-weight:600;color:${C.em};letter-spacing:-0.01em}
.wm{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.1em;margin-bottom:-.1em}
.wi{display:inline-block}
.big{position:absolute;left:84px;right:84px;top:330px;font-weight:800;font-size:118px;line-height:1.04;letter-spacing:-0.045em;z-index:2}
.big em{font-size:1.12em}
.big.sm{top:760px;font-size:92px}
.up{position:absolute;left:84px;top:1120px;font-weight:800;font-size:44px;letter-spacing:-0.02em;color:${C.em};opacity:0;z-index:2}
.up .arr{display:inline-block;margin-right:12px}
.sprig{position:absolute;right:70px;top:1100px;opacity:0;z-index:2}
.panel{position:absolute;left:84px;top:300px;width:470px;height:900px;z-index:3}
.lv{position:absolute;inset:0;opacity:0}
.lk{font-weight:800;font-size:26px;letter-spacing:.3em;color:${C.gold}} .lk i{font-style:normal;opacity:.6}
.ln{margin-top:18px;font-size:122px;line-height:1} .ln em{font-size:1em}
.ls{margin-top:22px;font-weight:800;font-size:50px;line-height:1.08;letter-spacing:-0.03em}
.lv ul{list-style:none;margin-top:44px;display:flex;flex-direction:column;gap:18px}
.lv li{display:flex;gap:16px;align-items:flex-start;font-weight:500;font-size:40px;line-height:1.2;letter-spacing:-0.01em;opacity:0}
.ck{flex:none;width:44px;height:44px;border-radius:50%;background:${C.olive};color:${C.a};font-weight:800;font-size:24px;display:flex;align-items:center;justify-content:center;margin-top:-2px}
.stage{position:absolute;left:470px;top:300px;width:600px;height:1155px;z-index:2}
.layer{position:absolute;left:0;top:0;width:600px;height:1155px}
.lf{position:absolute;width:30px;height:68px;border-radius:50%}
.ol{position:absolute;width:34px;height:42px;border-radius:50%;border:3px solid ${C.a}}
.tag{position:absolute;font-weight:800;font-size:22px;letter-spacing:.16em;padding:10px 16px;border-radius:99px;background:${C.olive};color:${C.a};white-space:nowrap;opacity:0;box-shadow:0 8px 20px rgba(29,35,29,.15)}
.rc{top:300px;font-size:100px}
.lone{position:absolute;right:110px;top:760px;opacity:0;z-index:2}
.why{position:absolute;left:84px;right:300px;top:820px;font-weight:800;font-size:66px;line-height:1.08;letter-spacing:-0.035em;opacity:0;z-index:2}
.rc2{top:300px;font-size:124px}
.steps{position:absolute;left:84px;right:84px;top:720px;display:flex;flex-direction:column;gap:16px;z-index:2}
.stp{display:flex;align-items:center;gap:26px;background:${C.card};border-radius:24px;padding:22px 30px;opacity:0;box-shadow:0 10px 26px rgba(29,35,29,.1)}
.stp b{font-weight:800;font-size:28px;letter-spacing:.2em;color:${C.gold};width:52px}
.stp span{font-family:Serif,serif;font-style:italic;font-weight:600;font-size:60px;color:${C.em};width:250px;line-height:1}
.stp i{font-style:normal;font-weight:500;font-size:30px;line-height:1.2;color:${C.mut}}
.stp:last-child{background:${C.obg}} .stp:last-child span{color:${C.acc}} .stp:last-child i{color:${C.a}}
#end{background:${C.obg};color:${C.a};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:30px;padding:0 80px}
.elogo{height:180px;opacity:0}
#end .wm2{font-weight:800;font-size:34px;letter-spacing:.5em;margin-right:-.5em;color:${C.acc};opacity:0}
#end .tg{font-family:Serif,serif;font-style:italic;font-weight:600;font-size:88px;line-height:1.08;opacity:0}
#end .cta{margin-top:24px;font-weight:800;font-size:38px;color:${C.ink};background:${C.acc};padding:24px 48px;border-radius:99px;opacity:0}
#caps{position:absolute;left:0;right:0;top:1545px;height:240px;z-index:20;pointer-events:none}
.cap{position:absolute;left:84px;right:84px;top:0;font-weight:800;font-size:84px;line-height:1.1;letter-spacing:-0.04em;opacity:0;color:${C.ink}}
.iris{display:flex;align-items:center;justify-content:center;z-index:30;pointer-events:none}
.iris i{width:2500px;height:2500px;border-radius:50%;background:${C.acc};flex:none;transform:scale(0)}
#progress-track{position:absolute;inset:auto 0 0 0;height:12px;background:rgba(29,35,29,.1);z-index:25}
#progress{position:absolute;inset:0;background:${C.olive};transform-origin:left center;transform:scaleX(0)}`;

const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${n3(TOTAL)}" data-width="${W}" data-height="${H}">
  ${sec("intro", SC.intro, intro)}
  ${sec("tree", SC.tree, tree)}
  ${sec("recap", SC.recap, recap)}
  ${sec("end", SC.end, end, "")}
  <div id="caps" class="clip" data-start="0" data-duration="${n3(SC.end[0])}" data-track-index="2">${capHtml}</div>
  ${cuts.map((t, i) => `<div id="ir${i}" class="clip iris" data-start="${n3(t - 0.32)}" data-duration="0.7" data-track-index="3"><i></i></div>`).join("\n  ")}
  <div id="progress-track" class="clip" data-start="0" data-duration="${n3(SC.end[0])}" data-track-index="4"><div id="progress"></div></div>
  <audio id="vox" src="assets/voice.wav" data-start="0" data-duration="${n3(TOTAL)}" data-volume="1"></audio>
  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${n3(TOTAL)}" data-media-start="0" data-volume="0.32" data-fade-in="1" data-fade-out="3"></audio>
  ${fx.map(([t, s, v, d], i) => `<audio id="fx${i}" src="assets/${s}.wav" data-start="${n3(t)}" data-duration="${n3(d)}" data-volume="${v}"></audio>`).join("\n  ")}
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  ${js.join("\n  ")}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script></body></html>`;

// assets: soft SFX generated here (numpy), so nothing depends on other projects
const sfxDir = path.join(here, "sfx");
if (!fs.existsSync(path.join(sfxDir, "chime.wav"))) {
  fs.mkdirSync(sfxDir, { recursive: true });
  await run("python3", ["-I", "-c", `
import sys, wave, numpy as np
SR=48000; out=sys.argv[1]; rng=np.random.default_rng(3)
t_of=lambda d: np.arange(int(d*SR))/SR
def write(n,x):
    x=np.clip(x/(np.max(np.abs(x))+1e-9)*0.9,-1,1); x=np.stack([x,x],1)
    w=wave.open(f"{out}/{n}.wav","wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype("<i2").tobytes()); w.close()
t=t_of(1.2); write("chime", sum(np.sin(2*np.pi*f*t)*np.exp(-t*d)*a for f,d,a in ((1568,3.5,1),(2349,5,.5),(3136,7,.25))))
t=t_of(0.18); f=500+900*t/0.18; write("pop", np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*28))
t=t_of(1.6); n=np.convolve(rng.standard_normal(len(t)),np.ones(60)/60,"same"); f=120+260*(t/1.6)
write("grow", (n*2.5+np.sin(2*np.pi*np.cumsum(f)/SR)*0.25)*np.sin(np.pi*t/1.6)**2)
t=t_of(1.2); f=700*np.exp(-t*1.8)+90; write("fall", np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*1.5)*0.6+np.convolve(rng.standard_normal(len(t)),np.ones(40)/40,"same")*np.exp(-t*2)*2)
t=t_of(0.45); n=np.convolve(rng.standard_normal(len(t)),np.ones(12)/12,"same"); write("whoosh", n*np.sin(np.pi*t/0.45)**2)
`, sfxDir]);
}
if (!fs.existsSync(path.join(here, "music/soft.wav"))) { fs.mkdirSync(path.join(here, "music"), { recursive: true }); await run("python3", [path.join(ROOT, "tools/lovesong.py"), "--soft", "--bpm", "90", "--bars", "20", "--seed", "5", path.join(here, "music/soft.wav")]); }

const bd = path.join(here, "build"), A = path.join(bd, "assets");
fs.mkdirSync(A, { recursive: true });
fs.writeFileSync(path.join(bd, "index.html"), html);
const cp = (f, to) => fs.copyFileSync(path.isAbsolute(f) ? f : path.join(ROOT, f), path.join(A, to));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
cp("node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2", "inter-500.woff2");
cp("node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2", "inter-800.woff2");
cp("node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2", "serif-600i.woff2");
cp(kit.logo.darkInk, "logo-dark.png"); cp(kit.logo.lightInk, "logo-light.png"); cp(kit.logo.mono, "logo-mono.png");
for (const s of ["chime", "pop", "grow", "fall", "whoosh"]) cp(path.join(sfxDir, `${s}.wav`), `${s}.wav`);
cp(path.join(here, "vo/voice.wav"), "voice.wav");
await prepMusic(path.join(here, "music/soft.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "rizco-brand-tree-reel", name: "The Brand Tree" }, null, 2));
log(`total ${TOTAL}s, ${chunks.length} caption chunks, ${fx.length} sfx`);
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(here, "raw.mp4"), out = path.join(here, "out"), mp4 = path.join(out, "rizco-the-brand-tree.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log("RENDER COMPLETE " + path.relative(ROOT, mp4));
