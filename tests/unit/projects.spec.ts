import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  clipPoster,
  coverImage,
  isClip,
  linkableProject,
  parseMetric,
  projectStills,
  remainingMedia,
  publicProjects,
  recentProjects,
  sortProjects,
} from "@/utils/projects";

test("coverImage skips videos and handles empty lists", () => {
  expect(coverImage(["/a.mp4", "/b.webp", "/c.webp"])).toBe("/b.webp");
  expect(coverImage(["/a.mp4"])).toBeNull();
  expect(coverImage([])).toBeNull();
});

test("projectStills keeps the pictures in order and leaves the clips out", () => {
  expect(projectStills(["/a.mp4", "/b.webp", "/c.MP4", "/d.webp"])).toEqual(["/b.webp", "/d.webp"]);
  expect(projectStills(["/a.webp", "/b.webp"])).toEqual(["/a.webp", "/b.webp"]);
  expect(projectStills(["/a.mp4"])).toEqual([]);
  expect(projectStills([])).toEqual([]);
});

test("remainingMedia is what the hero and the body have not shown, in order", () => {
  const images = ["/hero.mp4", "/a.webp", "/b.mp4", "/c.webp"];
  expect(remainingMedia(images, "")).toEqual(["/a.webp", "/b.mp4", "/c.webp"]);
  // A picture the body already embeds is not shown a second time.
  expect(remainingMedia(images, "text ![alt](/a.webp) more")).toEqual(["/b.mp4", "/c.webp"]);
  expect(remainingMedia(["/only.webp"], "")).toEqual([]);
  expect(remainingMedia([], "")).toEqual([]);
});

test("isClip tells a clip from a picture, and clipPoster names its still", () => {
  expect(isClip("/a/b.mp4")).toBe(true);
  expect(isClip("/a/b.WEBM")).toBe(true);
  expect(isClip("/a/b.webp")).toBe(false);
  expect(clipPoster("/images/projects/x/demo.mp4")).toBe("/images/projects/x/demo-poster.webp");
  expect(clipPoster("/a.b/demo.v2.mov")).toBe("/a.b/demo.v2-poster.webp");
});

test("every clip in a project's media has its poster in public", () => {
  // A clip loads nothing until it is played, so the poster is all there is to see.
  const dir = "src/app/work/projects";
  const clips = readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .flatMap((file) => {
      const source = readFileSync(path.join(dir, file), "utf8");
      return [...source.matchAll(/^\s+- "(\/images\/[^"]+)"/gm)].map((match) => match[1]);
    })
    .filter(isClip);
  expect(clips.length).toBeGreaterThan(0);
  expect(clips.filter((src) => !existsSync(path.join("public", clipPoster(src))))).toEqual([]);
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
