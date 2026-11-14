import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { RescheduleSessionRow } from "@/components/lms/RescheduleSessionRow";
import { GenerateCollegeInvoiceButton } from "@/components/lms/GenerateCollegeInvoiceButton";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CSR: "CSR (Free)",
  PER_STUDENT_HOURLY: "Per Student, Per Hour",
  PER_DAY_FLAT: "Flat Rate Per Day",
};

function statusPillClass(status: string) {
  return status === "APPROVED" ? "success" : status === "REJECTED" ? "danger" : "gold";
}

export default async function CompanyCollegeSentPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("colleges.sent");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

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

  const approvedContractKeys = new Set(contracts.filter((c) => c.status === "APPROVED").map((c) => `${c.collegeId}:${c.courseId}`));
  const relevantSessions = upcomingSessions.filter((s) => approvedContractKeys.has(`${s.batch.collegeId}:${s.batch.courseId}`));

  return (
    <AppShell nav={nav} active="colleges" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Colleges › Sent to College" title="Sent to college" subtitle="Every training contract sent, its status, and invoices.">
      <BackLink href="/lms/company/colleges" label="Back to Colleges" />

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>Training requests ({contracts.length})</h2>
        {contracts.length === 0 ? (
          <p className="empty">No training requests yet.</p>
        ) : (
          <ul className="list">
            {contracts.map((c) => (
              <li key={c.id} className="list-row" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
                <span className="icon-box"><Icon name="briefcase" size={18} /></span>
                <div className="grow">
                  <Link href={`/lms/company/colleges?contractId=${c.id}`}>
                    <div className="strong">{c.college.name} — {c.course.name}</div>
                    <div className="small muted">
                      {CONTRACT_TYPE_LABELS[c.contractType]}
                      {c.ratePerStudentHour && ` · ₹${c.ratePerStudentHour}/student/hr`}
                      {c.flatRatePerDay && ` · ₹${c.flatRatePerDay}/day`} · Min {c.minStudents} students · {c.totalDays} days ({format(c.startDate, "MMM d")}–{format(c.endDate, "MMM d, yyyy")})
                      {(c.targetBranch || c.targetSemester) && (
                        <>
                          {" "}·{" "}
                          <span className="strong">{[c.targetBranch, c.targetSemester ? `Sem ${c.targetSemester}` : null].filter(Boolean).join(" · ")} only</span>
                        </>
                      )}
                    </div>
                  </Link>
                  {c.invoices.filter((inv) => inv.submitted).length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {c.invoices.filter((inv) => inv.submitted).map((inv) => (
                        <Link key={inv.id} href={`/lms/company/colleges?invoiceId=${inv.id}`}>
                          <span className={`pill ${statusPillClass(inv.status)}`}>
                            ₹{inv.totalAmount} ({inv.status === "APPROVED" ? (inv.paidAt ? "paid" : inv.paidRequestedAt ? "awaiting confirmation" : "accepted") : inv.status.toLowerCase()})
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`pill ${statusPillClass(c.status)}`}>{c.status}</span>
                {c.status === "APPROVED" && c.contractType !== "CSR" && (
                  <GenerateCollegeInvoiceButton
                    contractId={c.id}
                    latestInvoice={(() => {
                      const latest = c.invoices[0];
                      return latest
                        ? { invoiceId: latest.id, status: latest.status as "PENDING" | "APPROVED" | "REJECTED", submitted: latest.submitted, pdfUrl: latest.pdfUrl, rejectReason: latest.rejectReason, paidAt: latest.paidAt, paidRequestedAt: latest.paidRequestedAt }
                        : null;
                    })()}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {relevantSessions.length > 0 && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>Upcoming sessions — reschedule</h2>
          <ul className="list">
            {relevantSessions.map((s) => (
              <li key={s.id} className="list-row">
                <span className="grow">{s.batch.college.name} — {s.batch.name} · Slot {s.slotNumber} · {format(s.sessionDate, "MMM d, yyyy")}</span>
                <RescheduleSessionRow sessionId={s.id} currentDate={s.sessionDate.toISOString().slice(0, 10)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
