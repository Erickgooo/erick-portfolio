// Workbench: the curated content of the home. Every figure, name and path
// below comes from src/resources/content.tsx or the project MDX.
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/utils";

export type Paper = "cobalt" | "ink" | "mist" | "paper";

/** Pixel sizes of the cover images, read from the files' headers. */
const COVER_SIZE: Record<string, { w: number; h: number }> = {
  "/images/projects/quick-metal-shop-viral-videos/social-media1.webp": { w: 2400, h: 1357 },
  "/images/projects/qms-dakoma-ai-creative/creatives1.webp": { w: 2400, h: 1357 },
  "/images/projects/project-01/whatsapp.webp": { w: 1466, h: 986 },
  "/images/projects/cuatrimotos-project/portada-chatbot.webp": { w: 2400, h: 1357 },
  "/images/projects/app-quick-metal-shop/qmsapp.webp": { w: 2400, h: 1357 },
  "/images/og/home.jpg": { w: 1200, h: 750 },
};
const DEFAULT_COVER = { w: 2400, h: 1357 };

/** The order of the fan on the home (the six cases with a metric), and the paper each card is printed on. */
const FAN: { slug: string; paper: Paper }[] = [
  { slug: "quick-metal-shop-viral-videos", paper: "ink" },
  { slug: "ai-powered-ad-creatives", paper: "mist" },
  { slug: "leadbot-ai", paper: "cobalt" },
  { slug: "atv-riders", paper: "paper" },
  { slug: "quick-metal-shop-arquiexpo", paper: "mist" },
  { slug: "ai-portfolio", paper: "ink" },
];

export type FanCard = {
  slug: string;
  client: string;
  title: string;
  value: string;
  label: string;
  cover: { src: string; w: number; h: number };
  href: string;
  paper: Paper;
};

function isImage(path: string) {
  return /\.(webp|jpe?g|png|avif)$/i.test(path);
}

function getProjects() {
  return getPosts(["src", "app", "work", "projects"]);
}

/**
 * The cards of the fan. With `hideProtected` (set when the page listing them is
 * public), a case whose own page is password-protected is left out, as the
 * project list on the previous home did.
 */
export function getFanCards({ hideProtected }: { hideProtected: boolean }): FanCard[] {
  const posts = getProjects();
  const cards: FanCard[] = [];
  for (const { slug, paper } of FAN) {
    const href = `/work/${slug}`;
    if (hideProtected && isProtectedPath(href)) continue;
    const post = posts.find((p) => p.slug === slug);
    if (!post) continue;
    const [client, ...rest] = post.metadata.title.split(":");
    const [value, label] = (post.metadata.metric || "").split("|");
    const coverSrc = post.metadata.images.find(isImage) ?? post.metadata.images[0];
    cards.push({
      slug,
      client: client.trim(),
      title: rest.join(":").trim() || post.metadata.title,
      value: value ?? "",
      label: label ?? "",
      cover: { src: coverSrc, ...(COVER_SIZE[coverSrc] ?? DEFAULT_COVER) },
      href,
      paper,
    });
  }
  return cards;
}

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

/** A count in words when it is short ("nine"), in digits otherwise. */
export function inWords(count: number): string {
  return WORDS[count] ?? String(count);
}

/** How many projects the Projects page lists. */
export function countProjects(): number {
  return getProjects().length;
}

/** Each tool's official logo, a file in public/images/tools (sources: docs/design/rediseno-2026/tool-logos.md). */
export type Tool = { name: string; logo: string };
export type ToolGroup = {
  id: string;
  title: string;
  line: string;
  tools: Tool[];
};

/** Only tools named in content.tsx or the project MDX. */
export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: "conversations",
    title: "Conversations and CRM",
    line: "Every lead lands, gets sorted and reaches the right stage on its own.",
    tools: [
      { name: "WhatsApp Business API", logo: "whatsapp.svg" },
      { name: "Bitrix24", logo: "bitrix24.svg" },
      { name: "Kommo CRM", logo: "kommo.png" },
      { name: "BotSL IA", logo: "botsl.png" },
      { name: "Zapier", logo: "zapier.svg" },
      { name: "Odoo", logo: "odoo.svg" },
    ],
  },
  {
    id: "models",
    title: "AI models",
    line: "Picked per job: precision for sales, range for content.",
    tools: [
      { name: "GPT-4o mini", logo: "openai.svg" },
      { name: "Gemini", logo: "gemini.svg" },
      { name: "Claude", logo: "claude.svg" },
      { name: "ElevenLabs", logo: "elevenlabs.svg" },
      { name: "Soro AI", logo: "soro.svg" },
      { name: "Holo AI", logo: "holo.png" },
    ],
  },
  {
    id: "media",
    title: "Paid media and analytics",
    line: "Campaigns built from creative to audience, measured end to end.",
    tools: [
      { name: "Meta Ads", logo: "meta.svg" },
      { name: "Instagram", logo: "instagram.png" },
      { name: "Facebook", logo: "facebook.png" },
      { name: "Google Analytics", logo: "google-analytics.svg" },
      { name: "Search Console", logo: "search-console.svg" },
      { name: "Shopify", logo: "shopify.svg" },
    ],
  },
  {
    id: "studio",
    title: "Studio and software",
    line: "Video, voice and the app itself when nothing exists yet.",
    tools: [
      { name: "Higgsfield", logo: "higgsfield.svg" },
      { name: "Kling 3.0", logo: "kling.svg" },
      { name: "DaVinci Resolve", logo: "davinci-resolve.png" },
      { name: "CapCut", logo: "capcut.svg" },
      { name: "Next.js", logo: "nextjs.svg" },
      { name: "Netlify", logo: "netlify.svg" },
    ],
  },
];

/** Where the tiles of each group sit on the 6-column wall, scattered across it. */
export const WALL_ORDER: [number, number][] = [
  // [group, tool] for each of the 24 cells, row by row
  [1, 0],
  [0, 0],
  [2, 3],
  [3, 2],
  [0, 4],
  [2, 0],
  [3, 0],
  [2, 1],
  [1, 2],
  [0, 1],
  [3, 4],
  [1, 4],
  [0, 3],
  [1, 1],
  [3, 1],
  [2, 4],
  [0, 2],
  [3, 3],
  [2, 2],
  [3, 5],
  [1, 3],
  [2, 5],
  [1, 5],
  [0, 5],
];
