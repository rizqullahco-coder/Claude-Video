// Tella Public API client (https://docs.tella.com). Auth: Bearer API key from
// your Tella workspace settings. Flow: list videos -> start export -> poll
// export status -> download `downloadUrl`.
//
// If any endpoint differs on your account, override the base with
// TELLA_API_BASE, or skip the API entirely: download the MP4 from Tella's
// "Export" button and drop it in media/raw/.
import path from "node:path";
import { download, log, sleep, slug, ROOT } from "./util.mjs";

function cfg() {
  const key = process.env.TELLA_API_KEY;
  if (!key) throw new Error("TELLA_API_KEY is not set. Add it to .env, or download the video from Tella manually into media/raw/.");
  return { key, base: (process.env.TELLA_API_BASE || "https://api.tella.com/v1").replace(/\/$/, "") };
}

async function api(method, route, body) {
  const { key, base } = cfg();
  const res = await fetch(base + route, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Tella ${method} ${route} -> ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

/** Pull an array out of the common response shapes ({data:[]}, {videos:[]}, []). */
const items = (r, key) => (Array.isArray(r) ? r : r[key] || r.data || r.items || []);

export async function listVideos() {
  const r = await api("GET", "/videos");
  return items(r, "videos").map((v) => ({
    id: v.id,
    title: v.name || v.title || "(untitled)",
    duration: v.duration ?? v.durationSeconds,
    created: v.createdAt || v.created_at,
  }));
}

export async function listExports(videoId) {
  return items(await api("GET", `/videos/${videoId}/exports`), "exports");
}

/**
 * Download a Tella video. Reuses a completed export if one exists; otherwise
 * starts a new export and polls until it completes.
 */
export async function pullVideo(videoId, { outDir = path.join(ROOT, "media/raw"), resolution = "1080p", timeoutMin = 30 } = {}) {
  let ready = (await listExports(videoId)).find((e) => e.status === "completed" && e.downloadUrl);
  if (!ready) {
    log(`starting Tella export for ${videoId} (${resolution})…`);
    const started = await api("POST", `/videos/${videoId}/exports`, { resolution });
    const exportId = started.id || started.export?.id;
    const deadline = Date.now() + timeoutMin * 60_000;
    while (Date.now() < deadline) {
      await sleep(5000);
      const all = await listExports(videoId);
      const e = all.find((x) => x.id === exportId) || all[0];
      if (!e) continue;
      log(`export ${e.status}${e.progress != null ? ` ${Math.round(e.progress)}%` : ""}`);
      if (e.status === "failed") throw new Error("Tella export failed");
      if (e.status === "completed" && e.downloadUrl) { ready = e; break; }
    }
    if (!ready) throw new Error("Timed out waiting for the Tella export");
  }
  return download(ready.downloadUrl, path.join(outDir, `tella-${slug(videoId)}.mp4`));
}
