const DIGITS = "0123456789";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * One frame of the decode effect: characters left of `progress` show their final
 * value; the rest scramble within their class (digit→digit, letter→A–Z).
 * Punctuation, symbols and spaces never move, so the width never changes.
 */
export function scrambleFrame(target: string, progress: number, rand: () => number): string {
  const resolved = Math.floor(target.length * Math.min(Math.max(progress, 0), 1));
  let out = "";
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    if (i < resolved) out += ch;
    else if (/\d/.test(ch)) out += DIGITS[Math.floor(rand() * DIGITS.length)];
    else if (/[a-z]/i.test(ch)) out += LETTERS[Math.floor(rand() * LETTERS.length)];
    else out += ch;
  }
  return out;
}
