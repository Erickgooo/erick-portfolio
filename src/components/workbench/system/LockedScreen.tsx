// Workbench: the protected-content screen around PasswordPrompt (the locked
// sheet itself). The sheet slides in like a drawer opening; under it, a way to
// ask for the password and a way back. It carries the Workbench scope itself,
// because the middleware rewrite keeps the protected URL, and SiteMain decides
// its wrapper by that URL.
import { person } from "@/resources/content";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import scope from "../scope.module.scss";
import ui from "../ui.module.scss";
import styles from "./locked.module.scss";

export function LockedScreen({ children }: { children: React.ReactNode }) {
  return (
    <section className={`${scope.scope} ${styles.locked}`}>
      <div className={styles.inner}>
        <div className={styles.drawer}>{children}</div>
        <div className={styles.after}>
          <p>
            Don&rsquo;t have it? Write to{" "}
            <a href={`mailto:${person.email}`} className={styles.mail}>
              {person.email}
            </a>
          </p>
          <Link href="/" className={ui.textLink}>
            Back to the home <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
