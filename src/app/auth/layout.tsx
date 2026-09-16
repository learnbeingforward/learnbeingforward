import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { BlobBackground } from "@/components/shared/BlobBackground";

export const metadata: Metadata = {
  title: "Login / Sign Up",
  description: "Log in or create a Learn Being Forward account.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12">
        <BlobBackground />
        <div className="relative w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
