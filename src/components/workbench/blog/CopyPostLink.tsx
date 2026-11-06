"use client";

// Workbench, post: the share key that copies the post's address.
import { FiCheck, FiLink } from "react-icons/fi";
import { useFlash } from "../useFlash";
import styles from "./blog.module.scss";

export function CopyPostLink({ url }: { url: string }) {
  const [state, flash] = useFlash<"idle" | "copied" | "failed">("idle", 2000);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      flash("copied");
    } catch {
      flash("failed");
    }
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
