/** Copy for the home landing page (spec 2026-10-09, §3). Plain strings only. */
export const landing = {
  hero: {
    headline: "I build your marketing engine from zero and make it outperform a full department.",
    subline:
      "For founders who need content, CRM and paid media working as one system. At Quick Metal Shop that meant 338K+ organic views with $0 in ad spend.",
    risk: "30 minutes. No commitment.",
  },
  cta: { label: "Book a 30 minute call" },
  tagline: ["Most companies hire a department.", "I build the system that does the work of one."],
  problem: {
    label: "The problem",
    text: "Your marketing lives in five tools and three freelancers, and none of them talk to each other.",
  },
  solution: {
    label: "What I do",
    text: "I design the whole system, build it, and keep it running: brand, content, paid media, CRM and the software in between.",
  },
  benefits: [
    {
      figure: "338K+",
      unit: "organic views",
      title: "Content at agency scale.",
      body: "338K+ organic views for Quick Metal Shop with $0 in ad spend, from an AI production pipeline.",
      slug: "quick-metal-shop-viral-videos",
    },
    {
      figure: "3.92x",
      unit: "ROAS",
      title: "Paid media that pays back.",
      body: "3.92x ROAS on AI generated ad creatives for Quick Metal Shop and Dakoma Roofing.",
      slug: "ai-powered-ad-creatives",
    },
    {
      figure: "85%",
      unit: "conversations automated",
      title: "Leads answered while you sleep.",
      body: "A WhatsApp assistant that handles 85% of inbound conversations on its own, and a CRM flow that sorts 200+ leads a day.",
      slug: "leadbot-ai",
    },
    {
      figure: "48h",
      unit: "from idea to deployed",
      title: "Software when nothing exists yet.",
      body: "A touchscreen trade show app designed, built and deployed in 48 hours.",
      slug: "quick-metal-shop-arquiexpo",
    },
  ],
  caseLink: "Read the case study",
  process: {
    title: "How I work",
    steps: [
      {
        name: "Map",
        text: "I audit where your team's time goes and what a system could take over.",
      },
      { name: "Build", text: "Brand, pipelines, CRM and tracking, wired together." },
      { name: "Run", text: "I operate it, measure it and keep improving it." },
    ],
  },
} as const;
