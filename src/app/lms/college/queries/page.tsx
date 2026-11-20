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
          <div className="split" style={{ marginBottom: 18 }}>
            <div>
              <h2 className="h2">Your requests</h2>
              <p className="subtitle">Attendance exceptions you sent to Learn Being Forward.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table m-cards" style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Reason</th>
                  <th>Sent</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {pastRequests.map((req) => {
                  const initials = req.enrollment.student.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <tr key={req.id}>
                      <td data-label="Student">
                        <div className="stat-inline">
                          <span className="avatar sm">{initials}</span>
                          <div>
                            <div className="strong">{req.enrollment.student.name}</div>
                            {req.enrollment.student.usn && <div className="small muted">USN: {req.enrollment.student.usn}</div>}
                          </div>
                        </div>
                      </td>
                      <td data-label="Course">{req.enrollment.course.name}</td>
                      <td data-label="Reason">{req.reason}</td>
                      <td data-label="Sent">{req.requestedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td data-label="Decision">
                        <span className={`pill ${req.status === "APPROVED" ? "success" : req.status === "REJECTED" ? "danger" : "warning"}`}>
                          {req.status === "PENDING" ? "Waiting" : req.status === "APPROVED" ? "Approved" : "Rejected"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="alert info" style={{ marginTop: 14 }}>
            <span>
              New requests need a reason of at least 20 characters and, for medical reasons, a document — so every
              exception certificate has a clear record.
            </span>
          </div>
        </section>
      )}
    </AppShell>
  );
}
