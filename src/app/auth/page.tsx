"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

type Mode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="rounded-2xl border border-border bg-white p-7 shadow-sm sm:p-9">
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

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === "login" ? -16 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === "login" ? 16 : -16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {mode === "login" ? <LoginForm /> : <SignUpForm />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
