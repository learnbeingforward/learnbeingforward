import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { BlobBackground } from "@/components/shared/BlobBackground";

export const metadata: Metadata = {
  title: "Login / Sign Up",
  description: "Log in or create a Learn Being Forward account.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-4 py-12">
      <BlobBackground />
      <div className="relative mb-8">
        <Logo />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
      <Link href="/" className="relative mt-8 text-sm text-muted-foreground hover:text-indigo">
        &larr; Back to home
      </Link>
    </div>
  );
}
