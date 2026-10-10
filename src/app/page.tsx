import { ScrollFilm } from "@/components/film/ScrollFilm";
import { FILM_BEATS, FILM_DURATION } from "@/components/film/filmMap";
import { Closing } from "@/components/landing/Closing";
import { Hero } from "@/components/landing/Hero";
import { Seats } from "@/components/landing/Seats";
import styles from "@/components/landing/landing.module.scss";
import { about, baseURL, home, person } from "@/resources";
import { Meta, Schema } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default function Home() {
  return (
    <div className={styles.home}>
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <ScrollFilm
        src="/video/home-film.mp4"
        srcMobile="/video/home-film-m.mp4"
        poster="/images/film/hero.webp"
        posterMobile="/images/film/hero-m.webp"
        stills="/images/film"
        beats={FILM_BEATS}
        duration={FILM_DURATION}
      >
        <Hero />
        <Seats />
      </ScrollFilm>
      <Closing />
    </div>
  );
}
