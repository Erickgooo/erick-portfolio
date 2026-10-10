"use client";

import styles from "@/components/screens.module.scss";
import { Heading, IconButton, Input } from "@once-ui-system/core";
import { useState } from "react";

/**
 * Password form for routes gated by middleware.ts. On success the page is
 * reloaded so the request passes through the middleware again, this time
 * carrying a valid signed cookie.
 */
const PasswordPrompt: React.FC = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [shown, setShown] = useState(false);

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
    <div className={styles.screen}>
      <Heading variant="display-strong-s" align="center" wrap="balance">
        This page is password protected
      </Heading>
      {/* Once UI's PasswordInput names its show/hide button "eye". This is the same
          field, with a button that says what it does. */}
      <Input
        id="password"
        label="Password"
        type={shown ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        errorMessage={error}
        hasSuffix={
          <IconButton
            type="button"
            variant="ghost"
            size="s"
            icon={shown ? "eyeOff" : "eye"}
            aria-label={shown ? "Hide password" : "Show password"}
            onClick={() => setShown(!shown)}
          />
        }
      />
      <button type="button" className={styles.cta} onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Checking..." : "Submit"}
      </button>
    </div>
  );
};

export { PasswordPrompt };
