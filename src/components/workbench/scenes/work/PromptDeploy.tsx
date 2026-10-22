// Scene (type 2): building this site with AI agents. A prompt window types
// the four steps of the method, one per line, and each is answered and
// ticked; then a deploy line runs to its end and the deploy time pops.
//
// Facts: src/app/work/projects/ai-portfolio.mdx (the four ### steps of "The
// Methodology: AI as a Development Team": Foundation Selection, Prompt
// Engineering as Specification Writing, Iterative Debugging, Continuous
// Deployment; metric "<2min|deploy time"). Set in Poppins: no monospace, no
// tool's interface or logo. Portrait (4:5) only.
import type { CSSProperties } from "react";
import { Scene, Typed, typeTime } from "../Scene";
import s from "./promptdeploy.module.scss";

const STEPS = [
  "Foundation Selection",
  "Prompt Engineering as Specification Writing",
  "Iterative Debugging",
  "Continuous Deployment",
];

export function PromptDeploy() {
  return (
    <Scene
      className={s.scene}
      steps={[700, ...STEPS.map((line) => typeTime(line) + 650), 1900, 4000]}
      loop
    >
      <div className={s.window}>
        <div className={s.bar}>
          <span className={s.dots}>
            <i />
            <i />
            <i />
          </span>
        </div>
        <ol className={s.lines}>
          {STEPS.map((line, k) => (
            <li key={line} className={s.line} style={{ "--k": k } as CSSProperties}>
              <span className={s.mark} />
              <span className={s.text}>
                <Typed text={line} at={k + 1} />
                <span className={s.reply}>
                  <i />
                  <i />
                </span>
              </span>
              <span className={s.check} />
            </li>
          ))}
        </ol>
      </div>

      <div className={s.deploy}>
        <span className={s.deployHead}>
          <span className={s.deployName}>Deploy</span>
          <span className={s.done} />
        </span>
        <span className={s.track}>
          <i />
        </span>
        <span className={s.time}>
          <span className={s.value}>&lt;2min</span>
          <span className={s.caption}>deploy time</span>
        </span>
      </div>
    </Scene>
  );
}
