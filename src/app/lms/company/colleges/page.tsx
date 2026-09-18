import Link from "next/link";
import { FileText } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCompanyNavLinksForRole } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import { RequestTrainingForm } from "@/components/lms/RequestTrainingForm";
import { BackLink } from "@/components/lms/BackLink";
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

function statusBadgeClass(status: string) {
  return status === "APPROVED"
    ? "bg-green-100 text-green-700 hover:bg-green-100"
    : status === "REJECTED"
      ? "bg-red-100 text-red-700 hover:bg-red-100"
      : "bg-gold/20 text-indigo hover:bg-gold/20";
}

export default async function CompanyCollegesPage({
  searchParams,
}: {
  searchParams: Promise<{ contractId?: string; invoiceId?: string }>;
}) {
  const { contractId, invoiceId } = await searchParams;
  const session = await auth();
  const isAdmin2 = session!.user.role === "ADMIN2";
  const navLinks = getCompanyNavLinksForRole(session!.user.role);

  if (contractId) {
    const contract = await prisma.collegeContract.findUnique({
      where: { id: contractId },
      include: { course: true, college: true, invoices: true },
    });
    if (!contract || (isAdmin2 && contract.requestedByAdminId !== session!.user.id)) {
      return (
        <DashboardShell title="Training Request" subtitle="Not found" navLinks={navLinks}>
          <BackLink href="/lms/company/colleges" label="Back to Colleges" />
          <p className="text-sm text-muted-foreground">This request is not accessible to you.</p>
        </DashboardShell>
      );
    }

    return (
      <DashboardShell title={contract.course.name} subtitle="Training request detail" navLinks={navLinks}>
        <BackLink href="/lms/company/colleges" label="Back to Colleges" />
        <div className="max-w-lg rounded-xl border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-indigo">{contract.course.name}</h2>
              <p className="text-sm text-muted-foreground">{contract.college.name}</p>
            </div>
            <Badge className={statusBadgeClass(contract.status)}>{STATUS_LABELS[contract.status]}</Badge>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Training Type</dt>
              <dd className="text-indigo">{CONTRACT_TYPE_LABELS[contract.contractType]}</dd>
            </div>
            {!isAdmin2 && contract.ratePerStudentHour && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Rate</dt>
                <dd className="text-indigo">₹{contract.ratePerStudentHour}/student/hr</dd>
              </div>
            )}
            {!isAdmin2 && contract.flatRatePerDay && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Rate</dt>
                <dd className="text-indigo">₹{contract.flatRatePerDay}/day</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Minimum Students</dt>
              <dd className="text-indigo">{contract.minStudents}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="text-indigo">
                {contract.totalDays} days ({format(contract.startDate, "MMM d")}–{format(contract.endDate, "MMM d, yyyy")})
              </dd>
            </div>
            {(contract.targetBranch || contract.targetSemester) && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Restricted To</dt>
                <dd className="text-indigo">
                  {[contract.targetBranch, contract.targetSemester ? `Sem ${contract.targetSemester}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Requested</dt>
              <dd className="text-indigo">{format(contract.requestedAt, "MMM d, yyyy")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Decided</dt>
              <dd className="text-indigo">{contract.decidedAt ? format(contract.decidedAt, "MMM d, yyyy") : "—"}</dd>
            </div>
            {contract.rejectReason && (
              <div>
                <dt className="mb-1 text-muted-foreground">Rejection Reason</dt>
                <dd className="rounded-lg bg-cream p-3 text-indigo">{contract.rejectReason}</dd>
              </div>
            )}
          </dl>
          {!isAdmin2 && contract.invoices.filter((inv) => inv.submitted).length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invoices</p>
              <div className="space-y-2">
                {contract.invoices
                  .filter((inv) => inv.submitted)
                  .map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/lms/company/colleges?invoiceId=${inv.id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:border-indigo/40"
                    >
                      <span className="font-medium text-indigo">₹{inv.totalAmount}</span>
                      <Badge className={statusBadgeClass(inv.status)}>{inv.status}</Badge>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    );
  }

  if (invoiceId && !isAdmin2) {
    const invoice = await prisma.collegeInvoice.findUnique({
      where: { id: invoiceId },
      include: { contract: { include: { course: true, college: true } } },
    });
    if (!invoice) {
      return (
        <DashboardShell title="Invoice" subtitle="Not found" navLinks={navLinks}>
          <BackLink href="/lms/company/colleges" label="Back to Colleges" />
          <p className="text-sm text-muted-foreground">This invoice could not be found.</p>
        </DashboardShell>
      );
    }

    return (
      <DashboardShell title={invoice.contract.course.name} subtitle="Invoice detail" navLinks={navLinks}>
        <BackLink href="/lms/company/colleges" label="Back to Colleges" />
        <div className="max-w-lg rounded-xl border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-indigo">{invoice.contract.course.name}</h2>
              <p className="text-sm text-muted-foreground">{invoice.contract.college.name}</p>
            </div>
            <Badge className={statusBadgeClass(invoice.status)}>{invoice.status}</Badge>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Students Trained</dt>
              <dd className="text-indigo">{invoice.totalStudents}</dd>
            </div>
            {invoice.totalHours && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Total Hours</dt>
                <dd className="text-indigo">{invoice.totalHours}</dd>
              </div>
            )}
            {invoice.totalDays && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Total Days</dt>
                <dd className="text-indigo">{invoice.totalDays}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-semibold text-indigo">₹{invoice.totalAmount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Submitted</dt>
              <dd className="text-indigo">{format(invoice.submittedAt, "MMM d, yyyy")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Decided</dt>
              <dd className="text-indigo">{invoice.decidedAt ? format(invoice.decidedAt, "MMM d, yyyy") : "—"}</dd>
            </div>
            {invoice.rejectReason && (
              <div>
                <dt className="mb-1 text-muted-foreground">Rejection Reason</dt>
                <dd className="rounded-lg bg-cream p-3 text-indigo">{invoice.rejectReason}</dd>
              </div>
            )}
          </dl>
          {invoice.pdfUrl && (
            <Link
              href={invoice.pdfUrl}
              target="_blank"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo underline underline-offset-2"
            >
              <FileText className="size-4" /> View Invoice PDF
            </Link>
          )}
        </div>
      </DashboardShell>
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
                <Link
                  key={c.id}
                  href={`/lms/company/colleges?contractId=${c.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-cream/60"
                >
                  <div>
                    <p className="text-sm font-medium text-indigo">
                      {c.college.name} — {c.course.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {CONTRACT_TYPE_LABELS[c.contractType]} &middot; Min {c.minStudents} students &middot;{" "}
                      {c.totalDays} days ({format(c.startDate, "MMM d")}–{format(c.endDate, "MMM d, yyyy")})
                    </p>
                  </div>
                  <Badge className={statusBadgeClass(c.status)}>
                    {STATUS_LABELS[c.status]}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    );
  }

  const [pendingRateCount, sentCount, approvedCount] = await Promise.all([
    prisma.collegeContract.count({ where: { status: "PENDING_RATE" } }),
    prisma.collegeContract.count({ where: { status: { not: "PENDING_RATE" } } }),
    prisma.collegeContract.count({ where: { status: "APPROVED" } }),
  ]);

  const quickLinks = [
    {
      href: "/lms/company/colleges/approvals",
      title: "Approvals",
      description: "Set the rate on contracts the second admin requested, then send them to the college.",
      count: pendingRateCount,
    },
    {
      href: "/lms/company/colleges/sent",
      title: "Sent to College",
      description: "Every contract sent so far, its status, and invoice generation.",
      count: sentCount,
    },
    {
      href: "/lms/company/colleges/mous",
      title: "MOUs",
      description: "Generate and edit a formal MOU for each training the college has approved.",
      count: approvedCount,
    },
  ];

  return (
    <DashboardShell title="Colleges" subtitle="Send Contract" navLinks={navLinks}>
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
          Request Training
        </h2>
        <RequestTrainingForm colleges={colleges} courses={courses} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
        Other Sections
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-indigo">{link.title}</p>
              <Badge className="bg-gold/20 text-indigo hover:bg-gold/20">{link.count}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
