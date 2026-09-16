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

export function AuthTabs({ colleges }: { colleges: College[] }) {
  const searchParams = useSearchParams();
  const initialMode: Mode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <div className="rounded-2xl border border-border bg-white p-7 shadow-sm sm:p-9">
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
              <span className="relative">{m === "login" ? "Login" : "Sign Up"}</span>
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
            <ForgotPasswordForm colleges={colleges} onBack={() => setMode("login")} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
