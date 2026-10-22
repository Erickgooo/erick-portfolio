"use client";

// Workbench, post: the share key that copies the post's address.
import { useEffect, useRef, useState } from "react";
import { FiCheck, FiLink } from "react-icons/fi";
import styles from "./blog.module.scss";

export function CopyPostLink({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2000);
  };

  return (
    <>
      <button
        type="button"
        className={styles.key}
        data-copied={state === "copied" ? "" : undefined}
        onClick={copy}
        aria-label="Copy link to this post"
      >
        {state === "copied" ? <FiCheck aria-hidden="true" /> : <FiLink aria-hidden="true" />}
      </button>
      <output className={styles.shareStatus}>
        {state === "copied" ? "Link copied" : state === "failed" ? "Could not copy the link" : ""}
      </output>
    </>
  );
}
