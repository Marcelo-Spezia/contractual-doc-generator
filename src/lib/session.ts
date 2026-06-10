// Thin wrapper around NextAuth's getServerSession. The rest of the codebase reads
// the current user via getSession() and never imports NextAuth directly, so we
// can swap providers in the future without touching call-sites.
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import type { UserRole } from "./users";

export interface Session {
  email: string;
  role: UserRole;
}

export async function getSession(): Promise<Session | null> {
  const s = await getServerSession(authOptions);
  if (!s?.user?.email || !s.user?.role) return null;
  return { email: s.user.email, role: s.user.role };
}

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new Error("Unauthenticated");
  return s;
}
