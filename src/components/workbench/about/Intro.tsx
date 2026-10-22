// Workbench About: the first screen. The name, the role and the offer are
// readable from the first frame; the photo stands beside them.
// Book a call and the resume stay on this screen.
import { about, person, social } from "@/resources/content";
import Image from "next/image";
import type { IconType } from "react-icons";
import { FiDownload, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { BookCall } from "../BookCall";
import { MEDIA } from "../media";
import ui from "../ui.module.scss";
import styles from "./intro.module.scss";

const ICONS: Record<string, IconType> = {
  github: FiGithub,
  linkedin: FiLinkedin,
  email: FiMail,
};

export function Intro() {
  const resume = about.resume?.link ?? "/resume/Erick_Mahecha_Resume.pdf";
  const links = social.filter((item) => item.link);

  return (
    <section className={styles.intro} aria-labelledby="about-title">
      <div className={styles.inner}>
        <div className={styles.text}>
          <h1 id="about-title" className={styles.name}>
            <span>Erick</span> <span>Mahecha</span>
          </h1>
          <p className={styles.role}>{person.role}</p>
          <p className={styles.lede}>
            I&rsquo;m a one-person growth department. I build complete marketing infrastructures,
            from brand identity and paid media to CRM automation, SEO systems and AI content
            production, for companies across construction, food and retail.
          </p>
          <div className={styles.actions}>
            <BookCall />
            <a href={resume} className={ui.textLink} download>
              Resume (PDF) <FiDownload aria-hidden="true" />
            </a>
          </div>
          <ul className={styles.links} aria-label="Elsewhere">
            {links.map((item) => {
              const Icon = ICONS[item.icon] ?? FiMail;
              const external = item.link.startsWith("http");
              return (
                <li key={item.name}>
                  <a
                    href={item.link}
                    className={styles.link}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    <Icon aria-hidden="true" />
                    {item.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <div className={styles.photoCol}>
          <figure className={styles.photo}>
            <Image
              src={MEDIA.avatar.src}
              width={MEDIA.avatar.w}
              height={MEDIA.avatar.h}
              alt={`Portrait of ${person.name}`}
              sizes="(min-width: 1024px) 380px, 64vw"
              priority
            />
            <figcaption>
              {person.location}
              <span>Works in {(person.languages ?? []).join(" and ")}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
