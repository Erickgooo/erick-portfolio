import { landing } from "@/resources/landing";
import { linkableProject } from "@/utils/projects";
import { getPosts } from "@/utils/utils";
import Link from "next/link";
import { Fragment } from "react";
import styles from "./landing.module.scss";

/**
 * The department, one seat at a time. Each seat is a title card of the page's
 * own colour that slides over the film the way an intertitle does, followed by
 * a stretch of film with nothing on it. The card has no beat, so the film holds
 * its frame while the card is read; the empty stretch after it plays the next shots.
 */
export function Seats() {
  const projects = getPosts(["src", "app", "work", "projects"]);
  const last = landing.seats.length - 1;
  return (
    <>
      {landing.seats.map((seat, i) => {
        // Same rule as the listings: nothing on a public page points into a protected route.
        const project = linkableProject(projects, seat.slug);
        return (
          <Fragment key={seat.id}>
            <section className={styles.seat} data-seat={seat.id} data-opaque="">
              <div className={styles.seatInner}>
                <h2 className={styles.seatName}>{seat.name}</h2>
                <div className={styles.seatText}>
                  <p className={styles.seatSaid}>{seat.text}</p>
                  {project && (
                    <Link
                      href={`/work/${project.slug}`}
                      className={styles.textLink}
                      // Five links with the same words: the name says which case study.
                      aria-label={`${landing.caseLink}: ${project.metadata.title}`}
                    >
                      {landing.caseLink}
                    </Link>
                  )}
                </div>
              </div>
            </section>
            <div
              className={i === last ? styles.lastStretch : styles.stretch}
              data-film-beat={`after-${seat.id}`}
              aria-hidden="true"
            />
          </Fragment>
        );
      })}
    </>
  );
}
