import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { COLLEGE_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
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
      <div className="row">
        <section className="card grow">
          <div className="split" style={{ marginBottom: 18 }}>
            <h2 className="h2">Waiting on your decision ({pending.length})</h2>
          </div>
          {pending.length === 0 ? (
            <p className="empty">Nothing waiting on your college right now.</p>
          ) : (
            <ul style={{ margin: 0, padding: 0 }}>
              {pending.map((req) => {
                const initials = req.student.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <li key={req.id} className="box" style={{ listStyle: "none", marginBottom: 12 }}>
                    <div className="split" style={{ flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>
                      <div className="stat-inline">
                        <span className="avatar sm">{initials}</span>
                        <div>
                          <div className="strong">{req.student.name}</div>
                          {req.student.semester && <div className="small muted">Sem {req.student.semester}</div>}
                        </div>
                      </div>
                      <span className="pill warning">Waiting for you</span>
                    </div>
                    <div className="grid" style={{ ["--min" as string]: "180px", marginTop: 12 }}>
                      <div>
                        <div className="label">Course · module</div>
                        <div className="strong">{labelFor(req)}</div>
                      </div>
                      <div>
                        <div className="label">Requested</div>
                        <div className="small">{format(req.requestedAt, "MMM d, yyyy")}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      <form action={decideContentAccessRequestAsCollege.bind(null, req.id, false)}>
                        <button className="btn btn-danger btn-sm" type="submit">Decline</button>
                      </form>
                      <form action={decideContentAccessRequestAsCollege.bind(null, req.id, true)}>
                        <button className="btn btn-success btn-sm" type="submit">
                          <Icon name="check" size={16} />
                          Approve
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {decided.length > 0 && (
          <section className="card side">
            <div className="split" style={{ marginBottom: 18 }}>
              <h2 className="h2">Your past decisions</h2>
            </div>
            <ul className="list small">
              {decided.map((req) => (
                <li key={req.id} className="split" style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span>
                    <b>{req.student.name}</b>
                    <br />
                    <span className="muted">{labelFor(req)}</span>
                  </span>
                  <span className={`pill ${req.status === "APPROVED" ? "success" : "danger"}`}>{req.status === "APPROVED" ? "Approved" : "Rejected"}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}
