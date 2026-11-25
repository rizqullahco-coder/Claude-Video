// One-off infographic poster: "The Brand Tree" (Riz.co). Original concept: a brand grows
// from roots (identity) to fruit (loyal customers). Local headless Chromium -> PNG (1080x1350 @2x).
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
const C = { bg: "#eceee4", band: "#dde3cc", ink: "#1e2114", olive: "#4b531e", lite: "#a9b46f", pale: "#f6f7f1", line: "#c9cfb8", gold: "#b89a52" };

// top -> bottom on the poster (a tree reads from the fruit down to the roots)
const levels = [
  { n: 4, name: "FRUIT", sub: "Keep them coming back", bg: C.pale, ink: C.ink, chip: "#e6ead9", icon: "fruit",
    items: ["Reviews & referrals", "Loyalty rewards", "After-sales care", "Community", "Repeat customers"] },
  { n: 3, name: "BRANCHES", sub: "Get found", bg: C.lite, ink: C.ink, chip: "rgba(255,255,255,.55)", icon: "branch",
    items: ["Social media & reels", "Website & Google", "Ads that target", "Press & partners", "Events & pop-ups"] },
  { n: 2, name: "TRUNK", sub: "Look & sound the same everywhere", bg: C.olive, ink: C.pale, chip: "rgba(255,255,255,.14)", icon: "trunk",
    items: ["Logo & colours", "Fonts & photo style", "Tagline", "Tone of voice", "Packaging & signage"] },
  { n: 1, name: "ROOTS", sub: "Know who you are", bg: C.ink, ink: C.pale, chip: "rgba(255,255,255,.10)", icon: "roots",
    items: ["Why you exist", "Who you serve", "What makes you different", "Your values", "Goals you can measure"] },
];
const st = (c) => `fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
  fruit: (c) => `<path d="M40 22 C 52 10, 66 12, 70 20 C 60 26, 48 26, 40 22 Z" fill="${C.olive}"/><path d="M40 22 L40 34" ${st(C.olive)}/><ellipse cx="32" cy="50" rx="12" ry="15" fill="${C.ink}" transform="rotate(-18 32 50)"/><ellipse cx="54" cy="52" rx="12" ry="15" fill="${C.olive}" transform="rotate(16 54 52)"/><path d="M40 34 L32 38 M40 34 L52 39" ${st(C.ink)}/>`,
  branch: (c) => `<path d="M40 72 L40 40 M40 50 L22 30 M40 44 L58 22 M22 30 L14 26 M58 22 L66 20" ${st(c)}/><ellipse cx="18" cy="22" rx="5" ry="9" fill="${c}" transform="rotate(-40 18 22)"/><ellipse cx="62" cy="14" rx="5" ry="9" fill="${c}" transform="rotate(40 62 14)"/><ellipse cx="30" cy="40" rx="4" ry="8" fill="${c}" transform="rotate(-60 30 40)"/>`,
  trunk: (c) => `<path d="M30 74 C 32 56, 32 30, 28 8 M50 74 C 48 56, 48 30, 52 8" ${st(c)}/><path d="M37 22 L37 34 M43 42 L43 56 M38 62 L38 68" ${st(c)}/>`,
  roots: (c) => `<path d="M40 6 L40 34 M40 34 C 30 44, 20 48, 10 64 M40 34 C 38 50, 34 60, 30 74 M40 34 C 44 50, 50 60, 56 72 M40 34 C 52 42, 62 46, 72 58" ${st(c)}/><path d="M6 20 L74 20" stroke="${c}" stroke-width="3" stroke-dasharray="6 6" opacity=".6"/>`,
};

const b64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString("base64");
const font = (fam, file, w, s = "normal") => `@font-face{font-family:"${fam}";font-weight:${w};font-style:${s};src:url(data:font/woff2;base64,${b64(file)}) format("woff2");}`;
const fonts = [
  font("Inter", "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2", 400),
  font("Inter", "node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", 600),
  font("Inter", "node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2", 800),
  font("Garamond", "node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2", 600, "italic"),
].join("");

const bandH = 214, gap = 18, top0 = 318;
const bands = levels.map((L, i) => `<div class="band" style="top:${top0 + i * (bandH + gap)}px;background:${L.bg};color:${L.ink}">
  <div class="badge" style="background:${L.ink === C.ink ? C.pale : "rgba(255,255,255,.12)"};border-color:${L.ink === C.ink ? C.ink : C.pale}"><svg viewBox="0 0 80 80" width="72" height="72">${icons[L.icon](L.ink)}</svg></div>
  <div class="lvl"><span class="num">0${L.n}</span><b>${L.name}</b><i>${h(L.sub)}</i></div>
  <div class="chips">${L.items.map((t) => `<span style="background:${L.chip}">${h(t)}</span>`).join("")}</div>
</div>`).join("");
// growth arrow down the left gutter (roots -> fruit)
const arrowTop = top0 + 40, arrowBot = top0 + 4 * bandH + 3 * gap - 40;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.bg};color:${C.ink};font-family:Inter,sans-serif}
.head{position:absolute;left:-40px;right:-40px;top:0;height:282px;background:${C.band};border-radius:0 0 50% 50% / 0 0 70px 70px;border-bottom:3px solid ${C.olive}}
.title{position:absolute;top:40px;left:0;right:0;text-align:center}
.title .k{font-weight:600;font-size:20px;letter-spacing:.42em;margin-right:-.42em;color:${C.olive}}
.title h1{font-weight:800;font-size:104px;letter-spacing:-0.04em;line-height:1;margin-top:12px}
.title h1 em{font-family:Garamond,serif;font-style:italic;font-weight:600;color:${C.olive};letter-spacing:-0.01em;font-size:1.08em}
.title p{font-weight:400;font-size:24px;margin-top:16px;color:#4a4f3c}
.title p em{font-family:Garamond,serif;font-style:italic;font-weight:600;font-size:30px;color:${C.olive}}
.grow{position:absolute;left:22px;width:24px;top:${arrowTop}px;height:${arrowBot - arrowTop}px}
.growlbl{position:absolute;left:-58px;top:${(arrowTop + arrowBot) / 2}px;transform:translateY(-50%) rotate(-90deg);font-weight:800;font-size:15px;letter-spacing:.4em;color:${C.olive};white-space:nowrap}
.band{position:absolute;left:64px;right:40px;height:${bandH}px;border-radius:26px;display:flex;align-items:center;gap:22px;padding:0 26px 0 24px;box-shadow:0 10px 26px rgba(30,33,20,.10)}
.badge{flex:none;width:104px;height:104px;border-radius:50%;border:3px solid;display:flex;align-items:center;justify-content:center}
.lvl{flex:none;width:236px;display:flex;flex-direction:column;gap:4px}
.lvl .num{font-weight:800;font-size:17px;letter-spacing:.3em;opacity:.65}
.lvl b{font-weight:800;font-size:44px;letter-spacing:-0.03em;line-height:1}
.lvl i{font-family:Garamond,serif;font-style:italic;font-weight:600;font-size:27px;line-height:1.05;margin-top:4px}
.chips{flex:1;display:flex;flex-wrap:wrap;gap:10px}
.chips span{font-weight:600;font-size:21px;padding:10px 16px;border-radius:99px;white-space:nowrap}
.foot{position:absolute;left:0;right:0;bottom:24px;display:flex;align-items:center;justify-content:center;gap:22px}
.foot img{height:54px}
.foot .name{font-weight:800;font-size:20px;letter-spacing:.38em;color:${C.olive}}
.foot .bar{width:2px;height:34px;background:${C.line}}
.foot .tag{font-family:Garamond,serif;font-style:italic;font-weight:600;font-size:30px}
</style></head><body>
<div class="head"></div>
<div class="title"><div class="k">A RIZ.CO GUIDE</div><h1>THE BRAND <em>Tree</em></h1><p>Customers only see the fruit. <em>Strong roots</em> are what make it grow.</p></div>
<svg class="grow" viewBox="0 0 24 ${arrowBot - arrowTop}" preserveAspectRatio="none"><line x1="12" y1="${arrowBot - arrowTop}" x2="12" y2="14" stroke="${C.olive}" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/><path d="M2 18 L12 2 L22 18" fill="none" stroke="${C.olive}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
${bands}
<div class="foot"><img src="data:image/png;base64,${b64(kit.logo.darkInk)}" alt=""/><span class="name">${h(kit.wordmark)}</span><span class="bar"></span><span class="tag">${h(kit.tagline)}</span></div>
</body></html>`;

fs.writeFileSync(path.join(here, "poster.html"), html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const over = await page.evaluate(() => [...document.querySelectorAll(".band")].map((b) => { const c = b.querySelector(".chips"); return c.scrollHeight > b.clientHeight - 20 || c.getBoundingClientRect().right > b.getBoundingClientRect().right; }));
console.log("overflow:", over.join(" "));
const out = path.join(here, "rizco-brand-tree.png");
await page.screenshot({ path: out });
await browser.close();
console.log(path.relative(ROOT, out));
