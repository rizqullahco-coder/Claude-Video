---
name: ffmpeg-video
description: Process video and audio files with ffmpeg and ffprobe — trimming, converting, compressing, resizing, cropping, changing speed, extracting audio or frames, burning in subtitles, concatenating clips, adding watermarks and making GIFs. Use whenever the user wants to edit, inspect or transform a media file (.mp4, .mov, .mkv, .webm, .avi, .mp3, .wav, .gif and similar), even if they don't mention ffmpeg.
---

# Working with video through ffmpeg

## Always do this

1. **Probe before you act.** Run `ffprobe -v error -show_entries format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate -of json "<file>"` so you know the codecs, resolution and duration before choosing settings.
2. **Never overwrite the input.** Write to a new file (for example `<name>_edited.mp4`). The plugin's PreToolUse hook blocks ffmpeg commands whose output is one of their inputs.
3. **Copy streams when you can.** `-c copy` is instant and lossless. Re-encode only when the operation needs it (filters, codec change, frame-accurate cuts).
4. **Quote paths** — media file names often contain spaces.
5. **Use `-hide_banner`** to keep output short, and check the result with ffprobe afterwards. Report the output path, duration and size.

## Sensible encoding defaults

| Goal | Video | Audio |
|------|-------|-------|
| Universal mp4 | `-c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p` | `-c:a aac -b:a 192k` |
| Smaller mp4 | `-c:v libx264 -crf 26` | `-c:a aac -b:a 128k` |
| Best compression | `-c:v libx265 -crf 28 -tag:v hvc1` | `-c:a aac -b:a 128k` |
| Web (webm) | `-c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1` | `-c:a libopus -b:a 128k` |

Add `-movflags +faststart` to mp4/mov output that will be streamed on the web. Lower CRF = higher quality and bigger files; ±6 roughly halves or doubles the size.

## Seeking

- `-ss` **before** `-i` is fast (seeks by keyframe; frame-accurate when re-encoding).
- `-ss` **after** `-i` decodes from the start: slow, but always exact.
- With `-c copy`, cuts snap to keyframes. Use `-avoid_negative_ts make_zero` to keep timestamps clean.

For more recipes (resize, crop, speed, rotate, concat, subtitles, watermark, audio normalisation, frame extraction) see [reference.md](reference.md).

## Troubleshooting

- *"height not divisible by 2"* → scale with `-2` instead of `-1`, e.g. `scale=1280:-2`.
- Video won't play in QuickTime/Safari → add `-pix_fmt yuv420p` and, for HEVC, `-tag:v hvc1`.
- Audio out of sync after a copy-trim → re-encode, or move `-ss` after `-i`.
- *"Unknown encoder"* → that encoder is not built into this ffmpeg; check `ffmpeg -encoders | grep <name>` and pick another.
