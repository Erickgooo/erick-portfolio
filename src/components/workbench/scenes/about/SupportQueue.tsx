// About, scene (type 2): a support-queue window beside the story of the crisis
// line. Three tickets arrive, labelled as the story names them (security
// incidents, fraud cases, technical failures); then a field types the question
// the story ends on, and a cobalt hairline draws under it. It clears and runs
// again while on screen. Everything it says is in the page text (about/Film.tsx).
import type { CSSProperties } from "react";
import { Scene, Typed, typeTime } from "../Scene";
import styles from "./supportqueue.module.scss";

const TICKETS = ["Security incident", "Fraud case", "Technical failure"];
const QUESTION = "What can be automated, and what’s the cost of not automating it?";

export function SupportQueue() {
  return (
    <Scene
      className={styles.window}
      steps={[700, 900, 900, 1100, typeTime(QUESTION) + 500, 900, 3200]}
      loop
    >
      <div className={styles.bar}>
        <span className={styles.mark} />
        <span className={styles.name}>Support queue</span>
        <span className={styles.count}>{TICKETS.length} open</span>
      </div>
      <ol className={styles.tickets}>
        {TICKETS.map((label, k) => (
          <li key={label} className={styles.ticket} style={{ "--k": k } as CSSProperties}>
            <span className={styles.dot} />
            <span className={styles.label}>{label}</span>
            <span className={styles.lines}>
              <i />
              <i />
            </span>
          </li>
        ))}
      </ol>
      <div className={styles.field}>
        <Typed text={QUESTION} at={4} className={styles.question} />
        <span className={styles.underline} />
      </div>
    </Scene>
  );
}
