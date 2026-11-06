// Liquid Glass: the lens of each surface and its displacement map. Chromium
// draws SVG filters in backdrop-filter; the filters themselves are rendered by
// GlassController.

export type Lens = {
  id: string;
  w: number;
  h: number;
  r: number;
  bezel: number;
  scale: number;
  /** The map's blob: URL, once drawn. */
  href?: string;
};

/**
 * A displacement map for a rounded box, drawn pixel by pixel (an SVG image
 * in feImage lost its inner shapes in Chromium): red moves the backdrop
 * sideways and green up and down, 128 leaves it in place. Within `bezel` of
 * the edge each pixel pulls the backdrop from further inside, along the
 * edge's normal and harder toward the edge, so the rim bends what lies
 * under it like the edge of a lens; the middle stays still. Only the band
 * along the edge is computed, and the PNG is encoded off the main thread.
 */
const maps = new Map<string, Promise<string>>();

export function lensMap(lens: Lens) {
  const key = `${lens.w}x${lens.h}r${lens.r}b${lens.bezel}`;
  let map = maps.get(key);
  if (!map) {
    map = drawLensMap(lens);
    maps.set(key, map);
  }
  return map;
}

function drawLensMap({ w, h, r, bezel }: Lens): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve("");
  const img = ctx.createImageData(w, h);
  // Every pixel still (128, 128, 128, opaque) to start with.
  new Uint32Array(img.data.buffer).fill(0xff808080);
  const hw = w / 2;
  const hh = h / 2;
  const rr = Math.min(r, hw, hh);
  const band = Math.max(bezel, rr);
  for (let y = 0; y < h; y++) {
    const capRow = y < band || y >= h - band;
    for (let x = 0; x < w; x++) {
      // Along the straight sides only the outer `bezel` pixels bend.
      if (!capRow && x >= bezel && x < w - bezel) {
        x = w - bezel - 1;
        continue;
      }
      const px = x + 0.5 - hw;
      const py = y + 0.5 - hh;
      const qx = Math.abs(px) - (hw - rr);
      const qy = Math.abs(py) - (hh - rr);
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const out = Math.hypot(ox, oy);
      // Distance from the edge, inward (the rounded box's signed distance).
      const depth = rr - out - Math.min(Math.max(qx, qy), 0);
      if (depth >= bezel || depth < -1) continue;
      const t = Math.min(1, 1 - depth / bezel);
      const m = t * t;
      let nx = 0;
      let ny = 0;
      if (out > 0) {
        nx = ox / out;
        ny = oy / out;
      } else if (qx > qy) nx = 1;
      else ny = 1;
      const i = (y * w + x) * 4;
      img.data[i] = Math.round(128 - 127 * Math.sign(px) * nx * m);
      img.data[i + 1] = Math.round(128 - 127 * Math.sign(py) * ny * m);
    }
  }
  ctx.putImageData(img, 0, 0);
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : ""), "image/png"),
  );
}

/** The lens of each surface: a bezel deep enough for the refraction to show. */
export function lensFor(id: string, el: HTMLElement): Lens {
  const w = Math.round(el.offsetWidth);
  const h = Math.round(el.offsetHeight);
  const radius = getComputedStyle(el).borderTopLeftRadius;
  const r = Math.min(
    radius.endsWith("%")
      ? (Number.parseFloat(radius) / 100) * Math.min(w, h)
      : Number.parseFloat(radius) || 0,
    Math.min(w, h) / 2,
  );
  const panel = id === "lg-panel" || id === "lg-bubble";
  const bezel = panel ? 16 : Math.min(14, Math.round(h * 0.34));
  return { id, w, h, r, bezel, scale: panel ? 24 : 28 };
}
