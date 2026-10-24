// Workbench: the primary action, everywhere it appears.
import { about } from "@/resources";
import { FiCalendar } from "react-icons/fi";
import styles from "./ui.module.scss";

export function BookCall({
  size = "large",
  className,
}: {
  size?: "large" | "small";
  className?: string;
}) {
  return (
    <a
      href={about.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={[styles.book, size === "small" ? styles.small : "", className ?? ""].join(" ")}
    >
      <span className={styles.bookIcon} aria-hidden="true">
        <FiCalendar />
      </span>
      Book a call
    </a>
  );
}
