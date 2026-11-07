---
description: Grab a still frame, or a contact sheet of frames, from a video
argument-hint: <file> [timestamp | grid] [output]
allowed-tools: Bash(ffmpeg:*), Bash(ffprobe:*), Bash(ls:*)
---

Make a thumbnail. Arguments: `$ARGUMENTS` — input file, then a timestamp (HH:MM:SS or seconds) or the word `grid`, then an optional output path.

- **Timestamp** (default: 10% into the video, from ffprobe's duration):
  `ffmpeg -hide_banner -ss <t> -i "<input>" -frames:v 1 -q:v 2 "<output>"` — default output `<name>_thumb.jpg`.
- **No timestamp, "best" frame**: let ffmpeg pick a representative frame from the first part:
  `ffmpeg -hide_banner -i "<input>" -vf thumbnail=300 -frames:v 1 -q:v 2 "<output>"`
- **grid**: a 4x4 contact sheet of evenly spaced frames. With duration `D`, use `fps=16/D`:
  `ffmpeg -hide_banner -i "<input>" -vf "fps=16/<D>,scale=320:-2,tile=4x4" -frames:v 1 -q:v 3 "<output>"` — default output `<name>_grid.jpg`.

After writing the image, open it with the Read tool so you can see it and briefly describe what it shows.
