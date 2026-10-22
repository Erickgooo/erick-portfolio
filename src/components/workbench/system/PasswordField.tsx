"use client";

// Workbench: the password field of the protected-content screen, a hairline
// box on the locked sheet. It takes the same props PasswordPrompt passed to Once
// UI's PasswordInput (id, label, value, onChange, onKeyDown, errorMessage) and
// keeps its behaviour: a visible label tied to the input, the error described
// by id with aria-invalid, and a key to show or hide the password, which here
// has a name and a pressed state. The error is also a live region.
import { type ChangeEvent, type KeyboardEvent, useState } from "react";
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./locked.module.scss";

export function PasswordField({
  id,
  label,
  value,
  onChange,
  onKeyDown,
  errorMessage,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  errorMessage?: string;
}) {
  const [shown, setShown] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.input}>
        <input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          autoComplete="current-password"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage ? errorId : undefined}
        />
        <button
          type="button"
          className={styles.reveal}
          onClick={() => setShown((s) => !s)}
          aria-pressed={shown}
          aria-controls={id}
          aria-label="Show password"
        >
          {shown ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
        </button>
      </div>
      <p id={errorId} className={styles.error} role="alert">
        {errorMessage && (
          <>
            <FiAlertCircle aria-hidden="true" />
            {errorMessage}
          </>
        )}
      </p>
    </div>
  );
}
