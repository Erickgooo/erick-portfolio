"use client";

// Workbench prose: the key beside a heading that copies a link to it. It shows
// on hover and keyboard focus, and always on touch screens, where hover never
// happens. The confirmation is announced politely and read by eye on the key.
import { useEffect, useRef, useState } from "react";
import { FiCheck, FiLink } from "react-icons/fi";
import styles from "./prose.module.scss";

export function CopyLink({ id, label }: { id: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard refused (permissions or an insecure origin): the heading
      // keeps its id, so the address bar link still works.
      window.location.hash = id;
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.copy}
        data-copied={copied ? "" : undefined}
        onClick={copy}
        aria-label={`Copy link to section: ${label}`}
      >
        {copied ? <FiCheck aria-hidden="true" /> : <FiLink aria-hidden="true" />}
      </button>
      <output className={styles.copyStatus}>{copied ? "Link copied" : ""}</output>
    </>
  );
}
