// THROWAWAY: a comparison page for Erick to pick how the Home's text should look
// and enter. Lives only on the lab/home-variants branch and its Vercel Preview;
// it is not meant to be merged.
import { FilmSection } from "@/components/film/FilmSection";
import { ScrollFilm } from "@/components/film/ScrollFilm";
import { FILM_DURATION } from "@/components/film/filmMap";
import styles from "@/components/lab/Lab.module.scss";
import { Split } from "@/components/lab/Split";
import { about, home } from "@/resources";
import { landing } from "@/resources/landing";
import Link from "next/link";

export const metadata = {
  title: "Lab: variantes de texto",
  robots: { index: false, follow: false },
};

// Three stretches of the film, one per sample section.
const BEATS = [
  { id: "hero", start: 0, end: 3.17 },
  { id: "statement", start: 7.03, end: 12.4 },
  { id: "benefit", start: 12.4, end: 15.55 },
];

const VARIANTS = [
  { id: "a", name: "Máscara editorial" },
  { id: "b", name: "Desenfoque centrado" },
  { id: "c", name: "Póster" },
] as const;

export default async function Lab({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const variant = VARIANTS.find((item) => item.id === v)?.id ?? "a";
  const benefit = landing.benefits[0];

  return (
    <div className={styles.lab} data-variant={variant}>
      <nav className={styles.switch} aria-label="Variantes">
        {VARIANTS.map((item) => (
          <Link
            key={item.id}
            href={`/lab?v=${item.id}`}
            className={styles.switchLink}
            aria-current={item.id === variant ? "page" : undefined}
          >
            {item.id.toUpperCase()}
            <span className={styles.switchName}>· {item.name}</span>
          </Link>
        ))}
      </nav>

      <ScrollFilm
        src="/video/home-film.mp4"
        srcMobile="/video/home-film-m.mp4"
        poster="/images/film/hero.webp"
        posterMobile="/images/film/hero-m.webp"
        stills="/images/film"
        beats={BEATS}
        duration={FILM_DURATION}
      >
        <FilmSection beat="hero" screens={2} fade={false}>
          <div className={`${styles.block} ${styles.hero}`}>
            <p className={styles.eyebrow}>Growth marketing &amp; AI automation</p>
            <h1 className={styles.h1}>
              <Split text={landing.hero.headline} highlight={["zero", "full", "department."]} />
            </h1>
            <p className={styles.sub}>{landing.hero.subline}</p>
            <div className={styles.action}>
              <a
                href={about.calendar.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cta}
              >
                {landing.cta.label}
                <span aria-hidden="true" className={styles.ctaArrow}>
                  →
                </span>
              </a>
              <span className={styles.risk}>{landing.hero.risk}</span>
            </div>
            <ul className={styles.stats}>
              {home.stats?.map((stat) => (
                <li key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </FilmSection>

        <FilmSection beat="statement" screens={1.75} fade={false}>
          <div className={`${styles.block} ${styles.statement} ${styles.scrolly}`}>
            <p className={`${styles.label} ${styles.rise}`}>{landing.solution.label}</p>
            <h2 className={styles.h2}>
              <Split
                text={landing.solution.text}
                highlight={["whole", "system,", "build", "running:"]}
              />
            </h2>
          </div>
        </FilmSection>

        <FilmSection beat="benefit" screens={1.75} fade={false}>
          <div className={`${styles.block} ${styles.benefit} ${styles.scrolly}`}>
            <p className={`${styles.figure} ${styles.rise}`}>
              <span className={styles.figureValue} data-value={benefit.figure}>
                {benefit.figure}
              </span>
              <span className={styles.figureUnit}>{benefit.unit}</span>
            </p>
            <div className={styles.benefitText}>
              <h2 className={styles.h3}>
                <Split text={benefit.title} />
              </h2>
              <p className={`${styles.body} ${styles.rise}`}>{benefit.body}</p>
              <Link href={`/work/${benefit.slug}`} className={`${styles.link} ${styles.rise}`}>
                {landing.caseLink}
              </Link>
            </div>
          </div>
        </FilmSection>
      </ScrollFilm>

      <div className={styles.after}>
        <p>Fin de la muestra. Cambia de variante con los botones y dime cuál prefieres.</p>
      </div>
    </div>
  );
}
