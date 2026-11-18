import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { approveBatchRequest, rejectBatchRequest } from "@/lib/actions/batches";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function BatchRequestsPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("trainers.manage");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const requests = await prisma.batchRequest.findMany({
    include: { college: true, course: true },
    orderBy: { requestedAt: "desc" },
  });

  const pending = requests.filter((r) => r.status === "PENDING");
  const decided = requests.filter((r) => r.status !== "PENDING");

  function studentCount(r: (typeof requests)[number]) {
    return Array.isArray(r.studentIds) ? r.studentIds.length : 0;
  }

  return (
    <AppShell
      nav={nav}
      active="trainers"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Accounts › Trainers › Batches › Requests"
      title="Batch requests"
      subtitle="Batches colleges have asked to create — approve to set the training type, rate and schedule and activate it."
    >
      <BackLink href="/lms/company/trainers/batches" label="Back to Batches" />

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 14 }}>
          Awaiting approval ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="empty">Nothing pending right now.</p>
        ) : (
          <div className="stack" style={{ gap: 14 }}>
            {pending.map((r) => (
              <div key={r.id} className="box">
                <div className="split">
                  <div>
                    <div className="strong">
                      {r.college.name} · {r.name || r.course.name}
                      {r.semester ? ` · Sem ${r.semester}` : ""}
                    </div>
                    <div className="small muted" style={{ marginTop: 2 }}>
                      {r.course.name} · {studentCount(r)} student(s) · requested {new Date(r.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="pill warning">Pending</span>
                </div>

                <div className="split" style={{ marginTop: 14, alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                  <form action={approveBatchRequest.bind(null, r.id)} className="grid" style={{ ["--min" as string]: "160px", gap: 10, flex: 1 }}>
                    <div>
                      <label className="small muted">Training type</label>
                      <select className="input" name="trainingType" required defaultValue="">
                        <option value="" disabled>
                          Select…
                        </option>
                        <option value="CSR">CSR</option>
                        <option value="FREE">Free</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="small muted">Price / hourly rate</label>
                      <input className="input" type="number" name="rate" min={1} placeholder="For paid training" />
                    </div>
                    <div>
                      <label className="small muted">Start date</label>
                      <input className="input" type="date" name="trainingStartDate" required />
                    </div>
                    <div>
                      <label className="small muted"># of training days</label>
                      <input className="input" type="number" name="trainingDays" min={1} required />
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      <button className="btn btn-success btn-sm" type="submit">
                        Approve &amp; activate
                      </button>
                    </div>
                  </form>

                  <details>
                    <summary style={{ display: "inline-flex", cursor: "pointer", listStyle: "none" }}>
                      <span className="btn btn-danger btn-sm">Reject</span>
                    </summary>
                    <form action={rejectBatchRequest.bind(null, r.id)} className="stack" style={{ gap: 8, marginTop: 8, maxWidth: 260 }}>
                      <textarea className="textarea" name="reason" required rows={2} placeholder="Reason for rejecting (required)" />
                      <button className="btn btn-sm" type="submit">
                        Confirm reject
                      </button>
                    </form>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {decided.length > 0 && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 14 }}>
            Decided
          </h2>
          <ul className="list">
            {decided.map((r) => (
              <li key={r.id} className="list-row" style={{ flexWrap: "wrap" }}>
                <div className="grow">
                  <div className="strong">
                    {r.college.name} · {r.name || r.course.name}
                  </div>
                  <div className="small muted">
                    {r.course.name} · {studentCount(r)} student(s)
                    {r.status === "REJECTED" && r.rejectReason ? ` · ${r.rejectReason}` : ""}
                  </div>
                </div>
                <span className={`pill ${r.status === "APPROVED" ? "success" : ""}`}>
                  {r.status === "APPROVED" ? "Approved" : "Rejected"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
