"use client";

import { PasswordField } from "@/components/workbench/system/PasswordField";
import styles from "@/components/workbench/system/locked.module.scss";
import { useState } from "react";
import { FiLock } from "react-icons/fi";

/**
 * Password form for routes gated by middleware.ts. On success the page is
 * reloaded so the request passes through the middleware again, this time
 * carrying a valid signed cookie.
 */
const PasswordPrompt: React.FC = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(undefined);

    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        window.location.reload();
        return;
      }

      if (response.status === 429) {
        setError("Too many attempts. Try again later.");
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className={styles.sheet} data-error={error ? "" : undefined}>
      <span className={styles.lock} aria-hidden="true">
        <FiLock />
      </span>
      <h1 className={styles.title}>This page is password protected</h1>
      <p className={styles.note}>Enter the password you were given to open it.</p>
      <div className={styles.slot}>
        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          errorMessage={error}
        />
        <button
          type="button"
          className={styles.submit}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Checking..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export { PasswordPrompt };
