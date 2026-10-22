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
//   and plays again from step 0 every time it does.
// - Every scene is aria-hidden: what it says must also be in the page text.
//   Its size is reserved by its own CSS (an aspect-ratio or fixed boxes), so
//   nothing it does moves the layout.
import type { CSSProperties, ReactNode } from "react";
import styles from "./scenes.module.scss";
import { TYPE_MS } from "./start";

export { TYPE_MS };

/** How long typing `text` takes, for sizing the step that types it. */
export function typeTime(text: string, ms = TYPE_MS) {
  return text.length * ms;
}

export function Scene({
  steps = [0],
  loop = false,
  afterIntro = false,
  threshold,
  className,
  style,
  children,
}: {
  steps?: number[];
  loop?: boolean;
  afterIntro?: boolean;
  /** Share of the scene on screen needed to start it (default 0.3). */
  threshold?: number;
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
      data-threshold={threshold}
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
  speed = TYPE_MS,
  caret = true,
  className,
}: {
  text?: string;
  phrases?: string[];
  at?: number;
  cycle?: boolean;
  speed?: number;
  caret?: boolean;
  className?: string;
}) {
  const list = phrases ?? (text ? [text] : []);
  return (
    <span
      className={className ? `${styles.typed} ${className}` : styles.typed}
      data-type={JSON.stringify(list)}
      data-at={at}
      data-cycle={cycle ? "" : undefined}
      data-speed={speed}
    >
      {list.map((phrase) => (
        <span key={phrase} className={styles.sizer}>
          {phrase}
        </span>
      ))}
      <span className={styles.live}>
        <span data-typed-text="" />
        {caret ? <span className={styles.caret} /> : null}
      </span>
    </span>
  );
}

/** The figure `value` as its zero ("$3.45" gives "$0.00"), the first frame of a count. */
export function zeroOf(value: string) {
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
