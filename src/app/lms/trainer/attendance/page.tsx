import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { trainerNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Button } from "@/components/ui/button";
import { submitSessionAttendance } from "@/lib/actions/trainer-attendance";
import { format } from "date-fns";

export default async function TrainerAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { sessionId } = await searchParams;
  const session = await auth();
  const trainerId = session!.user.trainerId!;

  if (!sessionId) {
    const pending = await prisma.trainingSession.findMany({
      where: { trainerId, attendanceTaken: false },
      include: { batch: { include: { college: true, course: true } }, courseModule: true },
      orderBy: [{ sessionDate: "asc" }, { slotNumber: "asc" }],
    });

    return (
      <DashboardShell title="Attendance" subtitle="Pick a session to mark" navLinks={navLinks}>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
            No sessions awaiting attendance.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-white">
            <div className="divide-y divide-border">
              {pending.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div>
                    <p className="font-medium text-indigo">
                      {s.batch.college.name} — {s.batch.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(s.sessionDate, "EEE, MMM d, yyyy")} &middot; Slot {s.slotNumber} (
                      {s.startTime}–{s.endTime}) &middot; {s.courseModule?.title ?? s.topic ?? "—"}
                    </p>
                  </div>
                  <Button
                    render={<Link href={`/lms/trainer/attendance?sessionId=${s.id}`} />}
                    nativeButton={false}
                    size="sm"
                    className="bg-indigo text-white hover:bg-indigo/90"
                  >
                    Mark Attendance
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DashboardShell>
    );
  }

  const trainingSession = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: {
      batch: {
        include: {
          college: true,
          course: true,
          enrollments: { include: { student: true } },
        },
      },
      courseModule: true,
    },
  });

  if (!trainingSession || trainingSession.trainerId !== trainerId) {
    return (
      <DashboardShell title="Attendance" subtitle="Session not found" navLinks={navLinks}>
        <p className="text-sm text-muted-foreground">
          This session doesn&apos;t exist or isn&apos;t assigned to you.
        </p>
      </DashboardShell>
    );
  }

  if (trainingSession.attendanceTaken) {
    return (
      <DashboardShell title="Attendance" subtitle="Already submitted" navLinks={navLinks}>
        <p className="text-sm text-muted-foreground">
          Attendance for this session has already been submitted and can&apos;t be changed here.
        </p>
      </DashboardShell>
    );
  }

  const enrollments = trainingSession.batch.enrollments;

  return (
    <DashboardShell
      title="Mark Attendance"
      subtitle={`${trainingSession.batch.college.name} — ${trainingSession.batch.name}`}
      navLinks={navLinks}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {format(trainingSession.sessionDate, "EEE, MMM d, yyyy")} &middot; Slot{" "}
        {trainingSession.slotNumber} ({trainingSession.startTime}–{trainingSession.endTime}) &middot;{" "}
        {trainingSession.courseModule?.title ?? trainingSession.topic ?? "—"}
      </p>

      <form action={submitSessionAttendance.bind(null, trainingSession.id)} className="rounded-xl border border-border bg-white">
        <div className="divide-y divide-border">
          {enrollments.map((enrollment) => (
            <label
              key={enrollment.id}
              className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-cream"
            >
              <span className="text-indigo">
                {enrollment.student.name}
                {enrollment.student.usn && (
                  <span className="ml-2 text-xs text-muted-foreground">USN: {enrollment.student.usn}</span>
                )}
              </span>
              <span className="flex items-center gap-2">
                Present
                <input type="checkbox" name={`present_${enrollment.id}`} defaultChecked className="size-4" />
              </span>
            </label>
          ))}
        </div>
        <div className="p-4">
          <Button type="submit" className="bg-indigo text-white hover:bg-indigo/90">
            Submit Attendance
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
