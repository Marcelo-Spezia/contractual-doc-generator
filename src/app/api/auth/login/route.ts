import { NextResponse } from "next/server";
import { findUser } from "@/lib/users";
import { verifyPassword } from "@/lib/password";
import { buildCookieValue, COOKIE_NAME } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password)
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

  const user = await findUser(email);
  // Constant-ish-time response: same generic error whether the user is missing or the
  // password is wrong, so we don't leak which emails exist.
  if (!user || !verifyPassword(password, user.passwordHash))
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const { value, expires } = buildCookieValue({ email: user.email, role: user.role });
  const res = NextResponse.json({ email: user.email, role: user.role });
  res.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
  return res;
}
