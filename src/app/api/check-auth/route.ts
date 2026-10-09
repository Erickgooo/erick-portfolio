import { AUTH_COOKIE, verifyAuthToken } from "@/utils/auth";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (await verifyAuthToken(token)) {
    return NextResponse.json({ authenticated: true }, { status: 200, headers: NO_STORE });
  }

  return NextResponse.json({ authenticated: false }, { status: 401, headers: NO_STORE });
}
