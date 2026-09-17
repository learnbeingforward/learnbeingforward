import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import { RequestTrainingForm } from "@/components/lms/RequestTrainingForm";
import { RescheduleSessionRow } from "@/components/lms/RescheduleSessionRow";
import { GenerateCollegeInvoiceButton } from "@/components/lms/GenerateCollegeInvoiceButton";
import { ApproveContractRateForm } from "@/components/lms/ApproveContractRateForm";
import { format } from "date-fns";

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CSR: "CSR (Free)",
  PER_STUDENT_HOURLY: "Per Student, Per Hour",
  PER_DAY_FLAT: "Flat Rate Per Day",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_RATE: "Requested",
  PENDING: "Sent to College",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default async function CompanyCollegesPage() {
  const session = await auth();
  const isAdmin2 = session!.user.role === "ADMIN2";

  const [colleges, courses] = await Promise.all([
    prisma.college.findMany({ orderBy: { name: "asc" } }),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (isAdmin2) {
    const myContracts = await prisma.collegeContract.findMany({
      where: { requestedByAdminId: session!.user.id },
      include: { college: true, course: true },
      orderBy: { requestedAt: "desc" },
    });

    return (
      <DashboardShell title="Colleges" subtitle="Request training" navLinks={navLinks}>
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Request Training
          </h2>
          <RequestTrainingForm colleges={colleges} courses={courses} hideRate />
        </div>

        <div className="rounded-xl border border-border bg-white">
          <div className="border-b border-border p-6">
            <p className="text-sm font-semibold text-indigo">My Training Requests ({myContracts.length})</p>
          </div>
          {myContracts.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No training requests yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {myContracts.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium text-indigo">
                      {c.college.name} — {c.course.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {CONTRACT_TYPE_LABELS[c.contractType]} &middot; Min {c.minStudents} students &middot;{" "}
                      {c.totalDays} days ({format(c.startDate, "MMM d")}–{format(c.endDate, "MMM d, yyyy")})
                    </p>
                  </div>
                  <Badge
                    className={
                      c.status === "APPROVED"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : c.status === "REJECTED"
                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                          : "bg-gold/20 text-indigo hover:bg-gold/20"
                    }
                  >
                    {STATUS_LABELS[c.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    );
  }

  const [contracts, pendingRateContracts, upcomingSessions] = await Promise.all([
    prisma.collegeContract.findMany({
      where: { status: { not: "PENDING_RATE" } },
      include: { college: true, course: true, invoices: true },
      orderBy: { requestedAt: "desc" },
    }),
    prisma.collegeContract.findMany({
      where: { status: "PENDING_RATE" },
      include: { college: true, course: true },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.trainingSession.findMany({
      where: { attendanceTaken: false },
      include: { batch: { include: { college: true, course: true } } },
      orderBy: { sessionDate: "asc" },
      take: 20,
    }),
  ]);

  const approvedContractKeys = new Set(
    contracts.filter((c) => c.status === "APPROVED").map((c) => `${c.collegeId}:${c.courseId}`)
  );
  const relevantSessions = upcomingSessions.filter((s) =>
    approvedContractKeys.has(`${s.batch.collegeId}:${s.batch.courseId}`)
  );

  return (
    <DashboardShell title="Colleges" subtitle="Training requests, MOUs & invoices" navLinks={navLinks}>
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
          Request Training
        </h2>
        <RequestTrainingForm colleges={colleges} courses={courses} />
      </div>

      {pendingRateContracts.length > 0 && (
        <div className="mb-8 rounded-xl border border-gold/40 bg-gold/10">
          <div className="border-b border-gold/40 p-6">
            <p className="text-sm font-semibold text-indigo">Training Approvals ({pendingRateContracts.length})</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Requested by the second admin — set the rate (if paid) and send it to the college.
            </p>
          </div>
          <div className="divide-y divide-gold/30">
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
        </div>
      )}

      <div className="mb-8 rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Training Requests ({contracts.length})</p>
        </div>
        {contracts.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No training requests yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {contracts.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-indigo">
                    {c.college.name} — {c.course.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {CONTRACT_TYPE_LABELS[c.contractType]}
                    {c.ratePerStudentHour && ` · ₹${c.ratePerStudentHour}/student/hr`}
                    {c.flatRatePerDay && ` · ₹${c.flatRatePerDay}/day`} &middot; Min {c.minStudents} students
                    &middot; {c.totalDays} days ({format(c.startDate, "MMM d")}–{format(c.endDate, "MMM d, yyyy")})
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
                  {c.invoices.filter((inv) => inv.submitted).length > 0 && (
                    <p className="mt-1 text-xs text-indigo">
                      Invoices:{" "}
                      {c.invoices
                        .filter((inv) => inv.submitted)
                        .map((inv) => `₹${inv.totalAmount} (${inv.status.toLowerCase()})`)
                        .join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge
                    className={
                      c.status === "APPROVED"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : c.status === "REJECTED"
                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                          : "bg-gold/20 text-indigo hover:bg-gold/20"
                    }
                  >
                    {c.status}
                  </Badge>
                  {c.status === "APPROVED" && c.contractType !== "CSR" && (
                    <GenerateCollegeInvoiceButton
                      contractId={c.id}
                      existingDraft={(() => {
                        const draft = c.invoices.find((inv) => !inv.submitted);
                        return draft ? { invoiceId: draft.id, pdfUrl: draft.pdfUrl } : null;
                      })()}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {relevantSessions.length > 0 && (
        <div className="rounded-xl border border-border bg-white">
          <div className="border-b border-border p-6">
            <p className="text-sm font-semibold text-indigo">Upcoming Sessions — Reschedule</p>
          </div>
          <div className="divide-y divide-border">
            {relevantSessions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="text-sm text-indigo">
                  {s.batch.college.name} — {s.batch.name} &middot; Slot {s.slotNumber} &middot;{" "}
                  {format(s.sessionDate, "MMM d, yyyy")}
                </p>
                <RescheduleSessionRow sessionId={s.id} currentDate={s.sessionDate.toISOString().slice(0, 10)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
