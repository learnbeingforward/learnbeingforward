import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { ApproveContractRateForm } from "@/components/lms/ApproveContractRateForm";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CSR: "CSR (Free)",
  PER_STUDENT_HOURLY: "Per Student, Per Hour",
  PER_DAY_FLAT: "Flat Rate Per Day",
};

export default async function CompanyCollegeApprovalsPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("colleges.approvals");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const pendingRateContracts = await prisma.collegeContract.findMany({
    where: { status: "PENDING_RATE" },
    include: { college: true, course: true },
    orderBy: { requestedAt: "asc" },
  });

  return (
    <AppShell
      nav={nav}
      active="colleges"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Accounts › Colleges › Approvals"
      title="Approvals"
      subtitle="The second admin can request training without a rate. Set the rate and send it to the college."
    >
      <BackLink href="/lms/company/colleges" label="Back to Colleges" />
      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>Pending approvals ({pendingRateContracts.length})</h2>
        {pendingRateContracts.length === 0 ? (
          <div className="empty">
            <span className="icon-box gold" style={{ margin: "0 auto 10px", width: 48, height: 48, borderRadius: "50%" }}>
              <Icon name="check" size={22} />
            </span>
            <div className="h3" style={{ color: "var(--text)" }}>Nothing waiting on a rate right now.</div>
          </div>
        ) : (
          <ul className="list">
            {pendingRateContracts.map((c) => (
              <li key={c.id} className="list-row" style={{ flexWrap: "wrap" }}>
                <div className="grow">
                  <div className="strong">{c.college.name} — {c.course.name}</div>
                  <div className="small muted">
                    {CONTRACT_TYPE_LABELS[c.contractType]} · Min {c.minStudents} students · {c.totalDays} days ({format(c.startDate, "MMM d")}–{format(c.endDate, "MMM d, yyyy")})
                    {(c.targetBranch || c.targetSemester) && (
                      <>
                        {" "}·{" "}
                        <span className="strong">{[c.targetBranch, c.targetSemester ? `Sem ${c.targetSemester}` : null].filter(Boolean).join(" · ")} only</span>
                      </>
                    )}
                  </div>
                </div>
                <ApproveContractRateForm contractId={c.id} contractType={c.contractType} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
