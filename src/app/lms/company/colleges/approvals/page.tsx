import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCompanyNavLinksForRole } from "@/lib/lms-nav-links";
import { BackLink } from "@/components/lms/BackLink";
import { ApproveContractRateForm } from "@/components/lms/ApproveContractRateForm";
import { format } from "date-fns";

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CSR: "CSR (Free)",
  PER_STUDENT_HOURLY: "Per Student, Per Hour",
  PER_DAY_FLAT: "Flat Rate Per Day",
};

export default async function CompanyCollegeApprovalsPage() {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN") redirect("/lms/company/colleges");
  const navLinks = getCompanyNavLinksForRole(session.user.role);

  const pendingRateContracts = await prisma.collegeContract.findMany({
    where: { status: "PENDING_RATE" },
    include: { college: true, course: true },
    orderBy: { requestedAt: "asc" },
  });

  return (
    <DashboardShell title="Approvals" subtitle="Contracts requested by the second admin" navLinks={navLinks}>
      <BackLink href="/lms/company/colleges" label="Back to Colleges" />
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        The second admin can request training without setting a rate. Set the rate (if paid) and
        send each one to the college here.
      </p>
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Pending Approvals ({pendingRateContracts.length})</p>
        </div>
        {pendingRateContracts.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Nothing waiting on a rate right now.</p>
        ) : (
          <div className="divide-y divide-border">
            {pendingRateContracts.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-indigo">
                    {c.college.name} — {c.course.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {CONTRACT_TYPE_LABELS[c.contractType]} &middot; Min {c.minStudents} students &middot;{" "}
                    {c.totalDays} days ({format(c.startDate, "MMM d")}–{format(c.endDate, "MMM d, yyyy")})
                    {(c.targetBranch || c.targetSemester) && (
                      <>
                        {" "}
                        &middot;{" "}
                        <span className="font-medium text-indigo">
                          {[c.targetBranch, c.targetSemester ? `Sem ${c.targetSemester}` : null]
                            .filter(Boolean)
                            .join(" · ")}{" "}
                          only
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <ApproveContractRateForm contractId={c.id} contractType={c.contractType} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
