import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCollegeStudentRows } from "@/lib/college-data";

const navLinks = [
  { href: "/lms/college", label: "Overview" },
  { href: "/lms/college/students", label: "Students" },
  { href: "/lms/college/courses", label: "Courses" },
];

export default async function CollegeStudentsPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId;

  const { rows } = await getCollegeStudentRows(collegeId);

  return (
    <DashboardShell title="Students" subtitle="Enrolled students" navLinks={navLinks}>
      <div className="rounded-xl border border-border bg-white">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No students enrolled yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Certification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={`${row.studentId}-${i}`}>
                  <TableCell className="font-medium text-indigo">{row.studentName}</TableCell>
                  <TableCell className="text-muted-foreground">{row.courseName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.present}/{row.total} ({row.pct}%)
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        row.eligible
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                      }
                    >
                      {row.eligible ? "Eligible" : "Not Yet Eligible"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
