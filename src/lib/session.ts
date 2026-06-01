// Server-only — issues + validates the signed session cookie.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { UserRole } from "./users";

export const COOKIE_NAME = "ms_sow_session";
const DEFAULT_TTL_HOURS = 8;

export interface Session {
  email: string;
  role: UserRole;
  exp: number; // unix seconds
}

function getSecret(): Buffer {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32)
    throw new Error("AUTH_SECRET is missing or too short (>=32 chars required)");
  return Buffer.from(s, "utf8");
}

function b64u(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64uDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(payload: string): string {
  return b64u(createHmac("sha256", getSecret()).update(payload).digest());
}

export function buildCookieValue(session: Omit<Session, "exp">, ttlHours = DEFAULT_TTL_HOURS): {
  value: string;
  expires: Date;
} {
  const exp = Math.floor(Date.now() / 1000) + ttlHours * 3600;
  const payload = b64u(Buffer.from(JSON.stringify({ ...session, exp }), "utf8"));
  const sig = sign(payload);
  return { value: `${payload}.${sig}`, expires: new Date(exp * 1000) };
}

export function verifyCookieValue(cookieValue: string): Session | null {
  const dot = cookieValue.indexOf(".");
  if (dot < 0) return null;
  const payload = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  const expected = sign(payload);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(b64uDecode(payload).toString("utf8")) as Session;
    if (!parsed.email || !parsed.role || !parsed.exp) return null;
    if (parsed.exp * 1000 < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const c = jar.get(COOKIE_NAME);
  return c ? verifyCookieValue(c.value) : null;
}

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new Error("Unauthenticated");
  return s;
}
