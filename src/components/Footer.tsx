import { person, social } from "@/resources";
import { EMIcon } from "@/resources/EMIcon";
import { IconButton, Row, SmartLink, Text } from "@once-ui-system/core";
import styles from "./Footer.module.scss";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Row as="footer" className={styles.footer} fillWidth padding="8" horizontal="center" s={{ direction: "column" }}>
      <Row
        className={styles.mobile}
        maxWidth="m"
        paddingY="8"
        paddingX="16"
        gap="16"
        horizontal="between"
        vertical="center"
        s={{
          direction: "column",
          horizontal: "center",
        }}
      >
        <Text variant="body-default-s" onBackground="neutral-strong">
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              fontSize: "1.1em",
              verticalAlign: "-2px",
              marginRight: "8px",
              opacity: 0.7,
            }}
          >
            <EMIcon />
          </span>
          <Text onBackground="neutral-weak">© {currentYear} /</Text>
          <Text paddingX="4">{person.name}</Text>
          <Text onBackground="neutral-weak">
            &nbsp;/ Based on <SmartLink className={styles.link} href="https://once-ui.com/">Once UI</SmartLink> (adapted).
            Licensed under{" "}
            <SmartLink
              className={styles.link}
              href="https://creativecommons.org/licenses/by-nc/4.0/"
            >
              CC BY-NC 4.0.
            </SmartLink>
          </Text>
        </Text>
        <Row gap="16" className={styles.icons}>
          {social.map(
            (item) =>
              item.link && (
                <IconButton
                  key={item.name}
                  href={item.link}
                  icon={item.icon}
                  tooltip={item.name}
                  size="s"
                  variant="ghost"
                />
              ),
          )}
        </Row>
      </Row>
      <Row height="80" hide s={{ hide: false }} />
    </Row>
  );
};
