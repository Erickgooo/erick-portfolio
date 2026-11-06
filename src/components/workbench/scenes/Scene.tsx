// Workbench scenes: the markup pieces. They are server components: a scene is
// plain HTML with data attributes, and SceneDriver (one client island per
// page) brings it to life, so no scene adds hydration work.
//
//   <Scene steps={[900, 1200, typeTime(reply) + 600, 2400]} loop className={s.chat}>
//     ...drawn markup, styled with the `before($n)` mixin from _scene.scss...
//     <Typed text={reply} at={2} />
//     <CountUp value="85%" at={3} />
//   </Scene>
//
// - `steps`: how long (ms) the scene stays at each step. Step 0 starts when the
//   scene starts (see start.ts); the last step is the final state, the one
//   reduced motion shows at once. With `loop`, after the last step's time the
//   content fades out, resets and plays again from step 0.
// - `afterIntro`: a hero scene, held while the site intro covers the page.
// - Inside a SceneStepper layer, a scene starts when its step becomes active
//   and plays again from step 0 every time it does after its layer had faded
//   out; back before that, it carries on where it was (SceneDriver.tsx).
// - `scrub`: the scroll, not the clock, picks the step (in both directions):
//   the step follows how far the reader is through the scene's part of the
//   text on desktop, where the scene is pinned in the margin, and through the
//   scene itself on phones (SceneDriver.tsx). No `loop`.
// - Every scene is aria-hidden: what it says must also be in the page text.
//   Its size is reserved by its own CSS (an aspect-ratio or fixed boxes), so
//   nothing it does moves the layout.
import type { CSSProperties, ReactNode } from "react";
import type { Paper } from "../data";
import styles from "./scenes.module.scss";
import { TYPE_MS } from "./start";

/** How long typing `text` takes, for sizing the step that types it. */
export function typeTime(text: string) {
  return text.length * TYPE_MS;
}

export function Scene({
  steps = [0],
  loop = false,
  afterIntro = false,
  scrub = false,
  className,
  style,
  children,
}: {
  steps?: number[];
  loop?: boolean;
  afterIntro?: boolean;
  /** The scroll picks the step instead of the clock (see above). */
  scrub?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={className ? `${styles.scene} ${className}` : styles.scene}
      style={style}
      aria-hidden="true"
      data-scene=""
      data-steps={steps.join(",")}
      data-loop={loop ? "" : undefined}
      data-after-intro={afterIntro ? "" : undefined}
      data-scrub={scrub ? "" : undefined}
    >
      <div className={styles.content}>{children}</div>
    </div>
  );
}

/**
 * Text that types itself when the scene reaches step `at`, inside a box sized
 * for the longest phrase. With several `phrases` and `cycle`, it types,
 * deletes and tries the next one for as long as the scene runs. Reduced
 * motion shows the first phrase in full.
 */
export function Typed({
  text,
  phrases,
  at = 0,
  cycle = false,
  className,
}: {
  text?: string;
  phrases?: string[];
  at?: number;
  cycle?: boolean;
  className?: string;
}) {
  const list = phrases ?? (text ? [text] : []);
  return (
    <span
      className={className ? `${styles.typed} ${className}` : styles.typed}
      data-type={JSON.stringify(list)}
      data-at={at}
      data-cycle={cycle ? "" : undefined}
    >
      {list.map((phrase) => (
        <span key={phrase} className={styles.sizer}>
          {phrase}
        </span>
      ))}
      <span className={styles.live}>
        <span data-typed-text="" />
        <span className={styles.caret} />
      </span>
    </span>
  );
}

/** The figure `value` as its zero ("$3.45" gives "$0.00"), the first frame of a count. */
function zeroOf(value: string) {
  return value.replace(/\d[\d,]*(\.\d+)?/, (n) => {
    const decimals = n.split(".")[1]?.length ?? 0;
    return (0).toFixed(decimals);
  });
}

/**
 * A figure that counts up to its real `value` (as written in the source, such
 * as "338K+", "3.92x", "$3.45" or "85%") when the scene reaches step `at`,
 * inside a box sized for the final figure. Only the final value is ever a
 * resting state. Reduced motion shows it at once.
 */
export function CountUp({
  value,
  at = 0,
  duration = 1400,
  className,
}: {
  value: string;
  at?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <span
      className={className ? `${styles.count} ${className}` : styles.count}
      data-count={value}
      data-at={at}
      data-duration={duration}
    >
      <span className={styles.sizer}>{value}</span>
      <span className={styles.live} data-count-text="">
        {zeroOf(value)}
      </span>
    </span>
  );
}

/**
 * A scene's paper outside a stepper: a coloured sheet that reserves the
 * scene's box (4:5 on phones, 5:4 from 720 px, or always 4:5 with
 * `portrait`) and gives it its container units.
 */
export function SceneSheet({
  paper,
  portrait = false,
  className,
  children,
}: {
  paper: Paper;
  portrait?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const names = [styles.sheet, styles[paper], portrait ? styles.sheetPortrait : "", className];
  return (
    <div className={names.filter(Boolean).join(" ")} aria-hidden="true">
      {children}
    </div>
  );
}
