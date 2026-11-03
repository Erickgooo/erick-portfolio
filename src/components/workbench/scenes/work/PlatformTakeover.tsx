// Scene (type 1): running ChatFlow. The platform as it was taken on (no
// tests yet) becomes a repository (commits land on main), a pipeline lights
// its gates one by one, with the approval gate held a moment before it
// passes, the reviews tick, and the test count grows from none to 3,177.
//
// Facts: src/app/work/projects/chatflow-whatsapp-ai-platform.mdx ("no
// automated tests yet", "a CI/CD pipeline", "code and security reviews ...
// remediated in regular releases", "3,177 passing tests"). Drawn in line: no
// product interface. Portrait (4:5) only.
import type { CSSProperties } from "react";
import { CountUp, Scene } from "../Scene";
import s from "./platformtakeover.module.scss";

const COMMITS = ["c0", "c1", "c2", "c3", "c4", "c5"];
const GATES = ["Build", "Test", "Approve", "Deploy"];
const AUDITS = ["Code review", "Security review", "Fixes shipped"];

export function PlatformTakeover() {
  return (
    <Scene className={s.scene} steps={[900, 1300, 2200, 1500, 4400]} loop>
      <div className={s.zip}>
        <span className={s.file}>
          <i className={s.fileIcon} />
          <span>
            <span className={s.label}>The platform, taken on</span>
            <span className={s.note}>live with clients, no tests yet</span>
          </span>
        </span>
      </div>

      <div className={s.repo}>
        <span className={s.head}>
          <span className={s.label}>Repository</span>
          <span className={s.note}>parity with production</span>
        </span>
        <span className={s.branch}>
          <i className={s.trunk} />
          {COMMITS.map((id, k) => (
            <i key={id} className={s.commit} style={{ "--k": k } as CSSProperties} />
          ))}
          <span className={s.main}>main</span>
        </span>
      </div>

      <div className={s.pipeline}>
        <span className={s.label}>Pipeline</span>
        <ol className={s.gates}>
          {GATES.map((gate, k) => (
            <li
              key={gate}
              className={gate === "Approve" ? `${s.gate} ${s.hold}` : s.gate}
              style={{ "--k": k } as CSSProperties}
            >
              <i className={s.tick} />
              <span>{gate}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={s.audits}>
        {AUDITS.map((audit, k) => (
          <span key={audit} className={s.audit} style={{ "--k": k } as CSSProperties}>
            <i className={s.tick} />
            {audit}
          </span>
        ))}
        <span className={s.reviewed}>remediated in regular releases</span>
      </div>

      <div className={s.tests}>
        <CountUp value="3,177" at={4} className={s.value} duration={1600} />
        <span className={s.caption}>
          automated tests
          <span className={s.note}>from none</span>
        </span>
        <span className={s.bar}>
          <i />
        </span>
      </div>
    </Scene>
  );
}
