// Workbench: the brands Erick has led projects for at Incentiva Group (Erick,
// 2026-11-02, round 3), a static row of their official logos, each linking to
// its case. On the Home, after the hero; on /work/incentiva-group, in the head.
//
// The files are the ones Incentiva's own website shows (its incentiva/marcas
// block), copied, cropped to their visible pixels where needed and saved at
// twice their size here (sources: docs/design/rediseno-2026/tool-logos.md,
// "Brands"). Every logo covers the same area, with that block's formula: 3,740
// px2, at most 200 px wide, 64 px tall and half its natural size, so none
// weighs more than another. Each sits on a light card, so its colours read on
// both themes. DIRECTV is named in the text only: no logo file of Incentiva's
// own was found for it.
import type { StaticImageData } from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import colmaiz from "./brands/colmaiz.webp";
import nequi from "./brands/nequi.webp";
import samsung from "./brands/samsung.webp";
import wompi from "./brands/wompi.webp";
import styles from "./brandstrip.module.scss";

type Brand = {
  name: string;
  file: StaticImageData;
  /** On-screen size, in px, from the equal-area formula. */
  w: number;
  h: number;
  href: string;
  /** What the link opens, for screen readers. */
  to: string;
};

export const BRANDS: Brand[] = [
  {
    name: "Nequi",
    file: nequi,
    w: 110,
    h: 34,
    href: "/work/scope-multi-client-platform",
    to: "the Scope multi-client platform case",
  },
  {
    name: "Wompi",
    file: wompi,
    w: 126,
    h: 30,
    href: "/work/scope-multi-client-platform",
    to: "the Scope multi-client platform case",
  },
  {
    name: "Colmaíz",
    file: colmaiz,
    w: 106,
    h: 35,
    href: "/work/chatflow-whatsapp-ai-platform",
    to: "the ChatFlow case",
  },
  {
    name: "Samsung",
    file: samsung,
    w: 156,
    h: 24,
    href: "/work/samsung-lifemiles-whatsapp",
    to: "the Samsung × LifeMiles case",
  },
];

export const BRANDS_TITLE = "Brands I’ve led projects for at Incentiva Group";

/**
 * `place`: "home" is its own section, full width; "index" sits in the head of
 * /work/incentiva-group, in the text column.
 */
export function BrandStrip({ place }: { place: "home" | "index" }) {
  const titleId = `brands-${place}`;
  const list = (
    <div className={styles.box}>
      <ul className={styles.logos}>
        {BRANDS.map((b) => (
          <li key={b.name}>
            <Link href={b.href} className={styles.card}>
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
              <span className={styles.hidden}>({b.to})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  if (place === "index") {
    return (
      <div className={`${styles.strip} ${styles.inIndex}`} data-brand-strip="">
        <h2 id={titleId} className={styles.title}>
          {BRANDS_TITLE}
        </h2>
        {list}
      </div>
    );
  }

  return (
    <section
      className={`${styles.strip} ${styles.onHome}`}
      aria-labelledby={titleId}
      data-brand-strip=""
    >
      <div className={styles.inner}>
        <h2 id={titleId} className={styles.title}>
          {BRANDS_TITLE}
        </h2>
        {list}
      </div>
    </section>
  );
}
