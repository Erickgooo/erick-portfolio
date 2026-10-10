import { FilmSection } from "@/components/film/FilmSection";
import { DecodeText } from "@/components/motion/DecodeText";
import { landing } from "@/resources/landing";
import { isProtectedPath } from "@/resources/protectedRoutes";
import Link from "next/link";
import styles from "./landing.module.scss";

/**
 * The sales argument laid over the rest of the film: the problem, what Erick
 * does about it, four outcomes with their figure and case study, and how the
 * work runs. One film beat per section, so the last one ends the video.
 */
export function Argument() {
  return (
    <>
      <FilmSection beat="problem" screens={1.5}>
        <div className={styles.statement}>
          <p className={styles.label}>{landing.problem.label}</p>
          <h2 className={styles.statementText}>{landing.problem.text}</h2>
        </div>
      </FilmSection>

      <FilmSection beat="solution" screens={1.5}>
        <div className={styles.statement}>
          <p className={styles.label}>{landing.solution.label}</p>
          <h2 className={styles.statementText}>{landing.solution.text}</h2>
        </div>
      </FilmSection>

      {landing.benefits.map((benefit, i) => {
        const href = `/work/${benefit.slug}`;
        return (
          <FilmSection key={benefit.slug} beat={`benefit-${i + 1}`} screens={1.5}>
            <div className={styles.benefit} data-benefit="">
              <p className={styles.figure}>
                <span className={styles.figureValue} data-benefit-figure="">
                  <DecodeText value={benefit.figure} className={styles.figureDecode} />
                </span>
                <span className={styles.figureUnit}>{benefit.unit}</span>
              </p>
              <h2 className={styles.benefitTitle}>{benefit.title}</h2>
              <p className={styles.benefitBody}>{benefit.body}</p>
              {/* Same rule as the listings: nothing on a public page points into a protected route. */}
              {!isProtectedPath(href) && (
                <Link href={href} className={styles.caseLink}>
                  {landing.caseLink}
                </Link>
              )}
            </div>
          </FilmSection>
        );
      })}

      <FilmSection beat="process" screens={2}>
        <div className={styles.process}>
          <h2 className={styles.statementText}>{landing.process.title}</h2>
          <ol className={styles.steps}>
            {landing.process.steps.map((step, i) => (
              <li key={step.name} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.stepName}>{step.name}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </FilmSection>
    </>
  );
}
