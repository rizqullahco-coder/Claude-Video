// Builds a HyperFrames project (HTML + GSAP composition) around the prepped
// recording: animated intro title, lower-third name tag, optional chapter
// callouts, outro call-to-action, and an Epidemic Sound music bed that ducks
// under the voice. Then renders it with `npx hyperframes render`.
import fs from "node:fs";
import path from "node:path";
import { run, escapeHtml as h, ROOT } from "./util.mjs";

const HF = ["--yes", "hyperframes@0.9.19"];
export const hyperframes = (args, opts) => run("npx", [...HF, ...args], opts);

/**
 * @param {object} p  project config (see projects/example/project.json)
 * @param {object} m  { mainFile, mainDuration, mainHasAudio, musicFile }
 */
export function buildComposition(buildDir, p, m) {
  const W = p.width || 1920, H = p.height || 1080;
  const brand = { bg: "#0b0b12", ink: "#ffffff", accent: "#7c5cff", font: "Inter, 'Helvetica Neue', Arial, sans-serif", ...(p.brand || {}) };
  const intro = p.intro?.enabled === false ? 0 : (p.intro?.duration ?? 4);
  const outro = p.outro?.enabled === false ? 0 : (p.outro?.duration ?? 5);
  const main = +m.mainDuration.toFixed(3);
  const total = +(intro + main + outro).toFixed(3);
  const t0 = intro, t1 = +(intro + main).toFixed(3);

  const lt = p.lowerThird?.text ? { start: t0 + (p.lowerThird.at ?? 1), dur: p.lowerThird.duration ?? 5, ...p.lowerThird } : null;
  const callouts = (p.callouts || []).map((c, i) => ({ id: `callout-${i}`, start: +(t0 + c.at).toFixed(3), dur: c.duration ?? 3, text: c.text }))
    .filter((c) => c.start < t1);

  // Music bed split in three so it can sit loud under the intro/outro and ducked under the voice.
  const mu = p.music || {};
  const musicClips = [];
  if (m.musicFile) {
    const full = mu.volume ?? 0.5, duck = mu.duckedVolume ?? 0.12, off = mu.startAt ?? 0;
    const add = (id, start, dur, vol, fadeIn, fadeOut) => dur > 0 && musicClips.push(
      `<audio id="${id}" src="assets/music.mp3" data-start="${start}" data-duration="${+dur.toFixed(3)}" data-media-start="${+(off + start).toFixed(3)}" data-volume="${vol}"${fadeIn ? ` data-fade-in="${fadeIn}"` : ""}${fadeOut ? ` data-fade-out="${fadeOut}"` : ""}></audio>`);
    const voice = m.mainHasAudio && mu.duck !== false;
    if (voice) {
      add("music-intro", 0, t0, full, 0.5, 0.6);
      add("music-bed", t0, main, duck, 0.6, 0.6);
      add("music-outro", t1, outro, full, 0.6, 2);
    } else {
      add("music", 0, total, full, 0.5, 2);
    }
  }

  const css = `
:root { --bg:${brand.bg}; --ink:${brand.ink}; --accent:${brand.accent}; --font:${brand.font}; }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:${W}px; height:${H}px; overflow:hidden; background:var(--bg); font-family:var(--font); }
#root { position:relative; width:100%; height:100%; }
.clip { position:absolute; inset:0; }
.card { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:24px; background:var(--bg); color:var(--ink); text-align:center; padding:0 10%; }
.card h1 { font-size:${Math.round(H * 0.085)}px; font-weight:800; letter-spacing:-0.03em; line-height:1.05; }
.card p { font-size:${Math.round(H * 0.032)}px; opacity:.75; }
.card .bar { width:${Math.round(W * 0.08)}px; height:8px; border-radius:4px; background:var(--accent); }
#main { object-fit:contain; width:100%; height:100%; background:#000; }
.lower-third { inset:auto auto ${Math.round(H * 0.08)}px ${Math.round(W * 0.04)}px; display:flex; flex-direction:column; gap:6px; padding:20px 32px; background:rgba(11,11,18,.88); border-left:8px solid var(--accent); border-radius:10px; color:var(--ink); opacity:0; }
.lower-third strong { font-size:${Math.round(H * 0.036)}px; }
.lower-third span { font-size:${Math.round(H * 0.024)}px; opacity:.8; }
.callout { inset:${Math.round(H * 0.06)}px ${Math.round(W * 0.04)}px auto auto; padding:16px 28px; background:var(--accent); color:#fff; font-size:${Math.round(H * 0.03)}px; font-weight:700; border-radius:999px; opacity:0; }`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${W}, height=${H}" />
<script src="assets/gsap.min.js"></script>
<style>${css}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="${W}" data-height="${H}">
${intro ? `  <section id="intro" class="clip card" data-start="0" data-duration="${intro}" data-track-index="0">
    <div class="bar"></div>
    <h1 id="intro-title">${h(p.title || "Untitled")}</h1>
    ${p.subtitle ? `<p id="intro-sub">${h(p.subtitle)}</p>` : ""}
  </section>` : ""}
  <video id="main" class="clip" src="assets/main.mp4" data-start="${t0}" data-duration="${main}" data-track-index="1" ${m.mainHasAudio ? `data-has-audio="true" data-volume="${p.voiceVolume ?? 1}"` : "muted"} playsinline></video>
${lt ? `  <div id="lower-third" class="clip lower-third" data-start="${lt.start}" data-duration="${lt.dur}" data-track-index="2">
    <strong>${h(lt.text)}</strong>${lt.subtext ? `<span>${h(lt.subtext)}</span>` : ""}
  </div>` : ""}
${callouts.map((c) => `  <div id="${c.id}" class="clip callout" data-start="${c.start}" data-duration="${c.dur}" data-track-index="3">${h(c.text)}</div>`).join("\n")}
${outro ? `  <section id="outro" class="clip card" data-start="${t1}" data-duration="${outro}" data-track-index="0">
    <h1 id="outro-title">${h(p.outro?.title || "Thanks for watching")}</h1>
    ${p.outro?.cta ? `<p id="outro-cta">${h(p.outro.cta)}</p>` : ""}
    <div class="bar"></div>
  </section>` : ""}
${musicClips.map((c) => "  " + c).join("\n")}
</div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
${intro ? `  tl.fromTo("#intro .bar", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out" }, 0.2);
  tl.fromTo("#intro-title", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power4.out" }, 0.35);
  ${p.subtitle ? `tl.fromTo("#intro-sub", { opacity: 0 }, { opacity: 0.75, duration: 0.6 }, 0.8);` : ""}
  tl.to("#intro", { opacity: 0, duration: 0.4 }, ${Math.max(intro - 0.4, 0)});` : ""}
${lt ? `  tl.fromTo("#lower-third", { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, ${lt.start});
  tl.to("#lower-third", { x: -60, opacity: 0, duration: 0.4 }, ${+(lt.start + lt.dur - 0.4).toFixed(3)});` : ""}
${callouts.map((c) => `  tl.fromTo("#${c.id}", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }, ${c.start});
  tl.to("#${c.id}", { opacity: 0, duration: 0.3 }, ${+(c.start + c.dur - 0.3).toFixed(3)});`).join("\n")}
${outro ? `  tl.fromTo("#outro", { opacity: 0 }, { opacity: 1, duration: 0.5 }, ${t1});
  tl.fromTo("#outro-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power4.out" }, ${t1 + 0.2});
  ${p.outro?.cta ? `tl.fromTo("#outro-cta", { opacity: 0 }, { opacity: 0.75, duration: 0.5 }, ${t1 + 0.7});` : ""}` : ""}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script>
</body>
</html>
`;

  fs.mkdirSync(path.join(buildDir, "assets"), { recursive: true });
  // Bundle GSAP locally so renders are offline-safe and reproducible.
  fs.copyFileSync(path.join(ROOT, "node_modules/gsap/dist/gsap.min.js"), path.join(buildDir, "assets/gsap.min.js"));
  fs.writeFileSync(path.join(buildDir, "index.html"), html);
  fs.writeFileSync(path.join(buildDir, "hyperframes.json"), JSON.stringify({
    $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
    paths: { blocks: "compositions", components: "compositions/components", assets: "assets" },
    media: { autoProxy: true },
  }, null, 2));
  fs.writeFileSync(path.join(buildDir, "meta.json"), JSON.stringify({ id: path.basename(path.dirname(buildDir)), name: p.title || "video" }, null, 2));
  fs.writeFileSync(path.join(buildDir, "package.json"), JSON.stringify({
    name: "composition", private: true, type: "module",
    scripts: { dev: "npx --yes hyperframes@0.9.19 preview", check: "npx --yes hyperframes@0.9.19 check", render: "npx --yes hyperframes@0.9.19 render" },
  }, null, 2));
  return { total };
}

export async function render(buildDir, output, { quality = "looks", fps = 30 } = {}) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  await hyperframes(["render", "-o", output, "-q", quality, "-f", String(fps), "--video-frame-format", "png"], { cwd: buildDir });
  return output;
}
