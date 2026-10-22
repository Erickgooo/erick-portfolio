import { PasswordPrompt } from "@/components/PasswordPrompt";
import { LockedScreen } from "@/components/workbench/system/LockedScreen";

export const metadata = {
  title: "Password required",
  robots: { index: false, follow: false },
};

/**
 * Target of the middleware rewrite for protected routes. The original URL is
 * preserved, so reloading after a successful login renders the real page.
 */
export default function Unauthorized() {
  return (
    <LockedScreen>
      <PasswordPrompt />
    </LockedScreen>
  );
}
