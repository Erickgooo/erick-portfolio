import { expect, test } from "@playwright/test";
import { coverImage, parseMetric, sortProjects } from "@/utils/projects";

test("coverImage skips videos and handles empty lists", () => {
  expect(coverImage(["/a.mp4", "/b.webp", "/c.webp"])).toBe("/b.webp");
  expect(coverImage(["/a.mp4"])).toBeNull();
  expect(coverImage([])).toBeNull();
});

test("parseMetric splits value|label and rejects partial input", () => {
  expect(parseMetric("85%|conversations automated")).toEqual({
    value: "85%",
    label: "conversations automated",
  });
  expect(parseMetric("85%")).toBeNull();
  expect(parseMetric("")).toBeNull();
  expect(parseMetric(undefined)).toBeNull();
});

test("sortProjects orders newest first without mutating the input", () => {
  const input = [
    { metadata: { publishedAt: "2026-01-01" }, slug: "a" },
    { metadata: { publishedAt: "2026-05-01" }, slug: "b" },
  ];
  expect(sortProjects(input).map((p) => p.slug)).toEqual(["b", "a"]);
  expect(input[0].slug).toBe("a");
});
