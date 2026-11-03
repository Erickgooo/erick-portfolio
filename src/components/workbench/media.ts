// Workbench: media paths and their pixel sizes. Plain data, safe for client
// components. Sizes are read from the files' headers, so every frame keeps the
// piece's own proportions and reserves its box before the image arrives.
export const MEDIA = {
  whatsapp: { src: "/images/projects/project-01/whatsapp.webp", w: 1466, h: 986 },
  coqui: {
    src: "/images/gallery/coqui.webp",
    w: 2048,
    h: 2048,
    alt: "Quick Metal Shop product ad for the laser-cut steel coquí wall piece",
  },
  // The final state of the Samsung × LifeMiles case's scene (MilesClaim), as
  // published on the case, cropped to the scene (scripts/design/covers.mjs).
  milesClaim: {
    src: "/images/projects/incentiva/samsung-lifemiles-whatsapp-scene.webp",
    w: 1080,
    h: 1350,
    alt: "The Samsung × LifeMiles claim on WhatsApp at Incentiva Group: the invoice read by OCR, an IMEI rejected and a valid one accepted, the identity verified, and 2M+ LifeMiles miles awarded through the chatbot",
  },
  arqui: {
    src: "/images/gallery/arqui.webp",
    w: 1357,
    h: 2400,
    alt: "Quick Metal Shop trade show announcement revealing the ArquiExpo 2026 stand design",
  },
  avatar: { src: "/images/avatar.jpg", w: 800, h: 800 },
} as const;
