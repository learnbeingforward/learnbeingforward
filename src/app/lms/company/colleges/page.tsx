import Link from "next/link";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { RequestTrainingForm } from "@/components/lms/RequestTrainingForm";
import { BackLink } from "@/components/lms/BackLink";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

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

function statusPillClass(status: string) {
  return status === "APPROVED" ? "success" : status === "REJECTED" ? "danger" : "gold";
}

function invoiceLabel(invoice: { status: string; paidAt: Date | null; paidRequestedAt?: Date | null }) {
  if (invoice.status === "APPROVED") {
    return invoice.paidAt ? "Paid" : invoice.paidRequestedAt ? "Awaiting Confirmation" : "Accepted";
  }
  return STATUS_LABELS[invoice.status] ?? invoice.status;
}

export default async function CompanyCollegesPage({
  searchParams,
}: {
  searchParams: Promise<{ contractId?: string; invoiceId?: string }>;
}) {
  const { contractId, invoiceId } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("colleges.view");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const isAdmin2 = session.user.role === "ADMIN2";

  if (contractId) {
    const contract = await prisma.collegeContract.findUnique({
      where: { id: contractId },
      include: { course: true, college: true, invoices: true },
    });
    if (!contract || (isAdmin2 && contract.requestedByAdminId !== session!.user.id)) {
      return (
        <AppShell nav={nav} active="colleges" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Colleges" title="Training Request" subtitle="Not found">
          <BackLink href="/lms/company/colleges" label="Back to Colleges" />
          <p className="muted">This request is not accessible to you.</p>
        </AppShell>
      );
    }

    return (
      <AppShell nav={nav} active="colleges" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Colleges" title={contract.course.name} subtitle="Training request detail">
        <BackLink href="/lms/company/colleges" label="Back to Colleges" />
        <section className="card" style={{ maxWidth: 520 }}>
          <div className="split" style={{ marginBottom: 16 }}>
            <h2 className="h2">{contract.course.name}</h2>
            <span className={`pill ${statusPillClass(contract.status)}`}>{STATUS_LABELS[contract.status]}</span>
          </div>
          <p className="small muted" style={{ marginBottom: 14 }}>{contract.college.name}</p>
          <dl className="stack" style={{ gap: 10, fontSize: 14 }}>
            <div className="split"><dt className="muted">Training Type</dt><dd>{CONTRACT_TYPE_LABELS[contract.contractType]}</dd></div>
            {!isAdmin2 && contract.ratePerStudentHour && <div className="split"><dt className="muted">Rate</dt><dd>₹{contract.ratePerStudentHour}/student/hr</dd></div>}
            {!isAdmin2 && contract.flatRatePerDay && <div className="split"><dt className="muted">Rate</dt><dd>₹{contract.flatRatePerDay}/day</dd></div>}
            <div className="split"><dt className="muted">Minimum Students</dt><dd>{contract.minStudents}</dd></div>
            <div className="split"><dt className="muted">Duration</dt><dd>{contract.totalDays} days ({format(contract.startDate, "MMM d")}–{format(contract.endDate, "MMM d, yyyy")})</dd></div>
            {(contract.targetBranch || contract.targetSemester) && (
              <div className="split"><dt className="muted">Restricted To</dt><dd>{[contract.targetBranch, contract.targetSemester ? `Sem ${contract.targetSemester}` : null].filter(Boolean).join(" · ")}</dd></div>
            )}
            <div className="split"><dt className="muted">Requested</dt><dd>{format(contract.requestedAt, "MMM d, yyyy")}</dd></div>
            <div className="split"><dt className="muted">Decided</dt><dd>{contract.decidedAt ? format(contract.decidedAt, "MMM d, yyyy") : "—"}</dd></div>
            {contract.rejectReason && (
              <div><dt className="muted" style={{ marginBottom: 4 }}>Rejection Reason</dt><dd style={{ background: "var(--cream)", borderRadius: 10, padding: 10 }}>{contract.rejectReason}</dd></div>
            )}
          </dl>
          {!isAdmin2 && contract.invoices.filter((inv) => inv.submitted).length > 0 && (
            <div style={{ marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <p className="small muted" style={{ marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>Invoices</p>
              <ul className="list">
                {contract.invoices.filter((inv) => inv.submitted).map((inv) => (
                  <li key={inv.id} className="list-row">
                    <Link className="grow" href={`/lms/company/colleges?invoiceId=${inv.id}`}>₹{inv.totalAmount}</Link>
                    <span className={`pill ${statusPillClass(inv.status)}`}>{invoiceLabel(inv)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </AppShell>
    );
  }

  if (invoiceId && !isAdmin2) {
    const invoice = await prisma.collegeInvoice.findUnique({
      where: { id: invoiceId },
      include: { contract: { include: { course: true, college: true } } },
    });
    if (!invoice) {
      return (
        <AppShell nav={nav} active="colleges" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Colleges" title="Invoice" subtitle="Not found">
          <BackLink href="/lms/company/colleges" label="Back to Colleges" />
          <p className="muted">This invoice could not be found.</p>
        </AppShell>
      );
    }

    return (
      <AppShell nav={nav} active="colleges" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Colleges" title={invoice.contract.course.name} subtitle="Invoice detail">
        <BackLink href="/lms/company/colleges" label="Back to Colleges" />
        <section className="card" style={{ maxWidth: 520 }}>
          <div className="split" style={{ marginBottom: 16 }}>
            <h2 className="h2">{invoice.contract.course.name}</h2>
            <span className={`pill ${statusPillClass(invoice.status)}`}>{invoiceLabel(invoice)}</span>
          </div>
          <p className="small muted" style={{ marginBottom: 14 }}>{invoice.contract.college.name}</p>
          <dl className="stack" style={{ gap: 10, fontSize: 14 }}>
            <div className="split"><dt className="muted">Students Trained</dt><dd>{invoice.totalStudents}</dd></div>
            {invoice.totalHours && <div className="split"><dt className="muted">Total Hours</dt><dd>{invoice.totalHours}</dd></div>}
            {invoice.totalDays && <div className="split"><dt className="muted">Total Days</dt><dd>{invoice.totalDays}</dd></div>}
            <div className="split"><dt className="muted">Amount</dt><dd className="strong">₹{invoice.totalAmount}</dd></div>
            <div className="split"><dt className="muted">Submitted</dt><dd>{format(invoice.submittedAt, "MMM d, yyyy")}</dd></div>
            <div className="split"><dt className="muted">Decided</dt><dd>{invoice.decidedAt ? format(invoice.decidedAt, "MMM d, yyyy") : "—"}</dd></div>
            {invoice.rejectReason && (
              <div><dt className="muted" style={{ marginBottom: 4 }}>Rejection Reason</dt><dd style={{ background: "var(--cream)", borderRadius: 10, padding: 10 }}>{invoice.rejectReason}</dd></div>
            )}
          </dl>
          {invoice.pdfUrl && (
            <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <FileText size={16} /> View Invoice PDF
            </a>
          )}
        </section>
      </AppShell>
    );
  }

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
      <AppShell nav={nav} active="colleges" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Colleges" title="Colleges" subtitle="Request training">
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>Request Training</h2>
          <RequestTrainingForm colleges={colleges} courses={courses} hideRate />
        </section>
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>My Training Requests ({myContracts.length})</h2>
          {myContracts.length === 0 ? (
            <p className="empty">No training requests yet.</p>
          ) : (
            <ul className="list" style={{ maxHeight: 280, overflowY: "auto" }}>
              {myContracts.map((c) => (
                <li key={c.id} className="list-row">
                  <Link className="grow" href={`/lms/company/colleges?contractId=${c.id}`}>
                    <div className="strong">{c.college.name} — {c.course.name}</div>
                    <div className="small muted">
                      {CONTRACT_TYPE_LABELS[c.contractType]} · Min {c.minStudents} students · {c.totalDays} days ({format(c.startDate, "MMM d")}–{format(c.endDate, "MMM d, yyyy")})
                    </div>
                  </Link>
                  <span className={`pill ${statusPillClass(c.status)}`}>{STATUS_LABELS[c.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </AppShell>
    );
  }

  const [pendingRateCount, sentCount, approvedCount] = await Promise.all([
    prisma.collegeContract.count({ where: { status: "PENDING_RATE" } }),
    prisma.collegeContract.count({ where: { status: { not: "PENDING_RATE" } } }),
    prisma.collegeContract.count({ where: { status: "APPROVED" } }),
  ]);

  const quickLinks = [
    { href: "/lms/company/colleges/approvals", icon: "clipboard" as const, title: "Approvals", description: "Set the rate on contracts the second admin requested, then send them to the college.", count: pendingRateCount },
    { href: "/lms/company/colleges/sent", icon: "mail" as const, title: "Sent to college", description: "Every contract sent, its status, and invoice generation.", count: sentCount },
    { href: "/lms/company/colleges/mous", icon: "file" as const, title: "MOUs", description: "Generate and edit a formal MOU for each approved training.", count: approvedCount },
  ];

  return (
    <AppShell
      nav={nav}
      active="colleges"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Accounts › Colleges"
      title="Colleges"
      subtitle="Send training requests and manage contracts, invoices and MOUs."
      actions={<Link className="btn btn-ghost-light" href="/lms/company/accounts"><Icon name="plus" size={16} />Add college</Link>}
    >
      <div className="grid" style={{ ["--min" as string]: "260px" }}>
        {quickLinks.map((link) => (
          <Link key={link.href} className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }} href={link.href}>
            <div className="split">
              <span className="icon-box gold"><Icon name={link.icon} size={20} /></span>
              <span className="value" style={{ fontSize: 28, fontWeight: 700 }}>{link.count}</span>
            </div>
            <h3 className="h3" style={{ marginTop: 12 }}>{link.title}</h3>
            <p className="small muted" style={{ marginTop: 4 }}>{link.description}</p>
          </Link>
        ))}
      </div>

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>New training request</h2>
        <RequestTrainingForm colleges={colleges} courses={courses} />
      </section>
    </AppShell>
  );
}
