import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["STUDENT", "COLLEGE_ADMIN"]),
    collegeName: z.string().trim().optional(),
    organizationName: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "STUDENT" && !data.collegeName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["collegeName"],
        message: "College name is required for students",
      });
    }
    if (data.role === "COLLEGE_ADMIN" && !data.organizationName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["organizationName"],
        message: "Organization name is required for college/vendor accounts",
      });
    }
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
