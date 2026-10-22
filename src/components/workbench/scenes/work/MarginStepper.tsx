// Scenes of the work, case pages: a stepper (type 4) in a case's margin. The
// steps are parts of the case's own text (an h3, a list item), so it needs no
// step copy of its own. From 1024 px the margin is pinned beside the text (the
// case's sticky margin) and, as each part of the text passes the middle of
// the screen, the sheet crossfades to that step's scene and its surface tone
// (white or pale mist, or their dark tones); the step's scene plays again
// from its start each time. Below 1024 px nothing pins: the steps' sheets
// stack after the text and each scene starts as it comes into view.
//
//   <MarginStepper steps={[{ key, label: "Avatar creation", anchor: { sel: "li", text: "Avatar creation" }, scene }, ...]} />
//
// Each step's scene is drawn for a 5:4 sheet (100 x 80 cqi) and keeps the top
// band (about 14 cqi) free for the step's name. The layers and scenes reuse
// the stepper's attributes (data-scene-layer, data-on), so SceneDriver starts
// and replays them as it does in a SceneStepper.
import type { CSSProperties, ReactNode } from "react";
import { MarginStepperController } from "./MarginStepperController";
import s from "./marginstepper.module.scss";

export type MarginStep = {
  key: string;
  /** The step's short name, drawn on its sheet (words of the case's own text). */
  label: string;
  /** The part of the text the step belongs to: the first `sel` in the section whose text includes `text`. */
  anchor: { sel: string; text: string };
  scene: ReactNode;
};

/**
 * A single scene's sheet in a case's margin, 5:4 at every width (SceneSheet
 * is 4:5 on phones), for a scene drawn landscape only.
 */
export function WideSheet({ children }: { children: ReactNode }) {
  return (
    <div className={s.wide} aria-hidden="true">
      {children}
    </div>
  );
}

export function MarginStepper({ steps }: { steps: MarginStep[] }) {
  return (
    <div
      className={s.stepper}
      style={{ "--n": steps.length } as CSSProperties}
      data-margin-stepper=""
      data-active="0"
      data-anchors={JSON.stringify(steps.map((step) => step.anchor))}
      aria-hidden="true"
    >
      <MarginStepperController />
      {steps.map((step, i) => (
        <div
          key={step.key}
          className={`${s.layer} ${i % 2 ? s.toneB : s.toneA}`}
          data-scene-layer=""
          data-step={i}
          data-on={i === 0 ? "" : undefined}
        >
          <div className={s.sheet}>
            <div className={s.head}>
              <span className={s.ticks}>
                {steps.map((other, k) => (
                  <i key={other.key} className={k === i ? s.tickOn : undefined} />
                ))}
              </span>
              <span className={s.label}>{step.label}</span>
            </div>
            {step.scene}
          </div>
        </div>
      ))}
    </div>
  );
}
