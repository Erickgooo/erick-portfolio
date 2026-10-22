// Scene (type 1) of the protected screen: a drawer drawn in hairline. Its
// slot fills with dots one by one, then its latch slides shut and rests. A
// drawing only (aria-hidden, no text): it sits beside the real password
// field, never wraps it, and knows nothing of its state.
import type { CSSProperties } from "react";
import { Scene } from "../Scene";
import s from "./lockeddrawer.module.scss";

/** The slot's dots, as many as a short password. */
const DOTS = Array.from({ length: 8 }, (_, k) => ({ k, id: `dot${k}` }));

/** Step 0: the drawer comes in; 1: the dots fill the slot; 2: the latch shuts, final. */
const STEPS = [600, 1700, 0];

export function LockedDrawer() {
  return (
    <div className={s.stage}>
      <Scene className={s.scene} steps={STEPS}>
        <span className={s.cabinet}>
          <span className={s.front}>
            <span className={s.handle} />
            <span className={s.slot}>
              {DOTS.map(({ k, id }) => (
                <i key={id} style={{ "--k": k } as CSSProperties} />
              ))}
            </span>
            <span className={s.keeper} />
            <span className={s.bolt} />
          </span>
        </span>
      </Scene>
    </div>
  );
}
