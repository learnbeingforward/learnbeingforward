import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { PublicHeader } from "@/components/lbf/PublicHeader";
import { SiteFooter } from "@/components/lbf/SiteFooter";

export const revalidate = 0;

export default async function AuthPage() {
  const colleges = await prisma.college.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="lbf-scope">
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
      <main className="container">
        <Suspense fallback={null}>
          <AuthTabs colleges={colleges} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
