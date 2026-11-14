"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

type Mode = "login" | "signup";
type College = { id: string; name: string };

export function AuthTabs({ colleges }: { colleges: College[] }) {
  const searchParams = useSearchParams();
  const urlMode: Mode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(urlMode);

  // Clicking "Login"/"Sign Up" elsewhere does a client-side nav to the same
  // /auth route with a different ?mode=, which doesn't remount this
  // component — react to the param changing, not just read it once.
  const [handledUrlMode, setHandledUrlMode] = useState(urlMode);
  if (urlMode !== handledUrlMode) {
    setHandledUrlMode(urlMode);
    setMode(urlMode);
  }

  const timedOut = searchParams.get("reason") === "timeout";

  return (
    <section
      className="card"
      style={{ maxWidth: mode === "signup" ? 520 : 480, marginLeft: "auto", marginRight: "auto", marginTop: -140, position: "relative" }}
    >
      <div className="segmented" role="tablist" style={{ display: "flex", marginBottom: 24 }}>
        <button type="button" role="tab" aria-pressed={mode === "login"} style={{ flex: 1 }} onClick={() => setMode("login")}>
          Login
        </button>
        <button type="button" role="tab" aria-pressed={mode === "signup"} style={{ flex: 1 }} onClick={() => setMode("signup")}>
          Sign Up
        </button>
      </div>

      {timedOut && mode === "login" && (
        <p className="alert gold" style={{ marginBottom: 18 }}>
          You were signed out after 5 minutes of inactivity. Please log in again.
        </p>
      )}

      {mode === "login" ? (
        <LoginForm />
      ) : (
        <>
          <SignUpForm colleges={colleges} />
          <p className="small muted" style={{ textAlign: "center" }}>
            Already have an account? <Link href="/auth">Log in</Link>
          </p>
        </>
      )}
    </section>
  );
}
