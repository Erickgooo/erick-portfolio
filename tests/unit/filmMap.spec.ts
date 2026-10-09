import { expect, test } from "@playwright/test";
import { type FilmBeat, filmTimeAt, veilAt } from "../../src/components/film/filmMap";

const beats: FilmBeat[] = [
  { id: "hero", start: 0, end: 3.17 },
  { id: "tagline", start: 3.17, end: 7.03 },
];

test("before the first section reaches the top the film sits on its first frame", () => {
  const boxes = [
    { id: "hero", top: 40, height: 1600 },
    { id: "tagline", top: 1640, height: 2000 },
  ];
  expect(filmTimeAt(beats, boxes)).toBe(0);
});

test("progress through a section walks that section's shots", () => {
  const boxes = [
    { id: "hero", top: -800, height: 1600 },
    { id: "tagline", top: 800, height: 2000 },
  ];
  expect(filmTimeAt(beats, boxes)).toBeCloseTo(1.585, 3);
});

test("a section that has fully passed hands over to the next one", () => {
  const boxes = [
    { id: "hero", top: -2100, height: 1600 },
    { id: "tagline", top: -500, height: 2000 },
  ];
  expect(filmTimeAt(beats, boxes)).toBeCloseTo(3.17 + 0.25 * 3.86, 3);
});

test("past the last section the film holds its last mapped frame", () => {
  const boxes = [
    { id: "hero", top: -9000, height: 1600 },
    { id: "tagline", top: -7400, height: 2000 },
  ];
  expect(filmTimeAt(beats, boxes)).toBeCloseTo(7.03, 3);
});

test("sections without a beat or without height are ignored", () => {
  const boxes = [
    { id: "unknown", top: -50, height: 100 },
    { id: "hero", top: -800, height: 0 },
  ];
  expect(filmTimeAt(beats, boxes)).toBe(0);
});

test("the veil darkens during the white flashes", () => {
  expect(veilAt(1)).toBe(0.58);
  expect(veilAt(2)).toBe(0.82);
  expect(veilAt(7)).toBe(0.82);
  expect(veilAt(12.5)).toBe(0.82);
  expect(veilAt(15.5)).toBe(0.82);
  expect(veilAt(16)).toBe(0.58);
});
