#!/usr/bin/env node
// Minimal typographic carousel posters (Instagram 4:5, 1080x1350), rendered locally
// with headless Chromium. Usage: node tools/posters.mjs projects/posters/<set>/posters.json
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { brandKit } from "../lib/brands.mjs";
import { ROOT, escapeHtml as h } from "../lib/util.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const file = process.argv[2];
const spec = JSON.parse(fs.readFileSync(file, "utf8"));
const outDir = path.dirname(path.resolve(file));
const kit = brandKit(spec);
const W = spec.width || 1080, H = spec.height || 1350;
const c = { bg: "#eceee4", ink: "#1e2114", accent: "#4b531e", soft: "#5d6150", ...(spec.colors || {}) };

const b64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString("base64");
const font = (w, s) => `@font-face{font-family:"Garamond";font-weight:${w};font-style:${s};src:url(data:font/woff2;base64,${b64(`node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-${w}-${s}.woff2`)}) format("woff2");}`;
const logo = `data:image/png;base64,${b64(kit.logo.darkInk)}`;
// *word* -> olive italic accent
const rich = (s) => h(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");
const grain = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .07 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const css = `${font(500, "normal")}${font(600, "normal")}${font(500, "italic")}${font(600, "italic")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:radial-gradient(120% 90% at 50% 40%, ${c.bg} 55%, color-mix(in srgb, ${c.bg} 88%, #8a8f78) 100%);color:${c.ink};font-family:"Garamond",Georgia,serif;position:relative}
body::after{content:"";position:absolute;inset:0;background-image:${grain};pointer-events:none}
.stage{position:absolute;inset:0 0 ${Math.round(H * 0.22)}px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 ${Math.round(W * 0.07)}px}
em{font-style:italic;color:${c.accent}}
.cover .a,.cover .c{font-weight:500;font-size:${Math.round(W * 0.14)}px;line-height:1;letter-spacing:-0.01em}
.cover .b{font-weight:600;font-style:italic;color:${c.accent};font-size:${Math.round(W * 0.18)}px;line-height:.95;letter-spacing:-0.015em;margin:${Math.round(W * 0.01)}px 0 0}
.swash{width:${Math.round(W * 0.62)}px;height:${Math.round(W * 0.05)}px;margin:${Math.round(W * 0.005)}px 0 ${Math.round(W * 0.02)}px}
.swash path{fill:none;stroke:${c.accent};stroke-width:2.4;stroke-linecap:round;opacity:.75}
.body{font-weight:500;font-size:${Math.round(W * 0.092)}px;line-height:1.06;letter-spacing:-0.012em;max-width:${Math.round(W * 0.88)}px}
.punch{margin-top:${Math.round(H * 0.055)}px;font-weight:600;font-size:${Math.round(W * 0.105)}px;line-height:1;white-space:nowrap;letter-spacing:-0.015em}
.tagline{margin-top:${Math.round(H * 0.045)}px;font-style:italic;font-weight:500;font-size:${Math.round(W * 0.042)}px;color:${c.soft}}
.foot{position:absolute;left:0;right:0;bottom:${Math.round(H * 0.07)}px;display:flex;flex-direction:column;align-items:center;gap:${Math.round(H * 0.012)}px}
.foot img{height:${Math.round(H * 0.052)}px}
.foot .row{display:flex;align-items:center;gap:${Math.round(W * 0.025)}px}
.foot .line{width:${Math.round(W * 0.085)}px;height:1.5px;background:${c.accent};opacity:.7}
.foot .ftag{font-style:italic;font-weight:500;font-size:${Math.round(W * 0.03)}px;color:${c.soft};margin-top:${Math.round(H * 0.002)}px}
.foot .name{font-weight:600;font-size:${Math.round(W * 0.026)}px;letter-spacing:.42em;margin-right:-.42em;color:${c.soft}}`;

// Logo + wordmark + tagline on every poster (brand rule).
const foot = `<div class="foot"><img src="${logo}" alt=""/><div class="row"><span class="line"></span><span class="name">${h(kit.wordmark)}</span><span class="line"></span></div><div class="ftag">${h(kit.tagline)}</div></div>`;
const slideHtml = (s) => {
  const inner = s.type === "cover"
    ? `<div class="cover"><div class="a">${rich(s.top)}</div><div class="b">${rich(s.big)}</div><svg class="swash" viewBox="0 0 620 50"><path d="M10 34 C 160 10, 430 8, 610 30"/></svg><div class="c">${rich(s.bottom)}</div></div>`
    : `<div class="body">${rich(s.text)}</div><div class="punch">${rich(spec.refrain)}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="stage">${inner}</div>${foot}</body></html>`;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const outs = [];
for (const [i, s] of spec.slides.entries()) {
  await page.setContent(slideHtml(s), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(outDir, `${spec.name}-${String(i + 1).padStart(2, "0")}.png`);
  await page.screenshot({ path: out });
  outs.push(out);
}
await browser.close();
console.log(outs.map((o) => path.relative(ROOT, o)).join("\n"));
