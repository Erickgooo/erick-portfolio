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
      body: "3.92x ROAS on an AI generated sales campaign for Quick Metal Shop.",
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
  proof: { title: "Recent work", all: "See all projects" },
  hiring: {
    title: "Hiring for a growth role?",
    text: "I lead growth and operations at Incentiva Group today. Before that I was the first marketing hire at Quick Metal Shop and built the function from zero.",
    resume: "Download my resume",
    about: "More about me",
  },
  faq: {
    title: "Questions founders ask",
    items: [
      {
        question: "What exactly do you do?",
        answer:
          "I build and run complete growth systems: brand identity, paid media, SEO automation, AI content pipelines, CRM and the custom software that connects them.",
      },
      {
        question: "Who do you work with?",
        answer:
          "Founders and small teams. So far in construction, food and retail, for companies like Quick Metal Shop, Dakoma Roofing and Artesa Panadería.",
      },
      {
        question: "Do you work alone?",
        answer:
          "Yes. I run projects from start to finish myself, with an AI stack that lets one person produce at agency scale.",
      },
      {
        question: "Which tools do you use?",
        answer:
          "Higgsfield and Google Veo for video, Claude, Gemini and ChatGPT for orchestration, Soro AI for SEO, and Zapier, Kommo CRM and Bitrix24 for operations.",
      },
      {
        question: "How fast can you start showing results?",
        answer:
          "It depends on where you start. At Quick Metal Shop the brand manual was done in the first week, and a trade show app went from idea to deployed in 48 hours.",
      },
      {
        question: "Where are you based and what languages do you work in?",
        answer: "Medellín, Colombia, on Bogotá time. I work in Spanish and English.",
      },
      {
        question: "What happens on the call?",
        answer:
          "It takes 30 minutes. You tell me where the funnel leaks and I tell you what I would automate first. No deck and no commitment.",
      },
    ],
  },
  finalCta: {
    title: "Let's build the growth system your company doesn't have yet.",
    text: "30 minutes, no deck. Tell me where the funnel leaks and I'll tell you what I'd automate first.",
  },
} as const;
