// Scene (type 2): an SEO engine that writes and publishes on its own, beside
// a rebrand. In a window titled "Soro AI" an article writes itself (its
// title types, its lines fill in), is published and filed, and the next one
// starts; under it the new brand manual's pages slide in one after another:
// the palette, the type, the logo's use.
//
// Facts: src/app/work/projects/dakoma-roofing.mdx, "AI-Powered SEO
// Automation" (Soro AI, automated keyword-targeted blog publishing) and
// "Full Brand Overhaul" (a brand manual: core colour palette, typography
// system, logo usage guidelines). The two titles are generic filler,
// attributed to no one; no figures. Drawn in the site's palette, not the
// client's, with no interface or logo of the tool. Portrait (4:5) only.
import type { CSSProperties } from "react";
import { Scene, Typed, typeTime } from "../Scene";
import s from "./articleengine.module.scss";

const FIRST = "Signs your roof needs a repair";
const NEXT = "How to get a roof ready for storm season";

function Article({ title, at, className }: { title: string; at: number; className: string }) {
  return (
    <div className={`${s.article} ${className}`}>
      <span className={s.title}>
        <Typed text={title} at={at} />
      </span>
      <span className={s.body}>
        {[0, 1, 2, 3, 4].map((n) => (
          <i key={n} style={{ "--k": n } as CSSProperties} />
        ))}
      </span>
      <span className={s.publish}>
        Publish
        <span className={s.press} />
      </span>
    </div>
  );
}

export function ArticleEngine() {
  return (
    <Scene
      className={s.scene}
      steps={[700, typeTime(FIRST) + 500, 1300, 1000, 900, typeTime(NEXT) + 500, 1300, 4200]}
      loop
    >
      <div className={s.window}>
        <div className={s.bar}>
          <span className={s.name}>Soro AI</span>
          <span className={s.status}>
            <span className={s.sizer}>Published</span>
            <span className={s.draft}>Draft</span>
            <span className={s.published}>Published</span>
          </span>
        </div>
        <div className={s.stage}>
          <Article title={FIRST} at={1} className={s.first} />
          <Article title={NEXT} at={5} className={s.next} />
        </div>
        <div className={s.filed}>
          <span className={s.post} />
          <span className={s.post} />
          <span className={`${s.post} ${s.postFirst}`} />
          <span className={`${s.post} ${s.postNext}`} />
        </div>
      </div>

      <span className={s.manualName}>Brand manual</span>
      <div className={s.pages}>
        <span className={`${s.page} ${s.pagePalette}`}>
          <span className={s.swatches}>
            <i className={s.cobalt} />
            <i className={s.ink} />
            <i className={s.mist} />
          </span>
          <span className={s.lines}>
            <i />
            <i />
          </span>
        </span>
        <span className={`${s.page} ${s.pageType}`}>
          <span className={s.specimen}>Aa</span>
          <span className={s.lines}>
            <i />
            <i />
          </span>
        </span>
        <span className={`${s.page} ${s.pageLogo}`}>
          <span className={s.space}>
            <i />
          </span>
          <span className={s.lines}>
            <i />
            <i />
          </span>
        </span>
      </div>
    </Scene>
  );
}
