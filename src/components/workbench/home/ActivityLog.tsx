// Home, scene (type 2): a window that rises and writes itself, line after
// line: the systems of "What I build" doing their jobs on their own, each
// line ticked as the next begins; then it clears and runs again while on
// screen. Every line restates a card of the section (Builds.tsx), so the
// window says nothing the page does not.
import type { CSSProperties } from "react";
import { Scene, Typed, typeTime } from "../scenes/Scene";
import styles from "./activity.module.scss";

const LINES = [
  "Every conversation sorted. Sales-ready leads passed to people.",
  "AI video shipped, no production crew.",
  "SEO article published automatically.",
  "Meta Ads running for B2B and B2C.",
];

export function ActivityLog() {
  return (
    <Scene
      className={styles.window}
      steps={[700, ...LINES.map((line) => typeTime(line) + 450), 3200]}
      loop
    >
      <div className={styles.bar}>
        <span className={styles.mark} />
        <span className={styles.name}>Activity</span>
        <span className={styles.live}>
          <i />
          Running
        </span>
      </div>
      <ol className={styles.lines}>
        {LINES.map((line, k) => (
          <li key={line} className={styles.line} style={{ "--k": k } as CSSProperties}>
            <span className={styles.check} />
            <Typed text={line} at={k + 1} className={styles.text} />
          </li>
        ))}
      </ol>
    </Scene>
  );
}
