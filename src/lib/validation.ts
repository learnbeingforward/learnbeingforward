import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  collegeId: z.string().min(1, "Select your college"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

// Form-only (adds confirmPassword, never sent to the API) — used by SignUpForm.
export const signUpFormSchema = signUpSchema
  .extend({ confirmPassword: z.string().min(1, "Confirm your password") })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpFormInput = z.infer<typeof signUpFormSchema>;

export const forgotPasswordSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Missing reset token"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  role: z.enum(["College / University", "Company", "Student", "Trainer"]).optional(),
  phone: z.string().trim().optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
