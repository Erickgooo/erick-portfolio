// Scene (type 1): a brand that becomes the standard, and the software built
// when nothing exists. A brand manual opens (colours, type, pattern); its
// colours travel to a trade-show stand, where an empty touchscreen builds its
// app: a header, then a gallery grid that fills tile by tile; a tap opens one
// panel full screen, a swipe shows the next, and the grid returns.
//
// Facts: quick-metal-shop-marketing.mdx (the brand manual became the company
// standard, used for the ArquiExpo 2026 stand), quick-metal-shop-arquiexpo.mdx
// (vertical touchscreen app; grid gallery and single-image modes; 285 panel
// variants, drawn as 285 tiles) and quick-metal-shop-the-brand-comes-to-life.mdx
// (the hexagonal pattern). Drawn in the site's palette, not the client's.
import type { CSSProperties } from "react";
import { Scene } from "../Scene";
import { KioskScreen } from "./KioskScreen";
import s from "./boothapp.module.scss";

const SWATCHES = ["cobalt", "ink", "mist"] as const;

export function BoothApp({ portrait = false }: { portrait?: boolean }) {
  return (
    <Scene
      className={portrait ? `${s.scene} ${s.portrait}` : s.scene}
      steps={[900, 900, 1000, 1400, 9800]}
      loop
    >
      <div className={s.wall}>
        <span className={s.hex} />
      </div>

      <div className={s.book}>
        <span className={s.bookName}>Brand manual</span>
        <div className={s.page}>
          <span className={s.swatches}>
            {SWATCHES.map((paper, k) => (
              <i key={paper} className={s[paper]} style={{ "--k": k } as CSSProperties} />
            ))}
          </span>
          <span className={s.specimen}>Aa</span>
        </div>
        <div className={s.page}>
          <span className={s.tile} />
          <span className={s.lines}>
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>

      <span className={s.flights}>
        {SWATCHES.map((paper, k) => (
          <i key={paper} className={s[paper]} style={{ "--k": k } as CSSProperties} />
        ))}
      </span>

      <div className={s.kiosk}>
        <div className={s.screen}>
          <KioskScreen className={s.canvas} />
        </div>
        <span className={s.post} />
        <span className={s.base} />
      </div>
    </Scene>
  );
}
