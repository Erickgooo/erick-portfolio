// The text of a PDF printed by Chromium (scripts/resume/build-resume.mjs),
// read without a PDF library: inflate the Flate streams, map each font's
// glyph codes to Unicode with its ToUnicode CMap, and decode the Tj and TJ
// strings of the page content in the font they are set in. Enough for
// Chromium's output (Type0 fonts, two-byte codes, hex strings); not a
// general PDF reader.
import { inflateSync } from "node:zlib";

type CMap = Map<number, string>;

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

export function pdfText(pdf: Buffer): string {
  const raw = pdf.toString("latin1");
  // Every object, with its dictionary and its stream (inflated when Flate).
  const objects = new Map<number, { dict: string; stream: string }>();
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
  const cmapOf = new Map<number, CMap>();
  const fontCMap = (fontObj: number): CMap => {
    const cached = cmapOf.get(fontObj);
    if (cached) return cached;
    const ref = objects.get(fontObj)?.dict.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
    const map = ref ? parseCMap(objects.get(Number(ref[1]))?.stream ?? "") : new Map();
    cmapOf.set(fontObj, map);
    return map;
  };

  const lines: string[] = [];
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
    ];
    for (const c of contents) {
      const content = objects.get(Number(c[1]))?.stream ?? "";
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
