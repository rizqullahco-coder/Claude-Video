// Epidemic Sound Partner API client (https://developers.epidemicsound.com).
// Requires Partner API credentials. With a regular Epidemic Sound
// subscription, simply download tracks from the website into media/music/ –
// the rest of the pipeline is identical.
import path from "node:path";
import { download, log, slug, ROOT } from "./util.mjs";

let token;

function base() {
  return (process.env.EPIDEMIC_API_BASE || "https://partner-content-api.epidemicsound.com").replace(/\/$/, "");
}

async function partnerToken() {
  if (token) return token;
  const accessKeyId = process.env.EPIDEMIC_ACCESS_KEY_ID;
  const accessKeySecret = process.env.EPIDEMIC_ACCESS_KEY_SECRET;
  if (!accessKeyId || !accessKeySecret) {
    throw new Error("EPIDEMIC_ACCESS_KEY_ID / EPIDEMIC_ACCESS_KEY_SECRET not set. Add them to .env, or download the track from epidemicsound.com into media/music/.");
  }
  const res = await fetch(`${base()}/v0/partner-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKeyId, accessKeySecret }),
  });
  if (!res.ok) throw new Error(`Epidemic Sound auth failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  token = (await res.json()).accessToken;
  return token;
}

async function api(route) {
  const res = await fetch(base() + route, { headers: { Authorization: `Bearer ${await partnerToken()}`, Accept: "application/json" } });
  if (!res.ok) throw new Error(`Epidemic Sound GET ${route} -> ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

export async function searchTracks(term, { limit = 10 } = {}) {
  const r = await api(`/v0/tracks/search?term=${encodeURIComponent(term)}&limit=${limit}`);
  return (r.tracks || r.data || []).map((t) => ({
    id: t.id,
    title: t.title,
    artist: (t.mainArtists || t.artists || []).map((a) => a.name || a).join(", "),
    bpm: t.bpm,
    length: t.length ?? t.durationMs / 1000,
    moods: (t.moods || []).map((m) => m.name || m).join(", "),
  }));
}

export async function pullTrack(trackId, { outDir = path.join(ROOT, "media/music"), format = "mp3", quality = "normal" } = {}) {
  const r = await api(`/v0/tracks/${trackId}/download?format=${format}&quality=${quality}`);
  if (!r.url) throw new Error("Epidemic Sound did not return a download url");
  log(`downloading Epidemic Sound track ${trackId}`);
  return download(r.url, path.join(outDir, `epidemic-${slug(trackId)}.${format}`));
}
