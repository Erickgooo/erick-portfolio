// Workbench: the closing call to action, a sheet laid on the bench.
import { person } from "@/resources/content";
import { BookCall } from "./BookCall";
import styles from "./closing.module.scss";

export function Closing({ title = "Show me where your team’s time goes." }: { title?: string }) {
  return (
    <section className={styles.closing} aria-labelledby="closing-title">
      <div className={styles.inner}>
        <div className={styles.sheet} data-reveal="">
          <h2 id="closing-title">{title}</h2>
          <p>
            On a 30-minute call we look at the work a system could be doing for you, and what it
            would take to build it.
          </p>
          <div className={styles.actions}>
            <BookCall />
            <a href={`mailto:${person.email}`} className={styles.mail}>
              Or write to {person.email}
            </a>
          </div>
        </div>
        <p className={styles.note} data-reveal="">
          {person.location} &middot; works in {(person.languages ?? []).join(" and ")}
        </p>
      </div>
    </section>
  );
}
