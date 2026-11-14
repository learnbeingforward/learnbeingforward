import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { STUDENT_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { BackLink } from "@/components/lms/BackLink";
import { EnrollmentProgressView } from "@/components/lms/EnrollmentProgressView";
import { getEnrollmentProgress } from "@/lib/enrollment-progress";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";
import { format } from "date-fns";

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ enrollmentId?: string }>;
}) {
  const { enrollmentId } = await searchParams;
  const session = await auth();
  const userId = session!.user.id;

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, studentStatus: true, college: { select: { name: true } } },
  });
  const shellUser = { name: student?.name ?? "Student", subtitle: student?.college?.name ?? "Student" };
  const firstName = (student?.name ?? "there").split(" ")[0];

  if (enrollmentId) {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId }, select: { studentId: true } });
    const progress = enrollment?.studentId === userId ? await getEnrollmentProgress(enrollmentId) : null;

    return (
      <AppShell nav={STUDENT_NAV} active="dashboard" user={shellUser} crumb="Welcome back" title="Course progress" subtitle="Session-by-session detail">
        <BackLink href="/lms/student" label="Back to Dashboard" />
        {!progress ? <p className="muted">You&apos;re not enrolled in this course.</p> : <EnrollmentProgressView progress={progress} />}
      </AppShell>
    );
  }

  const [enrollments, pendingRequests, assessmentsDue] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId: userId },
      include: { course: { include: { modules: true } }, trainer: true, attendanceRecords: true, certification: true },
      orderBy: { enrolledAt: "asc" },
    }),
    prisma.enrollmentRequest.findMany({ where: { studentId: userId, status: "PENDING" }, include: { course: true } }),
    prisma.assessmentAssignment.count({ where: { studentId: userId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } } }),
  ]);

  const batchIds = enrollments.map((e) => e.batchId).filter((id): id is string => id !== null);
  const upcomingSessions =
    batchIds.length > 0
      ? await prisma.trainingSession.findMany({
          where: { batchId: { in: batchIds }, attendanceTaken: false, sessionDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
          include: { batch: { include: { course: true } }, courseModule: true },
          orderBy: [{ sessionDate: "asc" }, { slotNumber: "asc" }],
          take: 5,
        })
      : [];

  const withStats = enrollments.map((e) => {
    const total = e.attendanceRecords.length || e.totalClasses;
    const present = e.attendanceRecords.filter((r) => r.present).length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    const eligible = pct >= ATTENDANCE_THRESHOLD || !!e.certification?.overrideApproved;
    return { enrollment: e, total, present, pct, eligible };
  });
  const overallPct =
    withStats.length > 0 ? Math.round(withStats.reduce((sum, s) => sum + s.pct, 0) / withStats.length) : 0;
  const next = upcomingSessions[0];

  return (
    <AppShell
      nav={STUDENT_NAV}
      active="dashboard"
      user={shellUser}
      crumb="Welcome back"
      title={`Hi ${firstName}`}
      subtitle="Your courses, attendance and what's next."
      actions={
        <Link className="btn btn-ghost-light" href="/lms/student/courses">
          <Icon name="book" size={16} />
          Browse courses
        </Link>
      }
    >
      {student?.studentStatus === "PENDING_APPROVAL" && (
        <div className="alert warning">
          <Icon name="clock" size={18} className="shrink-0" />
          <span>Your registration is awaiting company approval. You&apos;ll be able to request courses once it&apos;s approved.</span>
        </div>
      )}

      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "180px" }}>
          <div className="tile">
            <div className="label">Enrolled courses</div>
            <div className="value">{enrollments.length}</div>
          </div>
          <div className="tile success">
            <div className="label">Overall attendance</div>
            <div className="value">{overallPct}%</div>
          </div>
          <div className="tile gold">
            <div className="label">Next class</div>
            <div className="value">{next ? format(next.sessionDate, "EEE") + " " + next.startTime : "—"}</div>
            {next && <div className="delta">{next.courseModule?.title ?? next.batch.course.name}</div>}
          </div>
          <div className="tile">
            <div className="label">Assessments due</div>
            <div className="value">{assessmentsDue}</div>
          </div>
        </div>
      </section>

      {pendingRequests.map((req) => (
        <div key={req.id} className="alert gold">
          <Icon name="clock" size={18} className="shrink-0" />
          <span>
            Your request to enroll in <strong>{req.course.name}</strong> is awaiting company approval.
          </span>
        </div>
      ))}

      {withStats.length === 0 ? (
        <div className="empty">
          <p className="h3">You&apos;re not enrolled in any courses yet.</p>
          <p className="muted" style={{ marginTop: 6 }}>
            Browse the course catalog and request enrollment — your college and our team will get you set up.
          </p>
          <Link className="btn btn-primary" href="/lms/student/courses" style={{ marginTop: 16 }}>
            Browse Courses
          </Link>
        </div>
      ) : (
        withStats.map(({ enrollment, total, present, pct, eligible }) => (
          <section key={enrollment.id} className="card">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
              <div
                role="img"
                aria-label={`${pct}% attendance`}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: `conic-gradient(var(--success) ${pct * 3.6}deg, #E8E3D7 0)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <strong style={{ fontSize: 20 }}>{pct}%</strong>
                  <span className="small muted" style={{ fontSize: 10 }}>
                    attendance
                  </span>
                </div>
              </div>
              <div style={{ flex: "1 1 260px" }}>
                <div className="eyebrow">Enrolled course</div>
                <h2 className="h2" style={{ marginTop: 4 }}>
                  {enrollment.course.name}
                </h2>
                <div className="small muted" style={{ marginTop: 2 }}>
                  Trainer: {enrollment.trainer?.name ?? "Not yet assigned"} ·{" "}
                  <Link href={`/lms/student?enrollmentId=${enrollment.id}`}>View details</Link>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <span className={`pill ${eligible ? "success" : "warning"}`}>Certification: {eligible ? "Eligible" : "Not yet eligible"}</span>
                  {enrollment.certification?.overrideApproved && <span className="pill info">Approved by exception</span>}
                  <span className="pill">
                    {present} / {total} classes
                  </span>
                </div>
              </div>
              {enrollment.certification?.overrideApproved ? (
                <div className="alert info" style={{ flex: "1 1 280px" }}>
                  <Icon name="shield" size={18} className="shrink-0" />
                  <span>
                    <strong>Certificate approved by exception.</strong> Your college requested it for a valid reason and
                    Learn Being Forward approved it, so the attendance rule doesn&apos;t apply.
                  </span>
                </div>
              ) : (
                <div className={`alert ${eligible ? "success" : "warning"}`} style={{ flex: "1 1 280px" }}>
                  <Icon name="award" size={18} className="shrink-0" />
                  <span>
                    {ATTENDANCE_THRESHOLD}% attendance is required for certification — you&apos;re at <strong>{pct}%</strong>.
                    {eligible && " Placement support is unlocked."}
                  </span>
                </div>
              )}
            </div>
            {enrollment.course.modules.length > 0 && (
              <>
                <hr className="divider" />
                <div className="label" style={{ marginBottom: 10 }}>
                  Course materials
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {enrollment.course.modules.map((mod) => (
                    <Link key={mod.id} className="chip" href="/lms/student/content" style={{ textDecoration: "none", color: "inherit", gap: 6 }}>
                      <Icon name="book" size={14} />
                      {mod.title}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        ))
      )}

      {withStats.some((s) => s.eligible) && (
        <div className="alert gold">
          <Icon name="briefcase" size={18} className="shrink-0" />
          <span>
            <strong>Placement support</strong> is unlocked for {withStats.filter((s) => s.eligible).map((s) => s.enrollment.course.name).join(", ")}.
            Keep your <Link href="/lms/student/profile">CV</Link> updated so the placement team can share it.
          </span>
        </div>
      )}
    </AppShell>
  );
}
