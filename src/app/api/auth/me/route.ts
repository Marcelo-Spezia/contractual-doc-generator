import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  return NextResponse.json({ email: s.email, role: s.role, exp: s.exp });
}
