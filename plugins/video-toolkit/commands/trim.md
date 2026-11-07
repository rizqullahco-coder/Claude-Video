---
description: Cut a clip out of a video between two timestamps
argument-hint: <file> <start> <end> [output]
allowed-tools: Bash(ffmpeg:*), Bash(ffprobe:*), Bash(ls:*)
---

Trim a video. Arguments: `$ARGUMENTS` — input file, start time, end time (HH:MM:SS[.ms] or seconds), and an optional output path.

1. If no output path is given, use `<name>_trim_<start>-<end>.<ext>` next to the input (replace `:` with `-` in the name).
2. Never write the output over the input file.
3. Default to a fast, lossless stream copy:
   `ffmpeg -hide_banner -ss <start> -to <end> -i "<input>" -c copy -avoid_negative_ts make_zero "<output>"`
4. Stream copy can only cut on keyframes, so the start may be off by up to a few seconds. If the user asked for a frame-accurate cut, re-encode instead:
   `ffmpeg -hide_banner -ss <start> -to <end> -i "<input>" -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k "<output>"`
5. Confirm the result with ffprobe and report the output path, its duration and size.
