// One-off infographic poster: "The 80/20 Rule for Small Business Owners" (Riz.co).
// Renders locally with headless Chromium -> PNG (1080x1350 layout, exported at 2x).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { brandKit } from "../../../lib/brands.mjs";
import { ROOT, escapeHtml as h } from "../../../lib/util.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const kit = brandKit({ brandKit: "rizco" });

const W = 1080, H = 1350;
const C = { bg: "#eceee4", band: "#dde3cc", ink: "#1e2114", olive: "#4b531e", lite: "#a9b46f", seg: "#f6f7f1", line: "#c9cfb8" };
const tips = [
  ["Serve Your Best Customers", "A few clients usually bring most of your revenue. Look after them first."],
  ["Push Your Best Sellers", "Put your time and budget behind what actually sells."],
  ["Find Your Biggest Costs", "Track every expense to spot the few that eat most of your money."],
  ["Fix Cash Flow First", "Invoice fast and follow up. Late payments hurt more than slow sales."],
  ["Cut Busy Work", "Drop tasks that keep you busy but don't make money."],
  ["Automate the Routine", "Use templates and tools for records, invoices and repeat work."],
  ["Review Your Prices", "A small price fix can lift profit without needing new customers."],
  ["Check Numbers Monthly", "A quick monthly review shows what's really working."],
];

const b64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString("base64");
const font = (fam, file, w, s = "normal") => `@font-face{font-family:"${fam}";font-weight:${w};font-style:${s};src:url(data:font/woff2;base64,${b64(file)}) format("woff2");}`;
const fonts = [
  font("Inter", "node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", 600),
  font("Inter", "node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2", 800),
  font("Inter", "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2", 400),
  font("Garamond", "node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2", 600, "italic"),
].join("");

// Geometry: octagon wheel, segment 1 centred at the top.
const cx = W / 2, cy = 788, R = 505, ringOut = 226, ringIn = 180, pieR = 156, n = tips.length;
const ang = (i) => ((-90 - 180 / n + (360 / n) * i) * Math.PI) / 180; // boundary angles
const pt = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
const poly = (r) => Array.from({ length: n }, (_, i) => pt(r, ang(i)).map((v) => v.toFixed(1)).join(",")).join(" ");
const segs = tips.map((_, i) => {
  const [a0, a1] = [ang(i), ang(i + 1)];
  const pts = [pt(ringOut, a0), pt(R, a0), pt(R, a1), pt(ringOut, a1)].map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");
  return `<polygon points="${pts}" fill="${C.seg}" stroke="${C.line}" stroke-width="2"/>`;
}).join("");
const spokes = Array.from({ length: n }, (_, i) => { const [x1, y1] = pt(ringIn, ang(i)), [x2, y2] = pt(R, ang(i)); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.line}" stroke-width="2"/>`; }).join("");
const nums = tips.map((_, i) => { const a = (ang(i) + ang(i + 1)) / 2, [x, y] = pt((ringIn + ringOut) / 2, a); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Inter" font-weight="800" font-size="24" fill="${C.ink}">${i + 1}</text>`; }).join("");
// 80/20 pie: 20% wedge from -90deg clockwise
const pa = (deg) => (deg * Math.PI) / 180;
const [px1, py1] = pt(pieR, pa(-90)), [px2, py2] = pt(pieR, pa(-90 + 72));
const pie = `<circle cx="${cx}" cy="${cy}" r="${pieR}" fill="${C.ink}"/>
<path d="M${cx},${cy} L${px1},${py1} A${pieR},${pieR} 0 0 1 ${px2},${py2} Z" fill="${C.lite}" stroke="${C.seg}" stroke-width="6" stroke-linejoin="round"/>`;
const wedges = tips.map((_, i) => [pt(ringOut + 6, ang(i)), pt(R, ang(i)), pt(R, ang(i + 1)), pt(ringOut + 6, ang(i + 1))]);
const labels = tips.map(([t, d], i) => {
  const a = (ang(i) + ang(i + 1)) / 2, [x, y] = pt((ringOut + R) / 2 + 26, a);
  return `<div class="tip" style="left:${x}px;top:${y}px"><b>${h(t)}</b><span>${h(d)}</span></div>`;
}).join("");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.bg};color:${C.ink};font-family:Inter,sans-serif}
.head{position:absolute;left:-40px;right:-40px;top:0;height:300px;background:${C.band};border-radius:0 0 50% 50% / 0 0 70px 70px;border-bottom:3px solid ${C.olive}}
.title{position:absolute;top:44px;left:0;right:0;text-align:center}
.title h1{font-weight:800;font-size:96px;letter-spacing:-0.035em;line-height:1}
.title h2{font-weight:600;font-size:40px;letter-spacing:.04em;margin-top:10px}
.title p{font-weight:400;font-size:21px;margin-top:14px;color:#4a4f3c}
.title p em{font-family:Garamond,serif;font-size:26px;color:${C.olive}}
svg{position:absolute;inset:0}
.tip{position:absolute;width:206px;font-size:16px;transform:translate(-50%,-50%);text-align:center;display:flex;flex-direction:column;gap:7px}
.tip b{font-weight:800;font-size:1.44em;line-height:1.08;letter-spacing:-0.015em}
.tip span{font-weight:400;font-size:1.03em;line-height:1.26;color:#3c4130}
.pielabel{position:absolute;transform:translate(-50%,-50%);text-align:center;font-weight:800;line-height:1.05}
.foot{position:absolute;left:0;right:0;bottom:22px;display:flex;align-items:center;justify-content:center;gap:22px}
.foot img{height:54px}
.foot .name{font-weight:800;font-size:20px;letter-spacing:.38em;color:${C.olive}}
.foot .bar{width:2px;height:34px;background:${C.line}}
.foot .tag{font-family:Garamond,serif;font-style:italic;font-weight:600;font-size:30px}
</style></head><body>
<div class="head"></div>
<div class="title"><h1>THE 80/20 RULE</h1><h2>FOR SMALL BUSINESS OWNERS</h2><p>Roughly <em>80% of results</em> come from <em>20% of efforts</em>. Find yours.</p></div>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <polygon points="${poly(R)}" fill="${C.seg}" stroke="${C.ink}" stroke-width="3"/>
  ${segs}
  <polygon points="${poly(ringOut)}" fill="${C.lite}"/>
  ${spokes}
  <circle cx="${cx}" cy="${cy}" r="${ringIn}" fill="${C.seg}"/>
  ${pie}
  ${nums}
  <polygon points="${poly(R)}" fill="none" stroke="${C.ink}" stroke-width="3"/>
</svg>
${labels}
<div class="pielabel" style="left:${cx + 54}px;top:${cy - 96}px;font-size:26px;color:${C.ink}">20%<br><span style="font-size:20px;font-weight:600">Efforts</span></div>
<div class="pielabel" style="left:${cx - 24}px;top:${cy + 44}px;font-size:40px;color:${C.seg}">80%<br><span style="font-size:26px;font-weight:600">Results</span></div>
<script>
const WEDGES = ${JSON.stringify(wedges)}, CX = ${cx}, CY = ${cy}, N = ${n};
const inside = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c; } return c; };
const distSeg = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
const margin = (pts, poly) => Math.min(...pts.map((p) => inside(p, poly) ? Math.min(...poly.map((a, k) => distSeg(p, a, poly[(k + 1) % poly.length]))) : -1));
window.fitTips = () => document.querySelectorAll(".tip").forEach((el, i) => {
  const poly = WEDGES[i], a = ((-90 - 180 / N + (360 / N) * (i + 0.5)) * Math.PI) / 180;
  let best = null;
  for (let scale = 1; scale >= 0.8 && !best; scale -= 0.04) for (let w = 230; w >= 160; w -= 10) {
    el.style.width = w + "px"; el.style.fontSize = scale + "em";
    const bw = el.offsetWidth, bh = el.offsetHeight;
    for (let r = 250; r <= 470; r += 3) {
      const x = CX + r * Math.cos(a), y = CY + r * Math.sin(a);
      const pts = [[x - bw / 2, y - bh / 2], [x + bw / 2, y - bh / 2], [x + bw / 2, y + bh / 2], [x - bw / 2, y + bh / 2], [x, y - bh / 2], [x, y + bh / 2], [x - bw / 2, y], [x + bw / 2, y]];
      const m = margin(pts, poly);
      if (m >= 10 && (!best || m > best.m || (Math.abs(m - best.m) < 2 && w > best.w))) best = { m, x, y, w, scale };
    }
    if (best) break;
  }
  if (best) { el.style.width = best.w + "px"; el.style.fontSize = best.scale + "em"; el.style.left = best.x + "px"; el.style.top = best.y + "px"; el.dataset.fit = best.m.toFixed(0); }
  else el.dataset.fit = "none";
});
</script>
<div class="foot"><img src="data:image/png;base64,${b64(kit.logo.darkInk)}" alt=""/><span class="name">${h(kit.wordmark)}</span><span class="bar"></span><span class="tag">${h(kit.tagline)}</span></div>
</body></html>`;

fs.writeFileSync(path.join(here, "poster.html"), html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
console.log("fit margins:", await page.evaluate(() => { window.fitTips(); return [...document.querySelectorAll(".tip")].map((e) => e.dataset.fit).join(" "); }));
const out = path.join(here, "rizco-80-20-rule.png");
await page.screenshot({ path: out });
await browser.close();
console.log(path.relative(ROOT, out));
