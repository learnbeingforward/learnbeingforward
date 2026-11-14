"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation";

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);
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

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="size-10 text-gold" />
        <h3 className="font-semibold text-indigo">Check your email</h3>
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, we&apos;ve sent a link to reset the password — it&apos;s valid for
          1 hour. The main company admin account can&apos;t be reset this way.
        </p>
        <button type="button" onClick={onBack} className="mt-2 text-sm text-indigo underline">
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <button type="button" onClick={onBack} className="text-sm text-muted-foreground hover:text-indigo">
          &larr; Back to login
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Enter your name and the email on your account — works for students, trainers, and college logins. We&apos;ll
        email you a link to set a new password yourself.
      </p>

      <div>
        <Label htmlFor="forgot-name">
          Name
          <RequiredMark />
        </Label>
        <Input id="forgot-name" className="mt-1.5" {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="forgot-email">
          Email
          <RequiredMark />
        </Label>
        <Input id="forgot-email" type="email" className="mt-1.5" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo text-white hover:bg-indigo/90">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Send Reset Link
      </Button>
    </form>
  );
}
