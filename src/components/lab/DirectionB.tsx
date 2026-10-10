// THROWAWAY (lab only). Direction B, "Desk and ledger": the film plays in a
// window and the page is a written account beside it. No text ever sits on the
// footage, so the whole Home follows the light or dark theme.
import { ScrollFilm } from "@/components/film/ScrollFilm";
import { FILM_DURATION, type FilmBeat } from "@/components/film/filmMap";
import Link from "next/link";
import { CallLink, Closing } from "./Closing";
import s from "./b.module.scss";
import { CASE, ledger } from "./copy";

const BEATS: FilmBeat[] = [
  { id: "hero", start: 0, end: 3.17 },
  { id: "qms", start: 3.17, end: 9.5, still: "problem" },
  { id: "video", start: 9.5, end: 15.55, still: "benefit-1" },
  { id: "leads", start: 15.55, end: 20.77, still: "benefit-3" },
  { id: "software", start: 20.77, end: FILM_DURATION, still: "process" },
];

export function DirectionB() {
  return (
    <div className={s.b}>
      <ScrollFilm
        src="/video/home-film.mp4"
        srcMobile="/video/home-film-m.mp4"
        poster="/images/film/hero.webp"
        posterMobile="/images/film/hero-m.webp"
        stills="/images/film"
        beats={BEATS}
        duration={FILM_DURATION}
        layout="window"
        veil={{ base: 0, flash: 0.55 }}
        glow={false}
        progress
        className={s.film}
        stageClassName={s.stage}
        trackClassName={s.track}
      >
        <section data-film-beat="hero" className={`${s.entry} ${s.hero}`}>
          <h1 className={s.title}>{ledger.title}</h1>
          <p className={s.lead}>{ledger.lead}</p>
          <CallLink />
        </section>
        {ledger.entries.map((entry) => (
          <section key={entry.beat} data-film-beat={entry.beat} className={s.entry}>
            <h2 className={s.heading}>{entry.heading}</h2>
            <p className={s.body}>{entry.body}</p>
            <Link href={`/work/${entry.slug}`} className={s.link}>
              {CASE}
            </Link>
          </section>
        ))}
      </ScrollFilm>
      <Closing work="table" />
    </div>
  );
}
