#!/bin/bash
# Encodes the home film for scroll scrubbing. Small GOPs keep seeks cheap; the
# clip is played from an in-memory Blob, so it does not need to be all-intra.
# Also writes one still per film beat, shown instead of the video under reduced
# motion and on the lite device tier.
# Usage: bash scripts/media/encode-film.sh [source.mp4]
set -euo pipefail
SRC="${1:-D:/Portafolio/Video Home/Video Renderizado/Video-Renderizado.mp4}"
OUT=public/video
IMG=public/images/film
mkdir -p "$OUT" "$IMG"
COMMON=(-an -c:v libx264 -preset slow -pix_fmt yuv420p -sc_threshold 0 -movflags +faststart)

ffmpeg -v error -y -i "$SRC" -vf "scale=1280:-2" "${COMMON[@]}" -crf 23 -g 8 -keyint_min 8 "$OUT/home-film.mp4"

# Portrait: a 9:16 window whose centre follows the subject shot by shot.
# 540 px wide at CRF 28: the clip sits under a dark veil (58 % at its lightest),
# where this was indistinguishable from 720 px at CRF 24 (SSIM 0.994 against
# 0.996, both measured against the source at phone resolution) at 4.5 MB instead
# of 10.2 MB. A phone cannot scrub the film until all of it has arrived, so the
# size is the wait: tests/unit/filmBudget.spec.ts holds it under 5 MB.
CENTRE=$(node scripts/media/portrait-crop.mjs)
PORTRAIT="crop=w=ih*9/16:h=ih:x='clip(($CENTRE)*iw-ih*9/32,0,iw-ih*9/16)':y=0"
ffmpeg -v error -y -i "$SRC" -vf "$PORTRAIT,scale=540:-2" \
  "${COMMON[@]}" -crf 28 -g 4 -keyint_min 4 "$OUT/home-film-m.mp4"

# Stills: id and the second it is taken at (about a third into each beat of
# src/components/film/filmMap.ts; the hero still is the first frame, so the
# poster and the video's first painted frame match).
STILLS="hero:0 tagline:4.4 problem:7.8 solution:10.6 benefit-1:13.1 benefit-2:14.7 benefit-3:16.4 benefit-4:19.3 process:22.1"
for entry in $STILLS; do
  id="${entry%%:*}"
  at="${entry##*:}"
  ffmpeg -v error -y -ss "$at" -i "$OUT/home-film.mp4" -frames:v 1 -c:v libwebp -quality 78 "$IMG/$id.webp"
  # Cut from the source at 720 px, not from the lighter clip: a still is shown with
  # no video over it. -ss comes after -i so the crop sees the real timestamps.
  ffmpeg -v error -y -i "$SRC" -ss "$at" -frames:v 1 -vf "$PORTRAIT,scale=720:-2" -c:v libwebp -quality 78 "$IMG/$id-m.webp"
done

ls -la "$OUT"/home-film*.mp4
du -ch "$IMG"/*.webp | tail -1
