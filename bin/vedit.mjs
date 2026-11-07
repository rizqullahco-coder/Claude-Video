#!/usr/bin/env node
// vedit – Tella + Epidemic Sound + HyperFrames + FFmpeg video pipeline.
import fs from "node:fs";
import path from "node:path";
import { ROOT, loadEnv, step, log, die, has, probeDuration, probeHasAudio, run } from "../lib/util.mjs";
import * as ff from "../lib/ffmpeg.mjs";
import * as tella from "../lib/tella.mjs";
import * as epidemic from "../lib/epidemic.mjs";
import { buildComposition, render, hyperframes } from "../lib/hyperframes.mjs";

loadEnv();
const [cmd, ...args] = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const bool = (name) => args.includes(`--${name}`);

const HELP = `
vedit – video editing pipeline (Tella → FFmpeg → HyperFrames → FFmpeg)

Setup
  doctor                         Check FFmpeg, Node, HyperFrames, API keys
  demo                           Run the whole pipeline on generated test media

Get footage & music
  tella list                     List videos in your Tella workspace
  tella pull <videoId>           Export + download a Tella video to media/raw/
  music search "<term>"          Search Epidemic Sound (Partner API)
  music pull <trackId>           Download an Epidemic Sound track to media/music/

Edit
  new <name>                     Create projects/<name>/project.json from the example
  run <project.json>             Full pipeline: prep → compose → render → finish
     [--draft]                     fast low-quality render for checking
     [--skip-render]               only build the HyperFrames project
  preview <project.json>         Open the HyperFrames Studio for the built project
  prep <in> <out>                FFmpeg only: clean/normalise a single recording
`;

async function doctor() {
  step("Doctor");
  const node = process.versions.node;
  const ok = (b, label, extra = "") => console.log(`${b ? "\x1b[32m✔" : "\x1b[31m✖"}\x1b[0m ${label}${extra ? `  ${extra}` : ""}`);
  ok(+node.split(".")[0] >= 22, "Node.js >= 22", `(found ${node})`);
  const ffv = has("ffmpeg"); ok(!!ffv, "ffmpeg", ffv || "install: https://ffmpeg.org/download.html");
  ok(!!has("ffprobe"), "ffprobe");
  const hf = has("npx", ["--yes", "hyperframes@0.9.19", "--version"]); ok(!!hf, "hyperframes CLI", hf || "run: npm install");
  ok(!!process.env.TELLA_API_KEY, "TELLA_API_KEY", process.env.TELLA_API_KEY ? "" : "(optional – otherwise put MP4s in media/raw/)");
  ok(!!process.env.EPIDEMIC_ACCESS_KEY_ID, "EPIDEMIC_ACCESS_KEY_ID/SECRET", process.env.EPIDEMIC_ACCESS_KEY_ID ? "" : "(optional – otherwise put tracks in media/music/)");
  if (bool("full")) await hyperframes(["doctor"]);
}

function loadProject(file) {
  if (!file) die("Pass a project file, e.g. projects/example/project.json");
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) die(`Not found: ${file}`);
  const p = JSON.parse(fs.readFileSync(abs, "utf8"));
  const dir = path.dirname(abs);
  const resolve = (f) => (f ? path.resolve(dir, f) : null);
  return { p, dir, resolve };
}

async function pipeline(file) {
  const { p, dir, resolve } = loadProject(file);
  const buildDir = path.join(dir, "build"), outDir = path.join(dir, "out");
  const name = p.name || path.basename(dir);

  // 1. Source footage: Tella (by id) or a local file.
  step("1/5 Footage");
  let raw = resolve(p.source?.file);
  if (p.source?.tellaVideoId && (!raw || !fs.existsSync(raw))) raw = await tella.pullVideo(p.source.tellaVideoId);
  if (!raw || !fs.existsSync(raw)) die(`Source video not found: ${p.source?.file}. Put your Tella export in media/raw/ or set source.tellaVideoId.`);
  log(path.relative(ROOT, raw));

  // 2. Music: Epidemic Sound (by track id) or a local file.
  step("2/5 Music");
  let music = resolve(p.music?.file);
  if (p.music?.epidemicTrackId && (!music || !fs.existsSync(music))) music = await epidemic.pullTrack(p.music.epidemicTrackId);
  if (music && !fs.existsSync(music)) die(`Music file not found: ${p.music.file}`);
  log(music ? path.relative(ROOT, music) : "no music");

  // 3. FFmpeg prep.
  step("3/5 FFmpeg prep");
  const mainOut = path.join(buildDir, "assets/main.mp4");
  await ff.prep(raw, mainOut, { width: p.width, height: p.height, fps: p.fps, ...(p.prep || {}) });
  if (music) await ff.prepMusic(music, path.join(buildDir, "assets/music.mp3"));
  const mainDuration = probeDuration(mainOut);

  // 4. HyperFrames composition + render.
  step("4/5 HyperFrames");
  const { total } = buildComposition(buildDir, p, { mainDuration, mainHasAudio: probeHasAudio(mainOut), musicFile: music });
  log(`composition: ${path.relative(ROOT, path.join(buildDir, "index.html"))} (${total.toFixed(1)}s)`);
  if (bool("skip-render")) return log("--skip-render: stopping here. Preview with: node bin/vedit.mjs preview " + file);
  await hyperframes(["lint"], { cwd: buildDir }).catch(() => die("HyperFrames lint found errors in the composition (see above)."));
  const master = path.join(outDir, `${name}-master.mp4`);
  await render(buildDir, master, { quality: bool("draft") ? "draft" : p.renderQuality || "looks", fps: p.fps || 30 });

  // 5. FFmpeg finish.
  step("5/5 FFmpeg finish");
  const files = await ff.finish(master, outDir, name, p.export || {});
  step("Done");
  [master, ...files].forEach((f) => log(path.relative(ROOT, f)));
}

const commands = {
  async doctor() { await doctor(); },
  async tella() {
    const [sub, id] = args;
    if (sub === "list") console.table(await tella.listVideos());
    else if (sub === "pull" && id) await tella.pullVideo(id, { resolution: flag("resolution", "1080p") });
    else die("Usage: tella list | tella pull <videoId>");
  },
  async music() {
    const [sub, val] = args;
    if (sub === "search" && val) console.table(await epidemic.searchTracks(val, { limit: +flag("limit", 10) }));
    else if (sub === "pull" && val) await epidemic.pullTrack(val);
    else die('Usage: music search "<term>" | music pull <trackId>');
  },
  async new() {
    const name = args[0] || die("Usage: new <name>");
    const dir = path.join(ROOT, "projects", name);
    if (fs.existsSync(dir)) die(`${dir} already exists`);
    fs.mkdirSync(dir, { recursive: true });
    const tpl = JSON.parse(fs.readFileSync(path.join(ROOT, "projects/example/project.json"), "utf8"));
    tpl.name = name;
    fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify(tpl, null, 2) + "\n");
    log(`created projects/${name}/project.json – edit it, then: node bin/vedit.mjs run projects/${name}/project.json`);
  },
  async run() { await pipeline(args[0]); },
  async preview() {
    const { dir } = loadProject(args[0]);
    const buildDir = path.join(dir, "build");
    if (!fs.existsSync(path.join(buildDir, "index.html"))) die("Build first: node bin/vedit.mjs run <project.json> --skip-render");
    await hyperframes(["preview"], { cwd: buildDir });
  },
  async prep() {
    const [i, o] = args;
    if (!i || !o) die("Usage: prep <input> <output>");
    await ff.prep(i, o, { trimStart: +flag("trim-start", 0), trimEnd: +flag("trim-end", 0), denoise: bool("denoise") });
  },
  async demo() {
    step("Generating demo media");
    await ff.makeDemoMedia(path.join(ROOT, "media/raw/demo-recording.mp4"), path.join(ROOT, "media/music/demo-music.mp3"));
    await pipeline(path.join(ROOT, "projects/example/project.json"));
  },
};

if (!cmd || cmd === "help" || cmd === "--help" || !commands[cmd]) { console.log(HELP); process.exit(cmd && !commands[cmd] && cmd !== "help" && cmd !== "--help" ? 1 : 0); }
commands[cmd]().catch((e) => die(e.message));
