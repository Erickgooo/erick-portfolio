"use client";

// The header key that switches between light and dark: a moon in light, a sun
// in dark. Styled by the header (see Header.module.scss).
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";
import { useTheme } from "./theme";

export function ThemeToggle({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  const [theme, setTheme] = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? HiOutlineSun : HiOutlineMoon;

  return (
    <button
      type="button"
      className={className}
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
    >
      <span className={iconClassName}>
        <Icon />
      </span>
    </button>
  );
}
