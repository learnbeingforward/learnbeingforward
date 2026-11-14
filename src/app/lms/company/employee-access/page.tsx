import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { EmployeeAccessForm } from "@/components/lms/EmployeeAccessForm";
import { EmployeeAccessList } from "@/components/lms/EmployeeAccessList";
import { parseEmployeeKeys, requireCompanyPageAccess } from "@/lib/employee-access";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin" };

export default async function EmployeeAccessPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess();
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN2") redirect("/lms/company");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const employees = await prisma.user.findMany({ where: { role: "EMPLOYEE" }, orderBy: { createdAt: "desc" } });

  return (
    <AppShell
      nav={nav}
      active="employee-access"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Accounts › Employee Access"
      title="Employee Access"
      subtitle="Create scoped logins for staff who shouldn't see the whole admin area"
    >
      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>New employee login</h2>
        <EmployeeAccessForm />
      </section>
      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>Employee accounts ({employees.length})</h2>
        <EmployeeAccessList
          employees={employees.map((e) => ({
            id: e.id,
            name: e.name,
            email: e.email,
            phone: e.phone,
            pageKeys: parseEmployeeKeys(e.employeePageKeys),
            kind: e.employeeKind === "ADMIN" ? "ADMIN" : "EMPLOYEE",
          }))}
        />
      </section>
    </AppShell>
  );
}
