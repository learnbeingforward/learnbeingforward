"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { loginSchema, type LoginInput } from "@/lib/validation";

type SessionResponse = {
  user?: { role?: "STUDENT" | "COLLEGE_ADMIN" | "SUPER_ADMIN" | "TRAINER" };
};

function roleRedirect(role?: string) {
  if (role === "SUPER_ADMIN") return "/lms/company";
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
    formState: { errors, isSubmitting },
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
      setServerError("Invalid email or password.");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session: SessionResponse = await sessionRes.json();
    router.push(roleRedirect(session.user?.role));
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="login-email">
          Email
          <RequiredMark />
        </Label>
        <Input id="login-email" type="email" className="mt-1.5" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="login-password">
          Password
          <RequiredMark />
        </Label>
        <Input id="login-password" type="password" className="mt-1.5" {...register("password")} />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo text-white hover:bg-indigo/90">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Log In
      </Button>
    </form>
  );
}
