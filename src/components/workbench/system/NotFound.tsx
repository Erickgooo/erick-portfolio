// Workbench: the 404. A bench with one empty spot where a print should be,
// Erick's monogram, and two ways back. Also rendered by RouteGuard (a client
// component) for disabled routes, so nothing here is server-only; it carries
// the Workbench scope itself because a disabled route may sit outside it.
import { EMIcon } from "@/resources/EMIcon";
import Link from "next/link";
import { FiArrowRight, FiHome } from "react-icons/fi";
import scope from "../scope.module.scss";
import ui from "../ui.module.scss";
import { EmptySpot } from "./EmptySpot";
import styles from "./notfound.module.scss";

export function NotFound() {
  return (
    <section className={`${scope.scope} ${styles.lost}`} aria-labelledby="lost-title">
      <div className={styles.inner}>
        <div className={styles.text}>
          <span className={styles.mark} aria-hidden="true">
            <EMIcon />
          </span>
          <p className={styles.code}>404</p>
          <h1 id="lost-title" className={styles.title}>
            Nothing on the bench here.
          </h1>
          <p className={styles.line}>
            This page hasn't been built yet. Everything else here was designed and shipped from
            zero; this URL just wasn't one of them.
          </p>
          <div className={styles.actions}>
            <Link href="/" className={ui.book}>
              <span className={ui.bookIcon} aria-hidden="true">
                <FiHome />
              </span>
              Back to the home
            </Link>
            <Link href="/work" className={ui.textLink}>
              See the projects <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <EmptySpot />
      </div>
    </section>
  );
}
