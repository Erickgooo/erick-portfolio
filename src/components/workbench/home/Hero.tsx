// Workbench: the hero. Text is readable from the first frame; the objects on
// the bench beside it rise into place as the site intro lifts, over an
// ambient layer of paper bits that rises with them (BenchAmbient).
// Positioning of 2026-11-03: the umbrella title "Growth & AI Systems Lead";
// the work is the primary action, the call the secondary one, and the
// recruiter's route (Experience & Resume) a text link.
import { experience, profile } from "@/resources";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { BookCall } from "../BookCall";
import { MEDIA } from "../media";
import ui from "../ui.module.scss";
import { Bench } from "./Bench";
import { BenchAmbient } from "./BenchAmbient";
import styles from "./hero.module.scss";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <div className={styles.text}>
          <p className={styles.kicker}>Growth / AI / Systems</p>
          <p className={styles.who}>
            <Image src={MEDIA.avatar.src} width={48} height={48} alt="" className={styles.avatar} />
            <span>
              <strong>{profile.name}</strong>
              <span className={styles.role}>{profile.role}</span>
            </span>
          </p>
          <h1 id="hero-title" className={styles.title}>
            I build the systems behind business growth.
          </h1>
          <p className={styles.offer}>
            From acquisition and CRM automation to AI assistants and production software. I turn
            disconnected tools and workflows into systems teams can actually run.
          </p>
          <div className={styles.actions}>
            <Link href="/work" className={ui.book}>
              Explore my work
              <span className={ui.bookIcon} aria-hidden="true">
                <FiArrowRight />
              </span>
            </Link>
            <BookCall variant="secondary" />
            <Link href={experience.href} className={ui.textLink}>
              {experience.label} <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className={styles.benchCol}>
          <BenchAmbient />
          <Bench />
        </div>
      </div>
    </section>
  );
}
