// THROWAWAY (lab only): the copy proposed for each Home direction.
// Every figure, client, date and tool below comes from src/resources/ or the
// project MDX; nothing here is new information.

export const CALL = "Book a 30 minute call";
export const CASE = "Read the case study";

/** A · Voice-over. One caption per shot, read like the narration of a short film. */
export const voiceOver = {
  title: "I build the marketing department your company doesn't have.",
  byline: "Erick Mahecha. Growth marketing and AI automation, from Medellín.",
  captions: [
    {
      beat: "tagline",
      text: "I work alone, from this desk.",
    },
    {
      beat: "problem",
      text: "In January 2026 Quick Metal Shop hired me as its first marketer. It had no brand manual and no analytics.",
      slug: "quick-metal-shop-marketing",
    },
    {
      beat: "solution",
      text: "I wrote the brand manual in my first week. SEO publishing, Meta ads and the CRM came after it.",
      slug: "quick-metal-shop-the-brand-comes-to-life",
    },
    {
      beat: "benefit-1",
      text: "A sales campaign made with AI video returned 3.92x ROAS.",
      slug: "ai-powered-ad-creatives",
    },
    {
      beat: "benefit-2",
      text: "A second one brought 260 B2B leads at $3.45 each.",
      slug: "ai-powered-ad-creatives",
    },
    {
      beat: "benefit-3",
      text: "Three reels cut from before-and-after photos reached 338K+ organic views. Ad spend was $0.",
      slug: "quick-metal-shop-viral-videos",
    },
    {
      beat: "benefit-4",
      text: "For ArquiExpo I shipped a touchscreen app 48 hours after the idea.",
      slug: "quick-metal-shop-arquiexpo",
    },
    {
      beat: "process",
      text: "At Artesa, a WhatsApp assistant I built handles 85% of conversations without a person.",
      slug: "leadbot-ai",
    },
  ],
} as const;

/** B · Desk and ledger. A short written account beside the film, then every project in a table. */
export const ledger = {
  title: "Marketing, built and run by one person.",
  lead: "I'm Erick Mahecha. I work from Medellín with founders who need brand, content, paid media and CRM running as one system. I build it and I keep it running.",
  entries: [
    {
      beat: "qms",
      heading: "Quick Metal Shop, January to July 2026",
      body: "I was the first marketing hire. I wrote the brand manual in my first week, set up analytics and automated SEO publishing, ran the Meta ads and routed their leads into the CRM.",
      slug: "quick-metal-shop-marketing",
    },
    {
      beat: "video",
      heading: "Video without a shoot",
      body: "Three reels cut from before-and-after photos reached 338K+ organic views with $0 in ad spend. A sales campaign made with AI video returned 3.92x ROAS.",
      slug: "quick-metal-shop-viral-videos",
    },
    {
      beat: "leads",
      heading: "Leads that arrive sorted",
      body: "At Artesa, a WhatsApp assistant handles 85% of conversations. At ATV Riders, a Kommo CRM flow qualifies 200+ leads a day before a salesperson reads them.",
      slug: "leadbot-ai",
    },
    {
      beat: "software",
      heading: "Software when none exists",
      body: "For ArquiExpo 2026 I shipped a touchscreen gallery of 285 panel variants, 48 hours after the idea.",
      slug: "quick-metal-shop-arquiexpo",
    },
  ],
  table: { title: "Every project", project: "Project", result: "Result", none: "Not measured" },
} as const;

/** C · Department of one. The film plays clean; black title cards name each seat I filled. */
export const department = {
  title: "The marketing department is one person.",
  byline: "Erick Mahecha. Growth marketing and AI automation, from Medellín.",
  seats: [
    {
      seat: "Brand",
      text: "Quick Metal Shop had no brand manual. I wrote it in my first week, and the ArquiExpo 2026 stand was built from it.",
      slug: "quick-metal-shop-the-brand-comes-to-life",
    },
    {
      seat: "Content",
      text: "Three reels cut from before-and-after photos reached 338K+ organic views. Ad spend was $0.",
      slug: "quick-metal-shop-viral-videos",
    },
    {
      seat: "Paid media",
      text: "A sales campaign made with AI video returned 3.92x ROAS. A second one brought 260 B2B leads at $3.45 each.",
      slug: "ai-powered-ad-creatives",
    },
    {
      seat: "CRM",
      text: "At Artesa, a WhatsApp assistant handles 85% of conversations. At ATV Riders, 200+ leads a day arrive sorted.",
      slug: "leadbot-ai",
    },
    {
      seat: "Software",
      text: "For ArquiExpo I shipped a touchscreen app 48 hours after the idea.",
      slug: "quick-metal-shop-arquiexpo",
    },
  ],
} as const;

/** Under the film, shared by the three directions. */
export const closing = {
  work: { title: "Work", all: "See all projects" },
  hiring: {
    title: "For hiring teams",
    text: "I lead growth and operations at Incentiva Group. Before that I was the first marketing hire at Quick Metal Shop.",
    resume: "Download my resume",
    about: "More about me",
  },
  faq: { title: "Questions" },
  final: {
    title: "Tell me where your funnel leaks.",
    text: "In 30 minutes I'll tell you what I would automate first.",
  },
} as const;
