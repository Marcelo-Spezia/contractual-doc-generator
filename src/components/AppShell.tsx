"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { UserRole } from "@/lib/users";

export default function AppShell({
  email,
  role,
  children,
}: {
  email: string;
  role: UserRole;
  children: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand" aria-label="Making Sense — home">
          <img src="/ms-ds/assets/logo/MakingSense-Logotype.svg" alt="Making Sense" />
        </Link>
        <span className="spacer" />
        <span className="user-chip" title={`Signed in as ${email}`}>
          {email}
          {role === "admin" ? " · admin" : ""}
        </span>
        <button className="btn ghost sm" onClick={handleSignOut} disabled={busy}>
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </header>
      <main className="shell">{children}</main>
    </>
  );
}
