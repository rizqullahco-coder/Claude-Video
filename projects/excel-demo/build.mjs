// Riz.co Excel template demo: "Income & Expenses Tracker" (~57s, editorial-pop · ivory-gold).
// Rebuilds the template's real tabs/functions as animated UI with EXAMPLE data (no personal data).
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
const C = { bg: "#f2efe6", ink: "#121212", gold: "#a8935e", mut: "#5d5a52", card: "#ffffff", line: "#e3ddd0",
  hdr: "#a57c9b", inc: "#b9d3b4", bill: "#e9bfc4", exp: "#d6bee0", debt: "#edcfb0", sav: "#bcd0e3", cream: "#fff8dc", ok: "#2e7d4f", bad: "#c0392b" };
const fmt = (v) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------- timeline (seconds)
const SC = { hook: [0, 3.6], intro: [3.6, 7.4], s1: [7.4, 18.0], s2: [18.0, 24.6], s3: [24.6, 34.8], s4: [34.8, 45.6], s5: [45.6, 51.4], end: [51.4, 57.6] };
const TOTAL = SC.end[1];
const js = []; const T = (x) => js.push(x);
const chars = (id, text) => [...text].map((ch, k) => `<span class="ch" id="${id}c${k}">${ch === " " ? "&nbsp;" : h(ch)}</span>`).join("");
const typeIn = (id, text, t, speed = 0.06) => T(`tl.to("#${id} .ch", { opacity: 1, duration: 0.01, stagger: ${speed} }, ${n3(t)});`);

// ---------- Transactions sheet (scenes 1+2)
const cols = [["Date", 115], ["Description", 215], ["Category", 245], ["Amount", 140], ["Type", 115], ["Check", 170]];
const cx = cols.reduce((a, [, w], i) => (a.push((a[i] ?? 0) + w), a), [0]);
const RH = 62, HH = 60, ry = (i) => HH + i * RH;
const rows = [
  ["1 Nov", "Monthly Salary", "Salary", 2500, "Income"], ["1 Nov", "Online Orders", "Business / Side Income", 450, "Income"],
  ["2 Nov", "House Rent", "Rent / Housing", 600, "Bill"], ["3 Nov", "Weekly Groceries", "Groceries", 85.4, "Expense"],
  ["5 Nov", "Phone Bill", "Phone & Internet", 45, "Bill"], ["6 Nov", "Car Instalment", "Car Instalment / Loan", 350, "Debt"],
  ["8 Nov", "Emergency Fund", "Emergency Fund", 500, "Savings"], ["8 Nov", "Unit Trust", "Investments", 200, "Savings"],
];
const cell = (i, c, html, cls = "") => `<div class="cell ${cls}" style="left:${cx[c]}px;top:${ry(i)}px;width:${cols[c][1]}px">${html}</div>`;
let grid = cols.map(([n], c) => `<div class="hcell${c >= 4 ? " auto" : ""}" style="left:${cx[c]}px;width:${cols[c][1]}px">${n}</div>`).join("");
rows.forEach((r, i) => { grid += `<div class="row" id="r${i}">${cell(i, 0, r[0])}${cell(i, 1, h(r[1]))}${cell(i, 2, h(r[2]))}${cell(i, 3, fmt(r[3]), "num")}${cell(i, 4, r[4], "auto")}${cell(i, 5, "✓", "auto okc")}</div>`; });
// typed row 8
grid += `<div class="row" id="r8">${cell(8, 0, `<span id="t0">${chars("t0", "9 Nov")}</span>`)}${cell(8, 1, `<span id="t1">${chars("t1", "Car Fuel")}</span>`)}${cell(8, 2, `<span id="t2">Fuel &amp; Transport</span>`)}${cell(8, 3, `<span id="t3">${chars("t3", "30.00")}</span>`, "num")}${cell(8, 4, `<span id="t4">Expense</span>`, "auto")}${cell(8, 5, `<span id="t5">✓</span>`, "auto okc")}</div>`;
// error row 9
grid += `<div class="row" id="r9">${cell(9, 0, "10 Nov")}${cell(9, 1, "Lunch")}${cell(9, 2, "Dining Out")}${cell(9, 3, `<span id="t6">${chars("t6", "12.50")}</span>`, "num")}${cell(9, 4, "Expense", "auto")}${cell(9, 5, `<span id="miss">Missing amount</span><span id="fixed">✓</span>`, "auto")}</div>`;
const dd = ["Groceries", "Dining Out", "Fuel & Transport", "Car Maintenance", "Health", "Entertainment"];
grid += `<div id="dd" style="left:${cx[2]}px;top:${ry(9)}px;width:${cols[2][1] + 40}px"><div id="ddh"></div>${dd.map((d) => `<div class="ddi">${h(d)}</div>`).join("")}</div>`;
grid += `<div id="act"></div><div id="glow4" class="glow" style="left:${cx[4]}px;top:${ry(8)}px;width:${cols[4][1] + cols[5][1]}px"></div>`;
grid += `<div id="callout" style="left:${cx[4] - 60}px;top:${ry(9) + 16}px">↑ fills itself ✨</div>`;
const actAt = (row, col, t) => T(`tl.to("#act", { x: ${cx[col]}, y: ${ry(row)}, width: ${cols[col][1]}, duration: 0.25, ease: "power2.out" }, ${n3(t)});`);

// scene 1 timings
T(`tl.fromTo("#sheet", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, ${n3(SC.s1[0] + 0.2)});`);
rows.forEach((_, i) => T(`tl.fromTo("#r${i}", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 }, ${n3(SC.s1[0] + 0.6 + i * 0.12)});`));
T(`tl.set("#r8", { opacity: 1 }, ${n3(SC.s1[0] + 1.9)});`);
T(`tl.fromTo("#act", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${n3(SC.s1[0] + 2.1)});`);
T(`tl.set("#act", { x: ${cx[0]}, y: ${ry(8)}, width: ${cols[0][1]} }, ${n3(SC.s1[0] + 2.0)});`);
typeIn("t0", "9 Nov", 9.7); actAt(8, 1, 10.4); typeIn("t1", "Car Fuel", 10.6); actAt(8, 2, 11.4);
T(`tl.fromTo("#dd", { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.25, ease: "power2.out", transformOrigin: "50% 0%" }, 11.7);`);
T(`tl.set("#ddh", { y: 0 }, 11.7); tl.to("#ddh", { y: 50, duration: 0.2 }, 12.1); tl.to("#ddh", { y: 100, duration: 0.2 }, 12.5);`);
T(`tl.to("#dd", { opacity: 0, duration: 0.15 }, 13.0); tl.fromTo("#t2", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 13.05);`);
actAt(8, 3, 13.4); typeIn("t3", "30.00", 13.6, 0.07);
T(`tl.to("#act", { opacity: 0, duration: 0.2 }, 14.2);`);
T(`tl.to("#sheet", { scale: 1.15, duration: 0.9, ease: "power2.inOut", transformOrigin: "94% 100%" }, 9.3);`);
T(`tl.to("#sheet", { scale: 1.0, duration: 0.8, ease: "power2.inOut", transformOrigin: "94% 100%" }, 22.2);`);
T(`tl.fromTo("#glow4", { opacity: 0 }, { opacity: 1, duration: 0.3, yoyo: true, repeat: 3 }, 14.4);`);
T(`tl.fromTo("#t4", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(3)" }, 14.5);`);
T(`tl.fromTo("#t5", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(3)" }, 15.0);`);
T(`tl.fromTo("#callout", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, 15.2); tl.to("#callout", { opacity: 0, duration: 0.3 }, 17.6);`);
// scene 2
T(`tl.fromTo("#r9", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.35 }, 18.4);`);
T(`tl.fromTo("#miss", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 18.6); tl.to("#r9 .cell", { backgroundColor: "#fbe3e0", duration: 0.3 }, 18.6);`);
T(`tl.to("#miss", { scale: 1.08, duration: 0.35, yoyo: true, repeat: 3, ease: "sine.inOut", transformOrigin: "0% 50%" }, 19.0);`);
T(`tl.fromTo("#stBad", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 }, 18.9);`);
T(`tl.set("#act", { x: ${cx[3]}, y: ${ry(9)}, width: ${cols[3][1]} }, 20.3); tl.to("#act", { opacity: 1, duration: 0.2 }, 20.35);`);
typeIn("t6", "12.50", 20.6, 0.08);
T(`tl.to("#act", { opacity: 0, duration: 0.2 }, 21.2); tl.to("#miss", { opacity: 0, duration: 0.15 }, 21.4); tl.to("#r9 .cell", { backgroundColor: "#ffffff", duration: 0.3 }, 21.4);`);
T(`tl.fromTo("#fixed", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(3)" }, 21.5);`);
T(`tl.to("#stBad", { opacity: 0, duration: 0.2 }, 21.7); tl.fromTo("#stOk", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 }, 21.8);`);

// ---------- Scene 3: Monthly
const inc = 2950, spent = 1122.9, saved = 700, left = inc - spent - saved;
const cards = [["TOTAL INCOME", inc, C.inc, "Salary + side income"], ["BILLS · EXPENSES · DEBT", spent, C.bill, "Budget used: 70% of B$1,600.00"], ["SAVINGS & INVESTMENTS", saved, C.sav, "24% of income"], ["LEFT TO SPEND", left, "#ede3ea", "Income − spent − savings"]];
const budget = [["Groceries", 300, 85.4], ["Dining Out", 100, 12.5], ["Fuel & Transport", 150, 30]];
const monthly = `<div class="mpill"><b>MONTH ▸</b><span>November</span><b>YEAR ▸</b><span>2026</span></div>
<div class="mcards">${cards.map(([t, v, c, s], i) => `<div class="mcard" id="mc${i}"><div class="mt" style="background:${c}">${t}</div><div class="mv">B$<span id="mv${i}">0.00</span></div><div class="ms">${h(s)}</div></div>`).join("")}</div>
<div class="btab"><div class="bth" style="background:${C.exp}">EXPENSES · day-to-day</div>
${budget.map(([n, b, a], i) => `<div class="brow" id="br${i}"><div class="bn">${h(n)}</div><div class="bbar"><i id="bb${i}" style="width:${Math.round((a / b) * 100)}%"></i></div><div class="bv">B$${fmt(a)} <em>/ ${fmt(b)}</em></div></div>`).join("")}</div>`;
T(`tl.fromTo("#mon .mpill", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, ${n3(SC.s3[0] + 0.3)});`);
T(`tl.fromTo("#mon .mcard", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.15, ease: "power3.out" }, ${n3(SC.s3[0] + 0.8)});`);
cards.forEach(([, v], i) => T(`const m${i} = { v: 0 }; tl.to(m${i}, { v: ${v}, duration: 1.4, ease: "power2.out", onUpdate: () => { document.querySelector("#mv${i}").textContent = m${i}.v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } }, ${n3(SC.s3[0] + 1.0 + i * 0.15)});`));
T(`tl.fromTo("#mon .btab", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, ${n3(SC.s3[0] + 3.4)});`);
budget.forEach((_, i) => T(`tl.fromTo("#bb${i}", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.out", transformOrigin: "0% 50%" }, ${n3(SC.s3[0] + 3.9 + i * 0.3)});`));

// ---------- Scene 4: Report
const kpis = [["INCOME", `B$${fmt(inc)}`, C.inc], ["SPENT", `B$${fmt(spent)}`, C.bill], ["SAVED", `B$${fmt(saved)}`, C.sav], ["SAVINGS RATE", "24%", C.exp], ["LEFT OVER", `B$${fmt(left)}`, "#ede3ea"], ["BUDGET USED", "70%", C.debt]];
const lines = [
  ["OVERVIEW", `In November 2026 you earned B$${fmt(inc)}, spent B$${fmt(spent)} on bills, day-to-day expenses and debt, and put B$${fmt(saved)} into savings.`],
  ["DID I SAVE ENOUGH?", "Savings rate: 24% of income. That meets the 20% guideline."],
  ["WHERE DID THE MONEY GO?", "Biggest spending: Rent / Housing at B$600.00 (53% of spending), then Car Instalment / Loan and Groceries."],
  ["HOW TO IMPROVE", `You still have B$${fmt(left)} unallocated. Move it to Savings now so it does not get spent.`],
];
const report = `<div class="kpis">${kpis.map(([t, v, c], i) => `<div class="kpi" id="k${i}"><div class="kt" style="background:${c}">${t}</div><div class="kv">${v}</div></div>`).join("")}</div>
<div class="rep"><div class="rh">MONTHLY REPORT · NOVEMBER 2026</div>${lines.map(([t, x], i) => `<div class="rl" id="rl${i}"><b>${t}</b><p>${x.split(" ").map((w) => `<span class="w">${h(w)}</span>`).join(" ")}</p></div>`).join("")}</div>`;
T(`tl.fromTo("#rep .kpi", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.12, ease: "back.out(2.4)" }, ${n3(SC.s4[0] + 0.4)});`);
T(`tl.fromTo("#rep .rh", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ${n3(SC.s4[0] + 1.6)});`);
lines.forEach((_, i) => { const t0 = SC.s4[0] + 2.0 + i * 2.1; T(`tl.fromTo("#rl${i} b", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${n3(t0)}); tl.fromTo("#rl${i} .w", { opacity: 0 }, { opacity: 1, duration: 0.15, stagger: 0.045 }, ${n3(t0 + 0.2)});`); });

// ---------- Scene 5: Year
const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const yi = [2800, 2800, 2950, 2800, 3100, 2800, 2800, 2950, 2800, 2900, 2950, 0], ys = [1180, 1320, 1050, 1410, 1240, 1090, 1360, 1200, 1150, 1280, 1123, 0];
const year = `<div class="ychart">${months.map((m, i) => `<div class="ycol"><div class="ybars"><i class="yi" id="yi${i}" style="height:${Math.round((yi[i] / 3200) * 100)}%"></i><i class="ys" id="ys${i}" style="height:${Math.round((ys[i] / 3200) * 100)}%"></i></div><span>${m}</span></div>`).join("")}</div>
<div class="ylegend"><span><i style="background:${C.inc}"></i>Income</span><span><i style="background:${C.bill}"></i>Spent</span></div>
<div class="proj">At this pace you'll save about <b>B$8,400.00</b> this year.</div>`;
T(`tl.fromTo("#yr .yi", { scaleY: 0 }, { scaleY: 1, duration: 0.5, stagger: 0.08, ease: "power2.out", transformOrigin: "50% 100%" }, ${n3(SC.s5[0] + 0.4)});`);
T(`tl.fromTo("#yr .ys", { scaleY: 0 }, { scaleY: 1, duration: 0.5, stagger: 0.08, ease: "power2.out", transformOrigin: "50% 100%" }, ${n3(SC.s5[0] + 0.6)});`);
T(`tl.fromTo("#yr .proj", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, ${n3(SC.s5[0] + 2.6)});`);

// ---------- captions per scene
const caps = { s1: ["01", "Encode once.", "Pick a category from the dropdown — Type and Check fill themselves."],
  s2: ["02", "It catches mistakes.", "A missing amount gets flagged until you fix it."],
  s3: ["03", "Your month, sorted.", "Pick the month — every total and budget updates by itself."],
  s4: ["04", "It writes your report.", "A plain-language summary, checks and next steps."],
  s5: ["05", "Your year at a glance.", "Every month side by side, plus a savings projection."] };
const capHtml = (k) => `<div class="cap"><span class="cn">${caps[k][0]}</span><div class="ct">${h(caps[k][1])}</div><div class="cs">${h(caps[k][2])}</div></div>`;
Object.entries(caps).forEach(([k]) => { const s = SC[k][0]; T(`tl.fromTo("#${k} .cap > *", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: "power3.out" }, ${n3(s + 0.05)});`); });

// hook + intro + end
T(`tl.fromTo("#hook .hw", { y: 50, opacity: 0, rotation: -3 }, { y: 0, opacity: 1, rotation: 0, duration: 0.35, stagger: 0.16, ease: "back.out(2.2)" }, 0.2);`);
T(`tl.fromTo("#hook .hw em", { scale: 1.4 }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 0.9);`);
T(`tl.fromTo("#intro .ik", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, ${n3(SC.intro[0] + 0.15)});`);
T(`tl.fromTo("#intro .it", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, ${n3(SC.intro[0] + 0.35)});`);
T(`tl.fromTo("#intro .tab", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.15, ease: "back.out(2)" }, ${n3(SC.intro[0] + 1.0)});`);
T(`tl.fromTo("#intro .is", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ${n3(SC.intro[0] + 1.9)});`);
T(`tl.fromTo("#end .e1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, ${n3(SC.end[0] + 0.2)}); tl.fromTo("#end .e2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, ${n3(SC.end[0] + 0.9)});`);
T(`tl.fromTo("#end img, #end .wm, #end .tg, #end .cta", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.18, ease: "power3.out" }, ${n3(SC.end[0] + 2.0)});`);
T(`tl.to("#end .cta", { scale: 1.06, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut" }, ${n3(SC.end[0] + 3.4)});`);
// gold wipes at scene changes
const cuts = [SC.intro[0], SC.s1[0], SC.s3[0], SC.s4[0], SC.s5[0], SC.end[0]];
cuts.forEach((t, i) => T(`tl.fromTo("#wp${i}", { xPercent: -101 }, { xPercent: 101, duration: 0.5, ease: "power3.inOut" }, ${n3(t - 0.25)});`));
T(`tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${SC.end[0]}, ease: "none" }, 0);`);

const css = `
@font-face{font-family:"Inter";font-weight:600;src:url(assets/inter-600.woff2) format("woff2")}
@font-face{font-family:"Inter";font-weight:800;src:url(assets/inter-800.woff2) format("woff2")}
@font-face{font-family:"Serif";font-weight:800;font-style:italic;src:url(assets/serif-800i.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.bg};font-family:Inter,sans-serif;color:${C.ink}}
#root{position:relative;width:100%;height:100%;overflow:hidden}
.clip{position:absolute;inset:0}
.scene{background:${C.bg}}
.scene::before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(0,0,0,.05) 1px,transparent 1px);background-size:6px 6px}
.logo{position:absolute;top:84px;left:50%;height:52px;transform:translateX(-50%)}
em{font-family:Serif,serif;font-style:italic;color:${C.ink};background:linear-gradient(transparent 60%,${C.gold}aa 60%,${C.gold}aa 92%,transparent 92%);padding:0 .06em}
.cap{position:absolute;left:70px;right:70px;top:190px;display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.cn{font-weight:800;font-size:30px;color:#fff;background:${C.ink};padding:6px 16px;border-radius:99px;letter-spacing:.06em}
.ct{font-weight:800;font-size:76px;letter-spacing:-0.035em;line-height:1}
.cs{font-weight:600;font-size:34px;color:${C.mut};line-height:1.3}
#sheet{position:absolute;left:40px;top:560px;width:1000px;background:${C.card};border-radius:22px;box-shadow:0 30px 80px rgba(60,50,30,.18);overflow:visible;opacity:0}
.sbar{height:78px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;border-bottom:2px solid ${C.line}}
.sbar b{font-weight:800;font-size:26px;letter-spacing:.06em}
.st{position:absolute;right:24px;top:20px;font-weight:800;font-size:22px;padding:8px 16px;border-radius:99px;opacity:0}
#stBad{background:#fbe3e0;color:${C.bad}} #stOk{background:#e1f1e6;color:${C.ok}}
.grid{position:relative;height:${HH + 10 * RH}px}
.hcell{position:absolute;top:0;height:${HH}px;line-height:${HH}px;padding:0 14px;font-weight:800;font-size:23px;color:#fff;background:${C.hdr}}
.hcell.auto{background:#d9cfd6;color:${C.ink}}
.row{opacity:0}
.cell{position:absolute;height:${RH}px;line-height:${RH}px;padding:0 14px;font-weight:600;font-size:23px;border-bottom:1px solid ${C.line};white-space:nowrap;overflow:hidden;background:#fff}
.cell.num{text-align:right;font-variant-numeric:tabular-nums}
.cell.auto{background:#f4f2f4;color:${C.mut}}
.cell.okc{color:${C.ok};font-weight:800}
.ch{opacity:0}
#t2,#t4,#t5,#fixed{opacity:0;display:inline-block}
#t5,#fixed{color:${C.ok};font-weight:800}
#miss{color:${C.bad};font-weight:800;font-size:17px;letter-spacing:-0.02em;margin-left:-6px;display:inline-block;opacity:0}
#fixed{position:absolute;left:14px}
#act{position:absolute;left:0;top:0;height:${RH}px;border:4px solid ${C.ok};border-radius:4px;opacity:0;pointer-events:none}
#dd{position:absolute;background:#fff;border:2px solid ${C.line};box-shadow:0 14px 40px rgba(0,0,0,.15);opacity:0;z-index:5}
.ddi{position:relative;height:50px;line-height:50px;padding:0 16px;font-weight:600;font-size:23px}
#ddh{position:absolute;left:0;right:0;top:0;height:50px;background:#e8f0fb}
.glow{position:absolute;height:${RH}px;border:4px solid ${C.gold};border-radius:6px;box-shadow:0 0 30px ${C.gold};opacity:0}
#callout{position:absolute;font-weight:800;font-size:30px;color:#fff;background:${C.gold};padding:12px 22px;border-radius:14px;opacity:0;white-space:nowrap}
.exl{position:absolute;left:0;right:0;bottom:250px;text-align:center;font-weight:600;font-size:24px;color:${C.mut};letter-spacing:.1em}
.mpill{position:absolute;left:70px;top:520px;display:flex;align-items:center;gap:16px;font-size:30px;opacity:0}
.mpill b{font-weight:800;letter-spacing:.06em} .mpill span{font-weight:800;background:${C.cream};border:2px solid #e6d9a8;padding:10px 22px;border-radius:12px}
.mcards{position:absolute;left:60px;right:60px;top:620px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
.mcard{background:#fff;border-radius:20px;box-shadow:0 18px 50px rgba(60,50,30,.12);overflow:hidden;opacity:0}
.mt{font-weight:800;font-size:22px;letter-spacing:.06em;padding:14px 20px}
.mv{font-weight:800;font-size:54px;padding:16px 20px 4px;letter-spacing:-0.02em;font-variant-numeric:tabular-nums}
.ms{font-weight:600;font-size:22px;color:${C.mut};padding:0 20px 18px}
.btab{position:absolute;left:60px;right:60px;top:1150px;background:#fff;border-radius:20px;box-shadow:0 18px 50px rgba(60,50,30,.12);overflow:hidden;opacity:0}
.bth{font-weight:800;font-size:24px;letter-spacing:.06em;padding:16px 22px}
.brow{display:grid;grid-template-columns:280px 1fr 300px;align-items:center;gap:20px;padding:20px 22px;border-top:1px solid ${C.line}}
.bn{font-weight:800;font-size:28px} .bv{font-weight:800;font-size:26px;text-align:right;font-variant-numeric:tabular-nums} .bv em{background:none;color:${C.mut};font-family:Inter;font-style:normal;font-weight:600}
.bbar{height:22px;background:#efe9dc;border-radius:99px;overflow:hidden} .bbar i{display:block;height:100%;background:${C.ok};border-radius:99px}
.kpis{position:absolute;left:60px;right:60px;top:500px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}
.kpi{background:#fff;border-radius:18px;box-shadow:0 14px 40px rgba(60,50,30,.12);overflow:hidden;opacity:0}
.kt{font-weight:800;font-size:19px;letter-spacing:.06em;padding:10px 14px}
.kv{font-weight:800;font-size:36px;padding:14px;letter-spacing:-0.02em;font-variant-numeric:tabular-nums}
.rep{position:absolute;left:60px;right:60px;top:860px;background:#fff;border-radius:20px;box-shadow:0 18px 50px rgba(60,50,30,.12);padding:26px 30px;display:flex;flex-direction:column;gap:22px}
.rh{font-weight:800;font-size:26px;letter-spacing:.08em;background:#ede3ea;padding:12px 16px;border-radius:10px;opacity:0}
.rl b{display:block;font-weight:800;font-size:23px;letter-spacing:.08em;color:${C.gold};opacity:0;margin-bottom:6px}
.rl p{font-weight:600;font-size:31px;line-height:1.36}
.rl .w{opacity:0}
.ychart{position:absolute;left:60px;right:60px;top:560px;height:640px;background:#fff;border-radius:20px;box-shadow:0 18px 50px rgba(60,50,30,.12);display:flex;align-items:flex-end;gap:12px;padding:40px 30px 30px}
.ycol{flex:1;display:flex;flex-direction:column;align-items:center;gap:12px;height:100%}
.ybars{flex:1;width:100%;display:flex;align-items:flex-end;gap:5px}
.ybars i{flex:1;display:block;border-radius:6px 6px 0 0}
.yi{background:${C.inc}} .ys{background:${C.bill}}
.ycol span{font-weight:800;font-size:24px;color:${C.mut}}
.ylegend{position:absolute;left:0;right:0;top:1230px;display:flex;justify-content:center;gap:40px;font-weight:800;font-size:26px}
.ylegend i{display:inline-block;width:26px;height:26px;border-radius:6px;margin-right:10px;vertical-align:-4px}
.proj{position:absolute;left:60px;right:60px;top:1310px;text-align:center;font-weight:600;font-size:40px;line-height:1.3;opacity:0}
.proj b{font-weight:800}
#hook{display:flex;flex-direction:column;justify-content:center;padding:0 90px}
.hw{font-weight:800;font-size:132px;letter-spacing:-0.045em;line-height:1.02;opacity:0;display:block}
#intro{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:34px;padding:0 70px}
.ik{font-weight:800;font-size:30px;letter-spacing:.3em;color:${C.gold}}
.it{font-weight:800;font-size:104px;letter-spacing:-0.04em;line-height:1.02}
.tabs{display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin-top:10px}
.tab{font-weight:800;font-size:30px;padding:14px 26px;border-radius:14px 14px 0 0;border:3px solid ${C.ink};border-bottom-width:6px;background:#fff}
.is{font-weight:600;font-size:32px;color:${C.mut}}
#end{background:${C.ink};color:${C.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:24px;padding:0 80px}
.e1{font-weight:800;font-size:76px;letter-spacing:-0.03em;line-height:1.05}
.e2{font-family:Serif,serif;font-style:italic;font-weight:800;font-size:70px;color:#c4a96b;line-height:1.1;margin-bottom:40px}
#end img{height:130px} #end .wm{font-weight:800;font-size:28px;letter-spacing:.45em;margin-right:-.45em;color:#c4a96b}
#end .tg{font-family:Serif,serif;font-style:italic;font-weight:800;font-size:52px;line-height:1.15}
#end .cta{margin-top:14px;font-weight:800;font-size:38px;color:${C.ink};background:#c4a96b;padding:20px 44px;border-radius:99px}
.wipe{background:${C.gold};transform:translateX(-101%)}
#progress-track{inset:auto 0 0 0;height:10px;background:rgba(0,0,0,.08)}
#progress{position:absolute;inset:0;background:${C.gold};transform-origin:left center;transform:scaleX(0)}`;

const logo = `<img class="logo" src="assets/logo-dark.png" alt=""/>`;
const sec = (id, [a, b], inner, cls = "scene") => `<section id="${id}" class="clip ${cls}" data-start="${n3(a)}" data-duration="${n3(b - a)}" data-track-index="0">${inner}</section>`;
const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/>
<script src="assets/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  ${sec("hook", SC.hook, `${logo}<span class="hw">Where did</span><span class="hw">your money</span><span class="hw"><em>go</em> this</span><span class="hw">month?</span>`)}
  ${sec("intro", SC.intro, `${logo}<div class="ik">RIZ.CO TEMPLATE</div><div class="it">Income &amp; Expenses <em>Tracker</em></div><div class="tabs">${["Transactions", "Monthly", "Report", "Year"].map((t) => `<span class="tab">${t}</span>`).join("")}</div><div class="is">Excel · ready to use · fills itself</div>`)}
  ${sec("s1", [SC.s1[0], SC.s2[1]], `${logo}<div id="sheet"><div class="sbar"><b>TRANSACTIONS · encode here</b><span id="stBad" class="st">⚠ 1 row needs fixing</span><span id="stOk" class="st">✓ All transactions check out</span></div><div class="grid">${grid}</div></div><div class="exl">EXAMPLE DATA</div>`)}
  <div id="cap1" class="clip" data-start="${n3(SC.s1[0])}" data-duration="${n3(SC.s1[1] - SC.s1[0])}" data-track-index="2"><div id="s1x">${capHtml("s1")}</div></div>
  <div id="cap2" class="clip" data-start="${n3(SC.s2[0])}" data-duration="${n3(SC.s2[1] - SC.s2[0])}" data-track-index="2"><div id="s2">${capHtml("s2")}</div></div>
  ${sec("s3", SC.s3, `${logo}<div id="mon">${monthly}</div>${capHtml("s3")}<div class="exl">EXAMPLE DATA</div>`)}
  ${sec("s4", SC.s4, `${logo}<div id="rep">${report}</div>${capHtml("s4")}`)}
  ${sec("s5", SC.s5, `${logo}<div id="yr">${year}</div>${capHtml("s5")}<div class="exl">EXAMPLE DATA</div>`)}
  ${sec("end", SC.end, `<div class="e1">Encode on one tab.</div><div class="e2">Everything else updates itself.</div><img src="assets/logo-light.png" alt="Riz.co"/><div class="wm">${h(kit.wordmark)}</div><div class="tg">${h(kit.tagline).replace(". ", ".<br>")}</div><div class="cta">DM us to get this template</div>`, "")}
  ${cuts.map((t, i) => `<div id="wp${i}" class="clip wipe" data-start="${n3(t - 0.25)}" data-duration="0.5" data-track-index="3"></div>`).join("\n  ")}
  <div id="progress-track" class="clip" data-start="0" data-duration="${n3(SC.end[0])}" data-track-index="4"><div id="progress"></div></div>
  ${cuts.map((t, i) => `<audio id="wh${i}" src="assets/whoosh.wav" data-start="${n3(t - 0.3)}" data-duration="0.45" data-volume="0.35"></audio>`).join("\n  ")}
  ${[[12.9, "pop"], [14.5, "beep"], [15.0, "beep"], [18.6, "glitch"], [21.5, "beep"]].map(([t, s], i) => `<audio id="fx${i}" src="assets/${s}.wav" data-start="${t}" data-duration="${s === "glitch" ? 0.4 : 0.1}" data-volume="${s === "glitch" ? 0.2 : 0.35}"></audio>`).join("\n  ")}
  <audio id="music" src="assets/music.mp3" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-volume="0.55" data-fade-in="0.8" data-fade-out="2.5"></audio>
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  ${js.join("\n  ")}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script></body></html>`;

const bd = path.join(here, "build"), A = path.join(bd, "assets");
fs.mkdirSync(A, { recursive: true });
fs.writeFileSync(path.join(bd, "index.html"), html);
const cp = (f, to) => fs.copyFileSync(path.join(ROOT, f), path.join(A, to));
cp("node_modules/gsap/dist/gsap.min.js", "gsap.min.js");
cp("node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", "inter-600.woff2");
cp("node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2", "inter-800.woff2");
cp("node_modules/@fontsource/playfair-display/files/playfair-display-latin-800-italic.woff2", "serif-800i.woff2");
cp(kit.logo.darkInk, "logo-dark.png"); cp(kit.logo.lightInk, "logo-light.png");
cp("media/music/beats/a/whoosh.wav", "whoosh.wav"); cp("media/music/beats/a/pop.wav", "pop.wav");
cp("media/sfx/beep.wav", "beep.wav"); cp("media/sfx/glitch.wav", "glitch.wav");
await prepMusic(path.join(ROOT, "media/music/beats/luxury/demo.wav"), path.join(A, "music.mp3"));
fs.writeFileSync(path.join(bd, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(bd, "meta.json"), JSON.stringify({ id: "rizco-tracker-demo", name: "Income & Expenses Tracker demo" }, null, 2));
log(`total ${TOTAL}s`);
await hyperframes(["lint"], { cwd: bd });
if (process.argv.includes("--skip-render")) process.exit(0);
const raw = path.join(here, "raw.mp4"), out = path.join(here, "out"), mp4 = path.join(out, "rizco-income-expenses-tracker.mp4");
fs.mkdirSync(out, { recursive: true });
await render(bd, raw, { quality: "looks", fps: 30 });
await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mp4]);
log("RENDER COMPLETE " + path.relative(ROOT, mp4));
