import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { CompanyProfileForm } from "@/components/lms/CompanyProfileForm";
import { ChangePasswordForm } from "@/components/lms/ChangePasswordForm";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyProfilePage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess();
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const [admin, settings] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <AppShell nav={nav} active="profile" user={shellUser} hasUnread={hasUnread} crumb="Profile" title="Profile" subtitle="Your details, invoice bank details and password.">
      <div className="row">
        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>Profile details</h2>
          <CompanyProfileForm
            admin={{ name: admin.name, email: admin.email, photoUrl: admin.photoUrl }}
            bank={{
              companyBankAccountName: settings?.companyBankAccountName ?? null,
              companyBankAccountNumber: settings?.companyBankAccountNumber ?? null,
              companyBankIfsc: settings?.companyBankIfsc ?? null,
              companyBankName: settings?.companyBankName ?? null,
              companyGstNumber: settings?.companyGstNumber ?? null,
            }}
            showBank={session!.user.role === "SUPER_ADMIN"}
          />
        </section>
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>Change password</h2>
          <ChangePasswordForm />
        </section>
      </div>
    </AppShell>
  );
}
