// Workbench, Projects: every case as a straight card in a grid of three on
// desktop, two on tablets and one column on phones; each card carries its
// cover and, where the case has one, its figure. Server-rendered; the only
// script is the page's reveal observer.
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FiArrowRight } from "react-icons/fi";
import { inWords } from "../data";
import { getCases } from "./cases";
import styles from "./work.module.scss";

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
              style={{ "--i": i % 3 } as CSSProperties}
            >
              <article className={styles.card}>
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
                  <p className={styles.metric}>
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
                      sizes="(min-width: 1280px) 380px, (min-width: 1024px) 30vw, (min-width: 720px) 44vw, 92vw"
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
