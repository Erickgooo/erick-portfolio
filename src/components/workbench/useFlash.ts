import { useEffect, useRef, useState } from "react";

/** A value that goes back to `rest` `ms` after each `flash`: a key's brief "copied". */
export function useFlash<T>(rest: T, ms: number) {
  const [value, setValue] = useState(rest);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = (next: T) => {
    setValue(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setValue(rest), ms);
  };

  return [value, flash] as const;
}
