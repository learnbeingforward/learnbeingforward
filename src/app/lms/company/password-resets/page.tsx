import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import { PasswordResetRow } from "@/components/lms/PasswordResetRow";
import { format } from "date-fns";

export default async function CompanyPasswordResetsPage() {
  const [pending, decided] = await Promise.all([
    prisma.passwordResetRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.passwordResetRequest.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { decidedAt: "desc" },
      take: 15,
    }),
  ]);

  return (
    <DashboardShell title="Password Reset Requests" subtitle="Forgot-password requests" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Students, colleges, trainers, and second admins can all send a request here when they forget
        their password — the main company admin&apos;s own login can never be reset this way. Type a
        new password and send it; there&apos;s no email provider configured yet, so this simulates
        delivery (the password is logged server-side for now). Need to reset an account directly
        without a request? Use Manage Accounts instead.
      </p>

      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Pending ({pending.length})</p>
        </div>
        {pending.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          <div className="divide-y divide-border">
            {pending.map((req) => (
              <PasswordResetRow key={req.id} request={req} />
            ))}
          </div>
        )}
      </div>

      {decided.length > 0 && (
        <div className="mt-8 rounded-xl border border-border bg-white">
          <div className="border-b border-border p-6">
            <p className="text-sm font-semibold text-indigo">Recent Decisions</p>
          </div>
          <div className="divide-y divide-border">
            {decided.map((req) => (
              <div key={req.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="text-sm text-indigo">
                  {req.name} — {req.email}
                  {req.decidedAt && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {format(req.decidedAt, "MMM d, yyyy")}
                    </span>
                  )}
                </p>
                <Badge
                  className={
                    req.status === "APPROVED"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"
                  }
                >
                  {req.status === "APPROVED" ? "Sent" : "Rejected"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
