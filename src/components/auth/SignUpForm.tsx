"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
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
import { signUpSchema, type SignUpInput } from "@/lib/validation";

type College = { id: string; name: string };

export function SignUpForm({ colleges }: { colleges: College[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    setServerError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "Something went wrong. Please try again.");
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <p className="rounded-lg bg-cream px-3 py-2.5 text-xs text-muted-foreground">
        Only students who&apos;ve already been added by their college can sign up here. Colleges
        and companies get accounts provisioned directly by Learn Being Forward.
      </p>

      <div>
        <Label htmlFor="signup-name">
          Name
          <RequiredMark />
        </Label>
        <Input id="signup-name" className="mt-1.5" {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="signup-email">
          Email
          <RequiredMark />
        </Label>
        <Input id="signup-email" type="email" className="mt-1.5" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="signup-password">
          Password
          <RequiredMark />
        </Label>
        <Input id="signup-password" type="password" className="mt-1.5" {...register("password")} />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="signup-college">
          College
          <RequiredMark />
        </Label>
        <Controller
          control={control}
          name="collegeId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select your college">
                  {(value: string | null) => colleges.find((c) => c.id === value)?.name ?? "Select your college"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {colleges.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.collegeId && (
          <p className="mt-1 text-xs text-destructive">{errors.collegeId.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo text-white hover:bg-indigo/90">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
}
