import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  approveAttendanceException,
  rejectAttendanceException,
} from "@/lib/actions/attendance-exceptions";
import { format } from "date-fns";

export default async function CompanyApprovalsPage() {
  const [pending, decided] = await Promise.all([
    prisma.attendanceException.findMany({
      where: { status: "PENDING" },
      include: { college: true, enrollment: { include: { student: true, course: true } } },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.attendanceException.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      include: { college: true, enrollment: { include: { student: true, course: true } } },
      orderBy: { decidedAt: "desc" },
      take: 15,
    }),
  ]);

  return (
    <DashboardShell title="Approvals from College" subtitle="Attendance exceptions" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Colleges submit these when a student couldn&apos;t meet the attendance requirement for a
        valid reason. Approving makes that student immediately certificate-eligible for the course.
      </p>

      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Pending</p>
        </div>
        {pending.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          <div className="divide-y divide-border">
            {pending.map((req) => (
              <div key={req.id} className="flex flex-wrap items-start justify-between gap-4 p-6">
                <div>
                  <p className="font-medium text-indigo">
                    {req.enrollment.student.name}
                    {req.enrollment.student.usn && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        USN: {req.enrollment.student.usn}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {req.college?.name ?? "—"} &middot; {req.enrollment.course.name}
                  </p>
                  <p className="mt-2 max-w-xl text-sm text-indigo/80">&ldquo;{req.reason}&rdquo;</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Requested {format(req.requestedAt, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={approveAttendanceException.bind(null, req.id)}>
                    <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                      Approve
                    </Button>
                  </form>
                  <form action={rejectAttendanceException.bind(null, req.id)}>
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

      {decided.length > 0 && (
        <div className="mt-8 rounded-xl border border-border bg-white">
          <div className="border-b border-border p-6">
            <p className="text-sm font-semibold text-indigo">Recent Decisions</p>
          </div>
          <div className="divide-y divide-border">
            {decided.map((req) => (
              <div key={req.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="text-sm text-indigo">
                  {req.enrollment.student.name} — {req.enrollment.course.name}
                </p>
                <Badge
                  className={
                    req.status === "APPROVED"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"
                  }
                >
                  {req.status === "APPROVED" ? "Approved" : "Rejected"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
