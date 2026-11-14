import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { ResetAccountForm } from "@/components/lms/ResetAccountForm";
import { ResetStudentPasswordForm } from "@/components/lms/ResetStudentPasswordForm";
import { ResetCollegePasswordForm } from "@/components/lms/ResetCollegePasswordForm";
import { ResetTrainerPasswordForm } from "@/components/lms/ResetTrainerPasswordForm";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyManageAccountsPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess([
    "accounts.manage.students",
    "accounts.manage.colleges",
    "accounts.manage.trainers",
    "accounts.manage.admins",
  ]);
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const canStudents = keys.includes("accounts.manage.students");
  const canColleges = keys.includes("accounts.manage.colleges");
  const canTrainers = keys.includes("accounts.manage.trainers");
  const canAdmins = keys.includes("accounts.manage.admins");

  const [students, collegeAdmins, trainers] = await Promise.all([
    canStudents ? prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { name: "asc" } }) : [],
    canColleges ? prisma.user.findMany({ where: { role: "COLLEGE_ADMIN" }, include: { college: true }, orderBy: { name: "asc" } }) : [],
    canTrainers ? prisma.trainer.findMany({ where: { loginUser: { isNot: null } }, orderBy: { name: "asc" } }) : [],
  ]);

  return (
    <AppShell nav={nav} active="manage-accounts" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Manage Accounts" title="Manage accounts" subtitle="Reset a login when someone is locked out and didn't use the forgot-password form.">
      <div className="alert warning">
        <Icon name="lock" size={18} />
        <span>The main company admin&apos;s own password can&apos;t be reset here — change it from Profile.</span>
      </div>

      {canAdmins && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>Reset by email</h2>
          <ResetAccountForm />
        </section>
      )}

      <div className="grid" style={{ ["--min" as string]: "300px" }}>
        {canStudents && (
          <section className="card">
            <h2 className="h2" style={{ marginBottom: 18 }}>Reset a student&apos;s password</h2>
            <ResetStudentPasswordForm students={students.map((s) => ({ id: s.id, name: s.name, email: s.email }))} />
          </section>
        )}
        {canColleges && (
          <section className="card">
            <h2 className="h2" style={{ marginBottom: 18 }}>Reset a college&apos;s password</h2>
            <ResetCollegePasswordForm collegeAdmins={collegeAdmins.map((c) => ({ id: c.id, name: c.name, collegeName: c.college?.name ?? c.name }))} />
          </section>
        )}
        {canTrainers && (
          <section className="card">
            <h2 className="h2" style={{ marginBottom: 18 }}>Reset a trainer&apos;s password</h2>
            <ResetTrainerPasswordForm trainers={trainers} />
          </section>
        )}
      </div>
    </AppShell>
  );
}
