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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signUpSchema, type SignUpInput } from "@/lib/validation";

export function SignUpForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "STUDENT" },
  });

  const role = watch("role");

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

    router.push(data.role === "COLLEGE_ADMIN" ? "/lms/college" : "/lms/student");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="signup-name">Name</Label>
        <Input id="signup-name" className="mt-1.5" {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" className="mt-1.5" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="signup-password">Password</Label>
        <Input id="signup-password" type="password" className="mt-1.5" {...register("password")} />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Label>I am a</Label>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select role">
                  {(value: string | null) =>
                    value === "COLLEGE_ADMIN" ? "College / Vendor" : "Student"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="COLLEGE_ADMIN">College / Vendor</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {role === "STUDENT" && (
        <div>
          <Label htmlFor="signup-college">College Name</Label>
          <Input id="signup-college" className="mt-1.5" {...register("collegeName")} />
          {errors.collegeName && (
            <p className="mt-1 text-xs text-destructive">{errors.collegeName.message}</p>
          )}
        </div>
      )}

      {role === "COLLEGE_ADMIN" && (
        <div>
          <Label htmlFor="signup-org">Organization Name</Label>
          <Input id="signup-org" className="mt-1.5" {...register("organizationName")} />
          {errors.organizationName && (
            <p className="mt-1 text-xs text-destructive">{errors.organizationName.message}</p>
          )}
        </div>
      )}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo text-white hover:bg-indigo/90">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
}
