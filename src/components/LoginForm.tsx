"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const [busy, setBusy] = useState(false);

  async function continueWithGoogle() {
    setBusy(true);
    // Redirects to Google; on success comes back through /api/auth/callback/google
    // and the server-side layout picks up the new session.
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <div className="signin-wrap">
      <div className="card card-pad-lg signin fade-in">
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
          Access is limited to Making Sense staff with a provisioned account. Sign in with your
          work Google account.
        </p>
        <button
          className="btn lg"
          style={{ width: "100%" }}
          onClick={continueWithGoogle}
          disabled={busy}
        >
          {busy ? "Redirecting…" : "Continue with Google"}
        </button>
        <p className="faint" style={{ font: "var(--caption)", marginTop: "var(--space-4)", textAlign: "center" }}>
          Only @makingsense.com accounts that have been pre-authorized can access this tool.
        </p>
      </div>
    </div>
  );
}
