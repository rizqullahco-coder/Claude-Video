---
description: Convert a video to another container or codec (mp4, webm, mov, mkv)
argument-hint: <file> <format> [output]
allowed-tools: Bash(ffmpeg:*), Bash(ffprobe:*), Bash(ls:*)
---

Convert a video. Arguments: `$ARGUMENTS` — input file, target format (mp4, webm, mov, mkv), optional output path.

1. Probe the input first. If its codecs already fit the target container (for example H.264 + AAC into mp4 or mov), remux without re-encoding: `-c copy`.
2. Otherwise re-encode with these defaults:
   - **mp4 / mov**: `-c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart`
   - **webm**: `-c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1 -c:a libopus -b:a 128k`
   - **mkv**: keep the source codecs with `-c copy`, unless they are not supported, then use the mp4 settings.
3. Default output is the input name with the new extension. Never overwrite the input.
4. Report the output path, its size, and the size change compared to the input.
