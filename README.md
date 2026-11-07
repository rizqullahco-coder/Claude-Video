# Claude-Video: a video editing system

> **Turn a flat cut into a finished, on-brand video.** Everything runs locally through
> HyperFrames (Chrome + FFmpeg). No render cost, and no footage leaves your machine.
> Tella and Epidemic Sound are only used to bring files **in**. See [CLAUDE.md](CLAUDE.md).

A command-line video editing pipeline that joins four tools:

| Tool | What it does here |
|---|---|
| **Tella** | You record your screen and camera. The system can pull the export through the Tella API. |
| **Epidemic Sound** | Background music. Pulled through the Partner API, or downloaded by hand. |
| **FFmpeg** | Cleans up the recording before editing (trim, 1080p, 30 fps, loudness) and makes the final files (16:9, 9:16, 1:1, thumbnail). |
| **HyperFrames** | Adds the motion graphics: an animated intro title, a lower-third name tag, callouts, an outro call-to-action, and music that gets quieter while you talk. |

```
Tella recording ─┐
                 ├─► FFmpeg prep ─► HyperFrames composition + render ─► FFmpeg finish ─► out/
Epidemic track ──┘                  (intro · lower third · callouts ·       (landscape, vertical,
                                     outro · ducked music)                   square, thumbnail)
```

You describe each video in one `project.json` file. One command turns it into finished files.

---

## Step-by-step

### Step 1: Install the requirements (one time)

1. **Node.js 22 or newer**: https://nodejs.org (check with `node -v`)
2. **FFmpeg**:
   - macOS: `brew install ffmpeg`
   - Windows: `winget install ffmpeg`
   - Linux: `sudo apt install ffmpeg`
3. **Git**: https://git-scm.com

### Step 2: Get the code and install

```bash
git clone https://github.com/rizqullahco-coder/Claude-Video.git
cd Claude-Video
npm install
```

This installs HyperFrames and GSAP locally. HyperFrames downloads its own headless Chrome the first time you render.

### Step 3: Check your setup

```bash
npm run doctor
```

You should see green ticks for Node, ffmpeg, ffprobe and the hyperframes CLI. The two API key lines are optional (see Step 4).

### Step 4: (Optional) Add your API keys

```bash
cp .env.example .env
```

Open `.env` and fill in:

- `TELLA_API_KEY`: in Tella, open **Workspace settings → API**.
- `EPIDEMIC_ACCESS_KEY_ID` / `EPIDEMIC_ACCESS_KEY_SECRET`: these are **Partner API** credentials from https://developers.epidemicsound.com.

> **No API keys? That's fine.** Most people use it like this:
> - In Tella, click **Export → Download** and save the MP4 into `media/raw/`.
> - On epidemicsound.com, download the track (MP3 or WAV) into `media/music/`.
>
> The rest of the pipeline works the same either way.

### Step 5: Run the demo first

```bash
npm run demo
```

This makes a test recording and a test music track, then runs the whole pipeline. When it finishes, open `projects/example/out/`. You'll find:

- `example-master.mp4`: the HyperFrames render
- `example-landscape.mp4`: 16:9 for YouTube or your website
- `example-vertical.mp4`: 9:16 for Shorts, Reels and TikTok
- `example-square.mp4`: 1:1 for LinkedIn or feeds
- `example-thumbnail.jpg`

If the demo works, your system is ready.

### Step 6: Record in Tella and get the footage

Record your video in Tella as normal, then do **one** of these:

**A. Download it by hand:** export from Tella and save it as `media/raw/my-video.mp4`.

**B. Use the API:**
```bash
node bin/vedit.mjs tella list
node bin/vedit.mjs tella pull <videoId>
```
`list` shows your videos and their IDs. `pull` exports the video and downloads it to `media/raw/`.

### Step 7: Pick your music from Epidemic Sound

**A. Download it by hand:** save the track as `media/music/my-track.mp3`.

**B. Use the Partner API:**
```bash
node bin/vedit.mjs music search "upbeat corporate"
node bin/vedit.mjs music pull <trackId>
```

### Step 8: Create a project for your video

```bash
node bin/vedit.mjs new my-video
```

This creates `projects/my-video/project.json`. Open it and edit these fields:

```jsonc
{
  "title": "How to Ship Faster",            // intro title card
  "subtitle": "A 2-minute walkthrough",
  "source": { "file": "../../media/raw/my-video.mp4", "tellaVideoId": "" },
  "prep":   { "trimStart": 0, "trimEnd": 0, "denoise": false },  // seconds; denoise for noisy mics
  "music":  { "file": "../../media/music/my-track.mp3", "epidemicTrackId": "",
              "volume": 0.5, "duckedVolume": 0.12, "startAt": 0 }, // music is quieter while you talk
  "brand":  { "bg": "#0b0b12", "ink": "#ffffff", "accent": "#7c5cff", "font": "Inter, Arial, sans-serif" },
  "intro":  { "duration": 4 },               // "enabled": false to skip
  "lowerThird": { "text": "Your Name", "subtext": "Founder, Your Company", "at": 1, "duration": 4 },
  "callouts": [ { "at": 5, "duration": 2.5, "text": "Step 1: Set it up" } ],  // "at" = seconds into the recording
  "outro":  { "duration": 5, "title": "Thanks for watching", "cta": "Subscribe for more" },
  "export": { "formats": ["landscape", "vertical", "square"], "thumbnailAt": 2 }
}
```

Tips:
- If you fill in `tellaVideoId` or `epidemicTrackId`, the files download automatically when you run the project.
- File paths are relative to the `project.json` file.

### Step 9: Do a quick draft render

```bash
node bin/vedit.mjs run projects/my-video/project.json --draft
```

`--draft` renders fast at lower quality so you can check timing.

### Step 10: (Optional) Preview and tweak in HyperFrames Studio

```bash
node bin/vedit.mjs run projects/my-video/project.json --skip-render
node bin/vedit.mjs preview projects/my-video/project.json
```

This opens HyperFrames Studio in your browser (http://localhost:3002), so you can scrub through the timeline. Adjust the timings in `project.json` and run the command again. If you want hand-made animations, edit `projects/my-video/build/index.html` directly. It's plain HTML and GSAP. Note that running `run` again overwrites it.

### Step 11: Final render

```bash
node bin/vedit.mjs run projects/my-video/project.json
```

Your finished videos are in `projects/my-video/out/`.

---

## Words to video (no footage needed)

Write a script and get a finished, on-brand video: an **offline voiceover**, words that
appear in time with the voice (they double as captions), title cards between sections,
your logo and colours, a progress bar, and an outro. It all runs locally.

One extra install for the offline voice (one time):

```bash
pip install kokoro-onnx soundfile
```

1. Make a folder `projects/<name>/` containing `script.md`:
   ```markdown
   ## The Hook
   Have a *business idea* but don't know *where to start*?
   If that sounds familiar, then *this is for you*.

   ## Meet Cuba
   Hi everyone! Today, I want to introduce you to *Cuba*.
   ```
   `## ...` starts a new section (it gets a title card). Put each beat on its own line.
   `*words*` are highlighted in your accent colour.
2. Add a `project.json` next to it. Copy `projects/cuba-video-2/project.json` and change:
   `brand` (name, tagline, colours), `intro`, `outro` (`spoken` is read aloud over the end card),
   `voice` (`af_heart`, `af_nova`, `am_michael`, `bm_george`, …; list them with `npx hyperframes tts --list`),
   `formats` (`landscape`, `vertical`, `square`), and optionally `music.file`.
3. Render:
   ```bash
   node bin/vedit.mjs run projects/<name>/project.json
   ```
   Add `--format vertical` to render a single format, or `--draft` for a quick check.
   Results go to `projects/<name>/out/`. The voiceover is cached, so re-rendering after design
   tweaks skips the voice step.

## Command reference

```
node bin/vedit.mjs doctor                 Check requirements and keys
node bin/vedit.mjs demo                   Run the full pipeline on test media
node bin/vedit.mjs tella list             List Tella videos
node bin/vedit.mjs tella pull <id>        Download a Tella video to media/raw/
node bin/vedit.mjs music search "<term>"  Search Epidemic Sound
node bin/vedit.mjs music pull <id>        Download a track to media/music/
node bin/vedit.mjs new <name>             Create a new project
node bin/vedit.mjs run <project.json>     Full pipeline (--draft, --skip-render)
node bin/vedit.mjs preview <project.json> Open HyperFrames Studio
node bin/vedit.mjs prep <in> <out>        FFmpeg clean-up only (--trim-start, --trim-end, --denoise)
```

## What happens in each stage

1. **Footage**: uses your local file, or exports and downloads it from Tella.
2. **Music**: uses your local file, or downloads it from Epidemic Sound.
3. **FFmpeg prep**: trims, scales and pads to 1920×1080, sets a constant 30 fps (so HyperFrames can seek exactly), filters out rumble below 80 Hz, can remove noise, sets loudness to −16 LUFS and converts to H.264/AAC.
4. **HyperFrames**: writes `build/index.html` (an HTML and GSAP composition with an intro, your recording, a lower third, callouts and an outro). The music is split into three parts: full volume for the intro, quiet under your voice, full volume for the outro. It checks the composition, then renders `out/<name>-master.mp4`.
5. **FFmpeg finish**: runs a final loudness pass, then makes the 16:9, 9:16 and 1:1 versions and a JPG thumbnail.

## Troubleshooting

- **`ffmpeg: command not found`**: install FFmpeg (Step 1) and open a new terminal.
- **The render is slow**: use `--draft` while you're iterating. HyperFrames also supports `--gpu`.
- **Tella or Epidemic API errors (401/403/404)**: check your keys in `.env`. If your account's API addresses are different, change `TELLA_API_BASE` or `EPIDEMIC_API_BASE`. You can always download the files by hand instead (Steps 6A and 7A).
- **Music is too loud or too quiet**: change `music.volume` (intro and outro) and `music.duckedVolume` (while you talk).
- **Licensing**: Epidemic Sound tracks are covered by your Epidemic Sound subscription. Make sure the channel or account you publish to is the one on your licence.
