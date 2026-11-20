import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { PublicHeader } from "@/components/lbf/PublicHeader";
import { SiteFooter } from "@/components/lbf/SiteFooter";

export const revalidate = 0;

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const isSignup = mode === "signup";
  const colleges = await prisma.college.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      {isSignup ? (
        <PublicHeader
          active=""
          bandStyle={{ paddingBottom: 180 }}
          eyebrow="Student sign up"
          title={
            <span style={{ fontSize: 34 }}>
              Create your <em>student account</em>
            </span>
          }
          description="Only students already added by their college can sign up here."
        />
      ) : (
        <PublicHeader
          active=""
          bandStyle={{ paddingBottom: 180 }}
          eyebrow="Welcome back"
          title={
            <span style={{ fontSize: 34 }}>
              Log in to your <em>portal</em>
            </span>
          }
          description="One login for Super Admin, College, Trainer and Student accounts — you'll land on your own dashboard."
        />
      )}
      <main className="container">
        <Suspense fallback={null}>
          <AuthTabs colleges={colleges} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
