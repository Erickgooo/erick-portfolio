#!/bin/bash
# Encodes the home film for scroll scrubbing. Small GOPs keep seeks cheap; the
# clip is played from an in-memory Blob, so it does not need to be all-intra.
# Usage: bash scripts/media/encode-film.sh [source.mp4]
set -euo pipefail
SRC="${1:-D:/Portafolio/Video Home/Video Renderizado/Video-Renderizado.mp4}"
OUT=public/video
IMG=public/images/film
mkdir -p "$OUT" "$IMG"
COMMON=(-an -c:v libx264 -preset slow -pix_fmt yuv420p -sc_threshold 0 -movflags +faststart)

ffmpeg -v error -y -i "$SRC" -vf "scale=1280:-2" "${COMMON[@]}" -crf 23 -g 8 -keyint_min 8 "$OUT/home-film.mp4"
# Centre crop for now; the shot-by-shot portrait reframe is Plan B.
ffmpeg -v error -y -i "$SRC" -vf "crop=ih*9/16:ih,scale=720:-2" "${COMMON[@]}" -crf 24 -g 4 -keyint_min 4 "$OUT/home-film-m.mp4"

ffmpeg -v error -y -i "$OUT/home-film.mp4" -frames:v 1 -c:v libwebp -quality 80 "$IMG/hero.webp"
ffmpeg -v error -y -i "$OUT/home-film-m.mp4" -frames:v 1 -c:v libwebp -quality 80 "$IMG/hero-m.webp"

ls -la "$OUT"/home-film*.mp4 "$IMG"/hero*.webp
