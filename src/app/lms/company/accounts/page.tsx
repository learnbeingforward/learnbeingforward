import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { AddStudentSection } from "@/components/lms/AddStudentSection";
import { AddCollegeForm } from "@/components/lms/AddCollegeForm";
import { CreateTrainerLoginForm } from "@/components/lms/CreateTrainerLoginForm";
import { CreateAdmin2AccountForm } from "@/components/lms/CreateAdmin2AccountForm";
import { EmployeeAccessForm } from "@/components/lms/EmployeeAccessForm";

export default async function CompanyAccountsPage() {
  const { session, navLinks } = await requireCompanyPageAccess("accounts.add");
  const colleges = await prisma.college.findMany({ orderBy: { name: "asc" } });

  return (
    <DashboardShell title="Add Account" subtitle="Provision access" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Create student, college, or trainer accounts directly and hand out the generated
        credentials yourself — useful when onboarding without them signing up on their own.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            New Student Account
          </h2>
          <AddStudentSection colleges={colleges} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            New College Account
          </h2>
          <AddCollegeForm />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            New Trainer Account
          </h2>
          <CreateTrainerLoginForm />
        </div>

        {session!.user.role === "SUPER_ADMIN" && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
              New Second Admin Account
            </h2>
            <CreateAdmin2AccountForm />
          </div>
        )}

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            New Employee Account
          </h2>
          <p className="mb-3 max-w-2xl text-sm text-muted-foreground">
            For staff who should only see specific sections — e.g. only Assessments. Check exactly
            what they can access below.
          </p>
          <EmployeeAccessForm />
        </div>
      </div>
    </DashboardShell>
  );
}
