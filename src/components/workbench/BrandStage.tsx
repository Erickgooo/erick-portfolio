// Workbench: the brands Erick has led projects for at Incentiva Group, as a
// stage the scroll walks through (Erick, 2026-11-02, "escenario por scroll").
//
// Desktop (from 1024 px, the tool wall's breakpoint, with motion allowed): the
// section pins, like the tool wall, and each brand takes the stage in turn,
// its official logo large, a line of what Erick led, the result in large type
// (its main figure counts up as it enters) and a link to the case; a rail of
// the four brands shows which one is on stage and scrolls to any of them.
// Phones: no pin and no rail; each brand is a large card that comes in as it
// reaches the screen. Reduced motion, at any size: no pin and no count, the
// four brands still, side by side. Every word is in the DOM from the server.
// On /work/incentiva-group, `place="index"` is a compact grid, never pinned.
//
// The logos are the files Incentiva's own website shows (sources:
// docs/design/rediseno-2026/tool-logos.md, "Brands"), at one visual area so
// none weighs more than another: 16,000 px2 on stage, scaled down elsewhere.
// Each sits on a white card, so its colours read on both themes; none is
// recoloured. DIRECTV's is the wordmark DIRECTV Latin America serves on its own
// Colombian site, and its line keeps the frame: Incentiva is an authorized dealer.
import type { StaticImageData } from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FiArrowRight } from "react-icons/fi";
import { BrandStageController } from "./BrandStageController";
import colmaiz from "./brands/colmaiz.webp";
import directv from "./brands/directv.svg";
import nequi from "./brands/nequi.webp";
import samsung from "./brands/samsung.webp";
import wompi from "./brands/wompi.webp";
import styles from "./brandstage.module.scss";
import ui from "./ui.module.scss";

type Brand = {
  name: string;
  file: StaticImageData;
  /** On-stage size, in px, from the equal-area formula (16,000 px2). */
  w: number;
  h: number;
  line: string;
  /** The result: its figure (the part that counts) and what it measures. */
  value: string;
  measure: string;
  href: string;
  /** The case, for the link's accessible name. */
  caseName: string;
};

export const BRANDS: Brand[] = [
  {
    name: "Nequi",
    file: nequi,
    w: 227,
    h: 70,
    line: "Scope, the custom field-sales app I lead at Incentiva Group for Nequi’s field teams.",
    value: "13",
    measure: "production releases · App Store and Google Play",
    href: "/work/scope-multi-client-platform",
    caseName: "Scope, from single-client app to multi-client platform",
  },
  {
    name: "Wompi",
    file: wompi,
    w: 261,
    h: 61,
    line: "Wompi went live on the same Scope platform, with its own data and roles.",
    value: "146/146",
    measure: "rollout checks passed",
    href: "/work/scope-multi-client-platform",
    caseName: "Scope, from single-client app to multi-client platform",
  },
  {
    name: "Colmaíz",
    file: colmaiz,
    w: 218,
    h: 73,
    line: "The WhatsApp AI assistant I directed on ChatFlow for Colmaíz (Ingredion).",
    value: "35,000+",
    measure: "contacts · 6,000+ served",
    href: "/work/chatflow-whatsapp-ai-platform",
    caseName: "ChatFlow, taking over a WhatsApp AI platform",
  },
  {
    name: "Samsung",
    file: samsung,
    w: 322,
    h: 50,
    line: "The WhatsApp chatbot I led for the Samsung × LifeMiles campaign.",
    value: "2M+",
    measure: "LifeMiles miles awarded through the chatbot",
    href: "/work/samsung-lifemiles-whatsapp",
    caseName: "Samsung, LifeMiles on WhatsApp",
  },
  {
    // Incentiva is an authorized DIRECTV dealer: the channel was Incentiva's
    // own, never DIRECTV hiring Erick. The figure is the case's own output.
    name: "DIRECTV",
    file: directv,
    w: 292,
    h: 55,
    line: "The click-to-WhatsApp sales channel I led for Incentiva as an authorized DIRECTV dealer.",
    value: "62",
    measure: "creatives across six rounds",
    href: "/work/directv-click-to-whatsapp",
    caseName: "DIRECTV, a click-to-WhatsApp sales funnel",
  },
];

export const BRANDS_TITLE = "Brands I’ve led projects for at Incentiva Group";

function Panel({ b, i, place }: { b: Brand; i: number; place: "home" | "index" }) {
  return (
    <div
      className={styles.panel}
      data-panel={i}
      data-state={i === 0 ? "active" : "after"}
      data-reveal=""
      style={{ "--i": i } as CSSProperties}
    >
      <h3 className={styles.logoCard}>
        <img
          className={styles.logo}
          src={b.file.src}
          width={b.w}
          height={b.h}
          style={{ "--w": b.w, "--h": b.h } as CSSProperties}
          alt={b.name}
          loading="lazy"
          decoding="async"
        />
      </h3>
      <p className={styles.line}>{b.line}</p>
      <p className={styles.result}>
        {/* The final figure sizes the box; the live one counts inside it. */}
        <strong className={styles.value} data-count={b.value}>
          <span className={styles.sizer} aria-hidden="true">
            {b.value}
          </span>
          <span className={styles.live} data-count-text="">
            {b.value}
          </span>
        </strong>
        <span className={styles.measure}>{b.measure}</span>
      </p>
      <Link href={b.href} className={`${ui.textLink} ${styles.caseLink}`}>
        See the case<span className={styles.hidden}>: {b.caseName}</span>
        <FiArrowRight aria-hidden="true" />
      </Link>
      {place === "home" ? (
        <span className={styles.count} aria-hidden="true">
          {String(i + 1).padStart(2, "0")} / {String(BRANDS.length).padStart(2, "0")}
        </span>
      ) : null}
    </div>
  );
}

export function BrandStage({ place }: { place: "home" | "index" }) {
  const titleId = `brands-${place}`;

  if (place === "index") {
    return (
      <section
        className={`${styles.stage} ${styles.compact}`}
        aria-labelledby={titleId}
        data-brand-stage="index"
      >
        <h2 id={titleId} className={styles.compactTitle}>
          {BRANDS_TITLE}
        </h2>
        <div className={styles.grid}>
          {BRANDS.map((b, i) => (
            <Panel key={b.name} b={b} i={i} place="index" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${styles.stage} ${styles.onHome}`}
      aria-labelledby={titleId}
      data-brand-stage="home"
      data-active="0"
      style={{ "--n": BRANDS.length } as CSSProperties}
    >
      <BrandStageController count={BRANDS.length} />
      <div className={styles.track} data-track="">
        <div className={styles.sticky}>
          <div className={styles.inner}>
            <div className={styles.side}>
              <h2 id={titleId} className={styles.title}>
                {BRANDS_TITLE}
              </h2>
              {/* Pinned desktop only: which brand is on stage, and a way to any of them. */}
              <ol className={styles.rail} aria-label="Brands">
                {BRANDS.map((b, i) => (
                  <li key={b.name}>
                    <button
                      type="button"
                      className={styles.railItem}
                      data-rail={i}
                      aria-current={i === 0 ? "true" : undefined}
                    >
                      <span className={styles.railIndex} aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {b.name}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
            <div className={styles.panels}>
              {BRANDS.map((b, i) => (
                <Panel key={b.name} b={b} i={i} place="home" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
