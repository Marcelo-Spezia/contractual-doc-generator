"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // Force a server-side re-render so the layout's session check picks up the cleared cookie.
      router.refresh();
      window.location.href = "/";
    }
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
        <button className="btn ghost sm" onClick={signOut} disabled={busy}>
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </header>
      <main className="shell">{children}</main>
    </>
  );
}
