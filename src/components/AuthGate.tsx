"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser, setUser as persistUser, clearUser } from "@/lib/draft";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(getUser());
    setReady(true);
  }, []);

  function signIn(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim().toLowerCase();
    if (!/^[^@\s]+@makingsense\.com$/.test(v)) {
      setError("Use your @makingsense.com email address.");
      return;
    }
    persistUser(v);
    setEmail(v);
    setError("");
  }

  function signOut() {
    clearUser();
    setEmail(null);
  }

  if (!ready) return null;

  if (!email) {
    return (
      <div className="signin-wrap">
        <form className="card card-pad-lg signin fade-in" onSubmit={signIn}>
          <img
            src="/ms-ds/assets/logo/MakingSense-Logotype.svg"
            alt="Making Sense"
            className="signin-logo"
          />
          <div className="eyebrow">Internal tool</div>
          <h2 style={{ font: "var(--h2)", letterSpacing: "var(--ls-tight)", margin: "8px 0 8px" }}>
            Sign in to continue
          </h2>
          <p className="muted" style={{ font: "var(--body)", marginBottom: "var(--space-6)" }}>
            Access is scoped to Making Sense staff. We'll use your work email to label every
            document you generate.
          </p>
          <div className="field" style={{ marginBottom: "var(--space-4)" }}>
            <label htmlFor="signin-email">
              Work email <span className="req">*</span>
            </label>
            <input
              id="signin-email"
              type="email"
              value={input}
              autoFocus
              placeholder="you@makingsense.com"
              className={error ? "invalid" : ""}
              onChange={(e) => setInput(e.target.value)}
            />
            {error && <span className="err">{error}</span>}
          </div>
          <button className="btn lg" style={{ width: "100%" }} type="submit">
            Continue
          </button>
          <p className="faint" style={{ font: "var(--caption)", marginTop: "var(--space-4)", textAlign: "center" }}>
            Demo sign-in — your identity is stored locally in this browser, not verified by an IdP.
          </p>
        </form>
      </div>
    );
  }

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand" aria-label="Making Sense — home">
          <img src="/ms-ds/assets/logo/MakingSense-Logotype.svg" alt="Making Sense" />
        </Link>
        <span className="spacer" />
        <span className="user-chip" title="Signed-in user">{email}</span>
        <button className="btn ghost sm" onClick={signOut}>Sign out</button>
      </header>
      <main className="shell">{children}</main>
    </>
  );
}
