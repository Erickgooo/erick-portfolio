// Workbench: the curated content of the home. Every figure, name and path
// below comes from src/resources (about.tsx, incentiva.ts) or the project MDX.
import { type HomeCategory, homeFeatured } from "@/resources/home";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { WORK_DIR, getPosts } from "@/utils/posts";
import { isImage, mediaSize } from "./prose/media";

export type Paper = "cobalt" | "ink" | "mist" | "paper";

const DEFAULT_COVER = { w: 2400, h: 1357 };

/** The paper each kind of card is printed on. */
const PAPER: Record<HomeCategory, Paper> = {
  Acquisition: "mist",
  Automation: "ink",
  Product: "cobalt",
  Operations: "mist",
};

/** The cases featured on the home, with their category (src/resources/home.tsx). */
const FAN = homeFeatured.map((feature) => ({ ...feature, paper: PAPER[feature.category] }));

type FanCard = {
  slug: string;
  category: HomeCategory;
  /** What the card says the case is about, when it says more than the title. */
  line?: string;
  client: string;
  title: string;
  value: string;
  label: string;
  cover: { src: string; w: number; h: number };
  /** The case's full title, for the cover's alt text. */
  fullTitle: string;
  href: string;
  paper: Paper;
};

function getProjects() {
  return getPosts(WORK_DIR);
}

/**
 * The cards of the fan. With `hideProtected` (set when the page listing them is
 * public), a case whose own page is password-protected is left out.
 */
export function getFanCards({ hideProtected }: { hideProtected: boolean }): FanCard[] {
  const posts = getProjects();
  const cards: FanCard[] = [];
  for (const { slug, paper, category, line } of FAN) {
    const href = `/work/${slug}`;
    if (hideProtected && isProtectedPath(href)) continue;
    const post = posts.find((p) => p.slug === slug);
    if (!post) continue;
    const [client, ...rest] = post.metadata.title.split(":");
    const [value, label] = (post.metadata.metric || "").split("|");
    const coverSrc = post.metadata.images.find(isImage) ?? post.metadata.images[0];
    cards.push({
      slug,
      category,
      line,
      client: client.trim(),
      title: rest.join(":").trim() || post.metadata.title,
      value: value ?? "",
      label: label ?? "",
      cover: { src: coverSrc, ...mediaSize(coverSrc, DEFAULT_COVER) },
      fullTitle: post.metadata.title,
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

/**
 * Each tool's official logo, a file in ./home/tools, imported by ToolWall
 * (sources: docs/design/rediseno-2026/tool-logos.md). Azure and Azure DevOps,
 * whose icon terms do not allow their marks in a tool list, show a neutral
 * pictogram instead (`pictogram`, drawn by ToolWall in the site's own icon
 * set), so no tile is left without a glyph. Xcode, App Store Connect and
 * Google Play show their official icons by Erick's decision of 2026-11-03,
 * taken knowing that Apple's and Google's brand terms do not allow them in a
 * tool list (tool-logos.md). `wide` tiles take two cells of the desktop board
 * (39 tools fill its 6 x 7 cells) and of the phone list in a group of 8.
 */
export type Pictogram = "cloud" | "pipeline";
export type Tool = { name: string; logo?: string; pictogram?: Pictogram; wide?: boolean };
type ToolGroup = {
  id: string;
  title: string;
  line: string;
  tools: Tool[];
};

/** Only tools named in src/resources (about.tsx, incentiva.ts) or the project MDX. Six groups: four of six, one of seven and one of eight. */
export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: "conversations",
    title: "Conversations and CRM",
    line: "Every lead lands, gets sorted and reaches the right stage, in a CRM or on a WhatsApp platform I run.",
    tools: [
      { name: "WhatsApp Business API", logo: "whatsapp.svg", wide: true },
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
      { name: "ChatGPT 6.1 Sol", logo: "openai.svg" },
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
      { name: "Meta Ads and Conversions API", logo: "meta.svg", wide: true },
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
      { name: "Remotion", logo: "remotion.svg" },
      { name: "DaVinci Resolve", logo: "davinci-resolve.png" },
      { name: "CapCut", logo: "capcut.svg" },
      { name: "Next.js", logo: "nextjs.svg" },
    ],
  },
  {
    id: "platforms",
    title: "Apps and platforms",
    line: "Field apps, portals and APIs, built with AI agents under my direction.",
    tools: [
      { name: "Claude Code", logo: "claude.svg" },
      { name: "Flutter", logo: "flutter.svg" },
      { name: "React", logo: "react.svg" },
      { name: "Angular", logo: "angular.svg" },
      { name: "Node.js", logo: "nodejs.svg" },
      { name: ".NET", logo: "dotnet.svg" },
      { name: "Xcode", logo: "xcode.png" },
    ],
  },
  {
    id: "delivery",
    title: "Cloud, releases and tests",
    line: "Pipelines, store releases and the tests that let a small team ship.",
    tools: [
      // Azure and Azure DevOps: their icon terms do not allow their marks in
      // a tool list (tool-logos.md).
      { name: "Azure", pictogram: "cloud" },
      { name: "Azure DevOps", pictogram: "pipeline" },
      { name: "Netlify", logo: "netlify.svg" },
      { name: "Playwright", logo: "playwright.svg" },
      { name: "Vitest", logo: "vitest.svg" },
      { name: "xUnit.net", logo: "xunit.svg" },
      { name: "App Store Connect", logo: "app-store-connect.png", wide: true },
      { name: "Google Play", logo: "google-play.svg" },
    ],
  },
];

/**
 * Where the tiles sit on the desktop board, 6 cells by 7 rows: 39 tools, three
 * of them wide, so every row is full; the groups are scattered across it.
 */
export const WALL_ORDER: [number, number][] = [
  // [group, tool], row by row; a wide tile takes two cells
  [0, 0], // wide
  [1, 0],
  [3, 0],
  [4, 0],
  [5, 0],

  [2, 1],
  [3, 1],
  [4, 1],
  [5, 1],
  [0, 1],
  [1, 1],

  [2, 0], // wide
  [4, 2],
  [5, 2],
  [0, 2],
  [1, 2],

  [3, 2],
  [0, 3],
  [1, 3],
  [2, 2],
  [4, 3],
  [5, 3],

  [3, 3],
  [2, 3],
  [4, 4],
  [5, 4],
  [0, 4],
  [1, 4],

  [1, 5],
  [2, 4],
  [3, 4],
  [4, 5],
  [5, 5],
  [0, 5],

  [5, 6], // wide
  [4, 6],
  [2, 5],
  [3, 5],
  [5, 7],
];
