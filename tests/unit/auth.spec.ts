import { createAuthToken, timingSafeEqual, verifyAuthToken } from "@/utils/auth";
import { expect, test } from "@playwright/test";

const ENV_KEYS = ["AUTH_SECRET", "PAGE_ACCESS_PASSWORD"] as const;
const saved: Record<string, string | undefined> = {};

test.beforeEach(() => {
  for (const key of ENV_KEYS) saved[key] = process.env[key];
  process.env.AUTH_SECRET = "unit-test-secret";
  process.env.PAGE_ACCESS_PASSWORD = "unit-test-password";
});

test.afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) Reflect.deleteProperty(process.env, key);
    else process.env[key] = saved[key];
  }
});

test.describe("auth tokens", () => {
  test("a freshly issued token verifies", async () => {
    const token = await createAuthToken();
    expect(token).not.toBeNull();
    expect(await verifyAuthToken(token)).toBe(true);
  });

  test("forged and malformed tokens are rejected", async () => {
    const future = Date.now() + 60_000;
    for (const forged of [
      "true",
      "",
      `${future}.`,
      `${future}.AAAA`,
      `${future}.${"A".repeat(43)}`,
      `.${"A".repeat(43)}`,
      "x".repeat(5000),
    ]) {
      expect(await verifyAuthToken(forged)).toBe(false);
    }
    expect(await verifyAuthToken(undefined)).toBe(false);
  });

  test("extending the expiry invalidates the signature", async () => {
    const token = (await createAuthToken()) as string;
    const [expiresAt, signature] = token.split(".");
    expect(await verifyAuthToken(`${Number(expiresAt) + 1}.${signature}`)).toBe(false);
  });

  test("a validly signed but expired token is rejected", async () => {
    const realNow = Date.now;
    Date.now = () => realNow() - 2 * 60 * 60 * 1000;
    const stale = await createAuthToken();
    Date.now = realNow;
    expect(await verifyAuthToken(stale)).toBe(false);
  });

  test("changing the password or the secret invalidates existing tokens", async () => {
    const token = await createAuthToken();
    process.env.PAGE_ACCESS_PASSWORD = "rotated-password";
    expect(await verifyAuthToken(token)).toBe(false);

    process.env.PAGE_ACCESS_PASSWORD = "unit-test-password";
    expect(await verifyAuthToken(token)).toBe(true);
    process.env.AUTH_SECRET = "rotated-secret";
    expect(await verifyAuthToken(token)).toBe(false);
  });

  test("no token is issued or accepted without any secret configured", async () => {
    const token = await createAuthToken();
    // Assigning undefined would store the string "undefined"; the keys must be removed.
    Reflect.deleteProperty(process.env, "AUTH_SECRET");
    Reflect.deleteProperty(process.env, "PAGE_ACCESS_PASSWORD");
    expect(await createAuthToken()).toBeNull();
    expect(await verifyAuthToken(token)).toBe(false);
  });
});

test.describe("timingSafeEqual", () => {
  test("compares by value regardless of length", async () => {
    expect(await timingSafeEqual("secret", "secret")).toBe(true);
    expect(await timingSafeEqual("secret", "secreT")).toBe(false);
    expect(await timingSafeEqual("secret", "secret-longer")).toBe(false);
    expect(await timingSafeEqual("", "secret")).toBe(false);
  });
});
