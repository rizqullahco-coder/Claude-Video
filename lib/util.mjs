import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Load KEY=VALUE pairs from .env into process.env (without overwriting). */
export function loadEnv(file = path.join(ROOT, ".env")) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m || line.trim().startsWith("#")) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (value && process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

export const log = (...a) => console.log("›", ...a);
export const step = (title) => console.log(`\n\x1b[1m== ${title} ==\x1b[0m`);
export function die(msg) {
  console.error(`\x1b[31m✖ ${msg}\x1b[0m`);
  process.exit(1);
}

/** Run a command, streaming output. Rejects on non-zero exit. */
export function run(cmd, args, opts = {}) {
  if (opts.verbose !== false) log([cmd, ...args].map(q).join(" "));
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", ...opts });
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))));
  });
}

const q = (s) => (/[\s"'$]/.test(s) ? JSON.stringify(s) : s);

export function has(cmd, args = ["-version"]) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  return r.status === 0 ? (r.stdout || r.stderr).split("\n")[0] : null;
}

/** Duration of a media file in seconds (via ffprobe). */
export function probeDuration(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  const d = parseFloat(r.stdout);
  if (!Number.isFinite(d)) throw new Error(`ffprobe could not read duration of ${file}`);
  return d;
}

export function probeHasAudio(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", file], { encoding: "utf8" });
  return r.stdout.trim().length > 0;
}

/** Stream a URL to disk. */
export async function download(url, dest, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Download failed (${res.status}) ${url}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const { Readable } = await import("node:stream");
  const { pipeline } = await import("node:stream/promises");
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(dest));
  log(`saved ${path.relative(ROOT, dest)}`);
  return dest;
}

export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "file";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
