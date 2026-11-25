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
.swipe{position:absolute;right:40px;top:1253px;font-weight:800;font-size:19px;letter-spacing:.14em;text-transform:uppercase;color:${C.olive}}
.swipe b{display:inline-block;margin-left:6px;width:34px;height:34px;line-height:32px;text-align:center;border-radius:50%;background:${C.olive};color:${C.pale}}
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
<div class="swipe">Swipe for the full guide <b>→</b></div>
<div class="foot"><img src="data:image/png;base64,${b64(kit.logo.darkInk)}" alt=""/><span class="name">${h(kit.wordmark)}</span><span class="bar"></span><span class="tag">${h(kit.tagline)}</span></div>
</body></html>`;


// ---------- detail slides: every item explained, with an example and a quick check
const detail = {
  ROOTS: { intro: "Everything else grows from here. Skip it and the whole tree wobbles.",
    rows: [["Why you exist", "The reason behind the business, beyond making money.", "Help small shops price with confidence."],
      ["Who you serve", "Picture one real customer: their problem, and where they hang out.", "Home bakers selling on Instagram."],
      ["What makes you different", "The one thing people get from you and nobody else.", "Templates in plain English, not accountant-speak."],
      ["Your values", "Three words that guide every decision, even the hard ones.", "Honest. Simple. Halal."],
      ["Goals you can measure", "Numbers with a deadline, so you know if it's working.", "50 paying customers by June."]],
    check: "Can you explain your business in one sentence, without saying “we do everything”?" },
  TRUNK: { intro: "Consistency is what makes people remember you.",
    rows: [["Logo & colours", "One logo and 2–3 colours, used the same way every time.", "The same green on your sign, posts and invoices."],
      ["Fonts & photo style", "Pick 1–2 fonts and one photo mood, then stick to them.", "Natural light, warm tones, real products."],
      ["Tagline", "A short line that says what you stand for.", "“Build Your Rizq. Don't Wait for It.”"],
      ["Tone of voice", "How you talk. Keep it the same in DMs, captions and ads.", "Talk like a helpful friend, not a bank."],
      ["Packaging & signage", "Every physical touchpoint is a mini billboard.", "A sticker and thank-you card in every order."]],
    check: "Cover your logo. Would people still know the post is yours?" },
  BRANCHES: { intro: "Go where your customers already spend their time.",
    rows: [["Social media & reels", "Show up on 1–2 platforms often, not 6 platforms once in a while.", "3 reels a week beats one viral post."],
      ["Website & Google", "Make it easy to find you, trust you and buy from you.", "A Google Business Profile with photos and hours."],
      ["Ads that target", "Spend small, aim at one audience, test, then scale.", "B$5 a day to people nearby who match your customer."],
      ["Press & partners", "Borrow trust from people your customers already follow.", "A collab with a local café or creator."],
      ["Events & pop-ups", "Let people meet you, try you and talk about you.", "A booth at the weekend market."]],
    check: "If someone searches for what you sell right now, do they find you?" },
  FRUIT: { intro: "A loyal customer costs less than a new one, and brings friends.",
    rows: [["Reviews & referrals", "Ask happy customers to say it out loud.", "Send a review link the day after delivery."],
      ["Loyalty rewards", "Give regulars a reason to choose you again.", "Buy 5, get the 6th free."],
      ["After-sales care", "The sale isn't the end. Check in and fix problems fast.", "A “How's it going?” message one week later."],
      ["Community", "Turn customers into a group that talks to each other.", "A WhatsApp group or a monthly meetup."],
      ["Repeat customers", "Track who comes back, and find out why.", "List your top 20 buyers and thank them."]],
    check: "Do you know your top 10 customers by name?" },
};
const baseCss = `${fonts}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.bg};color:${C.ink};font-family:Inter,sans-serif;position:relative}
.foot{position:absolute;left:0;right:0;bottom:24px;display:flex;align-items:center;justify-content:center;gap:22px}
.foot img{height:54px}
.foot .name{font-weight:800;font-size:20px;letter-spacing:.38em;color:${C.olive}}
.foot .bar{width:2px;height:34px;background:${C.line}}
.foot .tag{font-family:Garamond,serif;font-style:italic;font-weight:600;font-size:30px}`;
const footHtml = `<div class="foot"><img src="data:image/png;base64,${b64(kit.logo.darkInk)}" alt=""/><span class="name">${h(kit.wordmark)}</span><span class="bar"></span><span class="tag">${h(kit.tagline)}</span></div>`;
const order = [...levels].reverse(); // roots first
const tracker = (cur) => `<div class="trk">${levels.map((L) => `<div class="tn${L.name === cur ? " on" : ""}"><i></i><span>${L.name}</span></div>`).join("")}</div>`;
const detailHtml = (L) => { const d = detail[L.name]; const dark = L.ink !== C.ink;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${baseCss}
.hd{position:absolute;left:0;right:0;top:0;height:338px;background:${L.bg};color:${L.ink};padding:46px 60px 0;border-bottom:4px solid ${dark ? C.lite : C.olive}}
.hd .badge{position:absolute;left:60px;top:58px;width:128px;height:128px;border-radius:50%;border:3px solid ${L.ink};background:${dark ? "rgba(255,255,255,.12)" : C.pale};display:flex;align-items:center;justify-content:center}
.hd .tt{position:absolute;left:216px;top:52px}
.hd .k{font-weight:800;font-size:19px;letter-spacing:.32em;opacity:.7}
.hd h1{font-weight:800;font-size:96px;letter-spacing:-0.04em;line-height:1;margin-top:8px}
.hd h2{font-family:Garamond,serif;font-style:italic;font-weight:600;font-size:38px;margin-top:4px}
.hd p{position:absolute;left:60px;right:60px;top:256px;font-weight:600;font-size:25px;line-height:1.3;opacity:.92}
.trk{position:absolute;right:52px;top:52px;display:flex;flex-direction:column;gap:12px}
.tn{display:flex;align-items:center;gap:12px;font-weight:800;font-size:16px;letter-spacing:.2em;opacity:.45}
.tn i{width:18px;height:18px;border-radius:50%;border:3px solid currentColor}
.tn.on{opacity:1} .tn.on i{background:currentColor;box-shadow:0 0 0 5px ${dark ? "rgba(255,255,255,.18)" : "rgba(75,83,30,.18)"}}
.rows{position:absolute;left:44px;right:44px;top:358px;display:flex;flex-direction:column;gap:10px}
.r{display:flex;gap:22px;align-items:flex-start;background:${C.pale};border-radius:22px;padding:15px 26px 15px 20px;box-shadow:0 6px 18px rgba(30,33,20,.07)}
.r .n{flex:none;width:50px;height:50px;border-radius:50%;background:${L.bg === C.pale ? C.olive : L.bg};color:${L.bg === C.lite ? C.ink : C.pale};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px}
.r b{display:block;font-weight:800;font-size:31px;letter-spacing:-0.02em;line-height:1.1}
.r span{display:block;font-weight:400;font-size:23px;line-height:1.3;color:#3c4130;margin-top:5px}
.r em{display:block;font-family:Garamond,serif;font-style:italic;font-weight:600;font-size:26px;line-height:1.15;color:${C.olive};margin-top:6px}
.qc{position:absolute;left:44px;right:44px;bottom:106px;border:3px dashed ${C.olive};border-radius:22px;padding:18px 26px;display:flex;gap:20px;align-items:center;background:#e4e8d6}
.qc .box{flex:none;width:44px;height:44px;border:4px solid ${C.olive};border-radius:10px}
.qc div b{font-weight:800;font-size:17px;letter-spacing:.24em;color:${C.olive}}
.qc div p{font-weight:600;font-size:26px;line-height:1.28;margin-top:4px}
</style></head><body>
<div class="hd"><div class="badge"><svg viewBox="0 0 80 80" width="88" height="88">${icons[L.icon](L.ink)}</svg></div>
<div class="tt"><div class="k">LEVEL 0${L.n} OF 04</div><h1>${L.name}</h1><h2>${h(L.sub)}</h2></div>${tracker(L.name)}<p>${h(d.intro)}</p></div>
<div class="rows">${d.rows.map(([t, x, e], i) => `<div class="r"><div class="n">${i + 1}</div><div><b>${h(t)}</b><span>${h(x)}</span><em>e.g. ${h(e)}</em></div></div>`).join("")}</div>
<div class="qc"><span class="box"></span><div><b>QUICK CHECK</b><p>${h(d.check)}</p></div></div>
${footHtml}</body></html>`; };
const closeHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${baseCss}
.wrap{position:absolute;left:70px;right:70px;top:110px}
.k{font-weight:800;font-size:20px;letter-spacing:.4em;color:${C.olive}}
h1{font-weight:800;font-size:112px;letter-spacing:-0.045em;line-height:.98;margin-top:20px}
h1 em{font-family:Garamond,serif;font-style:italic;font-weight:600;color:${C.olive};font-size:1.1em;letter-spacing:-0.01em}
.lead{font-weight:400;font-size:30px;line-height:1.4;margin-top:30px;color:#3c4130}
.lead b{font-weight:800;color:${C.ink}}
.steps{margin-top:44px;display:flex;flex-direction:column;gap:14px}
.st{display:flex;align-items:center;gap:22px;border-radius:20px;padding:16px 24px}
.st i{font-style:normal;font-weight:800;font-size:22px;letter-spacing:.2em;opacity:.7;width:50px}
.st b{font-weight:800;font-size:38px;letter-spacing:-0.02em;width:230px}
.st span{font-family:Garamond,serif;font-style:italic;font-weight:600;font-size:30px}
.cta{position:absolute;left:70px;right:70px;bottom:120px;text-align:center;font-weight:600;font-size:27px;line-height:1.35;background:${C.ink};color:${C.pale};border-radius:24px;padding:24px 30px}
.cta b{color:${C.lite}}
.next{margin-top:30px;display:flex;gap:22px;align-items:center;border:3px dashed ${C.olive};border-radius:22px;padding:22px 26px;background:#e4e8d6}
.next .box{flex:none;width:48px;height:48px;border:4px solid ${C.olive};border-radius:10px}
.next b{display:block;font-weight:800;font-size:17px;letter-spacing:.24em;color:${C.olive}}
.next p{font-weight:600;font-size:28px;line-height:1.3;margin-top:4px}
</style></head><body><div class="wrap"><div class="k">THE GOLDEN RULE</div><h1>Start at the <em>roots.</em></h1>
<p class="lead">Most businesses jump straight to the branches (ads, posts, promos) and wonder why nothing grows. <b>Build from the bottom up</b>, and every level makes the next one easier.</p>
<div class="steps">${order.map((L) => `<div class="st" style="background:${L.bg};color:${L.ink}"><i>0${L.n}</i><b>${L.name}</b><span>${h(L.sub)}</span></div>`).join("")}</div>
<div class="next"><span class="box"></span><div><b>YOUR MOVE THIS WEEK</b><p>Pick <u>one</u> item from Roots you can't answer yet. Write it down in one sentence.</p></div></div></div>
<div class="cta"><b>Save this</b> for your next planning day, and <b>send it</b> to a friend who's building something.</div>
${footHtml}</body></html>`;

const slides = [["01-overview", html], ...order.map((L, i) => [`0${i + 2}-${L.name.toLowerCase()}`, detailHtml(L)]), ["06-start-at-the-roots", closeHtml]];
const sd = path.join(here, "slides"); fs.rmSync(sd, { recursive: true, force: true }); fs.mkdirSync(sd);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
for (const [name, doc] of slides) {
  await page.setContent(doc, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  // layout check: nothing may run into the footer / quick-check box
  const clash = await page.evaluate(() => {
    const r = (s) => document.querySelector(s)?.getBoundingClientRect();
    const rows = r(".rows"), qc = r(".qc"), foot = r(".foot"), cta = r(".cta"), wrap = r(".wrap");
    if (rows && qc && rows.bottom > qc.top - 8) return `rows ${Math.round(rows.bottom)} > qc ${Math.round(qc.top)}`;
    if (wrap && cta && wrap.bottom > cta.top - 8) return `wrap ${Math.round(wrap.bottom)} > cta ${Math.round(cta.top)}`;
    if (qc && foot && qc.bottom > foot.top - 8) return "qc>foot";
    return "ok";
  });
  await page.screenshot({ path: path.join(sd, `${name}.png`) });
  console.log(name, clash);
}
await browser.close();
const zip = path.join(here, "rizco-brand-tree-carousel.zip");
fs.rmSync(zip, { force: true });
const { execFileSync } = await import("node:child_process");
execFileSync("zip", ["-j", "-q", zip, ...slides.map(([n]) => path.join(sd, `${n}.png`))]);
console.log(path.relative(ROOT, zip));
