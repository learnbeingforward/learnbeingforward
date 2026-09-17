import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { AddStudentForm } from "@/components/lms/AddStudentForm";
import { AddCollegeForm } from "@/components/lms/AddCollegeForm";
import { CreateTrainerLoginForm } from "@/components/lms/CreateTrainerLoginForm";

export default async function CompanyAccountsPage() {
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
          <AddStudentForm colleges={colleges} />
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
      </div>
    </DashboardShell>
  );
}
