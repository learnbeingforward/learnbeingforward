import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { decideContentAccessRequest } from "@/lib/actions/course-content";
import { sendContentRequestToCollege } from "@/lib/actions/content-access";
import { getStudentCourseAttendance } from "@/lib/content-access";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

type PendingRequest = {
  id: string;
  status: string;
  requestedAt: Date;
  studentId: string;
  student: { name: string; semester: number | null; college: { name: string } | null };
  courseContent: { course: { id: string; name: string }; courseModule: { title: string } | null } | null;
  courseModule: { course: { id: string; name: string }; title: string } | null;
};

function labelFor(req: PendingRequest) {
  if (req.courseContent) return `Course content — ${req.courseContent.course.name} — ${req.courseContent.courseModule?.title ?? "—"}`;
  if (req.courseModule) return `Course book — ${req.courseModule.course.name} — ${req.courseModule.title}`;
  return "—";
}

function courseIdFor(req: PendingRequest) {
  return req.courseContent?.course.id ?? req.courseModule?.course.id ?? null;
}

async function RequestRow({ req }: { req: PendingRequest }) {
  const courseId = courseIdFor(req);
  const { pct, eligible } = courseId ? await getStudentCourseAttendance(req.studentId, courseId) : { pct: 0, eligible: false };

  return (
    <li className="list-row" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="grow">
        <div className="strong">{req.student.name}</div>
        <div className="small muted">
          {req.student.college?.name ?? "No college"}
          {req.student.semester ? ` · Sem ${req.student.semester}` : ""} · {labelFor(req)}
        </div>
        <div className="small muted">Requested {format(req.requestedAt, "MMM d, yyyy")}</div>
      </div>
      <span className={`pill ${eligible ? "success" : "warning"}`}>{eligible ? `${pct}% attendance` : `${pct}% — below threshold`}</span>
      {req.status === "PENDING_COLLEGE" ? (
        <span className="pill info">Sent to college — awaiting their decision</span>
      ) : eligible ? (
        <div style={{ display: "flex", gap: 8 }}>
          <form action={decideContentAccessRequest.bind(null, req.id, true)}>
            <button className="btn btn-primary btn-sm" type="submit">Approve</button>
          </form>
          <form action={decideContentAccessRequest.bind(null, req.id, false)}>
            <button className="btn btn-sm" type="submit">Reject</button>
          </form>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <form action={decideContentAccessRequest.bind(null, req.id, true)}>
            <button className="btn btn-primary btn-sm" type="submit">Approve Directly</button>
          </form>
          <form action={sendContentRequestToCollege.bind(null, req.id)}>
            <button className="btn btn-gold btn-sm" type="submit">Send to College</button>
          </form>
          <form action={decideContentAccessRequest.bind(null, req.id, false)}>
            <button className="btn btn-sm" type="submit">Reject</button>
          </form>
        </div>
      )}
    </li>
  );
}

export default async function CourseContentRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { studentId } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("course-content");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const pending = (await prisma.contentAccessRequest.findMany({
    where: { status: { in: ["PENDING", "PENDING_COLLEGE"] }, groupId: null },
    include: {
      student: { select: { name: true, semester: true, college: { select: { name: true } } } },
      courseContent: { include: { course: { select: { id: true, name: true } }, courseModule: true } },
      courseModule: { include: { course: { select: { id: true, name: true } } } },
    },
    orderBy: { requestedAt: "asc" },
  })) as PendingRequest[];

  if (studentId) {
    const studentRequests = pending.filter((r) => r.studentId === studentId);
    const studentName = studentRequests[0]?.student.name ?? "Student";

    return (
      <AppShell nav={nav} active="course-content" user={shellUser} hasUnread={hasUnread} crumb="Course Content › Requests" title={studentName} subtitle="Pending content requests">
        <BackLink href="/lms/company/course-content/requests" label="Back to Pending Requests" />
        <section className="card">
          {studentRequests.length === 0 ? (
            <p className="empty">Nothing pending for this student anymore.</p>
          ) : (
            <ul className="list">
              {studentRequests.map((req) => (
                <RequestRow key={req.id} req={req} />
              ))}
            </ul>
          )}
        </section>
      </AppShell>
    );
  }

  const byStudent = new Map<string, { name: string; requests: PendingRequest[] }>();
  for (const r of pending) {
    const existing = byStudent.get(r.studentId);
    if (existing) existing.requests.push(r);
    else byStudent.set(r.studentId, { name: r.student.name, requests: [r] });
  }

  return (
    <AppShell
      nav={nav}
      active="course-content"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Course Content › Requests"
      title="Pending content requests"
      subtitle="A student below the attendance threshold can still ask — you decide whether to approve it yourself or send it to their college."
    >
      <BackLink href="/lms/company/course-content" label="Back to Course Content" />
      <section className="card">
        {byStudent.size === 0 ? (
          <p className="empty">No pending requests.</p>
        ) : (
          <ul className="list">
            {Array.from(byStudent.entries()).map(([sid, group]) =>
              group.requests.length === 1 ? (
                <RequestRow key={sid} req={group.requests[0]} />
              ) : (
                <Link key={sid} className="list-row" href={`/lms/company/course-content/requests?studentId=${sid}`}>
                  <span className="grow">
                    <span className="strong" style={{ display: "block" }}>{group.name}</span>
                    <span className="small muted">{group.requests.length} pending requests — review together</span>
                  </span>
                  <Icon name="chevR" size={16} />
                </Link>
              )
            )}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
