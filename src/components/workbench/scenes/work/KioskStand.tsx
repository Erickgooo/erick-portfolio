// Scene (type 1): the ArquiExpo touchscreen alone, larger. A 48-hour clock
// fills once while the app is built; then the vertical screen comes on and
// runs it: a header, the grid gallery filling with its 285 tiles (the panel
// variants count up), a tap opens one panel in single-image mode, a swipe
// shows the next, and the grid returns. Two keys under the clock mark the
// mode on screen.
//
// Facts: src/app/work/projects/quick-metal-shop-arquiexpo.mdx (metric
// "48h|dev to deploy"; "Core Application Features": single-image mode and
// grid gallery mode; 285 panel variants, drawn as 285 tiles). The screen is
// KioskScreen (the canvas of the home's BoothApp), with its panels drawn in
// line: it comes on at step 3 and plays the app from step 4, on its own
// clock. Drawn in the site's palette, not the client's. Portrait (4:5) only.
import type { CSSProperties } from "react";
import { CountUp, Scene } from "../Scene";
import { KioskScreen } from "./KioskScreen";
import s from "./kioskstand.module.scss";

/** The 48 hours, one tick each, every twelfth one longer. */
const TICKS = Array.from({ length: 48 }, (_, k) => {
  const a = (k / 48) * Math.PI * 2 - Math.PI / 2;
  const inner = k % 12 === 0 ? 34 : 39;
  const r = (v: number) => Math.round(v * 100) / 100;
  return {
    id: `h${k}`,
    k,
    x1: r(50 + Math.cos(a) * inner),
    y1: r(50 + Math.sin(a) * inner),
    x2: r(50 + Math.cos(a) * 46),
    y2: r(50 + Math.sin(a) * 46),
  };
});

export function KioskStand() {
  return (
    <Scene className={s.scene} steps={[800, 2900, 500, 900, 4700, 3800, 3800]} loop>
      <div className={s.kiosk}>
        <div className={s.screen}>
          <KioskScreen className={s.canvas} line />
        </div>
        <span className={s.post} />
        <span className={s.base} />
      </div>

      <div className={s.clock}>
        <svg className={s.dial} viewBox="0 0 100 100" aria-hidden="true">
          <circle className={s.rim} cx="50" cy="50" r="49" />
          {TICKS.map((t) => (
            <line key={t.id} className={s.tick} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
          {TICKS.map((t) => (
            <line
              key={`${t.id}-lit`}
              className={s.lit}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              style={{ "--k": t.k } as CSSProperties}
            />
          ))}
        </svg>
        <span className={s.hours}>
          <CountUp value="48h" at={1} duration={2500} className={s.value} />
        </span>
      </div>
      <span className={s.clockCaption}>dev to deploy</span>

      <div className={s.count}>
        <CountUp value="285" at={4} duration={3000} className={s.countValue} />
        <span className={s.caption}>panel variants</span>
      </div>

      <div className={s.modes}>
        <span className={s.mode}>
          Grid gallery
          <span className={`${s.on} ${s.gridOn}`} />
        </span>
        <span className={s.mode}>
          Single-image
          <span className={`${s.on} ${s.singleOn}`} />
        </span>
      </div>
    </Scene>
  );
}
