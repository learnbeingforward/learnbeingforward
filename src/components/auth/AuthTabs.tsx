"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

type Mode = "login" | "signup" | "forgot";
type College = { id: string; name: string };

const TAB_LABELS: Record<"login" | "signup", string> = {
  login: "Login",
  signup: "Sign Up",
};

export function AuthTabs({ colleges }: { colleges: College[] }) {
  const searchParams = useSearchParams();
  const urlMode: Mode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(urlMode);

  // Clicking "Login"/"Sign Up" in the header or footer does a client-side navigation to
  // the same /auth route with a different (or missing) ?mode= param — that doesn't remount
  // this component, so the tab needs to react to the param changing, not just read it once.
  // Adjusted during render (not in an effect) to avoid an extra render pass.
  const [handledUrlMode, setHandledUrlMode] = useState(urlMode);
  if (urlMode !== handledUrlMode) {
    setHandledUrlMode(urlMode);
    setMode(urlMode);
  }

  const timedOut = searchParams.get("reason") === "timeout";

  return (
    <div className="rounded-2xl border border-border bg-white p-7 shadow-sm sm:p-9">
      {timedOut && mode === "login" && (
        <p className="mb-5 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-indigo">
          You were signed out after 5 minutes of inactivity. Please log in again.
        </p>
      )}
      {mode !== "forgot" && (
        <div className="mb-7 grid grid-cols-2 rounded-lg bg-cream p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "relative rounded-md py-2 text-sm font-semibold transition-colors",
                mode === m ? "text-white" : "text-indigo/70 hover:text-indigo"
              )}
            >
              {mode === m && (
                <motion.span
                  layoutId="auth-tab-bg"
                  className="absolute inset-0 rounded-md bg-indigo"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{TAB_LABELS[m]}</span>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === "login" ? -16 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === "login" ? 16 : -16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {mode === "login" && (
            <>
              <LoginForm />
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="mt-4 text-sm text-muted-foreground underline hover:text-indigo"
              >
                Forgot password?
              </button>
            </>
          )}
          {mode === "signup" && <SignUpForm colleges={colleges} />}
          {mode === "forgot" && (
            <ForgotPasswordForm onBack={() => setMode("login")} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
