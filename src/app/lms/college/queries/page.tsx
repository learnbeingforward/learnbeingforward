import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { COLLEGE_NAV } from "@/components/lbf/nav-config";
import { getCollegeStudentRows } from "@/lib/college-data";
import { ExceptionRequestList } from "@/components/lms/ExceptionRequestList";

export default async function CollegeQueriesPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId;
  const college = await prisma.college.findUnique({ where: { id: collegeId! }, select: { name: true } });
  const shellUser = { name: college?.name ?? "College", subtitle: "College admin" };

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
    <AppShell
      nav={COLLEGE_NAV}
      active="queries"
      user={shellUser}
      crumb="Query from Student"
      title="Attendance exception requests"
      subtitle="Ask the company to make a student certificate-eligible when they missed classes for a genuine reason."
    >
      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>
          Students below the attendance requirement ({ineligibleRows.length})
        </h2>
        {ineligibleRows.length === 0 ? (
          <p className="empty">All your students currently meet the attendance requirement — nothing to request.</p>
        ) : (
          <ExceptionRequestList
            rows={ineligibleRows.map((row) => ({
              enrollmentId: row.enrollmentId,
              studentName: row.studentName,
              studentEmail: row.studentEmail,
              studentUsn: row.studentUsn,
              courseName: row.courseName,
              pct: row.pct,
            }))}
          />
        )}
      </section>

      {pastRequests.length > 0 && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Your requests
          </h2>
          <ul className="list">
            {pastRequests.map((req) => (
              <li key={req.id} className="list-row">
                <div className="grow">
                  <div className="strong">
                    {req.enrollment.student.name} — {req.enrollment.course.name}
                  </div>
                  <div className="small muted">{req.reason}</div>
                </div>
                <span className={`pill ${req.status === "APPROVED" ? "success" : req.status === "REJECTED" ? "danger" : "warning"}`}>
                  {req.status === "PENDING" ? "Pending" : req.status === "APPROVED" ? "Approved" : "Rejected"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
