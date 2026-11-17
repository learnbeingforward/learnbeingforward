import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { COLLEGE_NAV } from "@/components/lbf/nav-config";
import { decideContentAccessRequestAsCollege } from "@/lib/actions/content-access";
import { format } from "date-fns";

function labelFor(req: {
  courseContent: { course: { name: string }; courseModule: { title: string } | null } | null;
  courseModule: { course: { name: string }; title: string } | null;
}) {
  if (req.courseContent) return `Course content — ${req.courseContent.course.name} — ${req.courseContent.courseModule?.title ?? "—"}`;
  if (req.courseModule) return `Course book — ${req.courseModule.course.name} — ${req.courseModule.title}`;
  return "—";
}

export default async function CollegeContentRequestsPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId!;
  const college = await prisma.college.findUnique({ where: { id: collegeId }, select: { name: true } });
  const shellUser = { name: college?.name ?? "College", subtitle: "College admin" };

  const [pending, decided] = await Promise.all([
    prisma.contentAccessRequest.findMany({
      where: { status: "PENDING_COLLEGE", student: { collegeId } },
      include: {
        student: { select: { name: true, semester: true } },
        courseContent: { include: { course: true, courseModule: true } },
        courseModule: { include: { course: true } },
      },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.contentAccessRequest.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] }, student: { collegeId } },
      include: {
        student: { select: { name: true, semester: true } },
        courseContent: { include: { course: true, courseModule: true } },
        courseModule: { include: { course: true } },
      },
      orderBy: { decidedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <AppShell
      nav={COLLEGE_NAV}
      active="content-requests"
      user={shellUser}
      crumb="Content Requests"
      title="Content access requests"
      subtitle="Learn Being Forward sent these to your college to decide — the student's attendance is below the required threshold."
    >
      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>
          Waiting on your decision ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="empty">Nothing waiting on your college right now.</p>
        ) : (
          <ul className="list">
            {pending.map((req) => (
              <li key={req.id} className="list-row">
                <div className="grow">
                  <div className="strong">
                    {req.student.name}
                    {req.student.semester ? ` · Sem ${req.student.semester}` : ""}
                  </div>
                  <div className="small muted">{labelFor(req)}</div>
                  <div className="small muted">Requested {format(req.requestedAt, "MMM d, yyyy")}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <form action={decideContentAccessRequestAsCollege.bind(null, req.id, true)}>
                    <button className="btn btn-primary btn-sm" type="submit">Approve</button>
                  </form>
                  <form action={decideContentAccessRequestAsCollege.bind(null, req.id, false)}>
                    <button className="btn btn-sm" type="submit">Reject</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {decided.length > 0 && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Your past decisions
          </h2>
          <ul className="list">
            {decided.map((req) => (
              <li key={req.id} className="list-row">
                <div className="grow">
                  <div className="strong">{req.student.name}</div>
                  <div className="small muted">{labelFor(req)}</div>
                </div>
                <span className={`pill ${req.status === "APPROVED" ? "success" : "danger"}`}>{req.status === "APPROVED" ? "Approved" : "Rejected"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
