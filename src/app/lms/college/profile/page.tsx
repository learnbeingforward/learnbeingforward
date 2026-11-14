import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { COLLEGE_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
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
  const sortedBranches = Array.from(byBranch.entries()).sort((a, b) => b[1] - a[1]);
  const possibleDuplicates = sortedBranches
    .map(([name]) => name)
    .filter((name, i, arr) => arr.some((other, j) => j !== i && other.toLowerCase().includes(name.toLowerCase()) && other !== name));

  return (
    <AppShell nav={COLLEGE_NAV} active="profile" user={{ name: college.name, subtitle: "College admin" }} crumb="Profile" title="College profile" subtitle="College details and password.">
      <div className="row">
        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            College details
          </h2>
          <CollegeProfileForm college={{ name: college.name, contactEmail: college.contactEmail, photoUrl: admin.photoUrl }} />
        </section>

        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Students ({students.length} total)
          </h2>
          <ul className="list">
            {sortedBranches.map(([branch, count]) => (
              <li key={branch} className="split small">
                <span>{branch}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
          {possibleDuplicates.length > 0 && (
            <div className="alert gold small" style={{ marginTop: 12 }}>
              <Icon name="edit" size={16} className="shrink-0" />
              <span>&quot;{possibleDuplicates.join('", "')}&quot; look like the same branch — consider merging.</span>
            </div>
          )}
        </section>
      </div>

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>
          Change password
        </h2>
        <ChangePasswordForm />
      </section>
    </AppShell>
  );
}
