/**
 * Copy for the Home (spec 2026-10-10, section 3.3). Plain strings only. Every
 * figure, client and date here comes from src/resources/ or the project MDX.
 */
export const landing = {
  hero: {
    title: "The marketing department is one person.",
    byline: "Erick Mahecha. Growth marketing and AI automation, from Medellín.",
  },
  cta: { label: "Book a 30 minute call" },
  /** One title card per seat of the department, in the order the film is cut. `slug` is the case study behind it. */
  seats: [
    {
      id: "brand",
      name: "Brand",
      text: "Quick Metal Shop had no brand manual. I wrote it in my first week, and the ArquiExpo 2026 stand was built from it.",
      slug: "quick-metal-shop-the-brand-comes-to-life",
    },
    {
      id: "content",
      name: "Content",
      text: "Three reels cut from before-and-after photos reached 338K+ organic views. Ad spend was $0.",
      slug: "quick-metal-shop-viral-videos",
    },
    {
      id: "paid-media",
      name: "Paid media",
      text: "A sales campaign made with AI video returned 3.92x ROAS. A second one brought 260 B2B leads at $3.45 each.",
      slug: "ai-powered-ad-creatives",
    },
    {
      id: "crm",
      name: "CRM",
      text: "At Artesa, a WhatsApp assistant handles 85% of conversations. At ATV Riders, 200+ leads a day arrive sorted.",
      slug: "leadbot-ai",
    },
    {
      id: "software",
      name: "Software",
      text: "For ArquiExpo I shipped a touchscreen app 48 hours after the idea.",
      slug: "quick-metal-shop-arquiexpo",
    },
  ],
  caseLink: "Read the case study",
  work: { title: "Work", all: "See all projects" },
  hiring: {
    title: "For hiring teams",
    text: "I lead growth and operations at Incentiva Group. Before that I was the first marketing hire at Quick Metal Shop.",
    resume: "Download my resume",
    about: "More about me",
  },
  faq: {
    title: "Questions",
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
    title: "Tell me where your funnel leaks.",
    text: "In 30 minutes I'll tell you what I would automate first.",
  },
} as const;
