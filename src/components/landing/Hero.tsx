import { landing } from "@/resources/landing";
import { CallButton } from "./CallButton";
import styles from "./landing.module.scss";

/**
 * The first screen: the film above, and docked along its bottom edge a band of
 * the page's own colour that carries the headline, the byline and the one
 * action. The words never sit on footage, and none of them waits for a script
 * or an animation. The section is taller than the screen so the film walks its
 * first shot while the band scrolls away.
 */
export function Hero() {
  return (
    <section data-film-beat="hero" className={styles.hero}>
      <div className={styles.firstScreen}>
        <div className={styles.band} data-opaque="">
          <h1 className={styles.heroTitle}>{landing.hero.title}</h1>
          <div className={styles.bandSide}>
            <p className={styles.byline}>{landing.hero.byline}</p>
            <CallButton />
          </div>
        </div>
      </div>
    </section>
  );
}
