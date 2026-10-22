// Workbench prose: pixel sizes of the case-study and post media, read from the
// files' headers (sharp for images, ffprobe for videos), never by looking at
// them. Each frame keeps the piece's own proportions and reserves its box
// before the file arrives. Plain data, safe for client components.
// tests/unit/workbench-media.spec.ts checks this table against the files.

export type Size = { w: number; h: number };

export const MEDIA_SIZE: Record<string, Size> = {
  "/images/og/home.jpg": { w: 1200, h: 750 },
  "/images/blog/PC.jpg": { w: 1200, h: 1600 },
  "/images/projects/app-quick-metal-shop/qmsapp.webp": { w: 2400, h: 1357 },
  "/images/projects/app-quick-metal-shop/qmsapp2.webp": { w: 2400, h: 1357 },
  "/images/projects/app-quick-metal-shop/qmsapp3.webp": { w: 2400, h: 1340 },
  "/images/projects/cuatrimotos-project/portada-chatbot.webp": { w: 2400, h: 1357 },
  "/images/projects/cuatrimotos-project/chatbot.webp": { w: 1859, h: 897 },
  "/images/projects/cuatrimotos-project/chatbot-video.mp4": { w: 854, h: 480 },
  "/images/projects/dakoma-roofing-project/dakomaproject.webp": { w: 2400, h: 1357 },
  "/images/projects/dakoma-roofing-project/dakomaproject2.webp": { w: 2400, h: 1357 },
  "/images/projects/project-01/whatsapp.webp": { w: 1466, h: 986 },
  "/images/projects/project-01/chatbot-artesa.mp4": { w: 640, h: 360 },
  "/images/projects/project-01/leadbot.mp4": { w: 1402, h: 720 },
  "/images/projects/qms-arquiexpo/1.webp": { w: 1080, h: 1080 },
  "/images/projects/qms-arquiexpo/2.webp": { w: 2400, h: 2400 },
  "/images/projects/qms-arquiexpo/arqui1.webp": { w: 2400, h: 1357 },
  "/images/projects/qms-arquiexpo/arqui2.webp": { w: 2400, h: 1357 },
  "/images/projects/qms-arquiexpo/arqui3.webp": { w: 2400, h: 1357 },
  "/images/projects/qms-dakoma-ai-creative/creatives1.webp": { w: 2400, h: 1357 },
  "/images/projects/qms-dakoma-ai-creative/creatives2.webp": { w: 2400, h: 1357 },
  "/images/projects/qms-dakoma-ai-creative/creatives3.webp": { w: 2400, h: 1357 },
  "/images/projects/quick-metal-shop-project/qms1.webp": { w: 2400, h: 1357 },
  "/images/projects/quick-metal-shop-project/qms2.webp": { w: 2400, h: 1357 },
  "/images/projects/quick-metal-shop-project/qms3.webp": { w: 2400, h: 1357 },
  "/images/projects/quick-metal-shop-viral-videos/social-media1.webp": { w: 2400, h: 1357 },
  "/images/projects/quick-metal-shop-viral-videos/social-media2.webp": { w: 2400, h: 1357 },
  "/images/projects/quick-metal-shop-viral-videos/social-media3.webp": { w: 2400, h: 1357 },
};

/** A wide print, for a file missing from the table: it still shows at its own ratio once loaded. */
const FALLBACK: Size = { w: 1600, h: 900 };

export function mediaSize(src: string): Size {
  return MEDIA_SIZE[src] ?? FALLBACK;
}

export function isVideo(src: string): boolean {
  return /\.(mp4|webm|mov)$/i.test(src);
}

export function isImage(src: string): boolean {
  return /\.(webp|jpe?g|png|avif|gif)$/i.test(src);
}

/** A small, stable tilt for a print, so the same piece always lies the same way. */
export function tiltFor(key: string, range = 1.6): number {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  const unit = ((Math.abs(hash) % 1000) / 1000) * 2 - 1;
  const tilt = unit * range;
  // Never lie perfectly straight: at least half a degree either way.
  return Math.round(Math.sign(tilt || 1) * Math.max(Math.abs(tilt), 0.5) * 10) / 10;
}
