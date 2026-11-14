import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { AccountDetailView, type AccountDetail } from "@/components/lms/AccountDetailView";
import type { AccountKind } from "@/lib/actions/account-details";
import {
  AccountDetailsTabs,
  type StudentRow,
  type CollegeRow,
  type TrainerRow,
  type AdminRow,
} from "@/components/lms/AccountDetailsTabs";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

async function loadAccountDetail(kind: AccountKind, id: string): Promise<AccountDetail | null> {
  if (kind === "student") {
    const s = await prisma.user.findUnique({ where: { id, role: "STUDENT" } });
    if (!s) return null;
    return { id: s.id, kind, name: s.name, email: s.email, phone: s.phone, branch: s.branch, semester: s.semester, usn: s.usn };
  }
  if (kind === "college") {
    const a = await prisma.user.findUnique({ where: { id, role: "COLLEGE_ADMIN" }, include: { college: true } });
    if (!a || !a.college) return null;
    return { id: a.id, kind, name: a.name, email: a.email, phone: a.phone, collegeName: a.college.name, contactEmail: a.college.contactEmail };
  }
  if (kind === "trainer") {
    const t = await prisma.trainer.findUnique({ where: { id }, include: { loginUser: true } });
    if (!t || !t.loginUser) return null;
    return { id: t.id, kind, name: t.name, email: t.loginUser.email, phone: t.phone, hourlyRate: t.hourlyRate };
  }
  if (kind === "admin") {
    const a = await prisma.user.findUnique({ where: { id, role: { in: ["SUPER_ADMIN", "ADMIN2"] } } });
    if (!a) return null;
    return { id: a.id, kind, name: a.name, email: a.email, phone: a.phone };
  }
  return null;
}

export default async function AccountDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; id?: string }>;
}) {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("accounts.details");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const { type, id } = await searchParams;
  if (type && id && ["student", "college", "trainer", "admin"].includes(type)) {
    const account = await loadAccountDetail(type as AccountKind, id);
    return (
      <AppShell nav={nav} active="account-details" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Account Details" title="Account Details" subtitle="Full profile">
        <BackLink href="/lms/company/account-details" label="Back to Account Details" />
        {!account ? <p className="muted">This account no longer exists.</p> : <AccountDetailView account={account} />}
      </AppShell>
    );
  }

  const [studentUsers, collegeAdmins, trainers, admins] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { college: true, enrollments: { include: { course: true, attendanceRecords: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({ where: { role: "COLLEGE_ADMIN" }, include: { college: true }, orderBy: { name: "asc" } }),
    prisma.trainer.findMany({ where: { loginUser: { isNot: null } }, include: { loginUser: true, trainingSessions: true, invoices: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: { in: ["SUPER_ADMIN", "ADMIN2"] } }, orderBy: { name: "asc" } }),
  ]);

  const students: StudentRow[] = studentUsers.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    collegeName: s.college?.name ?? "—",
    courses: s.enrollments.map((e) => {
      const total = e.attendanceRecords.length || e.totalClasses;
      const present = e.attendanceRecords.filter((r) => r.present).length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      return { name: e.course.name, pct };
    }),
  }));

  const colleges: CollegeRow[] = collegeAdmins
    .filter((a) => a.college)
    .map((a) => ({ id: a.id, collegeName: a.college!.name, contactEmail: a.college!.contactEmail, adminName: a.name, adminEmail: a.email, adminPhone: a.phone }));

  const trainerRows: TrainerRow[] = trainers.map((t) => {
    const daysWorked = new Set(t.trainingSessions.map((s) => s.sessionDate.toDateString())).size;
    const pendingInvoices = t.invoices.filter((i) => i.status === "PENDING" || i.status === "PENDING_RATE");
    const approvedInvoices = t.invoices.filter((i) => i.status === "APPROVED");
    return {
      id: t.id,
      name: t.name,
      email: t.loginUser!.email,
      phone: t.phone,
      hourlyRate: t.hourlyRate,
      totalSessions: t.trainingSessions.length,
      daysWorked,
      invoiceCount: t.invoices.length,
      pendingInvoiceCount: pendingInvoices.length,
      pendingAmount: pendingInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
      approvedAmount: approvedInvoices.reduce((sum, i) => sum + (i.approvedAmount ?? i.totalAmount), 0),
    };
  });

  const adminRows: AdminRow[] = admins.map((a) => ({ id: a.id, name: a.name, email: a.email, phone: a.phone, role: a.role }));
  const totalPendingDue = trainerRows.reduce((sum, t) => sum + t.pendingAmount, 0);

  return (
    <AppShell nav={nav} active="account-details" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Account Details" title="Account details" subtitle="One directory of every student, college, trainer and admin account.">
      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "160px" }}>
          <div className="tile"><div className="label">Students</div><div className="value">{students.length}</div></div>
          <div className="tile"><div className="label">Colleges</div><div className="value">{colleges.length}</div></div>
          <div className="tile"><div className="label">Trainers</div><div className="value">{trainerRows.length}</div></div>
          <div className="tile"><div className="label">Admins</div><div className="value">{adminRows.length}</div></div>
          <div className="tile gold"><div className="label">Trainer dues</div><div className="value">₹{totalPendingDue}</div></div>
        </div>
      </section>

      <section className="card">
        <div className="alert info" style={{ marginBottom: 16 }}>
          <Icon name="lock" size={18} />
          <span>
            Passwords are one-way hashes and can never be read back. <strong>Generate new password</strong> sets a new one, shows it once, and overwrites any password set elsewhere.
          </span>
        </div>
        <AccountDetailsTabs students={students} colleges={colleges} trainers={trainerRows} admins={adminRows} />
      </section>
    </AppShell>
  );
}
