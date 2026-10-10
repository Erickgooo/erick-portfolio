import styles from "@/components/screens.module.scss";
import { Heading, Text } from "@once-ui-system/core";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className={styles.screen}>
      <Heading variant="display-strong-s" wrap="balance" align="center">
        Page not found
      </Heading>
      <Text variant="body-default-l" onBackground="neutral-weak" align="center">
        The address may be mistyped, or the page may have moved.
      </Text>
      <Link href="/" className={styles.cta}>
        Go to the homepage
      </Link>
    </section>
  );
}
