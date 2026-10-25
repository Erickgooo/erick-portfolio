// Workbench scenes: the stepper. From 1024 px the section pins and scrolling
// advances the steps: the active step's text lights up with a cobalt line
// that grows with the scroll, and the stage beside it crossfades to that
// step's scene, each scene on its own paper colour, so the background colour
// changes as one layer fades over the other (0.5 s). The stage itself never
// moves: the incoming scene's own entrance is the one thing that does. Below 1024 px nothing pins: each step's text is followed by its
// own scene, a plain stack, and each scene starts as it comes into view.
//
// The steps' titles are h3: put the stepper under the section's h2.
// Server-rendered; StepperController (a small client island inside) only
// writes data-active and data-on. Scenes inside the layers start when their
// step becomes active and replay each time it does after fading out (see
// Scene.tsx).
//
//   <SceneStepper
//     steps={[{ key: "bots", title: "Bots that qualify leads", text: "...", paper: "cobalt", scene: <LeadSort /> }, ...]}
//   />
//
// Scenes are drawn for the sheet's box: landscape 5:4 from 720 px, portrait
// 4:5 on phones (override with --sheet-ratio / --sheet-ratio-phone).
import type { CSSProperties, ReactNode } from "react";
import type { Paper } from "../data";
import { StepperController } from "./StepperController";
import styles from "./stepper.module.scss";

export type SceneStep = {
  key: string;
  title: ReactNode;
  text?: ReactNode;
  /** A last line under the text (e.g. who the work was for). */
  note?: ReactNode;
  paper: Paper;
  scene: ReactNode;
};

export function SceneStepper({
  steps,
  className,
  style,
}: {
  steps: SceneStep[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className ? `${styles.stepper} ${className}` : styles.stepper}
      style={{ "--n": steps.length, ...style } as CSSProperties}
      data-stepper=""
      data-active="0"
    >
      <StepperController count={steps.length} />
      <div className={styles.track} data-track="">
        <div className={styles.sticky}>
          <div className={styles.inner}>
            <div className={styles.grid}>
              {steps.map((step, i) => (
                <StepParts key={step.key} step={step} i={i} />
              ))}
              <div className={styles.stage} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepParts({ step, i }: { step: SceneStep; i: number }) {
  return (
    <>
      <div className={styles.text} data-step={i} style={{ "--row": i + 1 } as CSSProperties}>
        <h3 className={styles.title}>{step.title}</h3>
        {step.text ? <p className={styles.line}>{step.text}</p> : null}
        {step.note ? <p className={styles.note}>{step.note}</p> : null}
        <span className={styles.bar} aria-hidden="true" />
      </div>
      <div
        className={`${styles.layer} ${styles[step.paper]}`}
        data-scene-layer=""
        data-step={i}
        data-on={i === 0 ? "" : undefined}
        aria-hidden="true"
      >
        <div className={styles.sheet}>{step.scene}</div>
      </div>
    </>
  );
}
