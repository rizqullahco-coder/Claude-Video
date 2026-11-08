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
- **iPhone footage is often HDR (HLG).** Always tone-map it to SDR BT.709 when cutting
  (`HDR_TO_SDR` / `isHdr` in `lib/ffmpeg.mjs`, applied automatically by `prep`). HDR-tagged footage
  makes HyperFrames fall back to a very slow HDR render path and colours look wrong.
- GSAP is bundled locally (`node_modules/gsap`, copied into `build/assets/`), with no CDN at render time.

If a step would break this rule, don't do it. Tell the user and offer the local alternative.

## Brand kits
- **EVERY video and poster made from now on uses the Riz.co logo AND the tagline
  "Build Your Rizq. Don't Wait for It."** (`"brandKit": "rizco"`, the default for all new work).
  Videos: logo on every scene + logo/wordmark/tagline end card. Posters (`tools/posters.mjs`):
  logo, `RIZ.CO` wordmark and tagline in the footer of every slide.
- **Riz.co kit details:**
  Logo: `brand/rizco/` (black R with olive-green z; ivory and light-olive version for dark
  backgrounds; all-ink version for coloured backgrounds). End card: logo, the `RIZ.CO` wordmark,
  and the tagline **"Build Your Rizq. Don't Wait for It."** (set in `lib/brands.mjs`; leave
  `outro.tag` unset so the tagline is used), then the CTA button.
- The older RIZQ logo (`brand/rizq-*`, `"brandKit": "rizq"`) is no longer used for Riz.co.

## Template library
- Logo on every scene plus a logo end card.
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

## Delivery (how finished work is sent to the user)
- **Do not upload to Google Drive** unless the user asks.
- **Videos:** send the `.mp4` directly in the chat (no zip). Include its thumbnail only if useful.
- **Posters:** **one** poster → send the `.png`; **more than one** (e.g. a carousel) → send a single `.zip`
  of all the PNGs in slide order.
