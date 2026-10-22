// Scene (type 1): paid media from the concept to the budget. Two ads, one for
// consumers and one for a technical B2B audience, go from a sketched frame to
// a finished creative; the audience gathers into them; the spend comes back
// as nearly four times the coins, and the B2B ad files its leads; the two
// real results count up.
//
// Facts: src/app/work/projects/ai-powered-ad-creatives.mdx ("3.92x" purchase
// ROAS on the B2C webshop ad; "$3.45" cost per lead on the B2B ad; avatar-led
// AI creatives). The ads are generic and drawn: no platform interface, logo or
// frame of the real creatives.
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

export function AdReturn({ portrait = false }: { portrait?: boolean }) {
  return (
    <Scene
      className={portrait ? `${s.scene} ${s.portrait}` : s.scene}
      steps={[900, 1000, 1100, 1400, 1600, 3800]}
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

      <div className={`${s.tag} ${s.tagC}`}>
        <CountUp value="3.92x" at={5} className={s.value} duration={1500} />
        <span className={s.caption}>ROAS</span>
      </div>
      <div className={`${s.tag} ${s.tagB}`}>
        <CountUp value="$3.45" at={5} className={s.value} duration={1500} />
        <span className={s.caption}>cost per lead</span>
      </div>

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
