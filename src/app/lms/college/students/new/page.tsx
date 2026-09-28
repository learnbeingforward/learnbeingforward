import { DashboardShell } from "@/components/layout/DashboardShell";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { AddStudentSection } from "@/components/lms/AddStudentSection";

export default function AddCollegeStudentPage() {
  return (
    <DashboardShell title="Add Student" subtitle="New enrollment" navLinks={navLinks}>
      <p className="mb-6 max-w-xl text-sm text-muted-foreground">
        Add a student to your college&apos;s roster. This doesn&apos;t create a login by itself —
        the student signs up themselves on the login page, and it only succeeds if their name and
        email match exactly what you enter here for your college. Once they sign up, the company
        reviews and approves the registration before they can request courses. If you bulk-upload
        students with a password column filled in, those accounts are active immediately with that
        password instead.
      </p>
      <AddStudentSection />
    </DashboardShell>
  );
}
