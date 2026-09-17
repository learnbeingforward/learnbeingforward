import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import { PasswordResetRow } from "@/components/lms/PasswordResetRow";
import { ResetTrainerPasswordForm } from "@/components/lms/ResetTrainerPasswordForm";
import { format } from "date-fns";

export default async function CompanyPasswordResetsPage() {
  const [pending, decided, trainers] = await Promise.all([
    prisma.passwordResetRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.passwordResetRequest.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { decidedAt: "desc" },
      take: 15,
    }),
    prisma.trainer.findMany({ where: { loginUser: { isNot: null } }, orderBy: { name: "asc" } }),
  ]);

  return (
    <DashboardShell title="Password Resets" subtitle="Student forgot-password requests" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Only requests that match an active student account&apos;s name, email, and college can be
        fulfilled — this queue can never reset a college or company login. Type a new password and
        send it; there&apos;s no email provider configured yet, so this simulates delivery (the
        password is logged server-side for now).
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

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
          Reset a Trainer&apos;s Password
        </h2>
        <ResetTrainerPasswordForm trainers={trainers} />
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
