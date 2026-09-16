import { CheckCircle2, XCircle, BookOpen, Rocket } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AttendanceBar } from "@/components/shared/AttendanceBar";
import { Badge } from "@/components/ui/badge";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

export default async function StudentDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: userId },
    include: {
      course: { include: { modules: true } },
      attendanceRecords: true,
      certification: true,
    },
    orderBy: { enrolledAt: "asc" },
  });

  return (
    <DashboardShell title="Student Dashboard" subtitle="Welcome back">
      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center">
          <BookOpen className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium text-indigo">You&apos;re not enrolled in any courses yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your college or training coordinator will enroll you once your program starts.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {enrollments.map((enrollment) => {
            const total = enrollment.attendanceRecords.length || enrollment.totalClasses;
            const present = enrollment.attendanceRecords.filter((r) => r.present).length;
            const pct = total > 0 ? Math.round((present / total) * 100) : 0;
            const eligible = pct >= ATTENDANCE_THRESHOLD;

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
