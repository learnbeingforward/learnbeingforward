import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login / Sign Up",
  description: "Log in or create a Learn Being Forward account.",
};

// Each auth page renders its own PublicShell-style navy band + white card, so
// this layout no longer wraps them in the old Header/BlobBackground shell.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
