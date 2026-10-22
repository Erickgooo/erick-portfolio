// Workbench: the projects (sober, 2026-10-22): straight cards in a grid of
// three on desktop and two on tablets, rising one after another as they
// enter (they used to fan out like a hand); a horizontal scroll-snap row on
// phones.
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FiArrowRight } from "react-icons/fi";
import { countProjects, getFanCards, inWords } from "../data";
import ui from "../ui.module.scss";
import styles from "./projects.module.scss";

export function Projects({ hideProtected }: { hideProtected: boolean }) {
  const cards = getFanCards({ hideProtected });
  const cases = inWords(cards.length);

  return (
    <section id="work" className={styles.work} aria-labelledby="work-title">
      <div className={styles.inner}>
        <div className={styles.head} data-reveal="">
          <h2 id="work-title">Work on the bench</h2>
          <p>
            {cases.charAt(0).toUpperCase() + cases.slice(1)} cases, each with the number it moved.
            Pick one up.
          </p>
        </div>
      </div>
      <ul className={styles.fan} data-reveal="">
        {cards.map((card, i) => (
          <li
            key={card.slug}
            className={styles.slot}
            style={{ "--i": i } as CSSProperties}
          >
            <Link href={card.href} className={styles.card}>
              <span className={styles.print}>
                <Image
                  src={card.cover.src}
                  width={card.cover.w}
                  height={card.cover.h}
                  alt=""
                  sizes="(min-width: 1024px) 380px, (min-width: 720px) 46vw, 78vw"
                />
              </span>
              <span className={styles.metric}>
                <strong>{card.value}</strong>
                <span>{card.label}</span>
              </span>
              <span className={styles.client}>{card.client}</span>
              <span className={styles.title}>{card.title}</span>
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
