import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCompanyNavLinksForRole } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/lms/BackLink";
import { RescheduleSessionRow } from "@/components/lms/RescheduleSessionRow";
import { GenerateCollegeInvoiceButton } from "@/components/lms/GenerateCollegeInvoiceButton";
import { format } from "date-fns";

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CSR: "CSR (Free)",
  PER_STUDENT_HOURLY: "Per Student, Per Hour",
  PER_DAY_FLAT: "Flat Rate Per Day",
};

function statusBadgeClass(status: string) {
  return status === "APPROVED"
    ? "bg-green-100 text-green-700 hover:bg-green-100"
    : status === "REJECTED"
      ? "bg-red-100 text-red-700 hover:bg-red-100"
      : "bg-gold/20 text-indigo hover:bg-gold/20";
}

export default async function CompanyCollegeSentPage() {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN") redirect("/lms/company/colleges");
  const navLinks = getCompanyNavLinksForRole(session.user.role);

  const [contracts, upcomingSessions] = await Promise.all([
    prisma.collegeContract.findMany({
      where: { status: { not: "PENDING_RATE" } },
      include: { college: true, course: true, invoices: { orderBy: { submittedAt: "desc" } } },
      orderBy: { requestedAt: "desc" },
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
    <DashboardShell title="Sent to College" subtitle="Contracts sent, their status & invoices" navLinks={navLinks}>
      <BackLink href="/lms/company/colleges" label="Back to Colleges" />

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
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/lms/company/colleges?contractId=${c.id}`}
                    className="block rounded-lg transition-colors hover:bg-cream/60"
                  >
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
                  </Link>
                  {c.invoices.filter((inv) => inv.submitted).length > 0 && (
                    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-indigo">
                      Invoices:
                      {c.invoices
                        .filter((inv) => inv.submitted)
                        .map((inv, i, arr) => (
                          <span key={inv.id}>
                            <Link
                              href={`/lms/company/colleges?invoiceId=${inv.id}`}
                              className="underline underline-offset-2 hover:text-indigo/70"
                            >
                              ₹{inv.totalAmount} ({inv.status.toLowerCase()})
                            </Link>
                            {i < arr.length - 1 ? "," : ""}
                          </span>
                        ))}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge className={statusBadgeClass(c.status)}>{c.status}</Badge>
                  {c.status === "APPROVED" && c.contractType !== "CSR" && (
                    <GenerateCollegeInvoiceButton
                      contractId={c.id}
                      latestInvoice={(() => {
                        const latest = c.invoices[0];
                        return latest
                          ? {
                              invoiceId: latest.id,
                              status: latest.status as "PENDING" | "APPROVED" | "REJECTED",
                              submitted: latest.submitted,
                              pdfUrl: latest.pdfUrl,
                              rejectReason: latest.rejectReason,
                            }
                          : null;
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
