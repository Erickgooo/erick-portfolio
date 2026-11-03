// Workbench: the closing call to action, a sheet laid on the bench. Two
// routes: "Book a call", the primary one, for hiring Erick, and "Experience &
// Resume", the secondary one, for reviewing his profile; the email address
// stays below them.
import { experience, profile } from "@/resources";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { BookCall } from "./BookCall";
import styles from "./closing.module.scss";
import ui from "./ui.module.scss";

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
            <Link href={experience.href} className={ui.textLink}>
              {experience.label} <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
          <a href={`mailto:${profile.email}`} className={styles.mail}>
            Or write to {profile.email}
          </a>
        </div>
        <p className={styles.note} data-reveal="">
          {profile.location} &middot; works in {(profile.languages ?? []).join(" and ")}
        </p>
      </div>
    </section>
  );
}
