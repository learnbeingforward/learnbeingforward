"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation";

type College = { id: string; name: string };

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student",
  COLLEGE_ADMIN: "College Admin",
  TRAINER: "Trainer",
  ADMIN2: "Second Admin",
};

export function ForgotPasswordForm({ colleges, onBack }: { colleges: College[]; onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const role = watch("role");
  const needsCollege = role === "STUDENT" || role === "COLLEGE_ADMIN";

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
        <h3 className="font-semibold text-indigo">Request sent</h3>
        <p className="text-sm text-muted-foreground">
          Learn Being Forward will verify your details and email a new password to the address you
          provided once it&apos;s ready.
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
        Tell us who you are and we&apos;ll verify your details before resetting your password. The
        main company admin account can&apos;t be reset this way.
      </p>

      <div>
        <Label htmlFor="forgot-role">
          I am a
          <RequiredMark />
        </Label>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select who you are">
                  {(value: string | null) => (value ? ROLE_LABELS[value] : "Select who you are")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>}
      </div>

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

      {needsCollege && (
        <div>
          <Label htmlFor="forgot-college">
            College
            <RequiredMark />
          </Label>
          <Controller
            control={control}
            name="collegeName"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select your college">
                    {(value: string | null) => value || "Select your college"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.collegeName && (
            <p className="mt-1 text-xs text-destructive">{errors.collegeName.message}</p>
          )}
        </div>
      )}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo text-white hover:bg-indigo/90">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Send Request
      </Button>
    </form>
  );
}
