import type { Metadata } from "next";
import { PublicHeader } from "@/components/lbf/PublicHeader";
import { SiteFooter } from "@/components/lbf/SiteFooter";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <div className="lbf-scope">
      <PublicHeader
        active=""
        bandStyle={{ paddingBottom: 180 }}
        eyebrow="Account recovery"
        title={
          <span style={{ fontSize: 34 }}>
            Forgot your <em>password?</em>
          </span>
        }
        description="Enter your account email and we'll send you a secure reset link."
      />
      <main className="container">
        <div className="row" style={{ marginTop: -140, justifyContent: "center" }}>
          <ForgotPasswordForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
