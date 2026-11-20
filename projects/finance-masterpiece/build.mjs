// Riz.co finance reel: "Where did my money go?" (50 s, 9:16, bold-slam · gold-pop).
// Story: payday -> balance drains -> plot twist -> the Income & Expenses Tracker fixes it.
// EXAMPLE DATA only. Voice: local Kokoro (am_michael). Word timings: Scriptivox. Music + SFX: generated locally.
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
// gold-pop theme
const C = { iv: "#f2efe6", ink: "#121212", gold: "#c9a85c", goldD: "#8a6f2e", cream: "#f8f5ee", mut: "#6b665c", card: "#ffffff",
  line: "#e6dfcf", ok: "#2e7d4f", bad: "#c0392b", inc: "#b9d3b4", spend: "#e9bfc4", sav: "#bcd0e3" };
const fmt = (v) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TOTAL = 50.0;
const SC = { hook: [0, 9.5], twist: [9.5, 14.0], intro: [14.0, 18.0], sheet: [18.0, 25.5], month: [25.5, 30.0], report: [30.0, 33.5],
  year: [33.5, 37.0], both: [37.0, 41.0], plan: [41.0, 44.0], end: [44.0, TOTAL] };
const js = []; const T = (x) => js.push(x);
const counter = (sel, from, to, t, dur, ease = "power2.out", pre = "") => {
  const v = `c${js.length}`;
  T(`const ${v} = { v: ${from} }; tl.to(${v}, { v: ${to}, duration: ${n3(dur)}, ease: "${ease}", onUpdate: () => { document.querySelector("${sel}").textContent = "${pre}" + ${v}.v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } }, ${n3(t)});`);
};
const slam = (sel, t, rot = -4, st = 0.12) => T(`tl.fromTo("${sel}", { scale: 2.3, opacity: 0, rotation: ${rot * 2} }, { scale: 1, opacity: 1, rotation: ${rot}, duration: 0.22, stagger: ${st}, ease: "power4.in" }, ${n3(t)});`);
const rise = (sel, t, st = 0.1) => T(`tl.fromTo("${sel}", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: ${st}, ease: "power3.out" }, ${n3(t)});`);
const pop = (sel, t, st = 0.1) => T(`tl.fromTo("${sel}", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, stagger: ${st}, ease: "back.out(2.6)" }, ${n3(t)});`);
const shake = (sel, t, n = 7, d = 10) => T(`tl.fromTo("${sel}", { x: -${d} }, { x: ${d}, duration: 0.04, repeat: ${n}, yoyo: true, ease: "none" }, ${n3(t)}); tl.set("${sel}", { x: 0 }, ${n3(t + 0.04 * (n + 1))});`);
const chars = (id, text) => [...text].map((ch) => `<span class="ch">${ch === " " ? "&nbsp;" : h(ch)}</span>`).join("");
const typeIn = (sel, t, speed = 0.07) => T(`tl.to("${sel} .ch", { opacity: 1, duration: 0.01, stagger: ${speed} }, ${n3(t)});`);
const fx = []; const sfx = (t, s, v = 0.35, d = 0.6) => fx.push([t, s, v, d]);

// ---------- captions (bold-slam: ≤2 words, uppercase) from Scriptivox word timings
const words = fs.readFileSync(path.join(here, "vo/words.tsv"), "utf8").trim().split("\n").map((l) => { const [a, z, w] = l.split("\t"); return { a: +a, z: +z, w }; });
const capOn = [[0, 7.9], SC.sheet, SC.month, SC.report, SC.year];
const inOn = (t) => capOn.some(([a, b]) => t >= a + 0.05 && t < b - 0.1);
const hot = /\d|money|tracked|category|rest|flags|fix|month|done|report|english|year|save|payday/i;
const chunks = [];
for (let i = 0; i < words.length;) {
  const c = [words[i]]; i++;
  if (!/[.,!?]$/.test(c[0].w) && words[i] && words[i].a - c[0].z < 0.25 && !/[.,!?]$/.test(c[0].w)) { c.push(words[i]); i++; }
  chunks.push({ a: c[0].a, z: c[c.length - 1].z, ws: c.map((x) => x.w) });
}
let capHtml = "";
chunks.filter((c) => inOn(c.a)).forEach((c, i, arr) => {
  const next = arr[i + 1] ? Math.min(arr[i + 1].a, c.z + 0.5) : c.z + 0.4;
  const end = capOn.find(([a, b]) => c.a >= a && c.a < b)[1] - 0.12;
  capHtml += `<div class="cc" id="cc${i}">${c.ws.map((w) => `<span class="${hot.test(w) ? "hot" : ""}">${h(w.toUpperCase())}</span>`).join(" ")}</div>`;
  T(`tl.fromTo("#cc${i}", { scale: 1.9, opacity: 0, rotation: -3 }, { scale: 1, opacity: 1, rotation: -1.5, duration: 0.14, ease: "power4.in" }, ${n3(c.a - 0.06)});`);
  T(`tl.to("#cc${i}", { opacity: 0, duration: 0.04 }, ${n3(Math.min(next, end) - 0.05)});`);
});

const logo = (v = "dark") => `<img class="logo" src="assets/logo-${v}.png" alt=""/>`;
const giant = (txt, cls = "") => `<div class="giant ${cls}">${h(txt)}</div>`;
const kick = (txt) => `<div class="kick">${txt}</div>`;
const sec = (id, [a, b], inner, cls = "scene") => `<section id="${id}" class="clip ${cls}" data-start="${n3(a)}" data-duration="${n3(b - a)}" data-track-index="0">${inner}</section>`;

// ---------- 1. HOOK: payday -> drained
const receipts = [["House Rent", 600], ["Car Instalment", 350], ["Online Shopping", 214.6], ["Groceries", 185.4], ["Bubble Tea ×6", 39], ["Food Delivery", 96.5], ["Phone Bill", 45], ["Subscriptions", 42.99], ["Fuel", 60], ["Movie Night", 48], ["Late-night Snacks", 23.4], ["???", 1232.71]];
const left = 2950 - receipts.reduce((s, [, v]) => s + v, 0); // 12.40
const hook = `${logo()}${giant("$")}
<div id="bal"><div class="bt"><span>MY BALANCE</span><span id="bdate">PAYDAY · 25 NOV</span></div>
<div class="bv"><span class="cur">B$</span><span id="bnum">0.00</span></div><div class="bbar"><i id="bfill"></i></div></div>
<div id="later">3 DAYS LATER…</div>
${receipts.map(([n, v], i) => `<div class="rc" id="rc${i}" style="left:${[60, 560, 120, 600, 80, 520, 160, 640, 40, 580, 200, 400][i]}px;top:${[1130, 1180, 1250, 1300, 1370, 1150, 1200, 1260, 1320, 1220, 1290, 1160][i]}px">${h(n)} <b>−${fmt(v)}</b></div>`).join("")}
<div id="where">WHERE<br>DID IT GO<em>?</em></div>`;
rise("#bal", 0.15);
counter("#bnum", 0, 2950, 1.1, 2.1, "power3.out");
T(`tl.fromTo("#bfill", { scaleX: 0 }, { scaleX: 1, duration: 2.1, ease: "power3.out", transformOrigin: "0% 50%" }, 1.1);`);
T(`tl.to("#bal", { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1 }, 3.25); tl.to("#bal .bv", { color: "${C.ok}", duration: 0.2 }, 3.25);`);
sfx(1.1, "coin", 0.25); sfx(1.6, "coin", 0.25); sfx(2.1, "coin", 0.25); sfx(3.2, "chaching", 0.5, 1.1);
slam("#later", 4.9, -5); sfx(4.9, "stamp", 0.45); T(`tl.to("#bdate", { opacity: 0, duration: 0.1 }, 4.9); tl.to("#bal .bv", { color: "${C.cream}", duration: 0.2 }, 4.9);`);
receipts.forEach((_, i) => {
  const t = 5.45 + i * 0.15;
  T(`tl.fromTo("#rc${i}", { y: -560, opacity: 0, scale: 0.6, rotation: ${(i % 2 ? 1 : -1) * 8} }, { y: 0, opacity: 1, scale: 1, rotation: ${(i % 2 ? -1 : 1) * 6}, duration: 0.28, ease: "back.out(1.6)" }, ${n3(t)});`);
  if (i % 3 === 0) sfx(t, "tick", 0.3, 0.1);
});
counter("#bnum", 2950, left, 5.45, 1.85, "power1.in");
T(`tl.to("#bfill", { scaleX: ${n3(left / 2950)}, backgroundColor: "${C.bad}", duration: 1.85, ease: "power1.in" }, 5.45);`);
sfx(5.4, "drain", 0.5, 1.6);
T(`tl.to("#bal .bv", { color: "${C.bad}", duration: 0.2 }, 7.3);`);
shake("#bal", 7.44, 9, 14); sfx(7.44, "buzz", 0.35, 0.4);
T(`tl.to("#hook .rc", { opacity: 0.18, duration: 0.3 }, 7.9);`);
slam("#where", 7.95, 3); sfx(7.95, "scratch", 0.3, 0.8);

// ---------- 2. PLOT TWIST (gold)
const twist = `${logo("mono")}${giant("?!", "dk")}
<div class="tk" id="tk">PLOT TWIST.</div>
<div class="tw" id="tw1">YOUR MONEY</div><div class="tw" id="tw2">DIDN'T VANISH.</div>
<div class="tw sm" id="tw3">YOU JUST NEVER</div><div class="tw big" id="tw4"><em>tracked</em> IT.</div>`;
slam("#tk", 9.8, -6); sfx(9.8, "stamp", 0.4);
slam("#tw1", 11.0, -2); slam("#tw2", 11.5, 2); sfx(11.5, "stamp", 0.3);
T(`tl.to("#tw1, #tw2", { y: -120, opacity: 0.35, duration: 0.3, ease: "power2.out" }, 12.25);`);
slam("#tw3", 12.3, -2); slam("#tw4", 12.95, -3); sfx(12.95, "stamp", 0.5);
shake("#twist .tw.big", 13.2, 5, 8);

// ---------- 3. INTRO
const tabs = ["Transactions", "Monthly", "Report", "Year"];
const intro = `${logo()}${giant("B$")}${kick("A RIZ.CO EXCEL TEMPLATE")}
<div class="it" id="it1">INCOME &amp;</div><div class="it" id="it2">EXPENSES</div><div class="it gold" id="it3"><em>Tracker.</em></div>
<div class="tabs">${tabs.map((t, i) => `<span class="tab" id="tab${i}">${t}</span>`).join("")}</div>
<div class="xl"><b>X</b> Works in Excel</div>`;
sfx(13.0, "riser", 0.3, 1.5);
rise("#intro .kick", 14.2); slam("#it1", 15.45, -2); slam("#it2", 16.5, 2); slam("#it3", 17.15, -4); sfx(17.15, "stamp", 0.45);
pop("#intro .tab", 15.9, 0.12); pop("#intro .xl", 16.9);

// ---------- 4. SHEET: encode once + catches mistakes
const field = (id, label, inner, cls = "") => `<div class="fd ${cls}" id="${id}"><span class="fl">${label}</span><span class="fv">${inner}</span></div>`;
const dd = ["Groceries", "Dining Out", "Fuel & Transport", "Health"];
const sheet = `${logo()}${giant("01")}${kick("STEP 01 · ENCODE ONCE")}
<div class="row" id="rowA"><div class="rh"><span>NEW TRANSACTION</span><span class="badge ok" id="okA">✓ CHECKED</span></div>
<div class="fg">${field("fA0", "DATE", `<span id="tA0">${chars("tA0", "9 Nov")}</span>`)}${field("fA1", "DESCRIPTION", `<span id="tA1">${chars("tA1", "Car Fuel")}</span>`)}
${field("fA2", "CATEGORY ▾", `<span id="tA2" class="sel">Fuel &amp; Transport</span>`)}${field("fA3", "AMOUNT", `<span id="tA3">${chars("tA3", "30.00")}</span>`, "num")}
${field("fA4", "TYPE", `<span id="tA4">Expense</span>`, "auto")}${field("fA5", "CHECK", `<span id="tA5">✓ OK</span>`, "auto")}</div>
<div id="dd">${dd.map((d, i) => `<div class="ddi${i === 2 ? " on" : ""}">${h(d)}</div>`).join("")}</div>
<div id="autoTag">⚡ FILLS ITSELF</div></div>
<div class="row" id="rowB"><div class="rh"><span>NEXT ROW</span><span class="badge bad" id="badB">⚠ MISSING AMOUNT</span><span class="badge ok" id="okB">✓ FIXED</span></div>
<div class="fg">${field("fB0", "DATE", "10 Nov")}${field("fB1", "DESCRIPTION", "Lunch")}${field("fB2", "CATEGORY ▾", "Dining Out")}${field("fB3", "AMOUNT", `<span id="tB3">${chars("tB3", "12.50")}</span><i class="caret" id="caretB"></i>`, "num")}
${field("fB4", "TYPE", "Expense", "auto")}${field("fB5", "CHECK", `<span id="xB">✕ FIX ME</span><span id="vB">✓ OK</span>`, "auto")}</div></div>
<div class="exl">EXAMPLE DATA</div>`;
const S = SC.sheet[0];
rise("#rowA", S + 0.1);
typeIn("#tA0", 18.4, 0.06); sfx(18.4, "tick", 0.25, 0.1); typeIn("#tA1", 18.9, 0.05); sfx(18.95, "tick", 0.25, 0.1);
T(`tl.fromTo("#dd", { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.2, ease: "power2.out", transformOrigin: "50% 0%" }, 19.45); tl.to("#dd", { opacity: 0, duration: 0.12 }, 20.05);`);
T(`tl.fromTo("#tA2", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 20.1);`); sfx(20.1, "tick", 0.3, 0.1);
typeIn("#tA3", 20.25, 0.05); sfx(20.3, "tick", 0.25, 0.1);
T(`tl.fromTo("#fA4, #fA5", { boxShadow: "0 0 0 0 rgba(201,168,92,0)" }, { boxShadow: "0 0 0 6px rgba(201,168,92,1)", duration: 0.2, yoyo: true, repeat: 3 }, 20.55);`);
pop("#tA4", 20.6); pop("#tA5", 20.85); pop("#okA", 21.05); slam("#autoTag", 20.7, -4); sfx(20.7, "coin", 0.35); sfx(21.05, "coin", 0.3);
T(`tl.to("#rowA", { y: -40, scale: 0.92, opacity: 0.55, duration: 0.4, ease: "power2.inOut" }, 21.6); tl.to("#autoTag", { opacity: 0, duration: 0.2 }, 21.6);`);
rise("#rowB", 21.75);
T(`tl.to("#fB3, #fB5", { backgroundColor: "#fbe3e0", duration: 0.2 }, 22.6);`); pop("#xB", 22.6); slam("#badB", 22.65, -3); sfx(22.65, "buzz", 0.35, 0.4);
shake("#rowB", 23.5, 5, 8); T(`tl.to("#badB", { scale: 1.12, duration: 0.18, yoyo: true, repeat: 3 }, 23.5);`);
T(`tl.fromTo("#caretB", { opacity: 0 }, { opacity: 1, duration: 0.01, repeat: 3, yoyo: true, repeatDelay: 0.15 }, 23.9);`);
typeIn("#tB3", 24.3, 0.08); sfx(24.3, "tick", 0.25, 0.1); sfx(24.55, "tick", 0.25, 0.1);
T(`tl.to("#fB3, #fB5", { backgroundColor: "#e1f1e6", duration: 0.2 }, 24.95); tl.to("#xB", { opacity: 0, duration: 0.1 }, 24.95); tl.to("#badB", { opacity: 0, duration: 0.1 }, 24.95);`);
pop("#vB", 25.0); slam("#okB", 25.0, -3); sfx(25.0, "coin", 0.4);

// ---------- 5. MONTHLY
const inc = 2950, spent = 1122.9, saved = 700, rest = inc - spent - saved;
const kpi = [["INCOME", inc, C.inc, 26.95], ["SPENDING", spent, C.spend, 27.5], ["SAVINGS", saved, C.sav, 28.0]];
const month = `${logo()}${giant("02")}${kick("STEP 02 · PICK A MONTH")}
<div class="mp" id="mp"><span>NOVEMBER 2026</span><b>▾</b></div>
<div class="kp">${kpi.map(([n, v, c], i) => `<div class="kc" id="kc${i}"><div class="kt" style="background:${c}">${n}</div><div class="kv">B$<span id="kv${i}">0.00</span></div></div>`).join("")}
<div class="kc wide" id="kc3"><div class="kt" style="background:#ecdcb0">BUDGETS</div><div class="bud">${[["Groceries", 85.4, 300], ["Dining Out", 12.5, 100], ["Fuel & Transport", 30, 150]].map(([n, a, b], i) => `<div class="bl"><span>${h(n)}</span><div class="bb"><i id="bb${i}" style="width:${Math.round((a / b) * 100)}%"></i></div><b>${Math.round((a / b) * 100)}%</b></div>`).join("")}</div></div></div>
<div class="done" id="done">✓ DONE FOR YOU</div><div class="exl">EXAMPLE DATA</div>`;
slam("#mp", 26.15, -2); sfx(26.15, "tick", 0.3, 0.1);
kpi.forEach(([, v, , t], i) => { pop(`#kc${i}`, t - 0.1); counter(`#kv${i}`, 0, v, t, 0.9); sfx(t, "coin", 0.25); });
pop("#kc3", 28.4); [0, 1, 2].forEach((i) => T(`tl.fromTo("#bb${i}", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out", transformOrigin: "0% 50%" }, ${n3(28.55 + i * 0.12)});`));
slam("#done", 29.1, -5); sfx(29.1, "stamp", 0.45);

// ---------- 6. REPORT
const rl = [["✓", "You saved <b>24%</b> of your income. That beats the 20% goal."], ["▲", "Biggest spend: <b>Rent</b>, 53% of everything you spent."], ["→", `Move the spare <b>B$${fmt(rest)}</b> into savings before it gets spent.`]];
const report = `${logo()}${giant("03")}${kick("STEP 03 · YOUR REPORT")}
<div class="doc" id="doc"><div class="dh"><span>MONTHLY REPORT</span><span>NOV 2026</span></div>
${rl.map(([i, x], k) => `<div class="dl" id="dl${k}"><span class="di">${i}</span><p>${x.split(" ").map((w) => `<span class="w">${w}</span>`).join(" ")}</p></div>`).join("")}
<div class="sig">Written for you, automatically.</div></div><div class="exl">EXAMPLE DATA</div>`;
rise("#doc", 30.1);
rl.forEach((_, k) => { const t = 30.55 + k * 0.85; pop(`#dl${k} .di`, t); T(`tl.fromTo("#dl${k} .w", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.12, stagger: 0.035 }, ${n3(t + 0.1)});`); sfx(t, "tick", 0.3, 0.1); });
rise("#report .sig", 33.0);

// ---------- 7. YEAR
const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const sv = [620, 540, 710, 480, 760, 650, 590, 720, 680, 700, 700, 0];
const year = `${logo()}${giant("04")}${kick("STEP 04 · YOUR WHOLE YEAR")}
<div class="yc">${months.map((m, i) => `<div class="ycol"><div class="ybar"><i id="yb${i}" style="height:${i === 11 ? 70 : Math.round((sv[i] / 800) * 100)}%" class="${i === 11 ? "proj" : ""}"></i></div><span>${m}</span></div>`).join("")}</div>
<div class="ys"><span>ON TRACK TO SAVE</span><b>B$<span id="ysv">0.00</span></b><small>this year · projection</small></div><div class="exl">EXAMPLE DATA</div>`;
T(`tl.fromTo("#year .ybar i", { scaleY: 0 }, { scaleY: 1, duration: 0.45, stagger: 0.07, ease: "back.out(1.6)", transformOrigin: "50% 100%" }, 34.1);`);
rise("#year .ys", 35.4); counter("#ysv", 0, 8400, 35.5, 1.3, "power3.out"); sfx(36.75, "chaching", 0.5, 1.1);
T(`tl.fromTo("#year .ybar i.proj", { opacity: 0.4 }, { opacity: 1, duration: 0.3, yoyo: true, repeat: 3 }, 35.0);`);

// ---------- 8. BOTH (gold)
const both = `${logo("mono")}${giant("+", "dk")}
<div class="half" id="hb"><div class="hq">RUNNING A<br>BUSINESS?</div><ul><li>Sales</li><li>Stock</li><li>Cash flow</li></ul><div class="fy" id="fy1">FOR YOU.</div></div>
<div class="half" id="hy"><div class="hq">JUST<br>YOU?</div><ul><li>Salary</li><li>Bills</li><li>Savings</li></ul><div class="fy" id="fy2">FOR YOU <em>too.</em></div></div>`;
T(`tl.fromTo("#hb", { x: -700 }, { x: 0, duration: 0.4, ease: "power3.out" }, 37.3); tl.fromTo("#hy", { x: 700 }, { x: 0, duration: 0.4, ease: "power3.out" }, 38.95);`);
rise("#hb li", 37.7, 0.1); rise("#hy li", 39.35, 0.1);
slam("#fy1", 38.45, -6); sfx(38.45, "stamp", 0.4); slam("#fy2", 40.55, -6); sfx(40.55, "stamp", 0.45);

// ---------- 9. PLAN
const plan = `${logo()}${giant("$")}
<div class="pl" id="pl1">EVERY</div><div class="pl" id="pl2">DOLLAR</div><div class="pl sm" id="pl3">DESERVES</div><div class="pl gold" id="pl4"><em>a plan.</em></div>`;
slam("#pl1", 41.8, -2, 0); slam("#pl2", 42.12, 2, 0); slam("#pl3", 42.6, -2, 0); slam("#pl4", 43.4, -4, 0);
sfx(42.12, "stamp", 0.3); sfx(43.4, "chaching", 0.5, 1.1);

// ---------- 10. END CARD
const end = `<img class="elogo" src="assets/logo-light.png" alt="Riz.co"/><div class="wm">${h(kit.wordmark)}</div><div class="tag">${h(kit.tagline).replace(". ", ".<br>")}</div><div class="cta">SAVE THIS FOR PAYDAY</div>`;
T(`tl.fromTo("#end .elogo", { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "power4.in" }, 44.2);`); sfx(44.2, "stamp", 0.4);
rise("#end .wm", 44.7); rise("#end .tag", 45.2); pop("#end .cta", 46.9);
T(`tl.to("#end .cta", { scale: 1.06, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut" }, 47.4);`);

// giant decor drift + stripe transitions
Object.keys(SC).filter((k) => k !== "end").forEach((k) => { const [a, b] = SC[k]; T(`tl.fromTo("#${k} .giant", { scale: 1.15, rotation: -6 }, { scale: 1, rotation: 4, duration: ${n3(b - a)}, ease: "none" }, ${n3(a)});`); });
const cuts = Object.values(SC).slice(1).map((s) => s[0]);
cuts.forEach((t, i) => { T(`tl.fromTo("#st${i} i", { xPercent: -130 }, { xPercent: 130, duration: 0.5, stagger: 0.04, ease: "power3.inOut" }, ${n3(t - 0.3)});`); sfx(t - 0.3, "whoosh", 0.3, 0.45); });
T(`tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${n3(SC.end[0])}, ease: "none" }, 0);`);

const css = `
@font-face{font-family:"Inter";font-weight:600;src:url(assets/inter-600.woff2) format("woff2")}
@font-face{font-family:"Inter";font-weight:800;src:url(assets/inter-800.woff2) format("woff2")}
@font-face{font-family:"Serif";font-weight:800;font-style:italic;src:url(assets/serif-800i.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.iv};font-family:Inter,sans-serif;color:${C.ink}}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
.scene{background:${C.iv};overflow:hidden}
.scene::before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(0,0,0,.06) 1.2px,transparent 1.2px);background-size:7px 7px}
.gold-bg{background:${C.gold}}
.logo{position:absolute;top:80px;left:50%;height:58px;transform:translateX(-50%);z-index:5}
.giant{position:absolute;left:-10%;right:-10%;top:300px;text-align:center;font-weight:800;font-size:1100px;line-height:1;letter-spacing:-0.06em;color:transparent;-webkit-text-stroke:5px rgba(201,168,92,.35);z-index:0}
.giant.dk{-webkit-text-stroke:5px rgba(18,18,18,.16)}
.kick{position:absolute;top:190px;left:0;right:0;text-align:center;font-weight:800;font-size:30px;letter-spacing:.3em;color:${C.goldD};z-index:3}
em{font-family:Serif,serif;font-style:italic;text-transform:none;background:linear-gradient(transparent 58%,${C.gold} 58%,${C.gold} 92%,transparent 92%);padding:0 .08em}
#bal{position:absolute;left:70px;right:70px;top:330px;background:${C.ink};color:${C.cream};border-radius:40px;padding:40px 46px 46px;box-shadow:0 40px 90px rgba(0,0,0,.25);opacity:0;z-index:3}
.bt{display:flex;justify-content:space-between;font-weight:800;font-size:28px;letter-spacing:.16em;color:${C.gold}}
.bv{margin-top:26px;font-weight:800;font-size:170px;letter-spacing:-0.05em;line-height:1;font-variant-numeric:tabular-nums;color:${C.cream}}
.bv .cur{font-size:80px;margin-right:14px;color:${C.gold}}
.bbar{margin-top:34px;height:26px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden}
.bbar i{display:block;height:100%;background:${C.gold};border-radius:99px}
#later{position:absolute;left:150px;right:150px;top:760px;text-align:center;font-weight:800;font-size:72px;letter-spacing:-0.02em;background:${C.gold};color:${C.ink};padding:16px 0;border-radius:18px;opacity:0;z-index:4}
.rc{position:absolute;font-weight:800;font-size:31px;background:${C.card};padding:16px 22px;border-radius:14px;box-shadow:0 14px 34px rgba(0,0,0,.16);white-space:nowrap;opacity:0;z-index:2;border-left:10px solid ${C.bad}}
.rc b{color:${C.bad}}
#where{position:absolute;left:60px;right:60px;top:960px;text-align:center;font-weight:800;font-size:150px;line-height:.95;letter-spacing:-0.05em;opacity:0;z-index:4;text-shadow:0 6px 0 ${C.iv}}
#twist{background:${C.gold}}
#twist::before{background-image:radial-gradient(rgba(0,0,0,.08) 1.2px,transparent 1.2px)}
.tk{position:absolute;left:0;right:0;top:330px;text-align:center;font-weight:800;font-size:64px;letter-spacing:.12em;opacity:0;z-index:2}
.tk{left:250px;right:250px;background:${C.ink};color:${C.gold};border-radius:16px;padding:12px 0}
.tw{position:absolute;left:40px;right:40px;text-align:center;font-weight:800;font-size:142px;line-height:1;letter-spacing:-0.05em;opacity:0;z-index:2}
#tw1{top:600px} #tw2{top:760px;font-size:122px} #tw3{top:880px;font-size:96px} #tw4{top:1010px;font-size:190px}
#tw4 em{color:${C.cream};background:linear-gradient(transparent 58%,${C.ink} 58%,${C.ink} 92%,transparent 92%)}
.it{position:absolute;left:40px;right:40px;text-align:center;font-weight:800;font-size:150px;line-height:1;letter-spacing:-0.05em;opacity:0;z-index:2}
#it1{top:330px} #it2{top:490px} #it3{top:650px;font-size:190px}
.tabs{position:absolute;left:60px;right:60px;top:950px;display:flex;flex-wrap:wrap;justify-content:center;gap:16px;z-index:2}
.tab{font-weight:800;font-size:34px;padding:16px 28px;border-radius:16px 16px 0 0;border:4px solid ${C.ink};border-bottom-width:8px;background:${C.card};opacity:0}
.tab:first-child{background:${C.gold}}
.xl{position:absolute;left:0;right:0;top:1160px;text-align:center;font-weight:800;font-size:36px;color:${C.mut};opacity:0;z-index:2}
.xl b{display:inline-block;width:56px;height:56px;line-height:56px;border-radius:12px;background:#1d6f42;color:#fff;margin-right:14px}
.row{position:absolute;left:50px;right:50px;top:300px;background:${C.card};border-radius:30px;box-shadow:0 30px 70px rgba(0,0,0,.14);opacity:0;z-index:3}
#rowB{top:770px;z-index:4}
.rh{display:flex;justify-content:space-between;align-items:center;padding:24px 30px;border-bottom:3px solid ${C.line};font-weight:800;font-size:28px;letter-spacing:.14em;position:relative}
.badge{position:absolute;right:26px;top:16px;font-size:28px;letter-spacing:.04em;padding:8px 18px;border-radius:99px;opacity:0}
.badge.ok{background:#e1f1e6;color:${C.ok}} .badge.bad{background:${C.bad};color:#fff}
.fg{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:24px 26px 28px}
.fd{background:#f7f4ec;border-radius:16px;padding:14px 20px;display:flex;flex-direction:column;gap:6px;position:relative}
.fd.auto{background:#efeaf3}
.fl{font-weight:800;font-size:20px;letter-spacing:.12em;color:${C.mut}}
.fv{font-weight:800;font-size:42px;letter-spacing:-0.02em;min-height:52px;white-space:nowrap}
.fd.num .fv{font-variant-numeric:tabular-nums}
.ch{opacity:0}
#tA2,#tA4,#tA5,#vB{opacity:0;display:inline-block}
#tA5,#vB{color:${C.ok}} #xB{color:${C.bad};display:inline-block;opacity:0} #vB{position:absolute;left:20px;bottom:14px}
.caret{display:inline-block;width:5px;height:44px;background:${C.ink};vertical-align:-6px;opacity:0;margin-left:4px}
#dd{position:absolute;left:26px;top:330px;width:500px;background:#fff;border:3px solid ${C.line};border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.2);opacity:0;z-index:6;overflow:hidden}
.ddi{font-weight:600;font-size:32px;padding:14px 22px} .ddi.on{background:${C.gold};font-weight:800}
#autoTag{position:absolute;right:30px;bottom:-40px;font-weight:800;font-size:40px;background:${C.ink};color:${C.gold};padding:14px 26px;border-radius:16px;opacity:0;z-index:6}
.exl{position:absolute;left:0;right:0;top:1440px;text-align:center;font-weight:800;font-size:24px;letter-spacing:.2em;color:${C.mut};z-index:2}
.mp{position:absolute;left:250px;right:250px;top:290px;display:flex;justify-content:center;gap:18px;font-weight:800;font-size:44px;background:${C.ink};color:${C.cream};padding:20px 0;border-radius:99px;opacity:0;z-index:3}
.mp b{color:${C.gold}}
.kp{position:absolute;left:50px;right:50px;top:440px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;z-index:3}
.kc{background:${C.card};border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.12);opacity:0}
.kc.wide{grid-column:1 / -1}
.kt{font-weight:800;font-size:24px;letter-spacing:.12em;padding:14px 20px}
.kv{font-weight:800;font-size:52px;letter-spacing:-0.03em;padding:22px 18px;font-variant-numeric:tabular-nums}
.bud{padding:20px 26px 26px;display:flex;flex-direction:column;gap:20px}
.bl{display:grid;grid-template-columns:300px 1fr 90px;align-items:center;gap:20px;font-weight:800;font-size:32px}
.bl b{text-align:right}
.bb{height:26px;border-radius:99px;background:#efe9dc;overflow:hidden} .bb i{display:block;height:100%;background:${C.ok};border-radius:99px}
.done{position:absolute;left:220px;right:220px;top:1180px;text-align:center;font-weight:800;font-size:58px;color:${C.ok};border:8px solid ${C.ok};border-radius:20px;padding:10px 0;background:rgba(242,239,230,.95);opacity:0;z-index:5}
.doc{position:absolute;left:60px;right:60px;top:290px;background:${C.card};border-radius:30px;box-shadow:0 30px 70px rgba(0,0,0,.14);padding:0 0 30px;opacity:0;z-index:3}
.dh{display:flex;justify-content:space-between;padding:26px 34px;background:${C.ink};color:${C.gold};border-radius:30px 30px 0 0;font-weight:800;font-size:30px;letter-spacing:.14em}
.dl{display:flex;gap:22px;padding:30px 34px 6px;align-items:flex-start}
.di{flex:none;width:66px;height:66px;border-radius:50%;background:${C.gold};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:34px;opacity:0}
.dl p{font-weight:600;font-size:42px;line-height:1.3;letter-spacing:-0.01em} .dl p b{font-weight:800;background:linear-gradient(transparent 60%,#ecdcb0 60%)}
.dl .w{opacity:0;display:inline-block}
.sig{margin:26px 34px 0;font-family:Serif,serif;font-style:italic;font-weight:800;font-size:40px;color:${C.goldD};opacity:0}
.yc{position:absolute;left:50px;right:50px;top:290px;height:640px;background:${C.card};border-radius:30px;box-shadow:0 30px 70px rgba(0,0,0,.14);display:flex;gap:12px;padding:40px 30px 26px;z-index:3}
.ycol{flex:1;display:flex;flex-direction:column;align-items:center;gap:12px}
.ybar{flex:1;width:100%;display:flex;align-items:flex-end}
.ybar i{display:block;width:100%;background:${C.gold};border-radius:10px 10px 0 0}
.ybar i.proj{background:repeating-linear-gradient(45deg,${C.gold},${C.gold} 8px,#ecdcb0 8px,#ecdcb0 16px)}
.ycol span{font-weight:800;font-size:26px;color:${C.mut}}
.ys{position:absolute;left:100px;right:100px;top:990px;display:flex;flex-direction:column;align-items:center;background:${C.ink};color:${C.cream};border-radius:30px;padding:26px 0 30px;opacity:0;z-index:3}
.ys > span{font-weight:800;font-size:28px;letter-spacing:.2em;color:${C.gold}} .ys b{font-weight:800;font-size:120px;letter-spacing:-0.05em;line-height:1.05;font-variant-numeric:tabular-nums} .ys small{font-weight:600;font-size:26px;opacity:.7}
#both{background:${C.gold}}
.half{position:absolute;left:50px;right:50px;height:600px;border-radius:34px;padding:36px 40px;z-index:2}
#hb{top:300px;background:${C.ink};color:${C.cream}} #hy{top:960px;background:${C.cream};color:${C.ink}}
.hq{font-weight:800;font-size:82px;line-height:.98;letter-spacing:-0.04em}
.half ul{list-style:none;margin-top:28px;display:flex;flex-direction:column;gap:12px}
.half li{font-weight:800;font-size:40px;opacity:0} .half li::before{content:"● ";color:${C.gold}}
.fy{position:absolute;right:36px;bottom:40px;font-weight:800;font-size:76px;letter-spacing:-0.03em;padding:8px 26px;border-radius:18px;opacity:0}
#fy1{background:${C.gold};color:${C.ink}} #fy2{background:${C.ink};color:${C.cream}}
#fy2 em{color:${C.ink};background:${C.gold};border-radius:10px;padding:0 .16em}
.pl{position:absolute;left:30px;right:30px;text-align:center;font-weight:800;font-size:200px;line-height:1;letter-spacing:-0.06em;opacity:0;z-index:2}
#pl1{top:450px} #pl2{top:650px} #pl3{top:860px;font-size:150px} #pl4{top:1020px;font-size:230px}
#end{background:${C.ink};color:${C.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:30px;padding:0 70px}
.elogo{height:180px;opacity:0}
#end .wm{font-weight:800;font-size:34px;letter-spacing:.5em;margin-right:-.5em;color:${C.gold};opacity:0}
#end .tag{font-family:Serif,serif;font-style:italic;font-weight:800;font-size:80px;line-height:1.1;opacity:0}
#end .cta{margin-top:24px;font-weight:800;font-size:40px;letter-spacing:.04em;color:${C.ink};background:${C.gold};padding:24px 50px;border-radius:99px;opacity:0}
#caps{position:absolute;left:0;right:0;top:1540px;height:220px;z-index:20;pointer-events:none}
.cc{position:absolute;left:40px;right:40px;top:0;text-align:center;font-weight:800;font-size:118px;line-height:1.05;letter-spacing:-0.045em;opacity:0;color:${C.ink};text-shadow:0 5px 0 ${C.iv}}
.cc .hot{background:${C.gold};padding:0 .12em;border-radius:12px;text-shadow:none}
.stripes{position:absolute;inset:-200px;z-index:30;pointer-events:none;transform:rotate(-14deg)}
.stripes i{position:absolute;left:0;right:0;height:470px;transform:translateX(-130%)}
#progress-track{position:absolute;inset:auto 0 0 0;height:12px;background:rgba(0,0,0,.1);z-index:25}
#progress{position:absolute;inset:0;background:${C.gold};transform-origin:left center;transform:scaleX(0)}`;

const stripeCols = [C.gold, C.ink, C.gold, C.ink, C.gold];
const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${n3(TOTAL)}" data-width="${W}" data-height="${H}">
  ${sec("hook", SC.hook, hook)}
  ${sec("twist", SC.twist, twist)}
  ${sec("intro", SC.intro, intro)}
  ${sec("sheet", SC.sheet, sheet)}
  ${sec("month", SC.month, month)}
  ${sec("report", SC.report, report)}
  ${sec("year", SC.year, year)}
  ${sec("both", SC.both, both)}
  ${sec("plan", SC.plan, plan)}
  ${sec("end", SC.end, end, "")}
  <div id="caps" class="clip" data-start="0" data-duration="${n3(SC.end[0])}" data-track-index="2">${capHtml}</div>
  ${cuts.map((t, i) => `<div id="st${i}" class="clip stripes" data-start="${n3(t - 0.32)}" data-duration="0.72" data-track-index="3">${stripeCols.map((c, k) => `<i style="top:${k * 470}px;background:${c}"></i>`).join("")}</div>`).join("\n  ")}
  <div id="progress-track" class="clip" data-start="0" data-duration="${n3(SC.end[0])}" data-track-index="4"><div id="progress"></div></div>
  <audio id="vox" src="assets/voice.wav" data-start="0" data-duration="${n3(TOTAL)}" data-volume="1"></audio>
  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${n3(TOTAL)}" data-media-start="0" data-volume="0.24" data-fade-in="0.3" data-fade-out="3"></audio>
  ${fx.map(([t, s, v, d], i) => `<audio id="fx${i}" src="assets/${s}.wav" data-start="${n3(t)}" data-duration="${n3(d)}" data-volume="${v}"></audio>`).join("\n  ")}
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  ${js.join("\n  ")}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script></body></html>`;

if (!fs.existsSync(path.join(here, "beat/beat.wav"))) { fs.mkdirSync(path.join(here, "beat"), { recursive: true }); await run("python3", [path.join(ROOT, "tools/beatgen.py"), "--bpm", "120", "--bars", "26", "--mood", "drive", "--seed", "11", path.join(here, "beat")]); }
if (!fs.existsSync(path.join(here, "sfx/chaching.wav"))) { fs.mkdirSync(path.join(here, "sfx"), { recursive: true }); await run("python3", ["-I", path.join(here, "sfx.py"), path.join(here, "sfx")]); }
const bd = path.join(here, "build"), A = path.join(bd, "assets");
fs.mkdirSync(A, { recursive: true });
fs.writeFileSync(path.join(bd, "index.html"), html);
const cp = (f, to) => fs.copyFileSync(path.isAbsolute(f) ? f : path.join(ROOT, f), path.join(A, to));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
cp("node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", "inter-600.woff2");
cp("node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2", "inter-800.woff2");
cp("node_modules/@fontsource/playfair-display/files/playfair-display-latin-800-italic.woff2", "serif-800i.woff2");
cp(kit.logo.darkInk, "logo-dark.png"); cp(kit.logo.lightInk, "logo-light.png"); cp(kit.logo.mono, "logo-mono.png");
cp(path.join(here, "beat/whoosh.wav"), "whoosh.wav");
for (const s of ["stamp", "scratch"]) cp(`media/sfx/${s}.wav`, `${s}.wav`);
for (const s of ["chaching", "coin", "tick", "drain", "riser", "buzz"]) cp(path.join(here, `sfx/${s}.wav`), `${s}.wav`);
cp(path.join(here, "vo/voice.wav"), "voice.wav");
await prepMusic(path.join(here, "beat/beat.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "rizco-finance-masterpiece", name: "Where did my money go?" }, null, 2));
log(`total ${TOTAL}s, ${chunks.length} caption chunks, ${fx.length} sfx, balance left B$${fmt(left)}`);
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(here, "raw.mp4"), out = path.join(here, "out"), mp4 = path.join(out, "rizco-where-did-my-money-go.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log("RENDER COMPLETE " + path.relative(ROOT, mp4));
