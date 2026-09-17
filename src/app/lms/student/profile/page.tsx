import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { studentNavLinks as navLinks } from "@/lib/lms-nav-links";
import { StudentProfileForm } from "@/components/lms/StudentProfileForm";
import { ChangePasswordForm } from "@/components/lms/ChangePasswordForm";

export default async function StudentProfilePage() {
  const session = await auth();
  const student = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    include: { college: true },
  });

  return (
    <DashboardShell title="Profile" subtitle="Your details" navLinks={navLinks}>
      <div className="space-y-8">
        <StudentProfileForm
          student={{
            name: student.name,
            email: student.email,
            collegeName: student.college?.name ?? null,
            usn: student.usn,
            fatherName: student.fatherName,
            branch: student.branch,
            photoUrl: student.photoUrl,
            cvUrl: student.cvUrl,
          }}
        />

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
