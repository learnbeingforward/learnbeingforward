import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { STUDENT_NAV } from "@/components/lbf/nav-config";
import { StudentProfileForm } from "@/components/lms/StudentProfileForm";
import { ChangePasswordForm } from "@/components/lms/ChangePasswordForm";

export default async function StudentProfilePage() {
  const session = await auth();
  const student = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    include: { college: true },
  });
  const shellUser = { name: student.name, subtitle: student.college?.name ?? "Student" };

  return (
    <AppShell nav={STUDENT_NAV} active="profile" user={shellUser} crumb="Your details" title="Profile" subtitle="Keep your details and CV up to date for placements.">
      <div className="row">
        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Your details
          </h2>
          <StudentProfileForm
            student={{
              name: student.name,
              email: student.email,
              collegeName: student.college?.name ?? null,
              usn: student.usn,
              fatherName: student.fatherName,
              branch: student.branch,
              semester: student.semester,
              photoUrl: student.photoUrl,
              cvUrl: student.cvUrl,
            }}
          />
        </section>
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Change password
          </h2>
          <ChangePasswordForm />
        </section>
      </div>
    </AppShell>
  );
}
