// Workbench prose: plain helpers over the MDX source of case studies and
// posts. No React here, so pages and client islands can share them.
import { slugify } from "transliteration";

/**
 * The id of a heading, from its text. Same rule as the previous site's MDX
 * headings (src/components/mdx.tsx), so links to #the-build keep working.
 */
export function anchorId(text: string): string {
  return slugify(text.replace(/&/g, " and "), { lowercase: true, separator: "-" }).replace(
    /--+/g,
    "-",
  );
}

/** The visible text of a Markdown heading line: no emphasis marks, links or code ticks. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();
}

/** Lines of the source with whether each one sits inside a fenced code block. */
function scan(content: string) {
  let fenced = false;
  return content.split(/\r?\n/).map((line) => {
    const isFence = /^\s*(```|~~~)/.test(line);
    const inside = fenced || isFence;
    if (isFence) fenced = !fenced;
    return { line, code: inside };
  });
}

export type Chapter = { heading: string; id: string; body: string };

/**
 * Splits the MDX at its second-level headings, so a page can lay media beside
 * each part. Whatever comes before the first heading is kept as the preamble.
 * Headings inside fenced code are not split points.
 */
export function splitChapters(content: string): { preamble: string; chapters: Chapter[] } {
  const parts: { heading: string | null; lines: string[] }[] = [{ heading: null, lines: [] }];
  for (const { line, code } of scan(content)) {
    const match = !code && /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (match) parts.push({ heading: plainText(match[1]), lines: [line] });
    else parts[parts.length - 1].lines.push(line);
  }
  const [first, ...rest] = parts;
  return {
    preamble: first.lines.join("\n").trim(),
    chapters: rest.map((part) => ({
      heading: part.heading ?? "",
      id: anchorId(part.heading ?? ""),
      body: part.lines.join("\n").trim(),
    })),
  };
}

export type OutlineItem = { id: string; text: string; level: 2 | 3 };

/** The second- and third-level headings, for an "On this page" index. */
export function outline(content: string): OutlineItem[] {
  const items: OutlineItem[] = [];
  for (const { line, code } of scan(content)) {
    const match = !code && /^(##|###)\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = plainText(match[2]);
    items.push({ id: anchorId(text), text, level: match[1].length as 2 | 3 });
  }
  return items;
}

/** Every /images path the MDX body itself shows. */
export function bodyMediaPaths(content: string): Set<string> {
  return new Set(Array.from(content.matchAll(/["'(](\/images\/[^"')]+)["')]/g), (m) => m[1]));
}
