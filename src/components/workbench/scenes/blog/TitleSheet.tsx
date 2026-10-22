// Blog, scene (type 2): one sheet in the page head where the newest post's
// title types itself, then a hairline draws under it; it holds, clears and
// runs again while on screen. The title and date are the post's frontmatter,
// the same the sheet below shows. It waits behind the site intro like the
// other first-screen scenes; with reduced motion it shows the full title.
import { Scene, Typed, typeTime } from "../Scene";
import styles from "./titlesheet.module.scss";

export function TitleSheet({ title, date }: { title: string; date: string }) {
  return (
    <Scene
      className={styles.sheet}
      steps={[700, 500, typeTime(title) + 400, 1000, 3600]}
      loop
      afterIntro
    >
      <span className={styles.date}>{date}</span>
      <Typed text={title} at={2} className={styles.title} />
      <span className={styles.rule} />
    </Scene>
  );
}
