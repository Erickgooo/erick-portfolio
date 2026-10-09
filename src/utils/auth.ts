/**
 * Signed authentication tokens for password-protected routes.
 *
 * Uses the Web Crypto API only, so this module works unchanged in the Edge
 * runtime (middleware) and the Node.js runtime (route handlers).
 *
 * Token format: `<expiresAtMs>.<base64url(HMAC-SHA256(secret, expiresAtMs))>`
 * The expiry is part of the signed payload, so it cannot be extended by a client.
 */

const encoder = new TextEncoder();

export const AUTH_COOKIE = "authToken";
export const AUTH_TTL_SECONDS = 60 * 60; // 1 hour

/** Longest token we will even look at; real tokens are ~57 characters. */
const MAX_TOKEN_LENGTH = 128;

/**
 * Key material used to sign tokens. Prefer a dedicated AUTH_SECRET; fall back
 * to the page password so existing deployments keep working without extra
 * config.
 *
 * When AUTH_SECRET is set the password is mixed in as well, so changing
 * PAGE_ACCESS_PASSWORD immediately invalidates every session issued under the
 * old one instead of leaving them valid until they expire.
 */
function getSecret(): string | null {
  const password = process.env.PAGE_ACCESS_PASSWORD;
  const authSecret = process.env.AUTH_SECRET;

  if (authSecret) return `${authSecret}:${password ?? ""}`;
  return password ? password : null;
}

function base64UrlEncode(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Create a signed token valid for AUTH_TTL_SECONDS. Returns null if no secret is configured. */
export async function createAuthToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const expiresAt = String(Date.now() + AUTH_TTL_SECONDS * 1000);
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(expiresAt));

  return `${expiresAt}.${base64UrlEncode(signature)}`;
}

/** Verify a token's signature and expiry. Never throws. */
export async function verifyAuthToken(token: string | undefined | null): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token || token.length > MAX_TOKEN_LENGTH) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const expiresAt = token.slice(0, separator);
  if (!/^[0-9]{1,16}$/.test(expiresAt)) return false;

  const signature = base64UrlDecode(token.slice(separator + 1));
  if (!signature) return false;

  const key = await getKey(secret);
  // crypto.subtle.verify compares the MAC in constant time.
  const validSignature = await crypto.subtle.verify(
    "HMAC",
    key,
    signature as unknown as ArrayBuffer,
    encoder.encode(expiresAt),
  );
  if (!validSignature) return false;

  const expiry = Number(expiresAt);
  return Number.isFinite(expiry) && expiry > Date.now();
}

/**
 * Compare two secrets without leaking their contents through timing.
 * Both values are hashed first, so the comparison always runs over 32 bytes
 * regardless of input length.
 */
export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);

  const bytesA = new Uint8Array(hashA);
  const bytesB = new Uint8Array(hashB);

  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) {
    diff |= bytesA[i] ^ bytesB[i];
  }
  return diff === 0;
}
