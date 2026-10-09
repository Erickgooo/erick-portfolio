import { FilmSection } from "@/components/film/FilmSection";
import { home } from "@/resources";
import { landing } from "@/resources/landing";
import { CallButton } from "./CallButton";
import styles from "./landing.module.scss";

export function Hero() {
  return (
    <FilmSection beat="hero" screens={2}>
      <div className={styles.hero}>
        <h1 className={styles.headline}>{landing.hero.headline}</h1>
        <p className={styles.subline}>{landing.hero.subline}</p>
        <div className={styles.action}>
          <CallButton />
          <span className={styles.risk}>{landing.hero.risk}</span>
        </div>
        {home.stats && home.stats.length > 0 && (
          <ul className={styles.stats}>
            {home.stats.map((stat) => (
              <li key={stat.label} className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FilmSection>
  );
}
