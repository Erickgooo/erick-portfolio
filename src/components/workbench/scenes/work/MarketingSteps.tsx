// Scenes (type 4 steps): a marketing department built from zero, in the
// order of the case's "Strategic Solution". 1, week 1: the brand manual
// (palette, type, tone, usage); 2, SEO automation: Soro AI writes an article
// and it is published on both storefronts, the Odoo site (B2B) and the
// Shopify store (B2C); 3, LinkedIn with Holo AI: posts drafted and set into
// the company's feed; 4, the Meta Pixel on both stores, their events
// reaching one tracker; 5, the lead route: an Instant Form's lead goes
// through Zapier into the Odoo CRM. No figures: the case has none here.
//
// Facts: src/app/work/projects/quick-metal-shop-marketing.mdx, "Strategic
// Solution" (its subsections). Generic shapes with plain names: no Odoo,
// Shopify, LinkedIn, Meta or Zapier interface or logo. For a MarginStepper
// sheet (5:4, the top band left free).
import type { CSSProperties } from "react";
import { Scene } from "../Scene";
import s from "./marketingsteps.module.scss";

const k = (n: number) => ({ "--k": n }) as CSSProperties;

/** The tracker's events, lit one after another. */
const EVENTS = Array.from({ length: 12 }, (_, n) => ({ id: `e${n}`, n }));

/** Step 1: the brand manual, opened in week 1. */
export function BrandManualStep() {
  return (
    <Scene className={s.scene} steps={[700, 1000, 1100, 1100, 3200]} loop>
      <div className={s.book}>
        <div className={`${s.page} ${s.pageLeft}`}>
          <span className={s.swatches}>
            <i className={s.cobalt} style={k(0)} />
            <i className={s.ink} style={k(1)} />
            <i className={s.mist} style={k(2)} />
          </span>
          <span className={s.specimen}>Aa</span>
        </div>
        <div className={`${s.page} ${s.pageRight}`}>
          <span className={s.tone}>
            <i style={k(0)} />
            <i style={k(1)} />
            <i style={k(2)} />
          </span>
          <span className={s.usage}>
            <i />
          </span>
        </div>
      </div>
      <span className={s.week}>Week 1</span>
    </Scene>
  );
}

function Store({ name, kind, className }: { name: string; kind: string; className?: string }) {
  return (
    <div className={className ? `${s.store} ${className}` : s.store}>
      <span className={s.bar}>
        <span className={s.storeName}>{name}</span>
        <span className={s.kind}>{kind}</span>
      </span>
      <span className={s.posts}>
        <span className={`${s.post} ${s.newPost}`}>
          <i />
        </span>
        <span className={s.post}>
          <i />
        </span>
        <span className={s.post}>
          <i />
        </span>
      </span>
    </div>
  );
}

/** Step 2: Soro AI writes the article; it is published on both storefronts. */
export function SeoStep() {
  return (
    <Scene className={s.scene} steps={[700, 1300, 1000, 1200, 3200]} loop>
      <div className={s.engine}>
        <span className={s.engineName}>Soro AI</span>
        <span className={s.article}>
          <i style={k(0)} />
          <i style={k(1)} />
          <i style={k(2)} />
          <i style={k(3)} />
        </span>
      </div>
      <span className={`${s.wire} ${s.wireTop}`} />
      <span className={`${s.wire} ${s.wireBottom}`} />
      <span className={`${s.copy} ${s.copyTop}`} />
      <span className={`${s.copy} ${s.copyBottom}`} />
      <Store name="Odoo" kind="B2B" className={s.storeTop} />
      <Store name="Shopify" kind="B2C" className={s.storeBottom} />
    </Scene>
  );
}

/** Step 3: Holo AI drafts posts and they go into the company's LinkedIn feed. */
export function LinkedInStep() {
  return (
    <Scene className={s.scene} steps={[700, 1100, 1100, 1100, 3200]} loop>
      <div className={s.drafter}>
        <span className={s.engineName}>Holo AI</span>
        <span className={s.article}>
          <i style={k(0)} />
          <i style={k(1)} />
          <i style={k(2)} />
        </span>
      </div>
      <span className={s.feedWire} />
      <div className={s.feed}>
        <span className={s.feedName}>LinkedIn</span>
        {[0, 1, 2].map((n) => (
          <span key={n} className={s.feedPost} style={k(n)}>
            <i />
            <b />
          </span>
        ))}
      </div>
    </Scene>
  );
}

/** Step 4: the Meta Pixel on both stores; their events reach one tracker. */
export function PixelStep() {
  return (
    <Scene className={s.scene} steps={[700, 900, 1500, 1300, 3200]} loop>
      {[
        { name: "Odoo", kind: "B2B", side: s.left },
        { name: "Shopify", kind: "B2C", side: s.right },
      ].map((store) => (
        <div key={store.name} className={`${s.shop} ${store.side}`}>
          <span className={s.bar}>
            <span className={s.storeName}>{store.name}</span>
            <span className={s.kind}>{store.kind}</span>
          </span>
          <span className={s.lines}>
            <i />
            <i />
          </span>
          <span className={s.pixel} />
        </div>
      ))}
      <span className={`${s.drop} ${s.left}`}>
        <i />
      </span>
      <span className={`${s.drop} ${s.right}`}>
        <i />
      </span>
      <div className={s.tracker}>
        <span className={s.trackerName}>Meta Pixel</span>
        <span className={s.events}>
          {EVENTS.map((e) => (
            <i key={e.id} style={k(e.n)} />
          ))}
        </span>
      </div>
    </Scene>
  );
}

/** Step 5: an Instant Form's lead goes through Zapier into the Odoo CRM. */
export function LeadRouteStep() {
  return (
    <Scene className={s.scene} steps={[700, 1000, 1100, 1100, 3200]} loop>
      <div className={s.form}>
        <span className={s.boxName}>Instant Form</span>
        <span className={s.fields}>
          <i style={k(0)} />
          <i style={k(1)} />
          <i style={k(2)} />
        </span>
        <span className={s.submit} />
      </div>
      <span className={`${s.route} ${s.route1}`} />
      <div className={s.zap}>Zapier</div>
      <span className={`${s.route} ${s.route2}`} />
      <div className={s.crm}>
        <span className={s.boxName}>Odoo CRM</span>
        <span className={s.crmCards}>
          <span className={`${s.crmCard} ${s.lead}`}>
            <i />
          </span>
          <span className={s.crmCard}>
            <i />
          </span>
          <span className={s.crmCard}>
            <i />
          </span>
        </span>
      </div>
    </Scene>
  );
}
