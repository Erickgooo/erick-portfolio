import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { MEDIA_SIZE } from "@/components/workbench/prose/media";
import {
  anchorId,
  bodyMediaPaths,
  outline,
  splitChapters,
} from "@/components/workbench/prose/source";
import { expect, test } from "@playwright/test";
import matter from "gray-matter";
import sharp from "sharp";

// The case-study and post pages lay every piece out from a size table instead
// of opening the files. These checks keep that table true to the files'
// headers, so a new or replaced piece cannot leave a frame with the wrong
// proportions.

function mdxFiles(dir: string) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => matter(readFileSync(path.join(dir, f), "utf8")));
}

/** Width and height of the video track, from the MP4 track header box (tkhd). */
function mp4Size(file: string) {
  const buf = readFileSync(file);
  for (let at = buf.indexOf("tkhd"); at >= 0; at = buf.indexOf("tkhd", at + 4)) {
    const version = buf[at + 4];
    const offset = at + 4 + (version === 1 ? 88 : 76);
    const w = buf.readUInt32BE(offset) / 65536;
    const h = buf.readUInt32BE(offset + 4) / 65536;
    if (w > 0 && h > 0) return { w, h };
  }
  return null;
}

const projects = mdxFiles("src/app/work/projects");
const posts = mdxFiles("src/app/blog/posts");

const referenced = new Set<string>([
  ...projects.flatMap((p) => (p.data.images ?? []) as string[]),
  ...projects.flatMap((p) => [...bodyMediaPaths(p.content)]),
  ...posts.flatMap((p) => (p.data.image ? [p.data.image as string] : [])),
  ...posts.flatMap((p) => [...bodyMediaPaths(p.content)]),
]);

test("every case and post media path has a size in the Workbench table", () => {
  const missing = [...referenced].filter((src) => !MEDIA_SIZE[src]);
  expect(missing).toEqual([]);
});

test("the Workbench size table matches the files' headers", async () => {
  const wrong: string[] = [];
  for (const [src, size] of Object.entries(MEDIA_SIZE)) {
    const file = path.join("public", src);
    const actual = /\.mp4$/i.test(src)
      ? mp4Size(file)
      : await sharp(file)
          .metadata()
          .then((m) => ({ w: m.width ?? 0, h: m.height ?? 0 }));
    // The MP4 header stores the display size in 16.16 fixed point, which can
    // sit a fraction of a pixel off the coded size: allow one pixel.
    if (!actual || Math.abs(actual.w - size.w) >= 1 || Math.abs(actual.h - size.h) >= 1) {
      wrong.push(`${src}: table ${size.w}x${size.h}, file ${actual?.w}x${actual?.h}`);
    }
  }
  expect(wrong).toEqual([]);
});

test("chapters keep the text before the first heading and skip headings in code", () => {
  const { preamble, chapters } = splitChapters(
    "*Kicker*\n\n## One & Two\n\nText\n\n```\n## not a heading\n```\n\n## Three",
  );
  expect(preamble).toBe("*Kicker*");
  expect(chapters.map((c) => c.id)).toEqual(["one-and-two", "three"]);
  expect(chapters[0].body).toContain("## not a heading");
});

test("heading ids keep the previous site's anchors", () => {
  expect(anchorId("The Build")).toBe("the-build");
  expect(anchorId("Results & Impact")).toBe("results-and-impact");
  expect(outline("## **Bold** heading\n### Sub")).toEqual([
    { id: "bold-heading", text: "Bold heading", level: 2 },
    { id: "sub", text: "Sub", level: 3 },
  ]);
});
