# Claude-Video: project rules

## The goal
Turn a flat cut into a finished, on-brand video.

## The rule: everything runs locally
- **All rendering is local, through HyperFrames (headless Chrome + FFmpeg).** No render cost, ever.
- **No footage leaves the machine.** Footage goes in, finished files come out, nothing goes back out.

What that means in practice:

| Allowed | Not allowed |
|---|---|
| `hyperframes render`, `preview`, `lint`, `check`, `snapshot` (local) | `hyperframes cloud`, `lambda`, `cloudrun`, `publish` |
| Downloading the flat cut **from** Tella | Uploading footage **to** Tella (`upload_clip`, `import_from_url`, Tella-side editing or exports of uploaded footage) |
| Downloading music **from** Epidemic Sound | Sending footage or audio to any Epidemic Sound tool (e.g. `EditRecording` of user media) |
| FFmpeg on local files | HeyGen / HyperFrames MCP `compose` or `render_video` (cloud) |
| | Any paid or credit-spending render or AI step |

- Tella's only job here is to **supply the flat cut** (exported and downloaded).
- Epidemic Sound's only job is to **supply music** (downloaded in).
- "On brand" means the `brand` block in `project.json` (colours, font, accent) plus the intro,
  lower third, callouts and outro. Keep every video consistent with it.
- HyperFrames telemetry stays off (`HYPERFRAMES_NO_TELEMETRY=1`, set in `lib/hyperframes.mjs`).
- GSAP is bundled locally (`node_modules/gsap`, copied into `build/assets/`), with no CDN at render time.

If a step would break this rule, don't do it. Tell the user and offer the local alternative.

## Brand + template library (RIZQ)
- Brand: the RIZQ logo (`brand/`): ivory, charcoal and gold. Logo on every scene plus a logo end card.
- Default output: **portrait 9:16 for Instagram Reels / TikTok, 40–50 seconds**, Gen Z tone:
  short, punchy, attention-grabbing text, with music and sound effects.
- The four template + colour combos are the library to choose from (`lib/shorts.mjs`):
  | Template | Theme |
  |---|---|
  | editorial-pop | ivory-gold |
  | bold-slam | gold-pop |
  | soft-rise | sage-luxe |
  | karaoke-flow | blush-luxe |
- **For each video requested, pick ONE combo at random. When making several videos at once, give each
  a different combo.** Do not render every combo for a video unless the user asks. This is a
  portfolio: videos should feel like one family, not identical.
- Only produce the number of videos the user asked for.
