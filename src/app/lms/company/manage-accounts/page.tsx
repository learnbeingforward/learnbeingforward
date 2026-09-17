import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { ResetAccountForm } from "@/components/lms/ResetAccountForm";
import { ResetStudentPasswordForm } from "@/components/lms/ResetStudentPasswordForm";
import { ResetCollegePasswordForm } from "@/components/lms/ResetCollegePasswordForm";
import { ResetTrainerPasswordForm } from "@/components/lms/ResetTrainerPasswordForm";

export default async function CompanyManageAccountsPage() {
  const [students, collegeAdmins, trainers] = await Promise.all([
    prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "COLLEGE_ADMIN" }, include: { college: true }, orderBy: { name: "asc" } }),
    prisma.trainer.findMany({ where: { loginUser: { isNot: null } }, orderBy: { name: "asc" } }),
  ]);

  return (
    <DashboardShell title="Manage Accounts" subtitle="Directly reset any account's password" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Use this to reset a login when someone is locked out and the request didn&apos;t come through
        the forgot-password form. The main company admin&apos;s own password can&apos;t be reset from
        here — it can only be changed from its own Profile page.
      </p>
      <div className="space-y-8">
        <ResetAccountForm />

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">Reset a Student&apos;s Password</h2>
          <ResetStudentPasswordForm students={students.map((s) => ({ id: s.id, name: s.name, email: s.email }))} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">Reset a College&apos;s Password</h2>
          <ResetCollegePasswordForm
            collegeAdmins={collegeAdmins.map((c) => ({ id: c.id, name: c.name, collegeName: c.college?.name ?? c.name }))}
          />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">Reset a Trainer&apos;s Password</h2>
          <ResetTrainerPasswordForm trainers={trainers} />
        </div>
      </div>
    </DashboardShell>
  );
}
