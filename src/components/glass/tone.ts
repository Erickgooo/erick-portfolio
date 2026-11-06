// Liquid Glass: what passes under the pill. Sets data-lg-tone="dense" on it
// while media or a section that contrasts with the page lies underneath.
import chat from "../FaqChatbot.module.scss";

const MEDIA = new Set(["IMG", "VIDEO", "IFRAME", "PICTURE"]);

let probe: CanvasRenderingContext2D | null = null;
const colours = new Map<string, [number, number, number, number]>();

/** Any computed CSS colour as sRGB 0-255 and alpha 0-1, through a 1x1 canvas. */
function rgba(css: string): [number, number, number, number] {
  const known = colours.get(css);
  if (known) return known;
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  let out: [number, number, number, number] = [0, 0, 0, 0];
  if (probe) {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = css;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
    out = [r, g, b, a / 255];
  }
  colours.set(css, out);
  return out;
}

function luminance([r, g, b]: [number, number, number, number]) {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** "dense" when media, or a fill that stands apart from the page, lies at (x, y). */
function toneAt(x: number, y: number, page: number, skip: (el: Element) => boolean) {
  for (const el of document.elementsFromPoint(x, y)) {
    if (skip(el)) continue;
    if (MEDIA.has(el.tagName)) return "dense";
    const style = getComputedStyle(el);
    if (style.backgroundImage.includes("url(")) return "dense";
    const fill = rgba(style.backgroundColor);
    if (fill[3] >= 0.4) return Math.abs(luminance(fill) - page) > 0.12 ? "dense" : "base";
  }
  return "base";
}

export function readTone() {
  const pill = document.querySelector<HTMLElement>('[data-lg-glass="pill"]');
  if (!pill) return;
  const box = pill.getBoundingClientRect();
  if (box.width === 0) return;
  const header = pill.closest("header");
  const wrapper = document.querySelector(`.${chat.chatbotWrapper}`);
  const skip = (el: Element) => !!(header?.contains(el) || wrapper?.contains(el));
  const page = luminance(
    rgba(getComputedStyle(document.documentElement).getPropertyValue("--wb-page").trim()),
  );
  const y = box.top + box.height / 2;
  const dense = [0.2, 0.5, 0.8].some(
    (at) => toneAt(box.left + box.width * at, y, page, skip) === "dense",
  );
  const tone = dense ? "dense" : "base";
  if (pill.dataset.lgTone !== tone) pill.dataset.lgTone = tone;
}
