// Workbench: the featured work on the home (2026-11-03): four recent cases,
// one per kind of work (acquisition, automation, product, operations), each
// card with its category. Straight cards in a grid of two on tablets and
// desktops and four from 1280 px, rising one after another as they enter; a
// horizontal scroll-snap row on phones.
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FiArrowRight } from "react-icons/fi";
import { countProjects, getFanCards, inWords } from "../data";
import ui from "../ui.module.scss";
import styles from "./projects.module.scss";

export function Projects({ hideProtected }: { hideProtected: boolean }) {
  const cards = getFanCards({ hideProtected });

  return (
    <section id="work" className={styles.work} aria-labelledby="work-title">
      <div className={styles.inner}>
        <div className={styles.head} data-reveal="">
          <h2 id="work-title">Work on the bench</h2>
          <p>
            Recent work, one case for each part of the job: acquisition, automation, product and
            operations.
          </p>
        </div>
      </div>
      <ul className={styles.fan} data-reveal="">
        {cards.map((card, i) => (
          <li key={card.slug} className={styles.slot} style={{ "--i": i } as CSSProperties}>
            <Link href={card.href} className={styles.card} data-category={card.category}>
              <span className={styles.category}>{card.category}</span>
              <span className={styles.print}>
                <Image
                  src={card.cover.src}
                  width={card.cover.w}
                  height={card.cover.h}
                  alt={`Cover of ${card.fullTitle}`}
                  sizes="(min-width: 1280px) 290px, (min-width: 720px) 46vw, 78vw"
                />
              </span>
              <span className={styles.metric}>
                <strong>{card.value}</strong>
                <span>{card.label}</span>
              </span>
              <span className={styles.client}>{card.client}</span>
              <span className={styles.title}>{card.line ?? card.title}</span>
              <span className={styles.open}>
                Read the case <FiArrowRight aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.inner}>
        <Link href="/work" className={ui.textLink}>
          All {inWords(countProjects())} projects <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
