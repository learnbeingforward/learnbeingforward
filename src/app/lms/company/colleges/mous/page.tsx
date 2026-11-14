import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { MouCard } from "@/components/lms/MouCard";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyCollegeMousPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("colleges.mous");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const contracts = await prisma.collegeContract.findMany({
    where: { status: "APPROVED" },
    include: { college: true, course: true },
    orderBy: { decidedAt: "desc" },
  });

  return (
    <AppShell nav={nav} active="colleges" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Colleges › MOUs" title="MOUs" subtitle="Generate a standard MOU for each approved training. Regenerating updates the same PDF.">
      <BackLink href="/lms/company/colleges" label="Back to Colleges" />
      {contracts.length === 0 ? (
        <section className="card">
          <p className="empty">No approved training requests yet — MOUs can be generated once a college approves one.</p>
        </section>
      ) : (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>Approved trainings ({contracts.length})</h2>
          <div className="stack" style={{ gap: 12 }}>
            {contracts.map((c) => (
              <MouCard
                key={c.id}
                contract={{
                  id: c.id,
                  collegeName: c.college.name,
                  courseName: c.course.name,
                  contractType: c.contractType,
                  ratePerStudentHour: c.ratePerStudentHour,
                  flatRatePerDay: c.flatRatePerDay,
                  minStudents: c.minStudents,
                  totalDays: c.totalDays,
                  startDate: c.startDate,
                  endDate: c.endDate,
                  targetBranch: c.targetBranch,
                  targetSemester: c.targetSemester,
                  mouNotes: c.mouNotes,
                  mouPdfUrl: c.mouPdfUrl,
                  mouGeneratedAt: c.mouGeneratedAt,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
