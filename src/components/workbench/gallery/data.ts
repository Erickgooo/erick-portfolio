import { galleryPieces, protectedRoutes } from "@/resources";
// Workbench, Visual Work: the gallery's pieces, sorted onto the bench by client
// and by format. The only source is `galleryPieces` in src/resources/content.tsx
// (the list GalleryView read), unchanged: consecutive items sharing a `group`
// are one carousel, YouTube links are videos, everything else is a single post.
// The client of a piece is the name its alt text opens with. Server-only (it
// reads the project MDX for the related cases).
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/posts";
import { extractYouTubeId } from "@/utils/youtube";
import type { Paper } from "../data";

export type Slide = { src: string; w: number; h: number; alt: string };

export type Piece =
  | { kind: "video"; id: string; client: string; title: string; caption: string; videoId: string }
  | {
      kind: "deck";
      id: string;
      client: string;
      title: string;
      caption: string;
      slides: Slide[];
    }
  | { kind: "post"; id: string; client: string; title: string; caption: string; slide: Slide };

export type ClientShelf = {
  id: string;
  name: string;
  paper: Paper;
  videos: Extract<Piece, { kind: "video" }>[];
  decks: Extract<Piece, { kind: "deck" }>[];
  posts: Extract<Piece, { kind: "post" }>[];
  /** A case study about this client's work, when one exists and is public. */
  related?: { href: string; title: string };
};

type RawImage = (typeof galleryPieces)[number];

/** Pixel sizes of the gallery files, read from their headers (sharp metadata). */
const SIZE: Record<string, { w: number; h: number }> = {
  "/images/gallery/Artesa - Wallpaper Diciembre.webp": { w: 1920, h: 1080 },
  "/images/gallery/Artesa - Panettone 2x1.webp": { w: 1080, h: 1350 },
  "/images/gallery/Artesa - Muffin ChocoMix.webp": { w: 1080, h: 1350 },
  "/images/gallery/Artesa - Nuevos Sabores.webp": { w: 1587, h: 2245 },
  "/images/gallery/Artesa - Magia de Diciembre.webp": { w: 1080, h: 1350 },
  "/images/gallery/Artesa - Nuevo Menu.webp": { w: 1080, h: 1350 },
  "/images/gallery/Artesa - Dia de la Madre.webp": { w: 1080, h: 1350 },
  "/images/gallery/arqui.webp": { w: 1357, h: 2400 },
  "/images/gallery/pared.webp": { w: 1357, h: 2400 },
  "/images/gallery/transform.webp": { w: 1744, h: 2336 },
};

/** Every other gallery file is a 2048 px square; a new file falls back by its orientation tag. */
function sizeOf(image: RawImage) {
  const known = SIZE[image.src];
  if (known) return known;
  if (image.orientation === "vertical") return { w: 1080, h: 1350 };
  if (image.orientation === "horizontal") return { w: 1920, h: 1080 };
  return { w: 2048, h: 2048 };
}

/** The clients named at the start of the alt texts, and the paper of each one's divider. */
const CLIENTS: { name: string; paper: Paper; caseSlug?: string }[] = [
  { name: "Quick Metal Shop", paper: "cobalt", caseSlug: "quick-metal-shop-marketing" },
  { name: "Artesa Panadería", paper: "mist", caseSlug: "leadbot-ai" },
  { name: "Aseneg", paper: "ink" },
  { name: "Dakoma Roofing", paper: "paper", caseSlug: "dakoma-roofing" },
];
const OTHER = "Other work";
const PAPERS: Paper[] = ["cobalt", "mist", "ink", "paper"];

function clientOf(alt: string) {
  return CLIENTS.find((c) => alt.startsWith(c.name))?.name ?? OTHER;
}

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The alt text without the client's name, first letter up: a short caption. */
function captionOf(alt: string, client: string) {
  const rest = alt.startsWith(client) ? alt.slice(client.length).trim() : alt;
  const short = rest.split(/,\s*slide \d/i)[0];
  return short.charAt(0).toUpperCase() + short.slice(1);
}

function isYouTube(src: string) {
  return src.includes("youtube.com") || src.includes("youtu.be");
}

function slideOf(image: RawImage): Slide {
  return { src: image.src, alt: image.alt, ...sizeOf(image) };
}

/** The same grouping pass GalleryView made, in the data's own order. */
function getPieces(): Piece[] {
  const images = galleryPieces;
  const pieces: Piece[] = [];
  let i = 0;
  while (i < images.length) {
    const image = images[i];
    const client = clientOf(image.alt);
    if (image.group) {
      const group = image.group;
      const slides: Slide[] = [];
      while (i < images.length && images[i].group === group) {
        slides.push(slideOf(images[i]));
        i++;
      }
      pieces.push({
        kind: "deck",
        id: `deck-${group}`,
        client,
        title: image.alt,
        caption: captionOf(image.alt, client),
        slides,
      });
      continue;
    }
    if (isYouTube(image.src)) {
      const videoId = extractYouTubeId(image.src);
      pieces.push({
        kind: "video",
        id: `video-${videoId}`,
        client,
        title: image.alt,
        caption: captionOf(image.alt, client),
        videoId,
      });
    } else {
      pieces.push({
        kind: "post",
        id: `post-${slugify(image.src.split("/").pop() ?? String(i))}`,
        client,
        title: image.alt,
        caption: captionOf(image.alt, client),
        slide: slideOf(image),
      });
    }
    i++;
  }
  return pieces;
}

export type GalleryBench = {
  pieces: Piece[];
  clients: ClientShelf[];
  totals: { videos: number; decks: number; posts: number; clients: number };
};

/**
 * The whole bench. Clients are ordered by how many pieces they have (ties keep
 * the data's order); inside a client, videos, then carousels, then single
 * posts, each in the data's order. With `hideProtected` (the gallery itself is
 * public), a related case whose page is password-protected is not linked.
 */
export function getGalleryBench({ hideProtected }: { hideProtected: boolean }): GalleryBench {
  const pieces = getPieces();
  const posts = getPosts(["src", "app", "work", "projects"]);
  const byName = new Map<string, ClientShelf>();
  const order: string[] = [];

  for (const piece of pieces) {
    let shelf = byName.get(piece.client);
    if (!shelf) {
      const known = CLIENTS.find((c) => c.name === piece.client);
      const href = known?.caseSlug ? `/work/${known.caseSlug}` : undefined;
      const post = known?.caseSlug ? posts.find((p) => p.slug === known.caseSlug) : undefined;
      const title = post?.metadata.title ?? "";
      shelf = {
        id: slugify(piece.client),
        name: piece.client,
        paper: known?.paper ?? PAPERS[byName.size % PAPERS.length],
        videos: [],
        decks: [],
        posts: [],
        related:
          href && post && !(hideProtected && isProtectedPath(href))
            ? {
                href,
                title: title.includes(":") ? title.split(":").slice(1).join(":").trim() : title,
              }
            : undefined,
      };
      byName.set(piece.client, shelf);
      order.push(piece.client);
    }
    if (piece.kind === "video") shelf.videos.push(piece);
    else if (piece.kind === "deck") shelf.decks.push(piece);
    else shelf.posts.push(piece);
  }

  const clients = order
    .map((name, index) => ({ shelf: byName.get(name) as ClientShelf, index }))
    .sort((a, b) => piecesIn(b.shelf) - piecesIn(a.shelf) || a.index - b.index)
    .map(({ shelf }) => shelf);

  return {
    pieces,
    clients,
    totals: {
      videos: pieces.filter((p) => p.kind === "video").length,
      decks: pieces.filter((p) => p.kind === "deck").length,
      posts: pieces.filter((p) => p.kind === "post").length,
      clients: clients.length,
    },
  };
}

/** How many pieces a client has on the bench. */
export function piecesIn(shelf: Pick<ClientShelf, "videos" | "decks" | "posts">) {
  return shelf.videos.length + shelf.decks.length + shelf.posts.length;
}

/** "9 videos", "1 carousel": a count with its noun. */
export function countOf(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

/** A client's formats in one line: "9 videos, 5 carousels and 7 posts". */
export function formatsLine(shelf: Pick<ClientShelf, "videos" | "decks" | "posts">) {
  const parts = [
    shelf.videos.length ? countOf(shelf.videos.length, "video", "videos") : "",
    shelf.decks.length ? countOf(shelf.decks.length, "carousel", "carousels") : "",
    shelf.posts.length ? countOf(shelf.posts.length, "post", "posts") : "",
  ].filter(Boolean);
  if (parts.length < 2) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
