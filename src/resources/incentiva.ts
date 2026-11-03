// Incentiva Group: every project of the role (P01 to P33, P24 left out), for
// the index at /work/incentiva-group and for ErickBot. Source: the Incentiva
// experience knowledge base of 2026-11-02 (outside the repo). Lines carry no
// client figures, prices or internal economics; a project that is part of a
// case study links to it.

export type IncentivaStatus =
  | "In production"
  | "Delivered to client"
  | "Internal"
  | "Proposal / pitch";

export type IncentivaProject = {
  id: string;
  title: string;
  client: string;
  status: IncentivaStatus;
  /** What was done, in one line. */
  line: string;
  stack: string[];
  /** The case study it belongs to (a slug under /work). */
  caseSlug?: string;
};

export type IncentivaArea = {
  id: string;
  title: string;
  line: string;
  projects: IncentivaProject[];
};

export const incentivaRole = {
  company: "Incentiva Group",
  title: "Operations Manager",
  timeframe: "July 2026 - Present",
  place: "Medellín, hybrid",
  summary:
    "At Incentiva Group, a marketing agency in Medellín, I led projects for Nequi, Wompi, Colmaíz and Samsung. As Operations Manager I report to the CEO, lead a team of two and run the company's in-house software as product owner and technical lead: Scope, the field app for the Nequi and Wompi field teams, a client portal and ChatFlow, the WhatsApp AI-assistant platform, directing AI-assisted development from audit to App Store release. I also lead brand and go-to-market work: the 2026 brand redesign and new corporate website, a click-to-WhatsApp sales channel for Incentiva as an authorized DIRECTV dealer, and commercial proposals and cost models.",
  method:
    "The software, decks and media were produced with AI agents, mainly Claude Code, with Higgsfield for generative media. I define the requirements, approve specs and designs, make the product, legal and pricing decisions, and merge and release to production.",
};

export const INCENTIVA_AREAS: IncentivaArea[] = [
  {
    id: "product",
    title: "Product and engineering leadership",
    line: "Scope (the field-sales app), the Incentiva Portal and ChatFlow: roadmap, audits, releases and cloud operations.",
    projects: [
      {
        id: "P14",
        title: "Scope multi-campaign platform: Wompi as a second client and a new Nequi line",
        client: "Wompi and Nequi",
        status: "In production",
        line: "Turned a single-client field app into a multi-client platform, with a database per client and fail-closed tenant resolution.",
        stack: [".NET", "EF Core", "Azure SQL", "Angular", "Flutter"],
        caseSlug: "scope-multi-client-platform",
      },
      {
        id: "P30",
        title: "Scope app: first iOS launch and release management",
        client: "Incentiva (internal), for the Nequi and Wompi field teams",
        status: "In production",
        line: "Took the app through iOS signing, background GPS and App Store review to its first iOS release, then 13 versions on both stores.",
        stack: ["Flutter", "Xcode", "App Store Connect API", "Google Play Developer API"],
        caseSlug: "scope-ios-launch",
      },
      {
        id: "P33",
        title: "ChatFlow platform takeover, CI/CD and audits",
        client: "Incentiva (internal)",
        status: "In production",
        line: "Took a WhatsApp AI platform from backups to version control, a gated pipeline, three audits and 3,177 tests.",
        stack: ["React", "Node.js", "Azure", "Azure DevOps", "Vitest"],
        caseSlug: "chatflow-whatsapp-ai-platform",
      },
      {
        id: "P32",
        title: "Colmaíz WhatsApp assistant and client portal (ChatFlow)",
        client: "Colmaíz (Ingredion)",
        status: "In production",
        line: "An assistant for a community of 35,000+ contacts, 6,000+ served: lost messages fixed, structured capture, and a client-role portal reconciled against the API, Excel and SQL.",
        stack: ["React", "Node.js", "Azure SQL", "Anthropic Claude", "WhatsApp Cloud API"],
        caseSlug: "chatflow-whatsapp-ai-platform",
      },
      {
        id: "P27",
        title: "Scope field reliability, bug audit and field-team features",
        client: "Incentiva (internal), for field operations",
        status: "In production",
        line: "Fixed lost records, failing photo uploads and broken sessions, fixed audited bugs test-first, and added tools to supervise the working day.",
        stack: ["Flutter", ".NET", "Angular", "Application Insights"],
      },
      {
        id: "P28",
        title: "Azure cloud and DevOps for Scope and Portal",
        client: "Incentiva (internal)",
        status: "In production",
        line: "The first CI/CD for the Scope API, fully verified Portal deploys, a QA environment beside production and secrets in Key Vault.",
        stack: ["Azure App Service", "Azure SQL", "Key Vault", "Azure DevOps"],
      },
      {
        id: "P29",
        title: "Samsung × LifeMiles WhatsApp promotion assistant (ChatFlow)",
        client: "Samsung",
        status: "In production",
        line: "Led the promotion: took over its WhatsApp chatbot, rebuilt it for a high-volume promotion, rewrote its prompt and added fraud controls before the peak. 2M+ LifeMiles miles were awarded through it.",
        stack: ["Node.js", "TypeScript", "Anthropic Claude", "OCR", "WhatsApp Cloud API"],
        caseSlug: "samsung-lifemiles-whatsapp",
      },
    ],
  },
  {
    id: "operations",
    title: "Client operations enablement",
    line: "New client operations on Scope, and the dashboards, reports and guides that run them.",
    projects: [
      {
        id: "P01",
        title: "Wompi manager dashboard with two-factor login",
        client: "Wompi",
        status: "In production",
        line: "A read-only live dashboard for the client's manager, behind a default-deny gateway and a time-based second factor.",
        stack: [".NET", "Angular", "Azure Key Vault", "xUnit"],
      },
      {
        id: "P21",
        title: "Scope visit heat map, anti-fraud verification and client report",
        client: "Nequi and Wompi",
        status: "In production",
        line: "Reported versus GPS-verified visits on a custom canvas heat map, a fraud-signal risk score and a client PDF report.",
        stack: ["Angular", ".NET", "Google Maps APIs", "Canvas"],
      },
      {
        id: "P09",
        title: "Wompi launch enablement kit",
        client: "Wompi and Incentiva",
        status: "Internal",
        line: "A client presentation and a coordinator onboarding for the launch on Scope, built with mock-ups and blurred captures.",
        stack: ["HTML/CSS", "Python", "PowerPoint"],
      },
      {
        id: "P20",
        title: "Client-portal user guide",
        client: "Ingredion",
        status: "Delivered to client",
        line: "A plain-language guide to the WhatsApp assistant's client portal, with screenshots taken from mock data.",
        stack: ["Playwright", "PowerPoint", "Python"],
      },
    ],
  },
  {
    id: "growth",
    title: "Growth and paid media",
    line: "Incentiva as an authorized DIRECTV dealer: channel strategy, a Meta click-to-WhatsApp campaign and an AI assistant feeding a human closer.",
    projects: [
      {
        id: "P18",
        title: "DIRECTV digital-sales strategy and Meta media plan",
        client: "Incentiva's DIRECTV dealership",
        status: "Internal",
        line: "A strategy and a break-even-gated media plan for the CEO, which led directly to the live campaign.",
        stack: ["Python", "python-pptx", "Meta Ad Library"],
        caseSlug: "directv-click-to-whatsapp",
      },
      {
        id: "P10",
        title: "DIRECTV click-to-WhatsApp Meta campaign",
        client: "Incentiva's DIRECTV dealership",
        status: "In production",
        line: "A live Meta campaign with 7 ads and 62 creatives composed in code, every offer with a documented source.",
        stack: ["Meta Ads Manager", "Higgsfield", "Python", "Meta Conversions API"],
        caseSlug: "directv-click-to-whatsapp",
      },
      {
        id: "P11",
        title: "DIRECTV WhatsApp sales assistant (ChatFlow)",
        client: "Incentiva's DIRECTV dealership",
        status: "In production",
        line: "Pre-qualifies each lead with consent, reports to the Conversions API and hands off to a human advisor.",
        stack: ["Node.js", "TypeScript", "WhatsApp Cloud API", "Anthropic Claude"],
        caseSlug: "directv-click-to-whatsapp",
      },
    ],
  },
  {
    id: "commercial",
    title: "Commercial proposals and cost models",
    line: "Quotations and pitches, with cost models and scripts that check every figure against its source.",
    projects: [
      {
        id: "P16",
        title: "Samsung incentive-plan quotation",
        client: "Samsung",
        status: "Proposal / pitch",
        line: "A quotation and a cost model whose every figure is checked by script against one master table.",
        stack: ["Python", "openpyxl", "python-pptx"],
      },
      {
        id: "P25",
        title: "Field-team BPO proposals",
        client: "Wompi and Nequi",
        status: "Proposal / pitch",
        line: "Two field-team proposals with cost models that compare coverage against cost across team sizes.",
        stack: ["PowerPoint", "HTML/CSS"],
      },
      {
        id: "P26",
        title: "WhatsApp loyalty-program proposal",
        client: "Mall Indiana",
        status: "Proposal / pitch",
        line: "A WhatsApp loyalty program on ChatFlow: strategy, pricing tiers and a check that keeps internal figures out of the deck.",
        stack: ["Python", "python-pptx", "LibreOffice"],
      },
      {
        id: "P05",
        title: "WhatsApp leads in Salesforce: integration proposal",
        client: "Ingredion",
        status: "Proposal / pitch",
        line: "A feasibility proposal in English for sending the WhatsApp assistant's leads to Salesforce.",
        stack: ["HTML/CSS", "Playwright", "Python"],
      },
      {
        id: "P22",
        title: "Campaign results presentation",
        client: "Ingredion",
        status: "Proposal / pitch",
        line: "A traceable results deck with a data annex and a methodology note, from data extracted read-only.",
        stack: ["Azure SQL", "Python", "python-pptx", "Excel"],
      },
    ],
  },
  {
    id: "brand",
    title: "Brand and content",
    line: "The 2026 brand redesign, the new corporate website, the brand in the company's software, and AI-assisted social and video production.",
    projects: [
      {
        id: "P19",
        title: "Incentiva brand redesign 2026: manual and resource kit",
        client: "Incentiva (internal)",
        status: "Internal",
        line: "A 78-page manual and a 357-file kit that keep the medal and set a stricter system around it.",
        stack: ["HTML to PDF", "SVG", "CMYK print files"],
        caseSlug: "incentiva-website-brand",
      },
      {
        id: "P07",
        title: "Incentiva corporate website redesign",
        client: "Incentiva (internal)",
        status: "Internal",
        line: "A 28-page site told as a scroll story around the brand's 3D medal. Built; launch pending.",
        stack: ["WordPress", "three.js", "WebGL2", "Netlify"],
        caseSlug: "incentiva-website-brand",
      },
      {
        id: "P08",
        title: "Website-launch social campaign",
        client: "Incentiva (own marketing)",
        status: "Internal",
        line: "Four pieces built around the site's medal, recorded frame by frame and checked by a 13-point QA. Held for launch day.",
        stack: ["Remotion", "Puppeteer", "ElevenLabs", "Higgsfield"],
        caseSlug: "incentiva-launch-campaign",
      },
      {
        id: "P04",
        title: "2026 brand rollout across Portal, Scope and ChatFlow",
        client: "Incentiva (internal)",
        status: "In production",
        line: "Shared design tokens and a brand UI library, with about 750,000 lines of unused template code removed.",
        stack: ["Angular", "Flutter", "React", "Tailwind"],
      },
      {
        id: "P06",
        title: "Brand reel “Conversemos”",
        client: "Incentiva (own marketing)",
        status: "Internal",
        line: "A full-service brand reel in Remotion, with a technical QA and an automated check that no competitor comparison appears.",
        stack: ["Remotion", "Python", "Higgsfield", "ElevenLabs"],
      },
      {
        id: "P13",
        title: "Brand reel explorations: “The table” and “The Medal”",
        client: "Incentiva (own marketing)",
        status: "Internal",
        line: "A vertical reel built entirely in code, and a paper-puppet medal mascot with lip-sync driven by forced alignment.",
        stack: ["Remotion", "Python", "Whisper", "ElevenLabs"],
      },
      {
        id: "P15",
        title: "Job-vacancy post: commercial coordinator",
        client: "Incentiva (internal)",
        status: "Internal",
        line: "A recruiting piece that composes an AI base photo with code-rendered brand elements, after the model kept redrawing the logo.",
        stack: ["Higgsfield", "Python", "HTML/CSS"],
      },
      {
        id: "P17",
        title: "LinkedIn carousel: a client success story",
        client: "Incentiva (own marketing)",
        status: "Internal",
        line: "8 narrative angles, scored and merged into one case-study carousel composed in code.",
        stack: ["Higgsfield", "Python", "HTML"],
      },
      {
        id: "P23",
        title: "Social content program: monthly plan and first two-week campaign",
        client: "Incentiva (own marketing)",
        status: "Internal",
        line: "A content plan and a two-week campaign in the new brand, with OCR and transcription checks on every piece.",
        stack: ["Higgsfield", "Kling", "Remotion", "Tesseract OCR"],
      },
    ],
  },
  {
    id: "security",
    title: "Security, privacy and compliance",
    line: "Code and security audits, multi-tenant isolation, two-factor login, and consent flows under Colombia's data-protection law.",
    projects: [
      {
        id: "P12",
        title: "Scope and Portal security audits and hardening",
        client: "Incentiva (internal)",
        status: "In production",
        line: "Security audits, a threat model and a first remediation wave, from hashed refresh tokens to cross-tenant route isolation.",
        stack: [".NET", "Flutter", "Angular", "OWASP ASVS and MASVS"],
      },
      {
        id: "P31",
        title: "Data-protection compliance: consent flows and data policy",
        client: "Incentiva (internal), for its WhatsApp lines and website",
        status: "In production",
        line: "Consent flows where a no is recorded as a no, and a data policy published and verified against its source by hash.",
        stack: ["Node.js", "TypeScript", "WordPress"],
      },
      {
        id: "P03",
        title: "In-app customer data authorization with signature (Scope)",
        client: "Nequi and Wompi operations",
        status: "In production",
        line: "An on-device signed authorization for merchant data, which replaced a costlier messaging approach.",
        stack: ["Flutter", ".NET", "Playwright"],
      },
    ],
  },
];

/**
 * The case studies of the role, for ErickBot (the pages read the MDX itself;
 * the chatbot's route cannot read files at request time). Titles and figures
 * as in src/app/work/projects/<slug>.mdx.
 */
export const incentivaCases: { slug: string; title: string; figure: string }[] = [
  {
    slug: "scope-multi-client-platform",
    title: "Scope: From Single-Client App to Multi-Client Platform",
    figure:
      "Scope is Incentiva's custom app for the Nequi and Wompi field teams; Wompi went live on the same platform as Nequi, and the rollout passed 146 of 146 checks",
  },
  {
    slug: "scope-ios-launch",
    title: "Scope: First iOS Launch and 13 Store Releases",
    figure: "the first iOS release and 13 production versions on the App Store and Google Play",
  },
  {
    slug: "chatflow-whatsapp-ai-platform",
    title: "ChatFlow: Taking Over a WhatsApp AI Platform",
    figure:
      "at Incentiva Group Erick led the platform and, on it, the WhatsApp assistant of Colmaíz (Ingredion): from no tests to 3,177 automated tests; the Colmaíz assistant serves a community of 35,000+ contacts, 6,000+ served",
  },
  {
    slug: "directv-click-to-whatsapp",
    title: "DIRECTV: A Click-to-WhatsApp Sales Funnel",
    figure:
      "a sales channel for Incentiva as an authorized DIRECTV dealer (DIRECTV did not hire Erick): 7 ads and 62 creatives across six rounds",
  },
  {
    slug: "samsung-lifemiles-whatsapp",
    title: "Samsung: LifeMiles on WhatsApp, a Promotion I Led at Incentiva Group",
    figure:
      "2M+ LifeMiles miles were awarded to Galaxy S26 buyers through the WhatsApp chatbot Erick led for Samsung at Incentiva Group",
  },
  {
    slug: "incentiva-launch-campaign",
    title: "Website Launch: A Social Campaign Built in Code",
    figure: "both videos passed a 13-point QA",
  },
  {
    slug: "incentiva-website-brand",
    title: "Incentiva Group: A Corporate Website on a Redesigned Brand",
    figure: "a 28-page website on a 78-page brand manual; built, launch pending",
  },
];

/** Every project, in the order of the areas. */
export const incentivaProjects = INCENTIVA_AREAS.flatMap((area) => area.projects);
