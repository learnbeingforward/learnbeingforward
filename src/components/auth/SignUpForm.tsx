"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { signUpFormSchema, type SignUpFormInput } from "@/lib/validation";
import { Icon } from "@/components/lbf/icons";

type College = { id: string; name: string };

function passwordStrength(password: string) {
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const score = [hasLength, hasNumber, hasSymbol].filter(Boolean).length;
  const label = score === 0 ? "" : score === 1 ? "weak" : score === 2 ? "fair" : "good";
  return { pct: (score / 3) * 100, label };
}

export function SignUpForm({ colleges }: { colleges: College[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormInput>({
    resolver: zodResolver(signUpFormSchema),
  });

  const password = watch("password") || "";
  const strength = passwordStrength(password);

  const onSubmit = async (data: SignUpFormInput) => {
    setServerError(null);
    const { confirmPassword: _confirmPassword, ...payload } = data;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "This email isn't on your college's student list. Ask your placement officer to add you, then try again.");
      return;
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (!result || result.error) {
      setServerError("Account created — please log in.");
      return;
    }

    router.push("/lms/student");
    router.refresh();
  };

  return (
    <>
      <div className="alert info" style={{ marginBottom: 18 }}>
        <Icon name="shield" size={18} className="shrink-0" />
        <span>
          Use the <strong>same email your college gave us</strong>. Colleges and companies get accounts from Learn
          Being Forward directly.
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="stack" style={{ gap: 16 }}>
        <label className="field">
          <span>
            Full name <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" autoComplete="name" {...register("name")} />
          {errors.name && <span className="error-text">{errors.name.message}</span>}
        </label>
        <label className="field">
          <span>
            Email <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <span className="error-text">{errors.email.message}</span>}
        </label>
        <label className="field">
          <span>
            College <span className="req" aria-hidden="true">*</span>
          </span>
          <Controller
            control={control}
            name="collegeId"
            render={({ field }) => (
              <select className="select" value={field.value ?? ""} onChange={field.onChange}>
                <option value="">Select your college</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.collegeId && <span className="error-text">{errors.collegeId.message}</span>}
        </label>
        <label className="field">
          <span>
            Password <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" type="password" autoComplete="new-password" {...register("password")} />
          {strength.label && (
            <>
              <span className="progress gold" style={{ marginTop: 4 }} aria-hidden="true">
                <span style={{ width: `${strength.pct}%` }} />
              </span>
              <span className="hint">Strength: {strength.label} · At least 8 characters with a number and a symbol</span>
            </>
          )}
          {errors.password && <span className="error-text">{errors.password.message}</span>}
        </label>
        <label className="field">
          <span>
            Confirm password <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" type="password" autoComplete="new-password" {...register("confirmPassword")} />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
        </label>
        <label className="check">
          <input type="checkbox" required /> I agree to the Terms and Privacy Policy
        </label>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      {serverError && (
        <div className="alert warning" style={{ marginTop: 18 }}>
          <Icon name="x" size={18} className="shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <hr className="divider" />
    </>
  );
}
