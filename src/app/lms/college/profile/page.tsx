import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { CollegeProfileForm } from "@/components/lms/CollegeProfileForm";
import { ChangePasswordForm } from "@/components/lms/ChangePasswordForm";

export default async function CollegeProfilePage() {
  const session = await auth();
  const collegeId = session!.user.collegeId!;

  const [college, admin, students] = await Promise.all([
    prisma.college.findUniqueOrThrow({ where: { id: collegeId } }),
    prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } }),
    prisma.user.findMany({ where: { role: "STUDENT", collegeId }, select: { branch: true } }),
  ]);

  const byBranch = new Map<string, number>();
  for (const s of students) {
    const key = s.branch || "Unspecified";
    byBranch.set(key, (byBranch.get(key) ?? 0) + 1);
  }

  return (
    <DashboardShell title="Profile" subtitle="College details" navLinks={navLinks}>
      <div className="space-y-8">
        <CollegeProfileForm
          college={{ name: college.name, contactEmail: college.contactEmail, photoUrl: admin.photoUrl }}
        />

        <div className="rounded-xl border border-border bg-white p-6">
          <p className="mb-4 text-sm font-semibold text-indigo">
            Students ({students.length} total)
          </p>
          <div className="space-y-2">
            {Array.from(byBranch.entries()).map(([branch, count]) => (
              <div key={branch} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{branch}</span>
                <span className="font-medium text-indigo">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Change Password
          </h2>
          <ChangePasswordForm />
        </div>
      </div>
    </DashboardShell>
  );
}
