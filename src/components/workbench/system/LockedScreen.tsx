// Workbench: the protected-content screen around PasswordPrompt (the locked
// sheet itself). Above the sheet, a drawing of a locked drawer
// (scenes/system/LockedDrawer), a sibling that never touches the field; the
// sheet slides in like a drawer opening; under it, a way to ask for the
// password and a way back. It carries the Workbench scope itself, because the
// middleware rewrite keeps the protected URL, and SiteMain decides its
// wrapper by that URL.
import { profile } from "@/resources";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { SceneDriver } from "../scenes/SceneDriver";
import { LockedDrawer } from "../scenes/system/LockedDrawer";
import scope from "../scope.module.scss";
import ui from "../ui.module.scss";
import styles from "./locked.module.scss";

export function LockedScreen({ children }: { children: React.ReactNode }) {
  return (
    <section className={`${scope.scope} ${styles.locked}`}>
      <div className={styles.inner}>
        <div className={styles.drawing}>
          <LockedDrawer />
        </div>
        <div className={styles.drawer}>{children}</div>
        <div className={styles.after}>
          <p>
            Don&rsquo;t have it? Write to{" "}
            <a href={`mailto:${profile.email}`} className={styles.mail}>
              {profile.email}
            </a>
          </p>
          <Link href="/" className={ui.textLink}>
            Back to the home <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
      <SceneDriver />
    </section>
  );
}
