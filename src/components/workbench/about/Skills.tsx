// Workbench About: the technical skills, on one sheet behind a hairline.
import { about } from "@/resources";
import { inWords } from "../data";
import styles from "./skills.module.scss";

export function Skills() {
  const skills = about.skills.groups;

  return (
    <section className={styles.skills} aria-labelledby="skills-title">
      <div className={styles.inner}>
        <div className={styles.head} data-reveal="">
          <h2 id="skills-title">Technical skills</h2>
          <p>The stack behind the systems, in {inWords(skills.length)} groups.</p>
        </div>
        <div className={styles.sheet} data-reveal="">
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
