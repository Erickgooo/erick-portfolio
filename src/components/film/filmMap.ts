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
 * 5.17, 7.03, 12.40, 15.50, 20.77 and 23.67 s, with flare transitions near 9.0
 * and 14.0 s; beats start and end on those so a change of shot lands on a change
 * of message. Together the beats cover the whole film: scrolling through the
 * last section ends it.
 */
export const FILM_BEATS: FilmBeat[] = [
  { id: "hero", start: 0, end: 3.17 },
  { id: "tagline", start: 3.17, end: 7.03 },
  { id: "problem", start: 7.03, end: 9.5 },
  { id: "solution", start: 9.5, end: 12.4 },
  { id: "benefit-1", start: 12.4, end: 14 },
  { id: "benefit-2", start: 14, end: 15.55 },
  { id: "benefit-3", start: 15.55, end: 18.6 },
  { id: "benefit-4", start: 18.6, end: 20.77 },
  { id: "process", start: 20.77, end: FILM_DURATION },
];

/** Flare and white flash transitions in the edit; text over them needs a darker veil. */
const FILM_FLASHES: [number, number][] = [
  [1.9, 2.2],
  [6.5, 7.15],
  [8.6, 9.4],
  [12.3, 12.75],
  [13.85, 14.2],
  [15.35, 15.7],
  [20.6, 21],
];
const VEIL_BASE = 0.58;
const VEIL_FLASH = 0.82;

/**
 * Film time for the current scroll position. Sections are read top to bottom:
 * each one that has reached the top of the viewport takes over, and its own
 * progress (0 at its top edge, 1 at its bottom edge) walks its beat.
 *
 * The last section is the exception: the stage stops being pinned as soon as
 * that section's bottom edge meets the stage's bottom edge, so its beat has to
 * end there (`stage` is the stage height) or the film's ending would only play
 * while the film is already scrolling out of view.
 */
export function filmTimeAt(beats: FilmBeat[], boxes: SectionBox[], stage = 0): number {
  const mapped = boxes.filter((box) => box.height > 0 && beats.some((beat) => beat.id === box.id));
  let time = beats[0]?.start ?? 0;
  for (const [index, box] of mapped.entries()) {
    const beat = beats.find((candidate) => candidate.id === box.id);
    if (!beat) continue;
    if (box.top > 0) break;
    const isLast = index === mapped.length - 1;
    const travel = isLast ? Math.max(1, box.height - stage) : box.height;
    const progress = Math.min(1, -box.top / travel);
    time = beat.start + (beat.end - beat.start) * progress;
  }
  return time;
}

/** Opacity of the flat black veil over the film at a given time. */
export function veilAt(time: number): number {
  return FILM_FLASHES.some(([from, to]) => time >= from && time <= to) ? VEIL_FLASH : VEIL_BASE;
}
