import { expect, test } from "@playwright/test";
import {
  coverImage,
  linkableProject,
  parseMetric,
  publicProjects,
  recentProjects,
  sortProjects,
} from "@/utils/projects";

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

test("publicProjects drops anything under a protected route", () => {
  const posts = [{ slug: "open" }, { slug: "secret" }, { slug: "secret-notes" }];
  expect(publicProjects(posts, {}).map((post) => post.slug)).toEqual([
    "open",
    "secret",
    "secret-notes",
  ]);
  expect(publicProjects(posts, { "/work/secret": true }).map((post) => post.slug)).toEqual([
    "open",
    "secret-notes",
  ]);
  expect(publicProjects(posts, { "/work": true })).toEqual([]);
});

test("a protected case study gets no link", () => {
  const posts = [{ slug: "open" }, { slug: "secret" }];
  expect(linkableProject(posts, "open", { "/work/secret": true })).toEqual({ slug: "open" });
  expect(linkableProject(posts, "secret", { "/work/secret": true })).toBeNull();
  expect(linkableProject(posts, "secret", {})).toEqual({ slug: "secret" });
  // A slug with no project behind it would be a dead link.
  expect(linkableProject(posts, "gone", {})).toBeNull();
});

test("a project without a metric keeps its place in Work", () => {
  const post = (slug: string, publishedAt: string, metric?: string) => ({
    slug,
    metadata: { publishedAt, metric },
  });
  const posts = [
    post("oldest", "2026-01-01", "1|x"),
    post("newest", "2026-07-01", "2|x"),
    post("no-metric", "2026-06-01"),
    post("secret", "2026-06-15", "3|x"),
    post("middle", "2026-03-01", "4|x"),
  ];
  const slugs = (count: number) =>
    recentProjects(posts, count, { "/work/secret": true }).map((project) => project.slug);
  expect(slugs(6)).toEqual(["newest", "no-metric", "middle", "oldest"]);
  expect(slugs(2)).toEqual(["newest", "no-metric"]);
  // With every project behind the password the Home has nothing to list, and leaves Work out.
  expect(recentProjects(posts, 6, { "/work": true })).toEqual([]);
});
