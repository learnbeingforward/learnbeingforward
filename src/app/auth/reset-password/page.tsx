import type { Metadata } from "next";
import { PublicHeader } from "@/components/lbf/PublicHeader";
import { SiteFooter } from "@/components/lbf/SiteFooter";
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
    <div className="lbf-scope">
      <PublicHeader
        active=""
        bandStyle={{ paddingBottom: 180 }}
        eyebrow="Account recovery"
        title={
          <span style={{ fontSize: 34 }}>
            Set a <em>new password</em>
          </span>
        }
        description="Used from the email link, and on first login for accounts created by an admin."
      />
      <main className="container">
        <div className="row" style={{ marginTop: -140, justifyContent: "center" }}>
          <ResetPasswordForm token={token ?? ""} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
