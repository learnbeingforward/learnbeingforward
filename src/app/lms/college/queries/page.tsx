import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { getCollegeStudentRows } from "@/lib/college-data";
import { Badge } from "@/components/ui/badge";
import { RequestExceptionForm } from "@/components/lms/RequestExceptionForm";

export default async function CollegeQueriesPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId;

  const { rows } = await getCollegeStudentRows(collegeId);
  const ineligibleRows = rows.filter((r) => !r.eligible);

  const pastRequests = collegeId
    ? await prisma.attendanceException.findMany({
        where: { collegeId },
        include: { enrollment: { include: { student: true, course: true } } },
        orderBy: { requestedAt: "desc" },
      })
    : [];

  return (
    <DashboardShell title="Query from Student" subtitle="Attendance exception requests" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        If a student couldn&apos;t meet the attendance requirement for a genuine reason, request
        that the company make an exception so they can still become certificate-eligible.
      </p>

      {ineligibleRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
          All your students currently meet the attendance requirement — nothing to request.
        </div>
      ) : (
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {ineligibleRows.map((row) => (
            <RequestExceptionForm
              key={row.enrollmentId}
              enrollmentId={row.enrollmentId}
              studentName={row.studentName}
              studentUsn={row.studentUsn}
              courseName={row.courseName}
              pct={row.pct}
            />
          ))}
        </div>
      )}

      {pastRequests.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-6">
          <p className="mb-4 text-sm font-semibold text-indigo">Your Requests</p>
          <div className="space-y-3">
            {pastRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-cream px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-indigo">
                    {req.enrollment.student.name} — {req.enrollment.course.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{req.reason}</p>
                </div>
                <Badge
                  className={
                    req.status === "APPROVED"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : req.status === "REJECTED"
                        ? "bg-red-100 text-red-700 hover:bg-red-100"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  }
                >
                  {req.status === "PENDING" ? "Pending" : req.status === "APPROVED" ? "Approved" : "Rejected"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
