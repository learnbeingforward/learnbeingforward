import { DashboardShell } from "@/components/layout/DashboardShell";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { AddStudentForm } from "@/components/lms/AddStudentForm";

export default function AddCollegeStudentPage() {
  return (
    <DashboardShell title="Add Student" subtitle="New enrollment" navLinks={navLinks}>
      <p className="mb-6 max-w-xl text-sm text-muted-foreground">
        Add a student directly — an account is created immediately with a generated password you
        can share with them. They can request enrollment in courses once they log in.
      </p>
      <AddStudentForm />
    </DashboardShell>
  );
}
