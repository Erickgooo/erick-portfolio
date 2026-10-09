/** A stretch of the home film, in seconds, owned by one landing section. */
export interface FilmBeat {
  id: string;
  start: number;
  end: number;
}

/** A section's box relative to the top of the viewport. */
export interface SectionBox {
  id: string;
  top: number;
  height: number;
}

export const FILM_DURATION = 24.8;

/**
 * public/video/home-film.mp4 is an edit, not one take. Its cuts fall at 3.17,
 * 5.17, 7.03, 12.40, 15.50, 20.77 and 23.67 s; beats start and end on cuts so a
 * change of shot lands on a change of message.
 */
export const FILM_BEATS: FilmBeat[] = [
  { id: "hero", start: 0, end: 3.17 },
  { id: "tagline", start: 3.17, end: 7.03 },
];

/** Flare and white flash transitions in the edit; text over them needs a darker veil. */
const FILM_FLASHES: [number, number][] = [
  [1.9, 2.2],
  [6.5, 7.15],
  [12.3, 12.75],
  [15.35, 15.7],
];
const VEIL_BASE = 0.58;
const VEIL_FLASH = 0.82;

/**
 * Film time for the current scroll position. Sections are read top to bottom:
 * each one that has reached the top of the viewport takes over, and its own
 * progress (0 at its top edge, 1 at its bottom edge) walks its beat.
 */
export function filmTimeAt(beats: FilmBeat[], boxes: SectionBox[]): number {
  let time = beats[0]?.start ?? 0;
  for (const box of boxes) {
    const beat = beats.find((candidate) => candidate.id === box.id);
    if (!beat || box.height <= 0) continue;
    if (box.top > 0) break;
    const progress = Math.min(1, -box.top / box.height);
    time = beat.start + (beat.end - beat.start) * progress;
  }
  return time;
}

/** Opacity of the flat black veil over the film at a given time. */
export function veilAt(time: number): number {
  return FILM_FLASHES.some(([from, to]) => time >= from && time <= to) ? VEIL_FLASH : VEIL_BASE;
}
