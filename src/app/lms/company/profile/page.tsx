import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { CompanyProfileForm } from "@/components/lms/CompanyProfileForm";
import { ChangePasswordForm } from "@/components/lms/ChangePasswordForm";

export default async function CompanyProfilePage() {
  const session = await auth();
  const [admin, settings] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <DashboardShell title="Profile" subtitle="Your account" navLinks={navLinks}>
      <div className="space-y-8">
        <CompanyProfileForm
          admin={{ name: admin.name, email: admin.email, photoUrl: admin.photoUrl }}
          bank={{
            companyBankAccountName: settings?.companyBankAccountName ?? null,
            companyBankAccountNumber: settings?.companyBankAccountNumber ?? null,
            companyBankIfsc: settings?.companyBankIfsc ?? null,
            companyBankName: settings?.companyBankName ?? null,
            companyGstNumber: settings?.companyGstNumber ?? null,
          }}
        />

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
