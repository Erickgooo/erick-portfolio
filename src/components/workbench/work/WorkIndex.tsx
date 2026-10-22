// Workbench, Projects: every case as a print on one long bench. Loose rows
// that keep a slight tilt on desktop, one column on phones; each print carries
// its figure as a paper tag where the case has one. Server-rendered; the only
// script is the page's reveal observer.
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FiArrowRight } from "react-icons/fi";
import { inWords } from "../data";
import { getCases } from "./cases";
import styles from "./work.module.scss";

/** How each print lies on the bench, dealt in turn. */
const TILTS = [-1.2, 0.9, -0.6, 1.1, -1, 0.5, -0.8, 1.2, -0.5];

export function WorkIndex({ hideProtected }: { hideProtected: boolean }) {
  const cases = getCases({ hideProtected });
  const count = inWords(cases.length);

  return (
    <>
      <header className={styles.head}>
        <h1 className={styles.title}>Projects</h1>
        <p className={styles.lede}>
          AI systems, automation workflows and marketing infrastructure, built and shipped.{" "}
          {count.charAt(0).toUpperCase() + count.slice(1)} cases, newest first.
        </p>
      </header>

      <section className={styles.bench} aria-label="All projects">
        <ul className={styles.grid}>
          {cases.map((c, i) => (
            <li
              key={c.slug}
              className={styles.slot}
              data-reveal=""
              style={{ "--i": i % 3, "--t": `${TILTS[i % TILTS.length]}deg` } as CSSProperties}
            >
              <article className={`${styles.card} ${styles[c.paper]}`}>
                <h2 className={styles.cardTitle}>
                  <Link href={c.href} className={styles.stretch}>
                    <span className={styles.name}>{c.name}</span>
                    {c.subtitle ? (
                      <>
                        <span className={styles.hidden}>: </span>
                        <span className={styles.sub}>{c.subtitle}</span>
                      </>
                    ) : null}
                  </Link>
                </h2>
                {c.metric ? (
                  <p className={styles.tag}>
                    <strong>{c.metric.value}</strong>
                    <span>{c.metric.label}</span>
                  </p>
                ) : null}
                <p className={styles.summary}>{c.summary}</p>
                {c.cover ? (
                  <div className={styles.print}>
                    <Image
                      src={c.cover.src}
                      width={c.cover.w}
                      height={c.cover.h}
                      alt=""
                      sizes="(min-width: 1280px) 340px, (min-width: 720px) 44vw, 86vw"
                      priority={i === 0}
                    />
                  </div>
                ) : null}
                <span className={styles.open} aria-hidden="true">
                  Read the case <FiArrowRight />
                </span>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
