import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { COLLEGE_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { AddStudentSection } from "@/components/lms/AddStudentSection";

export default async function AddCollegeStudentPage() {
  const session = await auth();
  const college = await prisma.college.findUnique({ where: { id: session!.user.collegeId! }, select: { name: true } });
  const shellUser = { name: college?.name ?? "College", subtitle: "College admin" };

  return (
    <AppShell nav={COLLEGE_NAV} active="add-student" user={shellUser} crumb="Students › Add student" title="Add student" subtitle="Add students to your college roster.">
      <div className="alert info">
        <Icon name="shield" size={18} className="shrink-0" />
        <span>
          This doesn&apos;t create a login by itself. The student signs up on the login page, and it only succeeds if
          their <strong>name and email match exactly</strong> what you enter here. The company then approves the
          registration. Bulk uploads with a password column are active immediately.
        </span>
      </div>
      <AddStudentSection />
    </AppShell>
  );
}
