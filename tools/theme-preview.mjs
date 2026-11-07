// Build one shorts project in every theme and snapshot the same moments for comparison.
// Usage: node tools/theme-preview.mjs projects/<name>/project.json <t1,t2,t3>
import fs from "node:fs";
import path from "node:path";
import { parseScript, buildVoice } from "../lib/script.mjs";
import { buildShortsComposition, THEMES } from "../lib/shorts.mjs";
import { hyperframes } from "../lib/hyperframes.mjs";

const [file, times] = process.argv.slice(2);
const dir = path.dirname(path.resolve(file));
const p = JSON.parse(fs.readFileSync(file, "utf8"));
const work = path.join(dir, "build");
const voice = await buildVoice(p, parseScript(fs.readFileSync(path.join(dir, p.script), "utf8")), work);
for (const theme of Object.keys(THEMES)) {
  const bd = path.join(work, `theme-${theme}`);
  buildShortsComposition(bd, { ...p, theme }, voice, { width: 1080, height: 1920, hasMusic: false });
  fs.copyFileSync(voice.voiceFile, path.join(bd, "assets/voice.wav"));
  fs.rmSync(path.join(bd, ".hyperframes"), { recursive: true, force: true });
  await hyperframes(["snapshot", "--at", times], { cwd: bd, stdio: ["ignore", "ignore", "inherit"], verbose: false });
  console.log("snapshots:", theme);
}
