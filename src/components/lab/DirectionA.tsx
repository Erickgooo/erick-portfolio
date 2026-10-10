// THROWAWAY (lab only). Direction A, "Voice-over": the film fills the screen
// almost undimmed and the page speaks over it the way a short film does, in
// captions. One sentence per shot, each on its own opaque strip.
import { ScrollFilm } from "@/components/film/ScrollFilm";
import { FILM_BEATS, FILM_DURATION } from "@/components/film/filmMap";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CallLink, Closing } from "./Closing";
import s from "./a.module.scss";
import { CASE, voiceOver } from "./copy";

export function DirectionA() {
  return (
    <>
      <ScrollFilm
        src="/video/home-film.mp4"
        srcMobile="/video/home-film-m.mp4"
        poster="/images/film/hero.webp"
        posterMobile="/images/film/hero-m.webp"
        stills="/images/film"
        beats={FILM_BEATS}
        duration={FILM_DURATION}
        veil={{ base: 0.16, flash: 0.5 }}
        glow={false}
        progress
        stageClassName={s.stage}
      >
        <section
          data-film-beat="hero"
          className={s.beat}
          style={{ "--screens": 1.6 } as CSSProperties}
        >
          <div className={`${s.pin} ${s.hero}`}>
            <h1 className={s.title}>
              <span className={s.strip}>{voiceOver.title}</span>
            </h1>
            <p className={s.byline}>
              <span className={s.strip}>{voiceOver.byline}</span>
            </p>
            <CallLink />
          </div>
        </section>

        {voiceOver.captions.map((caption) => (
          <section
            key={caption.beat}
            data-film-beat={caption.beat}
            className={`${s.beat} ${s.fade}`}
            style={{ "--screens": 1.7 } as CSSProperties}
          >
            <div className={s.pin}>
              <p className={s.caption}>
                <span className={s.strip}>{caption.text}</span>
              </p>
              {"slug" in caption && (
                <Link href={`/work/${caption.slug}`} className={s.more}>
                  {CASE}
                </Link>
              )}
            </div>
          </section>
        ))}
      </ScrollFilm>
      <Closing />
    </>
  );
}
