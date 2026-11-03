// Workbench: the action for hiring Erick, everywhere it appears. It is the
// primary key (cobalt) in every closing; in the home hero, where the work
// comes first, it is the secondary key (a hairline key in the ink colour).
import { about } from "@/resources";
import { FiCalendar } from "react-icons/fi";
import styles from "./ui.module.scss";

export function BookCall({
  size = "large",
  variant = "primary",
  className,
}: {
  size?: "large" | "small";
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <a
      href={about.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        styles.book,
        variant === "secondary" ? styles.secondary : "",
        size === "small" ? styles.small : "",
        className ?? "",
      ].join(" ")}
    >
      <span className={styles.bookIcon} aria-hidden="true">
        <FiCalendar />
      </span>
      Book a call
    </a>
  );
}
