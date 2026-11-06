import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
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

async function loadAccountDetail(kind: AccountKind, id: string): Promise<AccountDetail | null> {
  if (kind === "student") {
    const s = await prisma.user.findUnique({ where: { id, role: "STUDENT" } });
    if (!s) return null;
    return { id: s.id, kind, name: s.name, email: s.email, phone: s.phone, branch: s.branch, semester: s.semester, usn: s.usn };
  }
  if (kind === "college") {
    const a = await prisma.user.findUnique({ where: { id, role: "COLLEGE_ADMIN" }, include: { college: true } });
    if (!a || !a.college) return null;
    return {
      id: a.id,
      kind,
      name: a.name,
      email: a.email,
      phone: a.phone,
      collegeName: a.college.name,
      contactEmail: a.college.contactEmail,
    };
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
  const { navLinks } = await requireCompanyPageAccess("accounts.details");

  const { type, id } = await searchParams;
  if (type && id && ["student", "college", "trainer", "admin"].includes(type)) {
    const account = await loadAccountDetail(type as AccountKind, id);
    return (
      <DashboardShell title="Account Details" subtitle="Full profile" navLinks={navLinks}>
        <BackLink href="/lms/company/account-details" label="Back to Account Details" />
        {!account ? (
          <p className="text-sm text-muted-foreground">This account no longer exists.</p>
        ) : (
          <AccountDetailView account={account} />
        )}
      </DashboardShell>
    );
  }

  const [studentUsers, collegeAdmins, trainers, admins] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        college: true,
        enrollments: { include: { course: true, attendanceRecords: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "COLLEGE_ADMIN" },
      include: { college: true },
      orderBy: { name: "asc" },
    }),
    prisma.trainer.findMany({
      where: { loginUser: { isNot: null } },
      include: { loginUser: true, trainingSessions: true, invoices: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN2"] } },
      orderBy: { name: "asc" },
    }),
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
    .map((a) => ({
      id: a.id,
      collegeName: a.college!.name,
      contactEmail: a.college!.contactEmail,
      adminName: a.name,
      adminEmail: a.email,
      adminPhone: a.phone,
    }));

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

  const adminRows: AdminRow[] = admins.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    phone: a.phone,
    role: a.role,
  }));

  const totalPendingDue = trainerRows.reduce((sum, t) => sum + t.pendingAmount, 0);

  return (
    <DashboardShell
      title="Account Details"
      subtitle="Every account on the platform, in one place"
      navLinks={navLinks}
    >
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        A single directory of every student, college, trainer, and admin account — so you don&apos;t need
        to open the database to check a contact detail. Passwords are stored as one-way hashes and can
        never be read back; the eye icon sets a fresh password for that account and reveals it here
        until you navigate away.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Students", value: students.length },
          { label: "Colleges", value: colleges.length },
          { label: "Trainers", value: trainerRows.length },
          { label: "Admins", value: adminRows.length },
          { label: "Trainer Dues", value: `₹${totalPendingDue}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-white p-4 text-center">
            <p className="text-xl font-bold text-indigo">{stat.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <AccountDetailsTabs students={students} colleges={colleges} trainers={trainerRows} admins={adminRows} />
    </DashboardShell>
  );
}
