import { Suspense } from "react";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function AuthPage() {
  const colleges = await prisma.college.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <Suspense fallback={null}>
      <AuthTabs colleges={colleges} />
    </Suspense>
  );
}
