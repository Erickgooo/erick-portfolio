// THROWAWAY (lab only). Direction C, "Department of one": the film plays with
// nothing on it, and between its shots a black title card names one seat of the
// department and what I did in it.
import { ScrollFilm } from "@/components/film/ScrollFilm";
import { FILM_DURATION, type FilmBeat } from "@/components/film/filmMap";
import Link from "next/link";
import { type CSSProperties, Fragment } from "react";
import { CallLink, Closing } from "./Closing";
import s from "./c.module.scss";
import { CASE, department } from "./copy";

// One clean stretch of film after the hero and after each card but the last,
// which is followed by the stretch that ends the film.
const BEATS: FilmBeat[] = [
  { id: "hero", start: 0, end: 3.17 },
  { id: "after-1", start: 3.17, end: 7.03, still: "tagline" },
  { id: "after-2", start: 7.03, end: 12.4, still: "solution" },
  { id: "after-3", start: 12.4, end: 15.55, still: "benefit-1" },
  { id: "after-4", start: 15.55, end: 20.77, still: "benefit-3" },
  { id: "after-5", start: 20.77, end: FILM_DURATION, still: "process" },
];

export function DirectionC() {
  return (
    <>
      <ScrollFilm
        src="/video/home-film.mp4"
        srcMobile="/video/home-film-m.mp4"
        poster="/images/film/hero.webp"
        posterMobile="/images/film/hero-m.webp"
        stills="/images/film"
        beats={BEATS}
        duration={FILM_DURATION}
        veil={{ base: 0, flash: 0.55 }}
        glow={false}
        progress
        stageClassName={s.stage}
      >
        <section data-film-beat="hero" className={s.heroBeat}>
          <div className={s.first}>
            <div className={s.band}>
              <h1 className={s.title}>{department.title}</h1>
              <div className={s.bandSide}>
                <p className={s.byline}>{department.byline}</p>
                <CallLink />
              </div>
            </div>
          </div>
        </section>

        {department.seats.map((seat, i) => (
          <Fragment key={seat.seat}>
            <section className={s.card}>
              <div className={s.cardInner}>
                <h2 className={s.seat}>{seat.seat}</h2>
                <div className={s.cardText}>
                  <p className={s.said}>{seat.text}</p>
                  <Link href={`/work/${seat.slug}`} className={s.link}>
                    {CASE}
                  </Link>
                </div>
              </div>
            </section>
            <section
              data-film-beat={`after-${i + 1}`}
              className={s.clear}
              style={{ "--screens": i === department.seats.length - 1 ? 1.6 : 1.25 } as CSSProperties}
              aria-hidden="true"
            />
          </Fragment>
        ))}
      </ScrollFilm>
      <Closing />
    </>
  );
}
