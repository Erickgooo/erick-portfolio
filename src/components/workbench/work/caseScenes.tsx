// Workbench, case study: the drawn scenes of each case (redesign 2026, steps
// 3 and 4) and the part of the text they sit beside, matched by its ##
// heading. On desktop a scene is pinned in that part's margin, above its
// prints; on phones it follows the part's text. Each scene says only what
// the case says. A MarginStepper (type 4) takes its steps from that part's
// own text (an h3 or a list item) and stacks its sheets on phones.
import type { ReactNode } from "react";
import { SceneSheet } from "../scenes/Scene";
import { AdReturn } from "../scenes/work/AdReturn";
import { ArticleEngine } from "../scenes/work/ArticleEngine";
import { BeatCuts } from "../scenes/work/BeatCuts";
import { BrandWall } from "../scenes/work/BrandWall";
import { ChatTriage } from "../scenes/work/ChatTriage";
import { KioskStand } from "../scenes/work/KioskStand";
import { LeadSort } from "../scenes/work/LeadSort";
import { MarginStepper, WideSheet } from "../scenes/work/MarginStepper";
import {
  BrandManualStep,
  LeadRouteStep,
  LinkedInStep,
  PixelStep,
  SeoStep,
} from "../scenes/work/MarketingSteps";
import { PresenterBuild } from "../scenes/work/PresenterBuild";
import { PromptDeploy } from "../scenes/work/PromptDeploy";
import { ReelBuild } from "../scenes/work/ReelBuild";

export type CaseScene = { id: string; part: RegExp; scene: ReactNode };

export const CASE_SCENES: Record<string, CaseScene[]> = {
  "leadbot-ai": [
    {
      id: "leadbot-chat",
      part: /^overview$/i,
      scene: (
        <SceneSheet paper="cobalt" portrait>
          <LeadSort status="Replies in seconds, 24/7" portrait />
        </SceneSheet>
      ),
    },
  ],
  "atv-riders": [
    {
      id: "atv-triage",
      part: /^building the automation system$/i,
      scene: (
        <SceneSheet paper="cobalt" portrait>
          <ChatTriage />
        </SceneSheet>
      ),
    },
  ],
  "ai-powered-ad-creatives": [
    {
      id: "ads-results",
      part: /^ad 01\b/i,
      scene: (
        <SceneSheet paper="cobalt" portrait>
          <AdReturn results />
        </SceneSheet>
      ),
    },
    {
      id: "ads-pipeline",
      part: /^behind the scenes$/i,
      scene: (
        <MarginStepper
          steps={[
            {
              key: "avatar",
              label: "Avatar creation",
              anchor: { sel: "li", text: "Avatar creation" },
              scene: <PresenterBuild stage={0} />,
            },
            {
              key: "animation",
              label: "Animation",
              anchor: { sel: "li", text: "Animation:" },
              scene: <PresenterBuild stage={1} />,
            },
            {
              key: "voice",
              label: "Voice",
              anchor: { sel: "li", text: "Voice:" },
              scene: <PresenterBuild stage={2} />,
            },
            {
              key: "post",
              label: "Post-production",
              anchor: { sel: "li", text: "Post-production" },
              scene: <PresenterBuild stage={3} />,
            },
          ]}
        />
      ),
    },
  ],
  "quick-metal-shop-viral-videos": [
    {
      id: "reel-views",
      part: /^the process\b/i,
      scene: (
        <SceneSheet paper="cobalt" portrait>
          <ReelBuild views />
        </SceneSheet>
      ),
    },
  ],
  "quick-metal-shop-arquiexpo": [
    {
      id: "kiosk-stand",
      part: /^core application features$/i,
      scene: (
        <SceneSheet paper="cobalt" portrait>
          <KioskStand />
        </SceneSheet>
      ),
    },
  ],
  "quick-metal-shop-marketing": [
    {
      id: "marketing-steps",
      part: /^strategic solution$/i,
      scene: (
        <MarginStepper
          steps={[
            {
              key: "manual",
              label: "Brand manual",
              anchor: { sel: "h3", text: "Week 1" },
              scene: <BrandManualStep />,
            },
            {
              key: "seo",
              label: "SEO automation",
              anchor: { sel: "h3", text: "SEO Automation" },
              scene: <SeoStep />,
            },
            {
              key: "linkedin",
              label: "LinkedIn with Holo AI",
              anchor: { sel: "h3", text: "Social Media" },
              scene: <LinkedInStep />,
            },
            {
              key: "pixel",
              label: "Meta Pixel on both stores",
              anchor: { sel: "li", text: "Full-Funnel Tracking" },
              scene: <PixelStep />,
            },
            {
              key: "zapier",
              label: "Zapier to Odoo CRM",
              anchor: { sel: "li", text: "CRM Automation" },
              scene: <LeadRouteStep />,
            },
          ]}
        />
      ),
    },
  ],
  "quick-metal-shop-the-brand-comes-to-life": [
    {
      id: "brand-wall",
      part: /^act one\b/i,
      scene: (
        <SceneSheet paper="cobalt" portrait>
          <BrandWall />
        </SceneSheet>
      ),
    },
    {
      id: "beat-cuts",
      part: /^act two\b/i,
      scene: (
        <WideSheet>
          <BeatCuts />
        </WideSheet>
      ),
    },
  ],
  "dakoma-roofing": [
    {
      id: "article-engine",
      part: /^strategic solution$/i,
      scene: (
        <SceneSheet paper="cobalt" portrait>
          <ArticleEngine />
        </SceneSheet>
      ),
    },
  ],
  "ai-portfolio": [
    {
      id: "prompt-deploy",
      part: /^the methodology\b/i,
      scene: (
        <SceneSheet paper="cobalt" portrait>
          <PromptDeploy />
        </SceneSheet>
      ),
    },
  ],
};

export function scenesFor(slug: string, heading: string): CaseScene[] {
  return (CASE_SCENES[slug] ?? []).filter((s) => s.part.test(heading));
}
