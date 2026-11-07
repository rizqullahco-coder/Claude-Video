#!/usr/bin/env bash
# SessionStart hook: tell Claude whether ffmpeg/ffprobe are available.
# Whatever this prints on stdout is added to Claude's context.

if command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1; then
  version=$(ffmpeg -version 2>/dev/null | head -n 1 | awk '{print $3}')
  echo "video-toolkit: ffmpeg ${version} is available."
else
  cat <<'MSG'
video-toolkit: ffmpeg/ffprobe are NOT installed, so the video commands will fail.
If the user asks for video work, tell them to install ffmpeg first:
  macOS: brew install ffmpeg
  Debian/Ubuntu: sudo apt-get install ffmpeg
  Windows: winget install ffmpeg
MSG
fi
exit 0
