// FFmpeg stages: clean up the raw recording before HyperFrames, and finish /
// export deliverables after HyperFrames renders.
import fs from "node:fs";
import path from "node:path";
import { run, log, probeHasAudio } from "./util.mjs";

const AUDIO_LOUDNORM = "loudnorm=I=-16:TP=-1.5:LRA=11"; // YouTube/podcast-friendly loudness

/**
 * Prep: trim, scale/pad to the canvas, constant frame rate, loudness-normalise.
 * Produces an H.264 MP4 that HyperFrames can seek frame-accurately.
 */
export async function prep(input, output, { width = 1920, height = 1080, fps = 30, trimStart = 0, trimEnd = 0, denoise = false } = {}) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const args = ["-y", "-hide_banner", "-loglevel", "warning", "-stats"];
  if (trimStart > 0) args.push("-ss", String(trimStart));
  args.push("-i", input);
  if (trimEnd > 0) args.push("-to", String(trimEnd - (trimStart || 0)));

  const vf = [
    `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`,
    `fps=${fps}`,
    "format=yuv420p",
  ].join(",");
  args.push("-vf", vf, "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart");

  if (probeHasAudio(input)) {
    const af = [denoise ? "afftdn=nf=-25" : null, "highpass=f=80", AUDIO_LOUDNORM].filter(Boolean).join(",");
    args.push("-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", "48000");
  } else {
    args.push("-an");
  }
  args.push(output);
  await run("ffmpeg", args);
  return output;
}

/** Make sure a music file is a clean 48 kHz stereo MP3 HyperFrames can mix. */
export async function prepMusic(input, output) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", input, "-vn", "-ac", "2", "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "256k", output]);
  return output;
}

/**
 * Finish: final loudness pass on the HyperFrames render plus extra deliverables
 * (vertical/square crops and a thumbnail).
 */
export async function finish(master, outDir, name, { formats = ["landscape"], thumbnailAt = 2 } = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  const outputs = [];
  const base = ["-y", "-hide_banner", "-loglevel", "warning", "-stats", "-i", master];
  const audio = probeHasAudio(master) ? ["-af", AUDIO_LOUDNORM, "-c:a", "aac", "-b:a", "192k", "-ar", "48000"] : ["-an"];
  const video = (vf) => [...(vf ? ["-vf", vf] : []), "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart"];

  const variants = {
    landscape: null, // 16:9 as rendered (YouTube, website)
    vertical: "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920", // 9:16 (Shorts, Reels, TikTok)
    square: "crop=ih:ih:(iw-ih)/2:0,scale=1080:1080", // 1:1 (LinkedIn, feed)
  };
  for (const fmt of formats) {
    if (!(fmt in variants)) { log(`skipping unknown format "${fmt}"`); continue; }
    const out = path.join(outDir, `${name}-${fmt}.mp4`);
    await run("ffmpeg", [...base, ...video(variants[fmt]), ...audio, out]);
    outputs.push(out);
  }
  const thumb = path.join(outDir, `${name}-thumbnail.jpg`);
  await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-ss", String(thumbnailAt), "-i", master, "-frames:v", "1", "-q:v", "2", thumb]);
  outputs.push(thumb);
  return outputs;
}

/** Generate a synthetic "screen recording" + music bed so the demo runs with no accounts. */
export async function makeDemoMedia(rawOut, musicOut) {
  fs.mkdirSync(path.dirname(rawOut), { recursive: true });
  fs.mkdirSync(path.dirname(musicOut), { recursive: true });
  await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error",
    "-f", "lavfi", "-i", "testsrc2=size=1280x720:rate=30:duration=8",
    "-f", "lavfi", "-i", "sine=frequency=330:duration=8:sample_rate=48000",
    "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", rawOut]);
  await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error",
    "-f", "lavfi", "-i", "sine=frequency=220:duration=20:sample_rate=48000",
    "-f", "lavfi", "-i", "sine=frequency=277:duration=20:sample_rate=48000",
    "-filter_complex", "amix=inputs=2,volume=0.6", "-c:a", "libmp3lame", "-b:a", "192k", musicOut]);
}
