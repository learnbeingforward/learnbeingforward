import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { COLLEGE_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { BackLink } from "@/components/lms/BackLink";
import { decideContract, decideCollegeInvoice } from "@/lib/actions/college-contracts";
import { MarkInvoicePaidButton } from "@/components/lms/MarkInvoicePaidButton";
import { format } from "date-fns";

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CSR: "CSR (Free)",
  PER_STUDENT_HOURLY: "Per Student, Per Hour",
  PER_DAY_FLAT: "Flat Rate Per Day",
};

export default async function CollegeContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ contractId?: string; invoiceId?: string }>;
}) {
  const { contractId, invoiceId } = await searchParams;
  const session = await auth();
  const collegeId = session!.user.collegeId!;
  const college = await prisma.college.findUnique({ where: { id: collegeId }, select: { name: true } });
  const shellUser = { name: college?.name ?? "College", subtitle: "College admin" };

  if (contractId) {
    const contract = await prisma.collegeContract.findUnique({ where: { id: contractId }, include: { course: true, college: true } });
    if (!contract || contract.collegeId !== collegeId) {
      return (
        <AppShell nav={COLLEGE_NAV} active="contracts" user={shellUser} crumb="Contracts" title="Training Request" subtitle="Not found">
          <BackLink href="/lms/college/contracts" label="Back to Contracts" />
          <p className="muted">This request doesn&apos;t belong to your college.</p>
        </AppShell>
      );
    }

    return (
      <AppShell nav={COLLEGE_NAV} active="contracts" user={shellUser} crumb="Contracts" title={contract.course.name} subtitle="Training request detail">
        <BackLink href="/lms/college/contracts" label="Back to Contracts" />
        <section className="card" style={{ maxWidth: 520 }}>
          <div className="split" style={{ marginBottom: 16 }}>
            <h2 className="h2">{contract.course.name}</h2>
            <span className={`pill ${contract.status === "APPROVED" ? "success" : contract.status === "REJECTED" ? "danger" : "gold"}`}>{contract.status}</span>
          </div>
          <dl className="stack" style={{ gap: 10, fontSize: 14 }}>
            <Row label="Training type" value={CONTRACT_TYPE_LABELS[contract.contractType]} />
            {contract.ratePerStudentHour && <Row label="Rate" value={`₹${contract.ratePerStudentHour}/student/hr`} />}
            {contract.flatRatePerDay && <Row label="Rate" value={`₹${contract.flatRatePerDay}/day`} />}
            <Row label="Minimum students" value={contract.minStudents} />
            <Row label="Duration" value={`${contract.totalDays} days (${format(contract.startDate, "MMM d")}–${format(contract.endDate, "MMM d, yyyy")})`} />
            {(contract.targetBranch || contract.targetSemester) && (
              <Row label="Restricted to" value={[contract.targetBranch, contract.targetSemester ? `Sem ${contract.targetSemester}` : null].filter(Boolean).join(" · ")} />
            )}
            <Row label="Requested" value={format(contract.requestedAt, "MMM d, yyyy")} />
            <Row label="Decided" value={contract.decidedAt ? format(contract.decidedAt, "MMM d, yyyy") : "—"} />
            {contract.rejectReason && (
              <div>
                <p className="muted small" style={{ marginBottom: 4 }}>Rejection reason</p>
                <p style={{ background: "var(--surface)", borderRadius: 8, padding: 12 }}>{contract.rejectReason}</p>
              </div>
            )}
          </dl>
        </section>
      </AppShell>
    );
  }

  if (invoiceId) {
    const invoice = await prisma.collegeInvoice.findUnique({ where: { id: invoiceId }, include: { contract: { include: { course: true, college: true } } } });
    if (!invoice || invoice.contract.collegeId !== collegeId) {
      return (
        <AppShell nav={COLLEGE_NAV} active="contracts" user={shellUser} crumb="Contracts" title="Invoice" subtitle="Not found">
          <BackLink href="/lms/college/contracts" label="Back to Contracts" />
          <p className="muted">This invoice doesn&apos;t belong to your college.</p>
        </AppShell>
      );
    }
    const statusLabel =
      invoice.status === "APPROVED" ? (invoice.paidAt ? "Paid" : invoice.paidRequestedAt ? "Awaiting Confirmation" : "Accepted") : invoice.status;

    return (
      <AppShell nav={COLLEGE_NAV} active="contracts" user={shellUser} crumb="Contracts" title={invoice.contract.course.name} subtitle="Invoice detail">
        <BackLink href="/lms/college/contracts" label="Back to Contracts" />
        <section className="card" style={{ maxWidth: 520 }}>
          <div className="split" style={{ marginBottom: 16 }}>
            <h2 className="h2">{invoice.contract.course.name}</h2>
            <span className={`pill ${invoice.status === "APPROVED" ? "success" : invoice.status === "REJECTED" ? "danger" : "gold"}`}>{statusLabel}</span>
          </div>
          <dl className="stack" style={{ gap: 10, fontSize: 14 }}>
            <Row label="Students trained" value={invoice.totalStudents} />
            {invoice.totalHours && <Row label="Total hours" value={invoice.totalHours} />}
            {invoice.totalDays && <Row label="Total days" value={invoice.totalDays} />}
            <Row label="Amount" value={`₹${invoice.totalAmount}`} strong />
            <Row label="Submitted" value={format(invoice.submittedAt, "MMM d, yyyy")} />
            <Row label="Decided" value={invoice.decidedAt ? format(invoice.decidedAt, "MMM d, yyyy") : "—"} />
            {invoice.rejectReason && (
              <div>
                <p className="muted small" style={{ marginBottom: 4 }}>Rejection reason</p>
                <p style={{ background: "var(--surface)", borderRadius: 8, padding: 12 }}>{invoice.rejectReason}</p>
              </div>
            )}
          </dl>
          {invoice.pdfUrl && (
            <Link href={invoice.pdfUrl} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14 }}>
              <Icon name="file" size={16} /> View invoice PDF
            </Link>
          )}
          {invoice.status === "APPROVED" && !invoice.paidAt && (
            <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              {invoice.paidRequestedAt ? (
                <p className="small muted">You marked this as paid on {format(invoice.paidRequestedAt, "MMM d, yyyy")} — waiting for Learn Being Forward to confirm.</p>
              ) : (
                <MarkInvoicePaidButton invoiceId={invoice.id} />
              )}
            </div>
          )}
        </section>
      </AppShell>
    );
  }

  const [pendingContracts, decidedContracts, pendingInvoices, decidedInvoices, activeTrainings, paidInvoices] = await Promise.all([
    prisma.collegeContract.findMany({ where: { collegeId, status: "PENDING" }, include: { course: true }, orderBy: { requestedAt: "asc" } }),
    prisma.collegeContract.findMany({ where: { collegeId, status: { in: ["APPROVED", "REJECTED"] } }, include: { course: true }, orderBy: { decidedAt: "desc" }, take: 10 }),
    prisma.collegeInvoice.findMany({ where: { status: "PENDING", submitted: true, contract: { collegeId } }, include: { contract: { include: { course: true } } }, orderBy: { submittedAt: "asc" } }),
    prisma.collegeInvoice.findMany({ where: { status: { in: ["APPROVED", "REJECTED"] }, contract: { collegeId } }, include: { contract: { include: { course: true } } }, orderBy: { decidedAt: "desc" }, take: 10 }),
    prisma.collegeContract.count({ where: { collegeId, status: "APPROVED" } }),
    prisma.collegeInvoice.findMany({ where: { contract: { collegeId }, paidAt: { not: null } }, select: { totalAmount: true } }),
  ]);
  const paidToDate = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <AppShell nav={COLLEGE_NAV} active="contracts" user={shellUser} crumb="Contracts" title="Contracts" subtitle="Training requests, MOUs and invoices from Learn Being Forward.">
      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "180px" }}>
          <div className="tile gold">
            <div className="label">Pending requests</div>
            <div className="value">{pendingContracts.length}</div>
          </div>
          <div className="tile warning">
            <div className="label">Pending invoices</div>
            <div className="value">{pendingInvoices.length}</div>
          </div>
          <div className="tile">
            <div className="label">Active trainings</div>
            <div className="value">{activeTrainings}</div>
          </div>
          <div className="tile success">
            <div className="label">Paid to date</div>
            <div className="value">₹{paidToDate}</div>
          </div>
        </div>
      </section>

      <div className="row">
        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Waiting for you
          </h2>
          {pendingContracts.length === 0 && pendingInvoices.length === 0 ? (
            <p className="empty">No pending requests / invoices.</p>
          ) : (
            <div className="stack" style={{ gap: 12 }}>
              {pendingContracts.map((c) => (
                <div key={c.id} className="box">
                  <div className="split">
                    <span className="strong">{c.course.name} — training request</span>
                    <span className="pill warning">Needs your decision</span>
                  </div>
                  <p className="small muted" style={{ marginTop: 6 }}>
                    {CONTRACT_TYPE_LABELS[c.contractType]}
                    {c.ratePerStudentHour && ` · ₹${c.ratePerStudentHour}/student/hr`}
                    {c.flatRatePerDay && ` · ₹${c.flatRatePerDay}/day`} · Min {c.minStudents} students · {c.totalDays} days (
                    {format(c.startDate, "MMM d")}–{format(c.endDate, "MMM d, yyyy")})
                    {(c.targetBranch || c.targetSemester) && (
                      <> · <strong>{[c.targetBranch, c.targetSemester ? `Sem ${c.targetSemester}` : null].filter(Boolean).join(" · ")} only</strong></>
                    )}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <Link className="btn btn-sm" href={`/lms/college/contracts?contractId=${c.id}`}>
                      <Icon name="file" size={16} />
                      View MOU
                    </Link>
                    <details style={{ display: "inline" }}>
                      <summary style={{ display: "inline-flex", cursor: "pointer", listStyle: "none" }}>
                        <span className="btn btn-danger btn-sm">Reject</span>
                      </summary>
                      <form action={decideContract.bind(null, c.id, false)} className="stack" style={{ gap: 8, marginTop: 8, maxWidth: 280 }}>
                        <textarea className="textarea" name="reason" required rows={2} placeholder="Reason for rejecting (required)" />
                        <button className="btn btn-sm" type="submit">Confirm reject</button>
                      </form>
                    </details>
                    <form action={decideContract.bind(null, c.id, true)}>
                      <button className="btn btn-success btn-sm" type="submit">Approve</button>
                    </form>
                  </div>
                </div>
              ))}
              {pendingInvoices.map((inv) => (
                <div key={inv.id} className="box">
                  <div className="split">
                    <span className="strong">Invoice · {inv.contract.course.name}</span>
                    <strong>₹{inv.totalAmount}</strong>
                  </div>
                  <p className="small muted" style={{ marginTop: 6 }}>
                    {inv.totalStudents} students{inv.totalHours && ` · ${inv.totalHours} hrs`}
                    {inv.totalDays && ` · ${inv.totalDays} days`}
                    {inv.pdfUrl && (
                      <>
                        {" "}
                        · <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer">View PDF</a>
                      </>
                    )}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <details style={{ display: "inline" }}>
                      <summary style={{ display: "inline-flex", cursor: "pointer", listStyle: "none" }}>
                        <span className="btn btn-danger btn-sm">Reject</span>
                      </summary>
                      <form action={decideCollegeInvoice.bind(null, inv.id, false)} className="stack" style={{ gap: 8, marginTop: 8, maxWidth: 280 }}>
                        <textarea className="textarea" name="reason" required rows={2} placeholder="Reason for rejecting (required)" />
                        <button className="btn btn-sm" type="submit">Confirm reject</button>
                      </form>
                    </details>
                    <form action={decideCollegeInvoice.bind(null, inv.id, true)}>
                      <button className="btn btn-success btn-sm" type="submit">Accept</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Recent decisions
          </h2>
          {decidedContracts.length === 0 && decidedInvoices.length === 0 ? (
            <p className="muted">Nothing decided yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="table" style={{ minWidth: 420 }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {decidedContracts.map((c) => (
                    <tr key={c.id}>
                      <td><Link href={`/lms/college/contracts?contractId=${c.id}`}>{c.course.name}</Link></td>
                      <td>Training request</td>
                      <td><span className={`pill ${c.status === "APPROVED" ? "success" : "danger"}`}>{c.status === "APPROVED" ? "Approved" : "Rejected"}</span></td>
                    </tr>
                  ))}
                  {decidedInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td><Link href={`/lms/college/contracts?invoiceId=${inv.id}`}>{inv.contract.course.name}</Link></td>
                      <td>Invoice ₹{inv.totalAmount}</td>
                      <td>
                        <span className={`pill ${inv.status === "APPROVED" ? "success" : "danger"}`}>
                          {inv.status === "APPROVED" ? (inv.paidAt ? "Paid" : inv.paidRequestedAt ? "Awaiting confirmation" : "Accepted") : "Rejected"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="split">
      <dt className="muted">{label}</dt>
      <dd className={strong ? "strong" : ""}>{value}</dd>
    </div>
  );
}
