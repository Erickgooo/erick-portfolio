// Projects, scene (type 2): a hairline counter in the page head. Once the
// cards below have come in, its cobalt rule draws in, then it types each
// case's figure in turn, holds it, deletes
// it and types the next, for as long as it is on screen. Under the rule, what
// the figure measures and the case's name fade in once the figure is typed and
// out as it starts to delete; a click or tap opens that case, and a mouse over
// the counter holds the cycle. The figures, labels and names are the cases'
// own, the same the cards below show. It waits behind the site intro like the
// other first-screen scenes; with reduced motion it shows the first figure
// with its caption.
import { Scene, Typed } from "../Scene";
import { CounterLink } from "./CounterLink";
import styles from "./figurecounter.module.scss";

export type CounterFigure = { value: string; label: string; name: string; href: string };

export function FigureCounter({ figures }: { figures: CounterFigure[] }) {
  if (figures.length === 0) return null;
  return (
    <Scene className={styles.counter} steps={[1100, 900]} afterIntro>
      <CounterLink className={styles.link} hrefs={figures.map((f) => f.href)}>
        <span className={styles.figure}>
          <Typed phrases={figures.map((f) => f.value)} cycle at={1} />
        </span>
        <span className={styles.rule} />
        <span className={styles.captions}>
          {figures.map((f, k) => (
            <span key={f.href} className={styles.caption} data-phrase={k}>
              {f.label} · {f.name}
            </span>
          ))}
        </span>
      </CounterLink>
    </Scene>
  );
}
