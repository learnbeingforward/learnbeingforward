import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { requestEnrollment } from "@/lib/actions/enrollment-requests";

const navLinks = [
  { href: "/lms/student", label: "My Dashboard" },
  { href: "/lms/student/courses", label: "Browse Courses" },
];

export default async function BrowseCoursesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [courses, enrollments, requests] = await Promise.all([
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    prisma.enrollment.findMany({ where: { studentId: userId }, select: { courseId: true } }),
    prisma.enrollmentRequest.findMany({
      where: { studentId: userId },
      orderBy: { requestedAt: "desc" },
    }),
  ]);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  const latestRequestByCourse = new Map<string, (typeof requests)[number]>();
  for (const req of requests) {
    if (!latestRequestByCourse.has(req.courseId)) latestRequestByCourse.set(req.courseId, req);
  }

  return (
    <DashboardShell title="Browse Courses" subtitle="Course catalog" navLinks={navLinks}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const enrolled = enrolledCourseIds.has(course.id);
          const request = latestRequestByCourse.get(course.id);

          return (
            <div key={course.id} className="flex flex-col rounded-xl border border-border bg-white p-6">
              <h3 className="font-semibold text-indigo">{course.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {course.description}
              </p>

              <div className="mt-5">
                {enrolled ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                    <CheckCircle2 className="size-3.5" /> Enrolled
                  </span>
                ) : request?.status === "PENDING" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-indigo">
                    <Clock className="size-3.5" /> Request pending
                  </span>
                ) : request?.status === "REJECTED" ? (
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                      <XCircle className="size-3.5" /> Request declined
                    </span>
                    <form action={requestEnrollment.bind(null, course.id)}>
                      <Button type="submit" size="sm" variant="outline" className="w-full border-border text-indigo">
                        Request again
                      </Button>
                    </form>
                  </div>
                ) : (
                  <form action={requestEnrollment.bind(null, course.id)}>
                    <Button type="submit" size="sm" className="w-full bg-indigo text-white hover:bg-indigo/90">
                      Request Enrollment
                    </Button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
