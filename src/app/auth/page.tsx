import { Suspense } from "react";
import { AuthTabs } from "@/components/auth/AuthTabs";

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthTabs />
    </Suspense>
  );
}
