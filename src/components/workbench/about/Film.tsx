// Workbench About: the film, and the story that starts under it. The copy is
// the About introduction from content.tsx, trimmed; every figure on the tags
// comes from it or from the work experience.
import { person } from "@/resources/content";
import type { CSSProperties } from "react";
import { FilmFrame } from "./FilmFrame";
import styles from "./film.module.scss";

/** The loop that used to open the home: 1280 x 720, H.264 (read from the file's headers). */
const FILM = {
  src: "/videohome.mp4",
  poster: "/images/videohome-poster.webp",
  w: 1280,
  h: 720,
};

const TAGS: {
  value: string;
  caption: string;
  paper: "cobalt" | "ink" | "mist" | "paper";
  r: number;
}[] = [
  {
    value: "338K+",
    caption: "organic video views at $0 ad spend, Quick Metal Shop",
    paper: "cobalt",
    r: -2.4,
  },
  {
    value: "85%",
    caption: "of conversations handled by the bot, Artesa Panadería",
    paper: "mist",
    r: 1.8,
  },
  {
    value: "48 h",
    caption: "to design, build and deploy the ArquiExpo 2026 gallery app",
    paper: "ink",
    r: -1.4,
  },
  {
    value: "2023",
    caption: "Top Performer on the Concentrix support team",
    paper: "paper",
    r: 2.2,
  },
];

export function Film() {
  return (
    <section className={styles.film} aria-labelledby="film-title">
      <div className={styles.screen}>
        <FilmFrame
          src={FILM.src}
          poster={FILM.poster}
          width={FILM.w}
          height={FILM.h}
          label={`Video of ${person.name}`}
          testId="about-video"
        />
      </div>
      <div className={styles.story}>
        <div className={styles.text}>
          <h2 id="film-title" data-reveal="">
            My entry point into marketing wasn&rsquo;t a campaign. It was a crisis line.
          </h2>
          <div className={styles.paras} data-reveal="" style={{ "--i": 1 } as CSSProperties}>
            <p>
              I spent two years at Concentrix managing security incidents, fraud cases and technical
              failures for Mercado Pago users. It taught me what most marketers never learn
              firsthand: where systems break down, how users behave under pressure, and what it
              costs a business when processes fail at scale.
            </p>
            <p>
              That pushed me toward a different kind of marketing. Not just running campaigns, but
              redesigning how businesses attract, qualify and convert customers, around one
              question: what can be automated, and what&rsquo;s the cost of not automating it?
            </p>
            <p>
              The answer has taken different shapes. An AI-powered WhatsApp chatbot that handled 85%
              of inbound conversations autonomously for Artesa. A full marketing department built
              from scratch for Quick Metal Shop, down to a trade show app deployed in 48 hours. A
              complete rebranding and content automation system for Dakoma Roofing.
            </p>
            <p>
              What connects all of it is the same approach: start with the operational reality, find
              where people spend time on work a system could handle, and build the infrastructure
              that removes that friction for good.
            </p>
          </div>
        </div>
        <ul className={styles.tags} aria-label="In figures">
          {TAGS.map((tag, i) => (
            <li
              key={tag.value}
              className={styles.tag}
              data-reveal=""
              style={{ "--i": i, "--r": `${tag.r}deg` } as CSSProperties}
            >
              <div className={`${styles.tagPaper} ${styles[tag.paper]}`}>
                <span className={styles.hole} aria-hidden="true" />
                <strong className={styles.value}>{tag.value}</strong>
                <span className={styles.caption}>{tag.caption}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
