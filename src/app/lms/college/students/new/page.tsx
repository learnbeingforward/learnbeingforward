import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { COLLEGE_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { AddStudentSection } from "@/components/lms/AddStudentSection";

const STATUS_PILL: Record<string, { label: string; pillClass: string }> = {
  PRE_REGISTERED: { label: "Waiting for student to sign up", pillClass: "warning" },
  PENDING_APPROVAL: { label: "Signed up · awaiting company approval", pillClass: "info" },
  ACTIVE: { label: "Active", pillClass: "success" },
};

export default async function AddCollegeStudentPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId!;
  const [college, recentStudents] = await Promise.all([
    prisma.college.findUnique({ where: { id: collegeId }, select: { name: true } }),
    prisma.user.findMany({
      where: { collegeId, role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, studentStatus: true, createdAt: true },
    }),
  ]);
  const shellUser = { name: college?.name ?? "College", subtitle: "College admin" };

  return (
    <AppShell nav={COLLEGE_NAV} active="add-student" user={shellUser} crumb="Students › Add student" title="Add student" subtitle="Add students to your college roster.">
      <div className="alert info">
        <Icon name="shield" size={18} className="shrink-0" />
        <span>
          This doesn&apos;t create a login by itself. The student signs up on the login page, and it only succeeds if
          their <strong>name and email match exactly</strong> what you enter here. The company then approves the
          registration. Bulk uploads with a password column are active immediately.
        </span>
      </div>
      <section className="card">
        <div className="split" style={{ marginBottom: 18 }}>
          <h2 className="h2">Single student</h2>
        </div>
        <AddStudentSection />
      </section>

      {recentStudents.length > 0 && (
        <section className="card">
          <div className="split" style={{ marginBottom: 18 }}>
            <h2 className="h2">Recently added</h2>
          </div>
          <div className="table-wrap">
            <table className="table m-cards" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Added</th>
                  <th>Signup status</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((s) => {
                  const initials = s.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  const status = STATUS_PILL[s.studentStatus] ?? STATUS_PILL.ACTIVE;
                  return (
                    <tr key={s.id}>
                      <td data-label="Student">
                        <div className="stat-inline">
                          <span className="avatar sm">{initials}</span>
                          <div>
                            <div className="strong">{s.name}</div>
                            <div className="small muted">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Added">{s.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                      <td data-label="Signup status">
                        <span className={`pill ${status.pillClass}`}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AppShell>
  );
}
