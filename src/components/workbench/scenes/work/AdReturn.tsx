// Scene (type 1): paid media from the concept to the budget. Two ads, one for
// consumers and one for a technical B2B audience, go from a sketched frame to
// a finished creative; the audience gathers into them; the spend comes back
// as nearly four times the coins, and the B2B ad files its leads; the two
// real results count up.
//
// Facts: src/app/work/projects/ai-powered-ad-creatives.mdx ("3.92x" purchase
// ROAS on the B2C webshop ad; "$3.45" cost per lead on the B2B ad; avatar-led
// AI creatives). The ads are generic and drawn: no platform interface, logo or
// frame of the real creatives. Sober (2026-10-22): drawn in line. With
// `results` (the case page) the tags carry every figure of the two ads'
// ResultsStats, the B2B ad's one step after the B2C ad's.
import type { CSSProperties } from "react";
import { CountUp, Scene } from "../Scene";
import s from "./adreturn.module.scss";

/** Where each member of the audience waits before joining an ad (cqi from the ad's centre). */
const AUDIENCE = [
  [-13, -19],
  [12, -22],
  [-14, 5],
  [14, 1],
  [-10, 22],
  [11, 20],
].map(([dx, dy], k) => ({ dx, dy, id: `a${k}` }));

const LEADS = ["l0", "l1", "l2", "l3", "l4", "l5"];
const COINS = ["c0", "c1", "c2", "c3"];

function Audience() {
  return (
    <span className={s.audience}>
      {AUDIENCE.map((a, k) => (
        <i
          key={a.id}
          style={{ "--dx": `${a.dx}cqi`, "--dy": `${a.dy}cqi`, "--k": k } as CSSProperties}
        />
      ))}
    </span>
  );
}

/** A figure of the results variant: the value counts up over its caption. */
function Fig({
  value,
  caption,
  at,
  main = false,
}: {
  value: string;
  caption: string;
  at: number;
  main?: boolean;
}) {
  return (
    <span className={main ? `${s.fig} ${s.figMain}` : s.fig}>
      <CountUp value={value} at={at} className={main ? s.value : s.small} duration={1500} />
      <span className={s.caption}>{caption}</span>
    </span>
  );
}

export function AdReturn({
  portrait = false,
  results = false,
}: {
  portrait?: boolean;
  /**
   * The case's version (portrait): every result of the two ads, the B2C ad's
   * first (35 purchases, $23.04 a purchase, 3.92x ROAS), then the B2B ad's
   * (260 leads, $3.45 a lead), from the ResultsStats of Ad 01 and Ad 02.
   */
  results?: boolean;
}) {
  const names = [s.scene, portrait || results ? s.portrait : "", results ? s.results : ""];
  return (
    <Scene
      className={names.filter(Boolean).join(" ")}
      steps={
        results ? [900, 1000, 1100, 1400, 1600, 1700, 3800] : [900, 1000, 1100, 1400, 1600, 3800]
      }
      loop
    >
      <div className={`${s.ad} ${s.adC}`}>
        <span className={s.label}>B2C</span>
        <span className={s.head}>
          <i />
          <b />
        </span>
        <span className={s.creative}>
          <span className={s.fill}>
            <span className={s.panel} />
          </span>
        </span>
        <span className={s.cta} />
        <Audience />
      </div>

      <div className={`${s.ad} ${s.adB}`}>
        <span className={s.label}>B2B</span>
        <span className={s.head}>
          <i />
          <b />
        </span>
        <span className={s.creative}>
          <span className={s.fill}>
            <span className={s.presenter} />
          </span>
        </span>
        <span className={s.cta} />
        <Audience />
      </div>

      {results ? (
        <>
          <div className={`${s.tag} ${s.tagC}`}>
            <Fig value="35" caption="purchases" at={5} />
            <Fig value="$23.04" caption="cost per purchase" at={5} />
            <Fig value="3.92x" caption="ROAS" at={5} main />
          </div>
          <div className={`${s.tag} ${s.tagB}`}>
            <Fig value="260" caption="leads" at={6} />
            <Fig value="$3.45" caption="cost per lead" at={6} main />
          </div>
        </>
      ) : (
        <>
          <div className={`${s.tag} ${s.tagC}`}>
            <CountUp value="3.92x" at={5} className={s.value} duration={1500} />
            <span className={s.caption}>ROAS</span>
          </div>
          <div className={`${s.tag} ${s.tagB}`}>
            <CountUp value="$3.45" at={5} className={s.value} duration={1500} />
            <span className={s.caption}>cost per lead</span>
          </div>
        </>
      )}

      <div className={s.coins}>
        <span className={s.spend} />
        <span className={s.arrow} />
        <span className={s.stack}>
          {COINS.map((id, k) => (
            <i key={id} style={{ "--k": k } as CSSProperties} />
          ))}
        </span>
      </div>

      <div className={s.leads}>
        {LEADS.map((id, k) => (
          <i key={id} style={{ "--k": k } as CSSProperties} />
        ))}
      </div>
    </Scene>
  );
}
