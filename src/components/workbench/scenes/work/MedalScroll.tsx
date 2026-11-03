// Scene (type 1, scrubbed): the Incentiva homepage's story, told by its medal.
// As the reader scrolls through the case's build, the official medal comes
// apart into its two pieces, the ribbon and the disc, shows its construction,
// and reassembles, one step per chapter of the homepage; scrolling back
// reverses it. Reduced motion shows it assembled, on the last chapter.
//
// Facts: src/app/work/projects/incentiva-website-brand.mdx ("a homepage told
// as a five-chapter scroll story: the problem, the idea, how we do it, the
// proof, and diagnosis", "the brand's 3D medal ... comes apart and
// reassembles as the visitor scrolls", "78-page manual", "357-file kit",
// "28 public pages"). The medal is the official mark (IncentivaMedal), moved
// as two pieces and never redrawn. Portrait (4:5) only.
import type { CSSProperties } from "react";
import { Scene } from "../Scene";
import { IncentivaMedal } from "./IncentivaMedal";
import s from "./medalscroll.module.scss";

const CHAPTERS = ["The problem", "The idea", "How we do it", "The proof", "Diagnosis"];

export function MedalScroll() {
  return (
    <Scene className={s.scene} steps={CHAPTERS.map(() => 1)} scrub>
      <div className={s.stage}>
        <i className={s.axis} />
        <i className={s.ring} />
        <IncentivaMedal className={s.medal} ribbonClass={s.ribbon} discClass={s.disc} />
      </div>

      <ol className={s.chapters}>
        {CHAPTERS.map((c, k) => (
          <li key={c} className={s.chapter} data-k={k} style={{ "--k": k } as CSSProperties}>
            <span className={s.dot} />
            {c}
          </li>
        ))}
      </ol>

      <p className={s.caption}>One medal: a 78-page manual, a 357-file kit, a 28-page site</p>
    </Scene>
  );
}
