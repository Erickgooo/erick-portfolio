// The text of a PDF printed by Chromium (scripts/resume/build-resume.mjs),
// read without a PDF library: inflate the Flate streams, map each font's
// glyph codes to Unicode with its ToUnicode CMap, and decode the Tj and TJ
// strings of the page content in the font they are set in. Enough for
// Chromium's output (Type0 fonts, two-byte codes, hex strings); not a
// general PDF reader. pdfLineBoxes also places each line on its page (in
// points, from the page's left edge), from the content's matrices, the Td
// moves and the glyph widths of each font's /W array.
import { inflateSync } from "node:zlib";

type CMap = Map<number, string>;
type Objects = Map<number, { dict: string; stream: string }>;

function hexToString(hex: string): string {
  let out = "";
  for (let i = 0; i + 4 <= hex.length; i += 4)
    out += String.fromCodePoint(Number.parseInt(hex.slice(i, i + 4), 16));
  return out;
}

function parseCMap(text: string): CMap {
  const map: CMap = new Map();
  for (const block of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const m of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) {
      map.set(Number.parseInt(m[1], 16), hexToString(m[2]));
    }
  }
  for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const m of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) {
      const from = Number.parseInt(m[1], 16);
      const to = Number.parseInt(m[2], 16);
      const start = Number.parseInt(m[3], 16);
      for (let c = from; c <= to; c++) map.set(c, String.fromCodePoint(start + (c - from)));
    }
  }
  return map;
}

/** Every object, with its dictionary and its stream (inflated when Flate). */
function readObjects(pdf: Buffer): Objects {
  const raw = pdf.toString("latin1");
  const objects: Objects = new Map();
  for (const m of raw.matchAll(/(\d+) 0 obj([\s\S]*?)endobj/g)) {
    const body = m[2];
    const at = body.indexOf("stream");
    const dict = at >= 0 ? body.slice(0, at) : body;
    let stream = "";
    if (at >= 0) {
      const start = at + "stream".length + (body[at + 6] === "\r" ? 2 : 1);
      const end = body.lastIndexOf("endstream");
      const bytes = Buffer.from(body.slice(start, end), "latin1");
      try {
        stream = /FlateDecode/.test(dict)
          ? inflateSync(bytes).toString("latin1")
          : bytes.toString("latin1");
      } catch {
        stream = "";
      }
    }
    objects.set(Number(m[1]), { dict, stream });
  }
  return objects;
}

/** The pages in object order, each with its font names and content streams. */
function readPages(objects: Objects) {
  const pages: { dict: string; fonts: Map<string, number>; contents: string[] }[] = [];
  for (const { dict } of objects.values()) {
    if (!/\/Type\s*\/Page\b/.test(dict)) continue;
    // The page's fonts: /Font << /F4 12 0 R ... >>, inline or by reference.
    let fontDict = dict.match(/\/Font\s*<<([\s\S]*?)>>/)?.[1] ?? "";
    if (!fontDict) {
      const res = dict.match(/\/Resources\s+(\d+)\s+0\s+R/);
      const resDict = res ? (objects.get(Number(res[1]))?.dict ?? "") : "";
      fontDict = resDict.match(/\/Font\s*<<([\s\S]*?)>>/)?.[1] ?? "";
      const fontRef = resDict.match(/\/Font\s+(\d+)\s+0\s+R/);
      if (!fontDict && fontRef) fontDict = objects.get(Number(fontRef[1]))?.dict ?? "";
    }
    const fonts = new Map<string, number>();
    for (const f of fontDict.matchAll(/\/([\w.+-]+)\s+(\d+)\s+0\s+R/g))
      fonts.set(f[1], Number(f[2]));
    const contents = [
      ...(dict.match(/\/Contents\s*(\[[^\]]*\]|\d+\s+0\s+R)/)?.[1] ?? "").matchAll(
        /(\d+)\s+0\s+R/g,
      ),
    ].map((c) => objects.get(Number(c[1]))?.stream ?? "");
    pages.push({ dict, fonts, contents });
  }
  return pages;
}

function cmapReader(objects: Objects) {
  const cmapOf = new Map<number, CMap>();
  return (fontObj: number): CMap => {
    const cached = cmapOf.get(fontObj);
    if (cached) return cached;
    const ref = objects.get(fontObj)?.dict.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
    const map = ref ? parseCMap(objects.get(Number(ref[1]))?.stream ?? "") : new Map();
    cmapOf.set(fontObj, map);
    return map;
  };
}

export function pdfText(pdf: Buffer): string {
  const objects = readObjects(pdf);
  const fontCMap = cmapReader(objects);
  const lines: string[] = [];
  for (const { fonts, contents } of readPages(objects)) {
    for (const content of contents) {
      let map: CMap = new Map();
      let line = "";
      // Chromium positions runs with Td and Tm inside one text object, so a
      // line ends at ET (end of text object) or T*.
      for (const op of content.matchAll(
        /\/([\w.+-]+)\s+[\d.]+\s+Tf|(\[[^\]]*\])\s*TJ|<([0-9a-fA-F]*)>\s*Tj|\b(T\*|ET)\b/g,
      )) {
        if (op[1]) {
          map = fontCMap(fonts.get(op[1]) ?? -1);
        } else if (op[2] || op[3] !== undefined) {
          const hexes = op[2] ? [...op[2].matchAll(/<([0-9a-fA-F]*)>/g)].map((h) => h[1]) : [op[3]];
          for (const hex of hexes) {
            for (let i = 0; i + 4 <= hex.length; i += 4)
              line += map.get(Number.parseInt(hex.slice(i, i + 4), 16)) ?? "";
          }
        } else if (op[4]) {
          if (line) lines.push(line);
          line = "";
        }
      }
      if (line) lines.push(line);
    }
  }
  return lines.join("\n");
}

/**
 * A CIDFont's glyph widths, in 1/1000 em: its /W array ("c [w1 w2 ...]" and
 * "c1 c2 w" entries) and, under the key -1, its /DW for every other glyph
 * (1000 when it has none).
 */
function parseWidths(dict: string): Map<number, number> {
  const widths = new Map<number, number>();
  widths.set(-1, Number(dict.match(/\/DW\s+([\d.]+)/)?.[1] ?? 1000));
  const at = dict.search(/\/W\s*\[/);
  if (at < 0) return widths;
  let i = dict.indexOf("[", at) + 1;
  let depth = 1;
  let body = "";
  for (; i < dict.length && depth > 0; i++) {
    if (dict[i] === "[") depth++;
    if (dict[i] === "]") depth--;
    if (depth > 0) body += dict[i];
  }
  const tokens = body.match(/\[|\]|-?[\d.]+/g) ?? [];
  for (let k = 0; k < tokens.length; ) {
    const first = Number(tokens[k]);
    if (tokens[k + 1] === "[") {
      k += 2;
      let c = first;
      while (k < tokens.length && tokens[k] !== "]") widths.set(c++, Number(tokens[k++]));
      k++;
    } else {
      const last = Number(tokens[k + 1]);
      const w = Number(tokens[k + 2]);
      for (let c = first; c <= last; c++) widths.set(c, w);
      k += 3;
    }
  }
  return widths;
}

export type LineBox = { page: number; text: string; x0: number; x1: number; pageWidth: number };

/**
 * Each text object of each page (Chromium sets one line per BT ... ET), with
 * its decoded text and its horizontal extent in points from the page's left
 * edge. Assumes no rotation or skew, which is how Chromium prints.
 */
export function pdfLineBoxes(pdf: Buffer): LineBox[] {
  const objects = readObjects(pdf);
  const fontCMap = cmapReader(objects);
  const widthsOf = new Map<number, Map<number, number>>();
  const fontWidths = (fontObj: number) => {
    const cached = widthsOf.get(fontObj);
    if (cached) return cached;
    const desc = objects.get(fontObj)?.dict.match(/\/DescendantFonts\s*\[\s*(\d+)\s+0\s+R/);
    const map = parseWidths(desc ? (objects.get(Number(desc[1]))?.dict ?? "") : "");
    widthsOf.set(fontObj, map);
    return map;
  };
  const boxes: LineBox[] = [];
  readPages(objects).forEach(({ dict, fonts, contents }, page) => {
    const media = dict.match(/\/MediaBox\s*\[\s*([-\d.]+)\s+[-\d.]+\s+([-\d.]+)/);
    const pageWidth = media ? Number(media[2]) - Number(media[1]) : 612;
    for (const content of contents) {
      // The x part of the current transformation: x' = a x + e.
      let ctm = { a: 1, e: 0 };
      const stack: { a: number; e: number }[] = [];
      let map: CMap = new Map();
      let widths = new Map<number, number>();
      let size = 0;
      let lineX = 0;
      let current: { text: string; x0: number; x1: number } | null = null;
      for (const op of content.matchAll(
        /([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+(cm|Tm)\b|([-\d.]+)\s+([-\d.]+)\s+Td\b|\/([\w.+-]+)\s+([\d.]+)\s+Tf\b|<([0-9a-fA-F]*)>\s*Tj|\b(q|Q|BT|ET)\b/g,
      )) {
        if (op[7] === "cm") {
          const [a, , , , e] = op.slice(1, 6).map(Number);
          ctm = { a: a * ctm.a, e: e * ctm.a + ctm.e };
        } else if (op[7] === "Tm") {
          lineX = Number(op[5]);
        } else if (op[8] !== undefined) {
          lineX += Number(op[8]);
        } else if (op[10]) {
          const obj = fonts.get(op[10]) ?? -1;
          map = fontCMap(obj);
          widths = fontWidths(obj);
          size = Number(op[11]);
        } else if (op[12] !== undefined) {
          const hex = op[12];
          let x = lineX;
          for (let i = 0; i + 4 <= hex.length; i += 4) {
            const code = Number.parseInt(hex.slice(i, i + 4), 16);
            const w = ((widths.get(code) ?? widths.get(-1) ?? 1000) * size) / 1000;
            const x0 = ctm.a * x + ctm.e;
            const x1 = ctm.a * (x + w) + ctm.e;
            if (!current) current = { text: "", x0, x1 };
            current.text += map.get(code) ?? "";
            current.x0 = Math.min(current.x0, x0);
            current.x1 = Math.max(current.x1, x1);
            x += w;
          }
        } else if (op[13] === "q") {
          stack.push(ctm);
        } else if (op[13] === "Q") {
          ctm = stack.pop() ?? { a: 1, e: 0 };
        } else if (op[13] === "BT") {
          current = null;
          lineX = 0;
        } else if (op[13] === "ET" && current) {
          boxes.push({ page, pageWidth, ...current });
          current = null;
        }
      }
    }
  });
  return boxes;
}
