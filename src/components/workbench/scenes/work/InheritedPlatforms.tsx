// Scene (type 1): the three platforms Erick took over at Incentiva Group. One
// after another they get version control, a pipeline and a test suite; then
// the total comes up: more than 13,000 automated tests.
//
// Facts: src/resources/incentiva.ts and the About experience ("took over
// three production platforms ... brought them under version control and
// automated pipelines, and grew their test suites to more than 13,000
// automated tests"; a field-sales app, a client portal and a WhatsApp
// AI-assistant platform). Drawn in line: no product interface. Landscape (5:4) from
// 720 px, portrait (4:5) on phones and with `portrait`.
import type { CSSProperties } from "react";
import { CountUp, Scene } from "../Scene";
import s from "./inheritedplatforms.module.scss";

const PLATFORMS = ["Field-sales app", "Client portal", "WhatsApp AI platform"];
const STAGES = ["Version control", "Pipeline", "Tests"];

export function InheritedPlatforms({ portrait = false }: { portrait?: boolean }) {
  return (
    <Scene
      className={portrait ? `${s.scene} ${s.portrait}` : s.scene}
      steps={[900, 1400, 1400, 1600, 4400]}
      loop
    >
      <ul className={s.cards}>
        {PLATFORMS.map((name, p) => (
          <li key={name} className={s.card} style={{ "--p": p } as CSSProperties}>
            <span className={s.name}>{name}</span>
            <span className={s.was}>taken over in production</span>
            <span className={s.stages}>
              {STAGES.map((stage, k) => (
                <span key={stage} className={s.stage} data-k={k}>
                  <i className={s.tick} />
                  {stage}
                </span>
              ))}
            </span>
            <span className={s.bar}>
              <i />
            </span>
          </li>
        ))}
      </ul>
      <div className={s.total}>
        <CountUp value="13,000+" at={4} className={s.value} duration={1600} />
        <span className={s.caption}>
          automated tests across the three
          <span className={s.note}>each under version control and a pipeline</span>
        </span>
      </div>
    </Scene>
  );
}
