import { FilmSection } from "@/components/film/FilmSection";
import { landing } from "@/resources/landing";
import { isProtectedPath } from "@/resources/protectedRoutes";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Words } from "./Words";
import t from "./type.module.scss";

/**
 * The sales argument laid over the rest of the film: the problem, what Erick
 * does about it, four outcomes with their figure and case study, and how the
 * work runs. One film beat per section, so the last one ends the video. No two
 * neighbouring sections are composed alike: the statements sit in glass panels
 * on opposite sides, and the outcomes swap their figure from side to side.
 */
export function Argument() {
  return (
    <>
      <FilmSection beat="problem" screens={1.5} fade="out">
        <div className={`${t.panel} ${t.left} ${t.scrolly}`} data-panel="" data-mo-io="">
          <p className={`${t.pill} ${t.rise}`}>{landing.problem.label}</p>
          <h2 className={t.h2}>
            <Words text={landing.problem.text} emphasis={landing.problem.emphasis} />
          </h2>
        </div>
      </FilmSection>

      <FilmSection beat="solution" screens={1.5} fade="out">
        <div className={`${t.panel} ${t.right} ${t.scrolly}`} data-panel="" data-mo-io="">
          <p className={`${t.pill} ${t.rise}`}>{landing.solution.label}</p>
          <h2 className={t.h2}>
            <Words text={landing.solution.text} emphasis={landing.solution.emphasis} />
          </h2>
        </div>
      </FilmSection>

      {landing.benefits.map((benefit, i) => {
        const href = `/work/${benefit.slug}`;
        return (
          <FilmSection key={benefit.slug} beat={`benefit-${i + 1}`} screens={1.5} fade="out">
            <div
              className={`${t.benefit} ${i % 2 ? t.flip : ""} ${t.scrolly}`}
              data-benefit=""
              data-mo-io=""
            >
              <p className={t.figure}>
                {/* The outline is the real text; the fill that grows over it is decoration. */}
                <span className={t.figureValue}>
                  <span data-benefit-figure="">{benefit.figure}</span>
                  <span className={t.figureFill} data-figure-fill="" aria-hidden="true">
                    {benefit.figure}
                  </span>
                </span>
                <span className={`${t.figureUnit} ${t.rise}`}>{benefit.unit}</span>
              </p>
              <div className={t.benefitText} data-benefit-text="">
                <h2 className={t.h3}>
                  <Words text={benefit.title} />
                </h2>
                <p className={`${t.body} ${t.rise}`}>{benefit.body}</p>
                {/* Same rule as the listings: nothing on a public page points into a protected route. */}
                {!isProtectedPath(href) && (
                  <Link href={href} className={`${t.link} ${t.rise}`}>
                    {landing.caseLink}
                  </Link>
                )}
              </div>
            </div>
          </FilmSection>
        );
      })}

      <FilmSection beat="process" screens={2} fade="out">
        <div className={`${t.block} ${t.scrolly}`} data-mo-io="">
          <h2 className={t.h2}>
            <Words text={landing.process.title} />
          </h2>
          <ol className={t.steps}>
            {landing.process.steps.map((step, i) => (
              <li
                key={step.name}
                className={`${t.step} ${t.rise}`}
                data-step=""
                style={{ "--i": i } as CSSProperties}
              >
                <span className={t.stepNumber} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={t.stepName}>{step.name}</h3>
                <p className={t.stepText}>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </FilmSection>
    </>
  );
}
