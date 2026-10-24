// The site's settings: its address, its pages (the path, the name on the
// header key, and the title and description for search results and shared
// links), which pages are on, what the header shows, and where a post can
// be shared.
import { profile, profileLinks } from "./profile";

export const siteUrl = "https://erickmahecha.com";

export type PagePath = `/${string}`;

export type Page = {
  path: PagePath;
  label: string;
  title: string;
  description: string;
  /** Picture for shared links, under public/; otherwise one is drawn from the title. */
  image?: string;
};

export const pages = {
  home: {
    path: "/",
    label: "Home",
    title: `${profile.name}'s Portfolio`,
    description:
      "I build complete growth systems for founders: AI content pipelines, CRM automation and paid media. ROAS 3.92x · 338K+ organic views at $0 ad spend · $3.45 cost per lead in technical B2B.",
    image: "/images/og/social-preview.jpg",
  },
  about: {
    path: "/about",
    label: "About",
    title: `About – ${profile.name}`,
    description: `Meet ${profile.name}, ${profile.role} from ${profile.location}`,
  },
  work: {
    path: "/work",
    label: "Projects",
    title: `Projects – ${profile.name}`,
    description:
      "AI systems, automation workflows, and marketing infrastructure built by Erick Mahecha",
  },
  blog: {
    path: "/blog",
    label: "Blog",
    title: "Insights & Setup",
    description: `Read what ${profile.name} has been up to recently`,
  },
  gallery: {
    path: "/gallery",
    label: "Visual Work",
    title: `Visual Work – ${profile.name}`,
    description:
      "Cinematic video production used to require a crew, a budget, and days of shooting. These assets were built by one person, usually in hours. This section collects paid ad creatives, short-form video, and AI-generated content produced for real campaigns.",
  },
} satisfies Record<string, Page>;

/** The pages that are on. A page that is off answers as not found. */
export const enabledRoutes: Record<PagePath, boolean> = {
  "/": true,
  "/about": true,
  "/work": true,
  "/blog": true,
  "/gallery": true,
};

/** What the header shows besides the page keys. */
export const headerShows = {
  location: true,
  time: true,
  themeKey: true,
};

/** The share keys under a post. */
export const sharing = {
  enabled: true,
  on: {
    x: true,
    linkedin: true,
    facebook: false,
    pinterest: false,
    whatsapp: false,
    reddit: false,
    telegram: false,
    email: true,
    copyLink: true,
  },
};

/** Erick's profile URLs for schema.org sameAs (web links only, no mailto). */
export const sameAs: string[] = profileLinks
  .map((link) => link.href)
  .filter((href) => href.startsWith("http"));
