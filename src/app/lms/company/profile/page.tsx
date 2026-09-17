import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { CompanyProfileForm } from "@/components/lms/CompanyProfileForm";
import { ChangePasswordForm } from "@/components/lms/ChangePasswordForm";

export default async function CompanyProfilePage() {
  const session = await auth();
  const admin = await prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } });

  return (
    <DashboardShell title="Profile" subtitle="Your account" navLinks={navLinks}>
      <div className="space-y-8">
        <CompanyProfileForm admin={{ name: admin.name, email: admin.email, photoUrl: admin.photoUrl }} />

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Change Password
          </h2>
          <ChangePasswordForm />
        </div>
      </div>
    </DashboardShell>
  );
}
