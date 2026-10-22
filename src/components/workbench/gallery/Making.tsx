// Workbench, Visual Work: how the pieces are made (type 4). A stepper,
// pinned on desktop and a stack of step and scene on phones: a blank frame
// gets a presenter, then motion, a voice, an edit, and it is posted. No piece
// is shown. Step titles confirmed by Erick; the lines under them follow the
// pipeline lists of ai-powered-ad-creatives.mdx and
// quick-metal-shop-viral-videos.mdx.
import type { Paper } from "../data";
import { SceneStepper } from "../scenes/SceneStepper";
import { MAKING, type MakingStage, PieceMaking } from "../scenes/gallery/PieceMaking";
import styles from "./gallery.module.scss";

const LINES = [
  "The on-screen presenter is generated in Higgsfield with Nano Banana Pro.",
  "Kling 3.0 brings it to life: motion, expression and lip movement.",
  "A script written with Claude, voiced in ElevenLabs.",
  "Captions, pacing and the final pass in CapCut Pro, then posted to Instagram and Facebook.",
];

// The sheets alternate between the two surface tones.
const PAPERS: Paper[] = ["mist", "paper", "mist", "paper"];

export function Making() {
  return (
    <section className={styles.making} aria-labelledby="making-title">
      <div className={styles.makingInner}>
        <div className={styles.makingHead} data-reveal="">
          <h2 id="making-title">How the pieces are made</h2>
          <p>No studio time, no talent fees, no shoot scheduling.</p>
        </div>
        <SceneStepper
          steps={MAKING.map((step, k) => ({
            key: step.title,
            title: step.title,
            text: LINES[k],
            paper: PAPERS[k],
            scene: <PieceMaking stage={k as MakingStage} />,
          }))}
        />
      </div>
    </section>
  );
}
