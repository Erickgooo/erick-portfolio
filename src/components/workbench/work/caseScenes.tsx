// Workbench, case study: the drawn scenes of each case (redesign 2026, step 3)
// and the part of the text they sit beside, matched by its ## heading. On
// desktop a scene is pinned in that part's margin, above its prints; on
// phones it follows the part's text. Each scene says only what the case says.
import type { ReactNode } from "react";
import { SceneSheet } from "../scenes/Scene";
import { LeadSort } from "../scenes/work/LeadSort";

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
};

export function scenesFor(slug: string, heading: string): CaseScene[] {
  return (CASE_SCENES[slug] ?? []).filter((s) => s.part.test(heading));
}
