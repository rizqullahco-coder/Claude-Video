---
description: Show duration, resolution, codecs, bitrate and size of a video file
argument-hint: <file>
allowed-tools: Bash(ffprobe:*), Bash(ls:*)
---

Inspect the media file `$ARGUMENTS` with ffprobe:

```
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=index,codec_type,codec_name,width,height,r_frame_rate,channels,sample_rate -of json "$ARGUMENTS"
```

Report a short summary table: container duration (as HH:MM:SS), file size (human readable), overall bitrate, and one row per stream (type, codec, resolution or channels/sample rate, frame rate as a decimal). If the file does not exist or ffprobe fails, say so plainly.
