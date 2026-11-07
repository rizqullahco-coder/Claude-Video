---
description: Shrink a video file, optionally to a target size in MB
argument-hint: <file> [target-MB | low|medium|high] [output]
allowed-tools: Bash(ffmpeg:*), Bash(ffprobe:*), Bash(ls:*), Bash(rm:ffmpeg2pass*)
---

Compress a video. Arguments: `$ARGUMENTS` — input file, then either a target size in MB (a number) or a quality level, then an optional output path. Default level is `medium`.

**Quality level** (single pass, H.264):

| level  | CRF | preset |
|--------|-----|--------|
| high   | 23  | slow   |
| medium | 26  | medium |
| low    | 30  | fast   |

`ffmpeg -hide_banner -i "<input>" -c:v libx264 -crf <crf> -preset <preset> -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "<output>"`

**Target size** (two-pass H.264):

1. Get the duration in seconds with ffprobe.
2. Video bitrate in kbit/s = `target_MB * 8192 / duration - 128` (128 kbit/s is reserved for audio). If that comes out below 150, warn that quality will be very poor and suggest also scaling down to 720p or 480p with `-vf scale=-2:720`.
3. Run:
   `ffmpeg -hide_banner -y -i "<input>" -c:v libx264 -b:v <v>k -pass 1 -an -f null /dev/null`
   `ffmpeg -hide_banner -i "<input>" -c:v libx264 -b:v <v>k -pass 2 -c:a aac -b:a 128k -movflags +faststart "<output>"`
4. Delete the `ffmpeg2pass-0.log*` files afterwards.

Default output is `<name>_compressed.mp4`. Never overwrite the input. Report the input size, output size and the percentage saved.
