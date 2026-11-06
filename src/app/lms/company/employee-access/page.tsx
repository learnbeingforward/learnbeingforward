import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { EmployeeAccessForm } from "@/components/lms/EmployeeAccessForm";
import { EmployeeAccessList } from "@/components/lms/EmployeeAccessList";
import { parseEmployeeKeys } from "@/lib/employee-access";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function EmployeeAccessPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN2")) {
    redirect("/lms/company");
  }

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell
      title="Employee Access"
      subtitle="Create scoped logins for staff who shouldn't see the whole admin area"
      navLinks={navLinks}
    >
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Use this when you&apos;re hiring someone who should only handle one or two specific things —
        for example, only building and sending assessments. Create a login for them below and check
        exactly what they should be able to see. When they log in with that email and password,
        they land on their own cut-down version of this admin area, with nothing else visible.
      </p>

      <div className="space-y-8">
        <EmployeeAccessForm />

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Employee Accounts ({employees.length})
          </h2>
          <EmployeeAccessList
            employees={employees.map((e) => ({
              id: e.id,
              name: e.name,
              email: e.email,
              phone: e.phone,
              pageKeys: parseEmployeeKeys(e.employeePageKeys),
            }))}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
