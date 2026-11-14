import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { DomainTabs } from "@/components/lbf/DomainTabs";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { AddStudentSection } from "@/components/lms/AddStudentSection";
import { AddCollegeForm } from "@/components/lms/AddCollegeForm";
import { CreateTrainerLoginForm } from "@/components/lms/CreateTrainerLoginForm";
import { CreateAdmin2AccountForm } from "@/components/lms/CreateAdmin2AccountForm";
import { EmployeeAccessForm } from "@/components/lms/EmployeeAccessForm";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyAccountsPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("accounts.add");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const colleges = await prisma.college.findMany({ orderBy: { name: "asc" } });

  const tabs = [
    { key: "student", label: "Student" },
    { key: "college", label: "College" },
    { key: "trainer", label: "Trainer" },
    ...(session!.user.role === "SUPER_ADMIN" ? [{ key: "admin2", label: "Second admin" }] : []),
    { key: "employee", label: "Employee" },
  ];

  const panels: Record<string, React.ReactNode> = {
    student: <AddStudentSection colleges={colleges} />,
    college: <AddCollegeForm />,
    trainer: <CreateTrainerLoginForm />,
    employee: (
      <div className="stack" style={{ gap: 12 }}>
        <p className="small muted">For staff who should only see specific sections — e.g. only Assessments. Check exactly what they can access below.</p>
        <EmployeeAccessForm />
      </div>
    ),
  };
  if (session!.user.role === "SUPER_ADMIN") panels.admin2 = <CreateAdmin2AccountForm />;

  return (
    <AppShell
      nav={nav}
      active="add-account"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Accounts › Add Account"
      title="Add account"
      subtitle="Create student, college, trainer, second-admin or employee accounts and hand out the credentials yourself."
    >
      <section className="card">
        <DomainTabs tabs={tabs} panels={panels} />
      </section>
    </AppShell>
  );
}
