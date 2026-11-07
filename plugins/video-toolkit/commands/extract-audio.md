---
description: Pull the audio track out of a video as mp3, m4a, wav or flac
argument-hint: <file> [mp3|m4a|wav|flac] [output]
allowed-tools: Bash(ffmpeg:*), Bash(ffprobe:*), Bash(ls:*)
---

Extract audio. Arguments: `$ARGUMENTS` — input file, optional format (default `mp3`), optional output path.

1. Probe the audio stream. If the requested format matches the source codec (for example AAC source and `m4a` requested), copy it: `-vn -c:a copy`.
2. Otherwise encode:
   - **mp3**: `-vn -c:a libmp3lame -q:a 2`
   - **m4a**: `-vn -c:a aac -b:a 192k`
   - **wav**: `-vn -c:a pcm_s16le`
   - **flac**: `-vn -c:a flac`
3. If the file has no audio stream, say so and stop.
4. Default output is the input name with the audio extension. Report its path, duration and size.
