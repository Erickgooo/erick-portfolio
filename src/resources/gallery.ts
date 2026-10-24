// The pieces of Visual Work, in order. A piece is an image under public/ or a
// YouTube Shorts link; consecutive pieces with the same group are one carousel.
export type GalleryPiece = {
  src: string;
  alt: string;
  orientation: "horizontal" | "vertical" | "square";
  group?: string;
};

export const galleryPieces: GalleryPiece[] = [
  {
    src: "https://youtube.com/shorts/BzDuYfJs3Oo",
    alt: "Quick Metal Shop video ad, short-form vertical creative",
    orientation: "vertical",
  },
  {
    src: "https://youtube.com/shorts/E-8o73YzYh4",
    alt: "Quick Metal Shop Father's Day reel, second cut",
    orientation: "vertical",
  },
  // QMS B2B carousel: "Cómo saber si un taller te va a cumplir o te va a atrasar"
  {
    src: "/images/gallery/carru1.webp",
    alt: "Quick Metal Shop B2B carousel for contractors and engineers, slide 1 of 6: how to tell whether a metal shop will deliver on time",
    orientation: "square",
    group: "carru",
  },
  {
    src: "/images/gallery/carru2.webp",
    alt: "Quick Metal Shop B2B carousel for contractors and engineers, slide 2 of 6",
    orientation: "square",
    group: "carru",
  },
  {
    src: "/images/gallery/carru3.webp",
    alt: "Quick Metal Shop B2B carousel for contractors and engineers, slide 3 of 6",
    orientation: "square",
    group: "carru",
  },
  {
    src: "/images/gallery/carru4.webp",
    alt: "Quick Metal Shop B2B carousel for contractors and engineers, slide 4 of 6",
    orientation: "square",
    group: "carru",
  },
  {
    src: "/images/gallery/carru5.webp",
    alt: "Quick Metal Shop B2B carousel for contractors and engineers, slide 5 of 6",
    orientation: "square",
    group: "carru",
  },
  {
    src: "/images/gallery/carru6.webp",
    alt: "Quick Metal Shop B2B carousel for contractors and engineers, slide 6 of 6",
    orientation: "square",
    group: "carru",
  },
  {
    src: "https://youtube.com/shorts/PoQ8VFQ801Q",
    alt: "Quick Metal Shop Father's Day collection teaser reel",
    orientation: "vertical",
  },
  {
    src: "https://youtube.com/shorts/GXaDhzxqOpo",
    alt: "Quick Metal Shop Father's Day reel",
    orientation: "vertical",
  },
  {
    src: "https://youtube.com/shorts/PgvIVcyL4jg",
    alt: "Quick Metal Shop Father's Day story creative",
    orientation: "vertical",
  },
  // QMS B2C carousel: "Lleva un pedacito de Puerto Rico en cada pared"
  {
    src: "/images/gallery/1.webp",
    alt: "Quick Metal Shop B2C carousel for Puerto Rico wall decor, slide 1 of 5: laser-cut steel Puerto Rico wall piece",
    orientation: "square",
    group: "generic",
  },
  {
    src: "/images/gallery/2.webp",
    alt: "Quick Metal Shop B2C carousel for Puerto Rico wall decor, slide 2 of 5",
    orientation: "square",
    group: "generic",
  },
  {
    src: "/images/gallery/3.webp",
    alt: "Quick Metal Shop B2C carousel for Puerto Rico wall decor, slide 3 of 5",
    orientation: "square",
    group: "generic",
  },
  {
    src: "/images/gallery/4.webp",
    alt: "Quick Metal Shop B2C carousel for Puerto Rico wall decor, slide 4 of 5",
    orientation: "square",
    group: "generic",
  },
  {
    src: "/images/gallery/5.webp",
    alt: "Quick Metal Shop B2C carousel for Puerto Rico wall decor, slide 5 of 5",
    orientation: "square",
    group: "generic",
  },
  {
    src: "/images/gallery/dakoma1.webp",
    alt: "Dakoma Roofing rebranding asset, slide 1 of 5",
    orientation: "square",
    group: "dakoma",
  },
  {
    src: "/images/gallery/dakoma2.webp",
    alt: "Dakoma Roofing rebranding asset, slide 2 of 5",
    orientation: "square",
    group: "dakoma",
  },
  {
    src: "/images/gallery/dakoma3.webp",
    alt: "Dakoma Roofing rebranding asset, slide 3 of 5",
    orientation: "square",
    group: "dakoma",
  },
  {
    src: "/images/gallery/dakoma4.webp",
    alt: "Dakoma Roofing rebranding asset, slide 4 of 5",
    orientation: "square",
    group: "dakoma",
  },
  {
    src: "/images/gallery/dakoma5.webp",
    alt: "Dakoma Roofing rebranding asset, slide 5 of 5",
    orientation: "square",
    group: "dakoma",
  },
  {
    src: "/images/gallery/qms1.webp",
    alt: "Quick Metal Shop brand social creative, slide 1 of 6",
    orientation: "square",
    group: "qms",
  },
  {
    src: "/images/gallery/qms2.webp",
    alt: "Quick Metal Shop brand social creative, slide 2 of 6",
    orientation: "square",
    group: "qms",
  },
  {
    src: "/images/gallery/qms3.webp",
    alt: "Quick Metal Shop brand social creative, slide 3 of 6",
    orientation: "square",
    group: "qms",
  },
  {
    src: "/images/gallery/qms4.webp",
    alt: "Quick Metal Shop brand social creative, slide 4 of 6",
    orientation: "square",
    group: "qms",
  },
  {
    src: "/images/gallery/qms5.webp",
    alt: "Quick Metal Shop brand social creative, slide 5 of 6",
    orientation: "square",
    group: "qms",
  },
  {
    src: "/images/gallery/qms6.webp",
    alt: "Quick Metal Shop brand social creative, slide 6 of 6",
    orientation: "square",
    group: "qms",
  },
  {
    src: "https://www.youtube.com/watch?v=qXv6XMOy1N4",
    alt: "Quick Metal Shop Puerto Rico collection video",
    orientation: "vertical",
  },
  {
    src: "https://www.youtube.com/watch?v=KSerIhwaknE",
    alt: "Quick Metal Shop custom metal signs video",
    orientation: "vertical",
  },
  {
    src: "https://www.youtube.com/watch?v=c_oQBTyLB0M",
    alt: "Quick Metal Shop Taíno-inspired laser-cut piece video",
    orientation: "vertical",
  },
  {
    src: "https://www.youtube.com/watch?v=J1EtEBNQ2mE",
    alt: "Quick Metal Shop decorative laser-cut pieces video",
    orientation: "vertical",
  },
  {
    src: "/images/gallery/Artesa - Wallpaper Diciembre.webp",
    alt: "Artesa Panadería December campaign wallpaper",
    orientation: "horizontal",
  },
  {
    src: "/images/gallery/Artesa - Panettone 2x1.webp",
    alt: "Artesa Panadería panettone 2-for-1 promotion creative",
    orientation: "vertical",
  },
  {
    src: "https://www.youtube.com/watch?v=5hcoQ5J9occ",
    alt: "Artesa Panadería store tour video",
    orientation: "vertical",
  },
  {
    src: "/images/gallery/Artesa - Muffin ChocoMix.webp",
    alt: "Artesa Panadería ChocoMix muffin product creative",
    orientation: "vertical",
  },
  {
    src: "/images/gallery/Artesa - Nuevos Sabores.webp",
    alt: "Artesa Panadería new flavors launch creative",
    orientation: "vertical",
  },
  {
    src: "https://www.youtube.com/watch?v=c8CcTBk6sV4",
    alt: "Aseneg December short-form video",
    orientation: "vertical",
  },
  {
    src: "https://www.youtube.com/watch?v=0EvVcg9uSk8",
    alt: "Aseneg burnout awareness short-form video",
    orientation: "vertical",
  },
  {
    src: "/images/gallery/Artesa - Magia de Diciembre.webp",
    alt: "Artesa Panadería December campaign creative",
    orientation: "vertical",
  },
  {
    src: "/images/gallery/Artesa - Nuevo Menu.webp",
    alt: "Artesa Panadería new menu launch creative",
    orientation: "vertical",
  },
  {
    src: "/images/gallery/Artesa - Dia de la Madre.webp",
    alt: "Artesa Panadería Mother's Day campaign creative",
    orientation: "vertical",
  },
  // QMS B2B carousel: "¿Cuántos días de obra perdiste este año?"
  {
    src: "/images/gallery/dias1.webp",
    alt: "Quick Metal Shop B2B carousel on project delays, slide 1 of 6: how many build days were lost waiting on late metal parts",
    orientation: "square",
    group: "dias",
  },
  {
    src: "/images/gallery/dias2.webp",
    alt: "Quick Metal Shop B2B carousel on project delays, slide 2 of 6",
    orientation: "square",
    group: "dias",
  },
  {
    src: "/images/gallery/dias3.webp",
    alt: "Quick Metal Shop B2B carousel on project delays, slide 3 of 6",
    orientation: "square",
    group: "dias",
  },
  {
    src: "/images/gallery/dias4.webp",
    alt: "Quick Metal Shop B2B carousel on project delays, slide 4 of 6",
    orientation: "square",
    group: "dias",
  },
  {
    src: "/images/gallery/dias5.webp",
    alt: "Quick Metal Shop B2B carousel on project delays, slide 5 of 6",
    orientation: "square",
    group: "dias",
  },
  {
    src: "/images/gallery/dias6.webp",
    alt: "Quick Metal Shop B2B carousel on project delays, slide 6 of 6",
    orientation: "square",
    group: "dias",
  },
  // QMS carousel: "De la idea al producto terminado"
  {
    src: "/images/gallery/idea1.webp",
    alt: "Quick Metal Shop carousel on the fabrication process, slide 1 of 4: concept sketch turned into a dimensioned laser-cut panel drawing",
    orientation: "square",
    group: "idea",
  },
  {
    src: "/images/gallery/idea2.webp",
    alt: "Quick Metal Shop carousel on the fabrication process, slide 2 of 4",
    orientation: "square",
    group: "idea",
  },
  {
    src: "/images/gallery/idea3.webp",
    alt: "Quick Metal Shop carousel on the fabrication process, slide 3 of 4",
    orientation: "square",
    group: "idea",
  },
  {
    src: "/images/gallery/idea4.webp",
    alt: "Quick Metal Shop carousel on the fabrication process, slide 4 of 4",
    orientation: "square",
    group: "idea",
  },
  // Piezas individuales
  {
    src: "/images/gallery/arqui.webp",
    alt: "Quick Metal Shop trade show announcement revealing the ArquiExpo 2026 stand design",
    orientation: "vertical",
  },
  {
    src: "/images/gallery/coqui.webp",
    alt: "Quick Metal Shop product ad for the laser-cut steel coquí wall piece, with specs, finishes and shipping detail",
    orientation: "square",
  },
  {
    src: "/images/gallery/diadelpadre.webp",
    alt: "Quick Metal Shop Father's Day product ad featuring laser-cut metal gifts",
    orientation: "square",
  },
  {
    src: "/images/gallery/libres.webp",
    alt: 'Quick Metal Shop Juneteenth post: a breaking steel chain over the line "Libres. Hoy y siempre."',
    orientation: "square",
  },
  {
    src: "/images/gallery/metal.webp",
    alt: "Quick Metal Shop B2B ad for facades, pergolas and decorative metal design in architectural projects",
    orientation: "square",
  },
  {
    src: "/images/gallery/pared.webp",
    alt: "Quick Metal Shop product ad for a four-panel laser-cut steel wall piece in a living room setting",
    orientation: "vertical",
  },
  {
    src: "/images/gallery/transform.webp",
    alt: "Quick Metal Shop English-language ad for customizable laser-cut steel wall art, shipping to Puerto Rico and the USA",
    orientation: "vertical",
  },
];
