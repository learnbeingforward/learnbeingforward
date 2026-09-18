import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCompanyNavLinksForRole } from "@/lib/lms-nav-links";
import { BackLink } from "@/components/lms/BackLink";
import { MouCard } from "@/components/lms/MouCard";

export default async function CompanyCollegeMousPage() {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN") redirect("/lms/company/colleges");
  const navLinks = getCompanyNavLinksForRole(session.user.role);

  const contracts = await prisma.collegeContract.findMany({
    where: { status: "APPROVED" },
    include: { college: true, course: true },
    orderBy: { decidedAt: "desc" },
  });

  return (
    <DashboardShell title="MOUs" subtitle="Training MOUs with partner colleges" navLinks={navLinks}>
      <BackLink href="/lms/company/colleges" label="Back to Colleges" />
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Every training request the college has approved shows here. Generate a standard MOU
        document for it, and edit its special terms any time — regenerating updates the same PDF.
      </p>
      {contracts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No approved training requests yet — MOUs can be generated once a college approves one.
        </div>
      ) : (
        <div className="space-y-3">
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
      )}
    </DashboardShell>
  );
}
