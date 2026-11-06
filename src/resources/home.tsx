// The work the home features (2026-11-03): four recent cases, one for each
// kind of work, in the order "Work on the bench" shows them. ErickBot names
// them too. The earlier cases (Quick Metal Shop, LeadBot AI and the rest)
// stay on /work.
export type HomeCategory = "Acquisition" | "Automation" | "Product" | "Operations";

type HomeFeature = {
  category: HomeCategory;
  /** The case, a slug under /work. */
  slug: string;
  /** What the card says the case is about, when it says more than the title. */
  line?: string;
};

export const homeFeatured: HomeFeature[] = [
  { category: "Acquisition", slug: "directv-click-to-whatsapp" },
  { category: "Automation", slug: "samsung-lifemiles-whatsapp" },
  { category: "Product", slug: "scope-multi-client-platform" },
  {
    category: "Operations",
    slug: "chatflow-whatsapp-ai-platform",
    line: "Running and scaling an AI platform in production: CI/CD, observability, releases and the client portal.",
  },
];
