// Projects, scene (type 2): a hairline counter in the page head. Its cobalt
// rule draws in, then it types each case's figure in turn, holds it, deletes
// it and types the next, for as long as it is on screen. The figures are the
// cases' own (frontmatter `metric`), the same the cards below show. It waits
// behind the site intro like the other first-screen scenes; with reduced
// motion it shows the first figure.
import { Scene, Typed } from "../Scene";
import styles from "./figurecounter.module.scss";

export function FigureCounter({ figures }: { figures: string[] }) {
  if (figures.length === 0) return null;
  return (
    <Scene className={styles.counter} steps={[700, 900]} afterIntro>
      <span className={styles.figure}>
        <Typed phrases={figures} cycle at={1} />
      </span>
      <span className={styles.rule} />
    </Scene>
  );
}
