import { about } from "@/resources";
import { landing } from "@/resources/landing";
import styles from "./landing.module.scss";

/** The landing's one action. Rendered at the top and repeated at the end, never beside another CTA. */
export function CallButton() {
  return (
    <a
      href={about.calendar.link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.cta}
      data-cta="primary"
    >
      {landing.cta.label}
    </a>
  );
}
