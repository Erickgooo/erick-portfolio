import { AUTH_COOKIE, AUTH_TTL_SECONDS, createAuthToken, timingSafeEqual } from "@/utils/auth";
import { RateLimiter, getClientIp } from "@/utils/rateLimit";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// 5 attempts per 15 minutes per IP.
const loginLimiter = new RateLimiter(5, 15 * 60 * 1000);

// Longer than any real password; bounds the work done on hostile input.
const PASSWORD_MAX_CHARS = 256;

// Fixed pause before answering a wrong password. The per-IP limiter lives in
// instance memory, so this also slows guessing that is spread across instances.
const FAILURE_DELAY_MS = 400;

const NO_STORE = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status: number, headers?: Record<string, string>) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

export async function POST(request: NextRequest) {
  const correctPassword = process.env.PAGE_ACCESS_PASSWORD;

  if (!correctPassword) {
    console.error("PAGE_ACCESS_PASSWORD environment variable is not set");
    return json({ message: "Internal server error" }, 500);
  }

  // A cross-site page can only send JSON after a CORS preflight, which this
  // route never approves — so other sites cannot submit guesses (and burn the
  // attempt budget) through a visitor's browser.
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ message: "Invalid request" }, 415);
  }

  const ip = getClientIp(request);
  const rate = loginLimiter.consume(ip);

  if (!rate.allowed) {
    return json({ message: "Too many attempts. Try again later." }, 429, {
      "Retry-After": String(rate.retryAfter),
    });
  }

  let password: unknown;
  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    return json({ message: "Invalid request" }, 400);
  }

  if (typeof password !== "string") {
    return json({ message: "Invalid request" }, 400);
  }

  const matches =
    password.length <= PASSWORD_MAX_CHARS && (await timingSafeEqual(password, correctPassword));

  if (!matches) {
    await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
    return json({ message: "Incorrect password" }, 401);
  }

  const token = await createAuthToken();
  if (!token) {
    return json({ message: "Internal server error" }, 500);
  }

  // Successful login clears the attempt counter for this IP.
  loginLimiter.reset(ip);

  const response = json({ success: true }, 200);

  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_TTL_SECONDS,
    sameSite: "strict",
    path: "/",
  });

  return response;
}
