// Workbench About: the technical skills, as one spec sheet clipped to the bench.
import { about } from "@/resources/content";
import { inWords } from "../data";
import styles from "./skills.module.scss";

export function Skills() {
  const skills = about.technical.skills;

  return (
    <section className={styles.skills} aria-labelledby="skills-title">
      <div className={styles.inner}>
        <div className={styles.head} data-reveal="">
          <h2 id="skills-title">Technical skills</h2>
          <p>The stack behind the systems, in {inWords(skills.length)} groups.</p>
        </div>
        <div className={styles.sheet} data-reveal="">
          <span className={styles.clip} aria-hidden="true" />
          <dl>
            {skills.map((skill) => (
              <div key={skill.title} className={styles.row}>
                <dt>{skill.title}</dt>
                <dd>{skill.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
