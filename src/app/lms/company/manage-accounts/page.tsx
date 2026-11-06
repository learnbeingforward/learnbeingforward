import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { ResetAccountForm } from "@/components/lms/ResetAccountForm";
import { ResetStudentPasswordForm } from "@/components/lms/ResetStudentPasswordForm";
import { ResetCollegePasswordForm } from "@/components/lms/ResetCollegePasswordForm";
import { ResetTrainerPasswordForm } from "@/components/lms/ResetTrainerPasswordForm";

export default async function CompanyManageAccountsPage() {
  const { navLinks, keys } = await requireCompanyPageAccess([
    "accounts.manage.students",
    "accounts.manage.colleges",
    "accounts.manage.trainers",
    "accounts.manage.admins",
  ]);
  const canStudents = keys.includes("accounts.manage.students");
  const canColleges = keys.includes("accounts.manage.colleges");
  const canTrainers = keys.includes("accounts.manage.trainers");
  const canAdmins = keys.includes("accounts.manage.admins");

  const [students, collegeAdmins, trainers] = await Promise.all([
    canStudents ? prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { name: "asc" } }) : [],
    canColleges
      ? prisma.user.findMany({ where: { role: "COLLEGE_ADMIN" }, include: { college: true }, orderBy: { name: "asc" } })
      : [],
    canTrainers ? prisma.trainer.findMany({ where: { loginUser: { isNot: null } }, orderBy: { name: "asc" } }) : [],
  ]);

  return (
    <DashboardShell title="Manage Accounts" subtitle="Directly reset any account's password" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Use this to reset a login when someone is locked out and the request didn&apos;t come through
        the forgot-password form. The main company admin&apos;s own password can&apos;t be reset from
        here — it can only be changed from its own Profile page.
      </p>
      <div className="space-y-8">
        {canAdmins && <ResetAccountForm />}

        {canStudents && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">Reset a Student&apos;s Password</h2>
            <ResetStudentPasswordForm students={students.map((s) => ({ id: s.id, name: s.name, email: s.email }))} />
          </div>
        )}

        {canColleges && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">Reset a College&apos;s Password</h2>
            <ResetCollegePasswordForm
              collegeAdmins={collegeAdmins.map((c) => ({ id: c.id, name: c.name, collegeName: c.college?.name ?? c.name }))}
            />
          </div>
        )}

        {canTrainers && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">Reset a Trainer&apos;s Password</h2>
            <ResetTrainerPasswordForm trainers={trainers} />
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
