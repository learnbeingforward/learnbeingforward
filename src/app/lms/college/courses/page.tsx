import { Clock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { getCollegeStudentRows, summarizeByCourse } from "@/lib/college-data";

const navLinks = [
  { href: "/lms/college", label: "Overview" },
  { href: "/lms/college/students", label: "Students" },
  { href: "/lms/college/courses", label: "Courses" },
];

export default async function CollegeCoursesPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId;

  const { rows } = await getCollegeStudentRows(collegeId);
  const byCourse = summarizeByCourse(rows);

  const pendingRequests = collegeId
    ? await prisma.enrollmentRequest.findMany({
        where: { collegeId, status: "PENDING" },
        include: { student: true, course: true },
        orderBy: { requestedAt: "asc" },
      })
    : [];

  const studentsByCourse = new Map<string, string[]>();
  for (const row of rows) {
    const list = studentsByCourse.get(row.courseName) ?? [];
    list.push(row.studentName);
    studentsByCourse.set(row.courseName, list);
  }

  return (
    <DashboardShell title="Courses" subtitle="Course activity" navLinks={navLinks}>
      {pendingRequests.length > 0 && (
        <div className="mb-8 rounded-xl border border-gold/40 bg-gold/10 p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo">
            <Clock className="size-4" /> Awaiting company approval
          </p>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 text-sm"
              >
                <span className="text-indigo">
                  <strong>{req.student.name}</strong> requested {req.course.name}
                </span>
                <Badge className="bg-gold/20 text-indigo hover:bg-gold/20">Pending</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {byCourse.size === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No active courses yet.
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(byCourse.entries()).map(([course, data]) => (
            <div key={course} className="rounded-xl border border-border bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-indigo">{course}</h3>
                <span className="text-sm text-muted-foreground">
                  {data.count} student{data.count !== 1 ? "s" : ""} &middot;{" "}
                  {Math.round(data.totalPct / data.count)}% avg attendance
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(studentsByCourse.get(course) ?? []).map((name, i) => (
                  <span
                    key={`${name}-${i}`}
                    className="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-indigo/80"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
