# Claude-Video

A Claude Code plugin marketplace with **video-toolkit**, a plugin for editing and inspecting video files with ffmpeg.

## Install

Requires [ffmpeg](https://ffmpeg.org/download.html) (which includes ffprobe) and Python 3, for the safety hook.

In Claude Code:

```
/plugin marketplace add rizqullahco-coder/Claude-Video
/plugin install video-toolkit@claude-video
```

To try it from a local clone without installing:

```bash
claude --plugin-dir ./plugins/video-toolkit
```

## What's inside

### Slash commands

| Command | What it does |
|---------|--------------|
| `/video-toolkit:info <file>` | Duration, resolution, codecs, bitrate, size |
| `/video-toolkit:trim <file> <start> <end> [out]` | Cut a clip (lossless by default, frame-accurate on request) |
| `/video-toolkit:convert <file> <mp4\|webm\|mov\|mkv> [out]` | Change container/codec, remuxing when possible |
| `/video-toolkit:compress <file> [MB \| low\|medium\|high] [out]` | Shrink by quality level or to a target size (two-pass) |
| `/video-toolkit:extract-audio <file> [mp3\|m4a\|wav\|flac] [out]` | Pull out the audio track |
| `/video-toolkit:thumbnail <file> [time \| grid] [out]` | Still frame or 4x4 contact sheet |
| `/video-toolkit:gif <file> [start] [duration] [width] [out]` | Palette-optimised animated GIF |

### Skill: `ffmpeg-video`

Claude loads this by itself whenever you ask for something done to a media file (resize, crop, speed up, concatenate, burn subtitles, watermark, normalise audio and so on), even without mentioning ffmpeg. It holds the working rules plus a recipe reference (`reference.md`).

### Subagent: `video-processor`

Handles batch and multi-step jobs, such as "make 9:16 versions of everything in `raw/`" or "trim, resize and compress these five clips". It keeps the ffmpeg output out of your main conversation and returns a summary table. It includes presets for YouTube, Reels/TikTok/Shorts, Instagram feed and X.

### Hooks

- **SessionStart** checks whether ffmpeg is installed and tells Claude, so it can point you to install instructions instead of failing.
- **PreToolUse (Bash)** blocks any ffmpeg command whose output file is one of its inputs. ffmpeg truncates the output before reading, so that would destroy the source.

## Layout

```
.claude-plugin/marketplace.json         # marketplace listing
plugins/video-toolkit/
├── .claude-plugin/plugin.json          # plugin manifest
├── commands/*.md                       # slash commands
├── skills/ffmpeg-video/                # SKILL.md + reference.md
├── agents/video-processor.md           # subagent
├── hooks/hooks.json                    # hook configuration
└── scripts/                            # hook scripts
```

## Developing

```bash
claude plugin validate .
claude plugin validate plugins/video-toolkit
```

Edit a command or skill and restart Claude Code (or run `/plugin` to reload) to pick up changes. Bump `version` in both `plugin.json` and `marketplace.json` when you release changes.
