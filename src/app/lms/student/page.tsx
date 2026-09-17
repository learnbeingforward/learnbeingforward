import Link from "next/link";
import { AlertTriangle, CheckCircle2, XCircle, BookOpen, Rocket, Clock, CalendarDays } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AttendanceBar } from "@/components/shared/AttendanceBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";
import { studentNavLinks as navLinks } from "@/lib/lms-nav-links";
import { format } from "date-fns";

export default async function StudentDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [student, enrollments, pendingRequests] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { studentStatus: true } }),
    prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: { include: { modules: true } },
        attendanceRecords: true,
        certification: true,
      },
      orderBy: { enrolledAt: "asc" },
    }),
    prisma.enrollmentRequest.findMany({
      where: { studentId: userId, status: "PENDING" },
      include: { course: true },
    }),
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

  return (
    <DashboardShell title="Student Dashboard" subtitle="Welcome back" navLinks={navLinks}>
      {student?.studentStatus === "PENDING_APPROVAL" && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-indigo">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            Your registration is awaiting company approval. You&apos;ll be able to request courses
            once it&apos;s approved — this usually doesn&apos;t take long.
          </span>
        </div>
      )}

      {upcomingSessions.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-white p-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo">
            <CalendarDays className="size-4" /> Upcoming Classes
          </p>
          <div className="space-y-2">
            {upcomingSessions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-cream px-3 py-2 text-sm">
                <span className="text-indigo">
                  {s.batch.course.name} &middot; {s.courseModule?.title ?? s.topic ?? "Topic TBD"}
                </span>
                <span className="text-muted-foreground">
                  {format(s.sessionDate, "EEE, MMM d")} &middot; {s.startTime}–{s.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="mb-6 space-y-2">
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center gap-3 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-indigo"
            >
              <Clock className="size-4 shrink-0" />
              Your request to enroll in <strong>{req.course.name}</strong> is awaiting company approval.
            </div>
          ))}
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center">
          <BookOpen className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium text-indigo">You&apos;re not enrolled in any courses yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse the course catalog and request enrollment — your college and our team will get you set up.
          </p>
          <Button
            render={<Link href="/lms/student/courses" />}
            nativeButton={false}
            className="mt-5 bg-indigo text-white hover:bg-indigo/90"
          >
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {enrollments.map((enrollment) => {
            const total = enrollment.attendanceRecords.length || enrollment.totalClasses;
            const present = enrollment.attendanceRecords.filter((r) => r.present).length;
            const pct = total > 0 ? Math.round((present / total) * 100) : 0;
            const eligible = pct >= ATTENDANCE_THRESHOLD || enrollment.certification?.overrideApproved;

            return (
              <div key={enrollment.id} className="rounded-xl border border-border bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo">
                      Enrolled Course
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-indigo">{enrollment.course.name}</h2>
                  </div>
                  <Badge
                    className={
                      eligible
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                    }
                  >
                    {eligible ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <XCircle className="size-3.5" />
                    )}
                    {eligible ? "Certification: Eligible" : "Certification: Not Yet Eligible"}
                  </Badge>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-indigo">
                      Attendance — {present} / {total} classes
                    </span>
                    <span className="font-semibold text-indigo">{pct}%</span>
                  </div>
                  <AttendanceBar pct={pct} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {ATTENDANCE_THRESHOLD}% attendance required for certification — you&apos;re at{" "}
                    {pct}%.
                  </p>
                </div>

                <div className="mt-7">
                  <p className="mb-3 text-sm font-semibold text-indigo">Course Materials</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {enrollment.course.modules.map((mod) => (
                      <div
                        key={mod.id}
                        className="rounded-lg border border-border bg-cream px-4 py-3 text-sm text-indigo"
                      >
                        {mod.title}
                        {mod.level && (
                          <span className="ml-2 text-xs text-muted-foreground">({mod.level})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex items-start gap-3 rounded-lg border border-indigo/15 bg-indigo/5 p-4">
                  <Rocket className="mt-0.5 size-5 shrink-0 text-indigo" />
                  <div>
                    <p className="text-sm font-semibold text-indigo">Placement Support</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {eligible
                        ? "You've met the attendance requirement — placement support is unlocked for this course."
                        : "Keep your attendance above the threshold to unlock placement support for this course."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
