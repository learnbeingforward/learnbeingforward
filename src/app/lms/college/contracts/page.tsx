import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { decideContract, decideCollegeInvoice } from "@/lib/actions/college-contracts";
import { format } from "date-fns";

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CSR: "CSR (Free)",
  PER_STUDENT_HOURLY: "Per Student, Per Hour",
  PER_DAY_FLAT: "Flat Rate Per Day",
};

export default async function CollegeContractsPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId!;

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
      where: { status: "PENDING", contract: { collegeId } },
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
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-indigo">{c.course.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {CONTRACT_TYPE_LABELS[c.contractType]}
                    {c.ratePerStudentHour && ` · ₹${c.ratePerStudentHour}/student/hr`}
                    {c.flatRatePerDay && ` · ₹${c.flatRatePerDay}/day`} &middot; Min {c.minStudents} students
                    &middot; {c.totalDays} days ({format(c.startDate, "MMM d")}–{format(c.endDate, "MMM d, yyyy")})
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={decideContract.bind(null, c.id, true)}>
                    <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                      Approve
                    </Button>
                  </form>
                  <form action={decideContract.bind(null, c.id, false)}>
                    <Button type="submit" size="sm" variant="outline" className="border-border text-muted-foreground">
                      Reject
                    </Button>
                  </form>
                </div>
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
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-indigo">{inv.contract.course.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.totalStudents} students
                    {inv.totalHours && ` · ${inv.totalHours} hrs`}
                    {inv.totalDays && ` · ${inv.totalDays} days`} &middot;{" "}
                    <span className="font-semibold text-indigo">₹{inv.totalAmount}</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={decideCollegeInvoice.bind(null, inv.id, true)}>
                    <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                      Approve
                    </Button>
                  </form>
                  <form action={decideCollegeInvoice.bind(null, inv.id, false)}>
                    <Button type="submit" size="sm" variant="outline" className="border-border text-muted-foreground">
                      Reject
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(decidedContracts.length > 0 || decidedInvoices.length > 0) && (
        <div className="rounded-xl border border-border bg-white">
          <div className="border-b border-border p-6">
            <p className="text-sm font-semibold text-indigo">Recent Decisions</p>
          </div>
          <div className="divide-y divide-border">
            {decidedContracts.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="text-sm text-indigo">{c.course.name} — Training Request</p>
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
            ))}
            {decidedInvoices.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="text-sm text-indigo">
                  {inv.contract.course.name} — Invoice ₹{inv.totalAmount}
                </p>
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
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
