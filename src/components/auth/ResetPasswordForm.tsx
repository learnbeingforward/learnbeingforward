"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation";
import { Icon } from "@/components/lbf/icons";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";
  const rules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One number", met: /\d/.test(password) },
    { label: "One symbol (!@#$…)", met: /[^A-Za-z0-9]/.test(password) },
  ];
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "This reset link has expired or was already used.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/auth"), 2500);
  };

  if (!token) {
    return (
      <section className="card" style={{ flex: "0 1 480px", textAlign: "center" }}>
        <p className="small muted">This reset link has expired or was already used.</p>
        <Link href="/auth/forgot-password" className="btn btn-sm" style={{ marginTop: 10 }}>
          Request a new link
        </Link>
      </section>
    );
  }

  if (done) {
    return (
      <section className="card" style={{ flex: "0 1 420px", textAlign: "center" }}>
        <span
          className="icon-box"
          style={{ width: 64, height: 64, borderRadius: "50%", margin: "18px auto 0", background: "var(--success-soft)", color: "var(--success)" }}
        >
          <Icon name="check" size={30} />
        </span>
        <h2 className="h2" style={{ marginTop: 14 }}>
          Password updated
        </h2>
        <p className="muted" style={{ marginTop: 6 }}>
          You can now log in with your new password. Redirecting you now…
        </p>
        <Link className="btn btn-primary" href="/auth" style={{ marginTop: 18 }}>
          Go to login
        </Link>
      </section>
    );
  }

  return (
    <section className="card" style={{ flex: "0 1 480px" }}>
      <form onSubmit={handleSubmit(onSubmit)} className="stack" style={{ gap: 16 }}>
        <input type="hidden" {...register("token")} />
        <label className="field">
          <span>
            New password <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" type="password" autoComplete="new-password" {...register("password")} />
        </label>
        <ul className="list small" aria-label="Password rules">
          {rules.map((r) => (
            <li key={r.label} style={{ display: "flex", gap: 8, color: r.met ? "var(--success-text)" : "var(--muted)" }}>
              <Icon name={r.met ? "check" : "x"} size={16} />
              {r.label}
            </li>
          ))}
        </ul>
        {errors.password && <span className="error-text">{errors.password.message}</span>}
        <label className="field">
          <span>
            Confirm new password <span className="req" aria-hidden="true">*</span>
          </span>
          <input
            className={`input${mismatch ? " error" : ""}`}
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {mismatch && <span className="error-text">Passwords don&apos;t match.</span>}
          {errors.confirmPassword && !mismatch && <span className="error-text">{errors.confirmPassword.message}</span>}
        </label>
        <label className="check">
          <input type="checkbox" defaultChecked /> Log me out of all other devices
        </label>
        {serverError && <span className="error-text">{serverError}</span>}
        <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
          {isSubmitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </section>
  );
}
