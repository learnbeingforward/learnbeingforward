"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { Icon } from "@/components/lbf/icons";

type SessionResponse = {
  user?: { role?: "STUDENT" | "COLLEGE_ADMIN" | "SUPER_ADMIN" | "TRAINER" | "ADMIN2" | "EMPLOYEE" };
};

function roleRedirect(role?: string) {
  if (role === "SUPER_ADMIN" || role === "ADMIN2" || role === "EMPLOYEE") return "/lms/company";
  if (role === "COLLEGE_ADMIN") return "/lms/college";
  if (role === "TRAINER") return "/lms/trainer";
  return "/lms/student";
}

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (!result || result.error) {
      setServerError("Incorrect email or password.");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session: SessionResponse = await sessionRes.json();
    router.push(roleRedirect(session.user?.role));
    router.refresh();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="stack" style={{ gap: 16 }}>
        <label className="field">
          <span>
            Email <span className="req" aria-hidden="true">*</span>
          </span>
          <span className="input-group">
            <Icon name="mail" size={16} />
            <input className="input" type="email" autoComplete="email" placeholder="you@college.edu" {...register("email")} />
          </span>
        </label>
        <label className="field">
          <span className="split">
            Password <span className="req" aria-hidden="true">*</span>
            <Link href="/auth/forgot-password" className="small" style={{ marginLeft: "auto" }}>
              Forgot password?
            </Link>
          </span>
          <span className="input-group">
            <Icon name="lock" size={16} />
            <input className="input" type="password" autoComplete="current-password" {...register("password")} />
          </span>
        </label>
        <label className="check">
          <input type="checkbox" /> Keep me signed in on this device
        </label>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      {serverError && (
        <div className="alert danger" role="alert" style={{ marginTop: 18 }}>
          <Icon name="x" size={18} className="shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <hr className="divider" />
      <p className="small muted" style={{ textAlign: "center" }}>
        Colleges and companies get accounts from Learn Being Forward. Students can sign up only after their college
        adds them.
      </p>
    </>
  );
}
