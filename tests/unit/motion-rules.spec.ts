import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

// The motion language of the site (docs/design/rediseno-2026/pulido-animaciones.md),
// checked on every stylesheet so it cannot drift back unnoticed:
// - no curve overshoots its start or end (no bounce, no elastic settle);
// - only transform properties and opacity are transitioned or animated
//   (stroke-dashoffset for drawn lines, visibility to hide a faded layer);
// - nothing transitions `all`.

const ROOT = path.join(__dirname, "..", "..", "src");
const ALLOWED = new Set([
  "opacity",
  "transform",
  "translate",
  "scale",
  "rotate",
  "visibility",
  "stroke-dashoffset",
  "none",
]);

function styles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...styles(full));
    else if (/\.(s?css)$/.test(name)) out.push(full);
  }
  return out;
}

/** The file without comments, and without the contents of every (...) group. */
function read(file: string) {
  const text = readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
  return text;
}

function flatten(text: string) {
  let out = text;
  let prev = "";
  while (out !== prev) {
    prev = out;
    out = out.replace(/\([^()]*\)/g, "");
  }
  return out;
}

const FILES = styles(ROOT);
const rel = (file: string) => path.relative(ROOT, file).replace(/\\/g, "/");

test("the stylesheets are found", () => {
  expect(FILES.length).toBeGreaterThan(40);
});

test("no curve overshoots: every cubic-bezier keeps its y values within 0 and 1", () => {
  const bad: string[] = [];
  for (const file of FILES) {
    for (const m of read(file).matchAll(/cubic-bezier\(([^)]*)\)/g)) {
      const [, y1, , y2] = m[1].split(",").map((v) => Number(v.trim()));
      if (!(y1 >= 0 && y1 <= 1 && y2 >= 0 && y2 <= 1)) bad.push(`${rel(file)}: ${m[0]}`);
    }
    if (/ease-settle/.test(read(file))) bad.push(`${rel(file)}: ease-settle`);
  }
  expect(bad).toEqual([]);
});

test("transitions move only transform properties and opacity, never `all`", () => {
  const bad: string[] = [];
  for (const file of FILES) {
    const text = flatten(read(file));
    for (const m of text.matchAll(/(?:^|[;{\s])transition(-property)?\s*:\s*([^;{}]+)/g)) {
      const list = m[2].split(",").map((part) => part.trim().split(/\s+/)[0]);
      for (const prop of list) {
        // A value that starts with a duration or a Sass variable names no property.
        if (!prop || /^[\d.$]/.test(prop) || prop.startsWith("var")) continue;
        if (!ALLOWED.has(prop)) bad.push(`${rel(file)}: transition ${prop}`);
      }
    }
  }
  expect(bad).toEqual([]);
});

test("keyframes animate only transform properties and opacity", () => {
  const bad: string[] = [];
  for (const file of FILES) {
    const text = read(file);
    for (const start of text.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
      let depth = 1;
      let i = (start.index ?? 0) + start[0].length;
      const from = i;
      while (depth > 0 && i < text.length) {
        if (text[i] === "{") depth += 1;
        else if (text[i] === "}") depth -= 1;
        i += 1;
      }
      const body = text.slice(from, i - 1);
      for (const decl of body.matchAll(/([a-z-]+)\s*:/g)) {
        if (!ALLOWED.has(decl[1]) && decl[1] !== "offset") {
          bad.push(`${rel(file)}: @keyframes ${start[1]} animates ${decl[1]}`);
        }
      }
    }
  }
  expect(bad).toEqual([]);
});
