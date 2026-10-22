// Workbench: the hero. Text is readable from the first frame; the objects on
// the bench beside it rise into place as the site intro lifts, over an
// ambient layer of paper bits that rises with them (BenchAmbient).
import { person } from "@/resources/content";
import Image from "next/image";
import { FiArrowDown } from "react-icons/fi";
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
          <p className={styles.who}>
            <Image src={MEDIA.avatar.src} width={48} height={48} alt="" className={styles.avatar} />
            <span>
              <strong>{person.name}</strong>
              <span className={styles.role}>{person.role}</span>
            </span>
          </p>
          <h1 id="hero-title" className={styles.title}>
            I build marketing infrastructure from zero.
          </h1>
          <p className={styles.offer}>
            A one-person growth department for founders: AI content pipelines, CRM automation and
            paid media, plus the software itself when nothing exists yet.
          </p>
          <div className={styles.actions}>
            <BookCall />
            <a href="#work" className={ui.textLink}>
              See the work <FiArrowDown aria-hidden="true" />
            </a>
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
