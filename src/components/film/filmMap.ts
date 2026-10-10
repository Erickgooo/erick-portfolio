/** A stretch of the home film, in seconds, owned by one landing section. */
export interface FilmBeat {
  id: string;
  start: number;
  end: number;
  /** Still shown for this beat when the film is not downloaded: `<still>.webp`. Defaults to the id. */
  still?: string;
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
 * 5.17, 7.03, 12.40, 15.50, 20.77 and 23.67 s. The film plays with nothing over
 * it: the hero walks the first shot, and every title card of the Home is
 * followed by one clean stretch. The stretches end where the shot changes: on
 * the cut itself, except `after-paid-media`, which ends at 15.55, 0.05 s past
 * the cut at 15.50. The film holds that frame while the next card is on screen
 * and moves on once it has left. Together the beats cover the whole film:
 * scrolling through the last stretch ends it. The stills keep the names of the
 * sections they were first cut for.
 */
export const FILM_BEATS: FilmBeat[] = [
  { id: "hero", start: 0, end: 3.17 },
  { id: "after-brand", start: 3.17, end: 7.03, still: "tagline" },
  { id: "after-content", start: 7.03, end: 12.4, still: "solution" },
  { id: "after-paid-media", start: 12.4, end: 15.55, still: "benefit-1" },
  { id: "after-crm", start: 15.55, end: 20.77, still: "benefit-3" },
  { id: "after-software", start: 20.77, end: FILM_DURATION, still: "process" },
];

/**
 * Flare and white flash transitions in the edit. They are the only moments the
 * film is dimmed: a white frame filling the whole screen is harsh.
 */
const FILM_FLASHES: [number, number][] = [
  [1.9, 2.2],
  [6.5, 7.15],
  [8.6, 9.4],
  [12.3, 12.75],
  [13.85, 14.2],
  [15.35, 15.7],
  [20.6, 21],
];
const VEIL_BASE = 0;
const VEIL_FLASH = 0.55;

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

/**
 * Id of the beat whose section currently owns the stage: the last mapped
 * section whose top edge has passed `line` (pixels from the top of the viewport).
 */
export function activeBeatId(beats: FilmBeat[], boxes: SectionBox[], line: number): string {
  let id = beats[0]?.id ?? "";
  for (const box of boxes) {
    if (!beats.some((beat) => beat.id === box.id)) continue;
    if (box.top > line) break;
    id = box.id;
  }
  return id;
}

/** Opacity of the flat black veil over the film at a given time: none, except during a flash. */
export function veilAt(time: number): number {
  return FILM_FLASHES.some(([from, to]) => time >= from && time <= to) ? VEIL_FLASH : VEIL_BASE;
}
