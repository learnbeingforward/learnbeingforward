import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { STUDENT_NAV } from "@/components/lbf/nav-config";
import { Icon, type IconName } from "@/components/lbf/icons";
import { DomainTabs } from "@/components/lbf/DomainTabs";
import { requestEnrollment } from "@/lib/actions/enrollment-requests";

const DOMAIN_ORDER = ["TECHNICAL", "APTITUDE", "SOFT_SKILL"] as const;
const DOMAIN_LABELS: Record<(typeof DOMAIN_ORDER)[number], string> = {
  TECHNICAL: "Technical",
  APTITUDE: "Aptitude",
  SOFT_SKILL: "Soft skills",
};
const DOMAIN_ICONS: Record<(typeof DOMAIN_ORDER)[number], IconName> = {
  TECHNICAL: "code",
  APTITUDE: "target",
  SOFT_SKILL: "message",
};

export default async function BrowseCoursesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [student, courses, enrollments, requests] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, studentStatus: true, college: { select: { name: true } } } }),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    prisma.enrollment.findMany({ where: { studentId: userId }, select: { id: true, courseId: true } }),
    prisma.enrollmentRequest.findMany({ where: { studentId: userId }, orderBy: { requestedAt: "desc" } }),
  ]);

  const shellUser = { name: student?.name ?? "Student", subtitle: student?.college?.name ?? "Student" };
  const isActive = student?.studentStatus === "ACTIVE";
  const enrollmentByCourse = new Map(enrollments.map((e) => [e.courseId, e.id]));
  const latestRequestByCourse = new Map<string, (typeof requests)[number]>();
  for (const req of requests) {
    if (!latestRequestByCourse.has(req.courseId)) latestRequestByCourse.set(req.courseId, req);
  }

  const panels: Record<string, React.ReactNode> = {};
  for (const domain of DOMAIN_ORDER) {
    const domainCourses = courses.filter((c) => c.domain === domain);
    panels[domain] = (
      <div className="grid" style={{ ["--min" as string]: "280px" }}>
        {domainCourses.map((course) => {
          const enrollmentId = enrollmentByCourse.get(course.id);
          const request = latestRequestByCourse.get(course.id);
          return (
            <article key={course.id} className="box stack" style={{ gap: 10 }}>
              <div className="split">
                <span className="icon-box navy">
                  <Icon name={DOMAIN_ICONS[domain]} size={20} />
                </span>
                {enrollmentId ? (
                  <span className="pill success">Enrolled</span>
                ) : request?.status === "PENDING" ? (
                  <span className="pill warning">Requested</span>
                ) : request?.status === "REJECTED" ? (
                  <span className="pill danger">Declined</span>
                ) : null}
              </div>
              <h3 className="h3">{course.name}</h3>
              <p className="small muted">{course.shortDescription || course.description.slice(0, 120)}</p>
              <div>
                {enrollmentId ? (
                  <a className="btn btn-sm" href={`/lms/student?enrollmentId=${enrollmentId}`}>
                    Go to course
                  </a>
                ) : request?.status === "PENDING" ? (
                  <button className="btn btn-sm" type="button" disabled>
                    Awaiting approval
                  </button>
                ) : (
                  <form action={requestEnrollment.bind(null, course.id)}>
                    <button className="btn btn-primary btn-sm" type="submit" disabled={!isActive}>
                      {request?.status === "REJECTED" ? "Request again" : "Request enrollment"}
                    </button>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <AppShell nav={STUDENT_NAV} active="courses" user={shellUser} crumb="Course catalog" title="Browse courses" subtitle="Request enrollment — your college and Learn Being Forward approve it.">
      {!isActive && (
        <div className="alert gold">
          <Icon name="clock" size={18} className="shrink-0" />
          <span>Your registration is still awaiting company approval. You&apos;ll be able to request courses once it&apos;s approved.</span>
        </div>
      )}
      <section className="card">
        <DomainTabs tabs={DOMAIN_ORDER.map((d) => ({ key: d, label: DOMAIN_LABELS[d] }))} panels={panels} />
      </section>
    </AppShell>
  );
}
