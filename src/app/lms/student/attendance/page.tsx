import Link from "next/link";
import { Award, CalendarClock, CheckCircle2, Clock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { studentNavLinks as navLinks } from "@/lib/lms-nav-links";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { AttendanceBarChart, AttendancePieChart } from "@/components/charts/AttendanceCharts";

export default async function StudentAttendancePage() {
  const session = await auth();
  const userId = session!.user.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: userId },
    include: {
      course: true,
      attendanceRecords: true,
      certification: true,
    },
    orderBy: { enrolledAt: "asc" },
  });

  const chartData = enrollments.map((e) => {
    const total = e.attendanceRecords.length || e.totalClasses;
    const present = e.attendanceRecords.filter((r) => r.present).length;
    return { name: e.course.name, pct: total > 0 ? Math.round((present / total) * 100) : 0 };
  });

  return (
    <DashboardShell title="Attendance" subtitle="Your progress" navLinks={navLinks}>
      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No enrollments yet — nothing to show here.
        </div>
      ) : (
        <div className="space-y-8">
          {chartData.length > 1 && (
            <div className="rounded-xl border border-border bg-white p-6">
              <p className="mb-2 text-sm font-semibold text-indigo">Attendance Across Courses</p>
              <AttendanceBarChart data={chartData} />
            </div>
          )}

          {enrollments.map((enrollment) => {
            const classesHeld = enrollment.attendanceRecords.length;
            const total = classesHeld || enrollment.totalClasses;
            const present = enrollment.attendanceRecords.filter((r) => r.present).length;
            const absent = total - present;
            const pct = total > 0 ? Math.round((present / total) * 100) : 0;
            const cert = enrollment.certification;
            const eligible = pct >= ATTENDANCE_THRESHOLD || cert?.overrideApproved;
            const remaining = Math.max(enrollment.totalClasses - classesHeld, 0);

            return (
              <div key={enrollment.id} className="rounded-xl border border-border bg-white p-6 sm:p-8">
                <h2 className="text-lg font-bold text-indigo">{enrollment.course.name}</h2>

                <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto]">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatBlock icon={CalendarClock} label="Classes Held" value={classesHeld} />
                    <StatBlock icon={CheckCircle2} label="Attended" value={present} />
                    <StatBlock icon={Clock} label="Upcoming" value={remaining} />
                    <StatBlock icon={Award} label="Attendance" value={`${pct}%`} />
                  </div>
                  <div className="mx-auto w-full max-w-[220px]">
                    <AttendancePieChart present={present} absent={absent} />
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {ATTENDANCE_THRESHOLD}% attendance required for certification eligibility.
                </p>

                <div className="mt-6 rounded-lg border border-indigo/15 bg-indigo/5 p-4">
                  <p className="text-sm font-semibold text-indigo">Certificate</p>
                  {cert?.status === "ISSUED" ? (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">
                        Your certificate has been issued and approved by your trainer.
                      </p>
                      <Button
                        render={<Link href={`/lms/student/certificate/${enrollment.id}`} />}
                        nativeButton={false}
                        size="sm"
                        className="bg-gold text-indigo hover:bg-gold/90"
                      >
                        Download Certificate
                      </Button>
                    </div>
                  ) : eligible ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      You&apos;ve met the attendance requirement — waiting on your trainer&apos;s final
                      approval before the certificate is issued.
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Not yet eligible — keep your attendance above {ATTENDANCE_THRESHOLD}% to qualify.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-border bg-cream px-3 py-3">
      <Icon className="size-4 text-indigo/70" />
      <p className="mt-1.5 text-lg font-bold text-indigo">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
