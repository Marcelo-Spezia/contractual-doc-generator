"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (res.ok) {
        // The session cookie is now set; reload so the server-side layout sees it.
        window.location.reload();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || `Sign-in failed (${res.status})`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="signin-wrap">
      <form className="card card-pad-lg signin fade-in" onSubmit={submit}>
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
          Access is limited to Making Sense staff with a provisioned account. Reach out to the
          tool owner if you need access.
        </p>
        <div className="field" style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="signin-email">
            Work email <span className="req">*</span>
          </label>
          <input
            id="signin-email"
            type="email"
            value={email}
            autoFocus
            autoComplete="username"
            placeholder="you@makingsense.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field" style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="signin-password">
            Password <span className="req">*</span>
          </label>
          <input
            id="signin-password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <span className="err">{error}</span>}
        </div>
        <button className="btn lg" style={{ width: "100%" }} type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
