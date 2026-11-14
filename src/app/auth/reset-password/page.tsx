import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Learn Being Forward account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="rounded-2xl border border-border bg-white p-7 shadow-sm sm:p-9">
      <h1 className="mb-5 text-xl font-bold text-indigo">Reset Your Password</h1>
      <ResetPasswordForm token={token ?? ""} />
    </div>
  );
}
