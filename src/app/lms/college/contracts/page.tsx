import Link from "next/link";
import { FileText } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BackLink } from "@/components/lms/BackLink";
import { decideContract, decideCollegeInvoice } from "@/lib/actions/college-contracts";
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

  if (contractId) {
    const contract = await prisma.collegeContract.findUnique({
      where: { id: contractId },
      include: { course: true, college: true },
    });
    if (!contract || contract.collegeId !== collegeId) {
      return (
        <DashboardShell title="Training Request" subtitle="Not found" navLinks={navLinks}>
          <BackLink href="/lms/college/contracts" label="Back to Contracts" />
          <p className="text-sm text-muted-foreground">This request doesn&apos;t belong to your college.</p>
        </DashboardShell>
      );
    }

    return (
      <DashboardShell title={contract.course.name} subtitle="Training request detail" navLinks={navLinks}>
        <BackLink href="/lms/college/contracts" label="Back to Contracts" />
        <div className="max-w-lg rounded-xl border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-indigo">{contract.course.name}</h2>
            <Badge
              className={
                contract.status === "APPROVED"
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : contract.status === "REJECTED"
                    ? "bg-red-100 text-red-700 hover:bg-red-100"
                    : "bg-gold/20 text-indigo hover:bg-gold/20"
              }
            >
              {contract.status}
            </Badge>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Training Type</dt>
              <dd className="text-indigo">{CONTRACT_TYPE_LABELS[contract.contractType]}</dd>
            </div>
            {contract.ratePerStudentHour && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Rate</dt>
                <dd className="text-indigo">₹{contract.ratePerStudentHour}/student/hr</dd>
              </div>
            )}
            {contract.flatRatePerDay && (
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
        </div>
      </DashboardShell>
    );
  }

  if (invoiceId) {
    const invoice = await prisma.collegeInvoice.findUnique({
      where: { id: invoiceId },
      include: { contract: { include: { course: true, college: true } } },
    });
    if (!invoice || invoice.contract.collegeId !== collegeId) {
      return (
        <DashboardShell title="Invoice" subtitle="Not found" navLinks={navLinks}>
          <BackLink href="/lms/college/contracts" label="Back to Contracts" />
          <p className="text-sm text-muted-foreground">This invoice doesn&apos;t belong to your college.</p>
        </DashboardShell>
      );
    }

    return (
      <DashboardShell title={invoice.contract.course.name} subtitle="Invoice detail" navLinks={navLinks}>
        <BackLink href="/lms/college/contracts" label="Back to Contracts" />
        <div className="max-w-lg rounded-xl border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-indigo">{invoice.contract.course.name}</h2>
            <Badge
              className={
                invoice.status === "APPROVED"
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : invoice.status === "REJECTED"
                    ? "bg-red-100 text-red-700 hover:bg-red-100"
                    : "bg-gold/20 text-indigo hover:bg-gold/20"
              }
            >
              {invoice.status}
            </Badge>
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

  const [pendingContracts, decidedContracts, pendingInvoices, decidedInvoices] = await Promise.all([
    prisma.collegeContract.findMany({
      where: { collegeId, status: "PENDING" },
      include: { course: true },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.collegeContract.findMany({
      where: { collegeId, status: { in: ["APPROVED", "REJECTED"] } },
      include: { course: true },
      orderBy: { decidedAt: "desc" },
      take: 10,
    }),
    prisma.collegeInvoice.findMany({
      where: { status: "PENDING", submitted: true, contract: { collegeId } },
      include: { contract: { include: { course: true } } },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.collegeInvoice.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] }, contract: { collegeId } },
      include: { contract: { include: { course: true } } },
      orderBy: { decidedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <DashboardShell title="Contracts" subtitle="Training MOUs & invoices" navLinks={navLinks}>
      <div className="mb-8 rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Pending Training Requests ({pendingContracts.length})</p>
        </div>
        {pendingContracts.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          <div className="divide-y divide-border">
            {pendingContracts.map((c) => (
              <div key={c.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-indigo">{c.course.name}</p>
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
                </div>
                <details className="group shrink-0">
                  <summary className="flex cursor-pointer list-none gap-2">
                    <form action={decideContract.bind(null, c.id, true)}>
                      <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                        Approve
                      </Button>
                    </form>
                    <span className="inline-flex h-8 items-center rounded-md border border-border px-3 text-sm text-muted-foreground">
                      Reject
                    </span>
                  </summary>
                  <form action={decideContract.bind(null, c.id, false)} className="mt-2 flex flex-col items-end gap-2">
                    <Textarea
                      name="reason"
                      required
                      rows={2}
                      placeholder="Reason for rejecting (required)"
                      className="w-64"
                    />
                    <Button type="submit" size="sm" variant="outline" className="border-destructive text-destructive">
                      Confirm Reject
                    </Button>
                  </form>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8 rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Pending Invoices ({pendingInvoices.length})</p>
        </div>
        {pendingInvoices.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No pending invoices.</p>
        ) : (
          <div className="divide-y divide-border">
            {pendingInvoices.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-indigo">{inv.contract.course.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.totalStudents} students
                    {inv.totalHours && ` · ${inv.totalHours} hrs`}
                    {inv.totalDays && ` · ${inv.totalDays} days`} &middot;{" "}
                    <span className="font-semibold text-indigo">₹{inv.totalAmount}</span>
                  </p>
                  {inv.pdfUrl && (
                    <Link
                      href={inv.pdfUrl}
                      target="_blank"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-indigo underline underline-offset-2"
                    >
                      <FileText className="size-3.5" /> View Invoice PDF
                    </Link>
                  )}
                </div>
                <details className="group shrink-0">
                  <summary className="flex cursor-pointer list-none gap-2">
                    <form action={decideCollegeInvoice.bind(null, inv.id, true)}>
                      <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                        Approve
                      </Button>
                    </form>
                    <span className="inline-flex h-8 items-center rounded-md border border-border px-3 text-sm text-muted-foreground">
                      Reject
                    </span>
                  </summary>
                  <form action={decideCollegeInvoice.bind(null, inv.id, false)} className="mt-2 flex flex-col items-end gap-2">
                    <Textarea
                      name="reason"
                      required
                      rows={2}
                      placeholder="Reason for rejecting (required)"
                      className="w-64"
                    />
                    <Button type="submit" size="sm" variant="outline" className="border-destructive text-destructive">
                      Confirm Reject
                    </Button>
                  </form>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>

      {(decidedContracts.length > 0 || decidedInvoices.length > 0) && (
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">Recent Decisions</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {decidedContracts.map((c) => (
              <Link
                key={c.id}
                href={`/lms/college/contracts?contractId=${c.id}`}
                className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-indigo">{c.course.name}</p>
                  <Badge
                    className={
                      c.status === "APPROVED"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-red-100 text-red-700 hover:bg-red-100"
                    }
                  >
                    {c.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Training Request</p>
              </Link>
            ))}
            {decidedInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/lms/college/contracts?invoiceId=${inv.id}`}
                className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-indigo">{inv.contract.course.name}</p>
                  <Badge
                    className={
                      inv.status === "APPROVED"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-red-100 text-red-700 hover:bg-red-100"
                    }
                  >
                    {inv.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Invoice ₹{inv.totalAmount}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
