---
description: Turn part of a video into a good-looking, small animated GIF
argument-hint: <file> [start] [duration] [width] [output]
allowed-tools: Bash(ffmpeg:*), Bash(ffprobe:*), Bash(ls:*)
---

Make a GIF. Arguments: `$ARGUMENTS` — input file, optional start (default 0), duration in seconds (default 5), width in pixels (default 480), output path (default `<name>.gif`).

Use a generated palette in a single command so colours stay clean:

```
ffmpeg -hide_banner -ss <start> -t <duration> -i "<input>" -vf "fps=12,scale=<width>:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" -loop 0 "<output>"
```

If the GIF ends up larger than 10 MB, say so and offer a smaller width, a lower fps (8–10) or a shorter clip. Report the path and size.
