"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation";
import { Icon } from "@/components/lbf/icons";

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmittedEmail(data.email);
  };

  if (submittedEmail) {
    const masked = submittedEmail.replace(/^(.{1,2}).*(@.*)$/, (_, head, tail) => `${head}***${tail}`);
    return (
      <section className="card" style={{ flex: "0 1 460px", textAlign: "center" }}>
        <div className="label">Step 2 · Link sent</div>
        <span className="icon-box gold" style={{ width: 64, height: 64, borderRadius: "50%", margin: "18px auto 0" }}>
          <Icon name="mail" size={28} />
        </span>
        <h2 className="h2" style={{ marginTop: 14 }}>
          Check your inbox
        </h2>
        <p className="muted" style={{ marginTop: 6 }}>
          If an account exists for <strong style={{ color: "var(--text)" }}>{masked}</strong>, a reset link is on
          its way. It expires in 1 hour.
        </p>
        <Link href="/auth" className="btn" style={{ marginTop: 18 }}>
          Back to login
        </Link>
      </section>
    );
  }

  return (
    <section className="card" style={{ flex: "0 1 460px" }}>
      <div className="label">Step 1 · Request link</div>
      <form onSubmit={handleSubmit(onSubmit)} className="stack" style={{ gap: 16, marginTop: 14 }}>
        <label className="field">
          <span>
            Name <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" {...register("name")} />
          {errors.name && <span className="error-text">{errors.name.message}</span>}
        </label>
        <label className="field">
          <span>
            Email <span className="req" aria-hidden="true">*</span>
          </span>
          <span className="input-group">
            <Icon name="mail" size={16} />
            <input className="input" type="email" {...register("email")} />
          </span>
          {errors.email && <span className="error-text">{errors.email.message}</span>}
        </label>
        {serverError && <span className="error-text">{serverError}</span>}
        <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
        <Link href="/auth" className="small" style={{ textAlign: "center" }}>
          ← Back to login
        </Link>
      </form>
    </section>
  );
}
