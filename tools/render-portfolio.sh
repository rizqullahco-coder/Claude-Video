#!/usr/bin/env bash
# Render every project in projects/portfolio (words-to-video, shorts style), then
# collect the finished MP4s + thumbnails into projects/portfolio/_final/.
set -e
cd "$(dirname "$0")/.."
mkdir -p projects/portfolio/_final
for d in projects/portfolio/v*/; do
  name=$(basename "$d")
  if [ -f "projects/portfolio/_final/rizq-$name-vertical.mp4" ]; then echo "skip $name"; continue; fi
  echo "=== $name ($(date +%T))"
  node bin/vedit.mjs run "$d/project.json"
  cp "$d"/out/*-vertical.mp4 "$d"/out/*-thumbnail.jpg projects/portfolio/_final/
done
echo "ALL DONE $(date +%T)"
