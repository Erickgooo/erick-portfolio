// Scene (type 1): Scope's first iOS launch and its release run. App Store
// review rejects the app three times; each rejection is resolved and the app
// is approved for unlisted distribution; then the 13 production versions land
// on both stores, one after another, and the count comes up.
//
// Facts: src/app/work/projects/scope-ios-launch.mdx ("three App Store review
// rejections", "unlisted distribution", "13 versions (1.1.1 to 1.1.13)",
// "between Aug 20 and Oct 16"). Drawn in line: no store interface or logo.
// Portrait (4:5) only.
import type { CSSProperties } from "react";
import { CountUp, Scene } from "../Scene";
import s from "./storereleases.module.scss";

const REVIEWS = ["Review 1", "Review 2", "Review 3"];
const VERSIONS = Array.from({ length: 13 }, (_, k) => `1.1.${k + 1}`);

export function StoreReleases() {
  return (
    <Scene className={s.scene} steps={[800, 1500, 1500, 2400, 4400]} loop>
      <div className={s.review}>
        <span className={s.head}>
          <span className={s.label}>App Store review</span>
          <span className={s.approved}>
            <i className={s.tick} />
            approved, unlisted
          </span>
        </span>
        <ol className={s.rounds}>
          {REVIEWS.map((name, k) => (
            <li key={name} className={s.round} style={{ "--k": k } as CSSProperties}>
              <span>{name}</span>
              <span className={s.verdict}>
                <span className={s.rejected}>
                  <i className={s.cross} />
                  rejected
                </span>
                <span className={s.resolved}>
                  <i className={s.tick} />
                  resolved
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className={s.releases}>
        <span className={s.head}>
          <span className={s.label}>Production releases</span>
          <span className={s.legend}>
            <span>
              <i className={s.ios} /> iOS
            </span>
            <span>
              <i className={s.android} /> Android
            </span>
          </span>
        </span>
        <ol className={s.versions}>
          {VERSIONS.map((v, k) => (
            <li key={v} className={s.version} style={{ "--k": k } as CSSProperties}>
              <span className={s.number}>{v}</span>
              <i className={s.ios} />
              <i className={s.android} />
            </li>
          ))}
        </ol>
        <span className={s.total}>
          <CountUp value="13" at={4} className={s.value} duration={1200} />
          <span className={s.caption}>
            store releases
            <span className={s.note}>Aug 20 to Oct 16</span>
          </span>
        </span>
      </div>
    </Scene>
  );
}
