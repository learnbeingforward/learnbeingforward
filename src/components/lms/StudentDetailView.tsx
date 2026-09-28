import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EditStudentDialog } from "@/components/lms/EditStudentDialog";

export type StudentDetailEnrollment = {
  id: string;
  courseName: string;
  trainerName: string | null;
  present: number;
  total: number;
  pct: number;
  eligible: boolean;
};

export type StudentDetail = {
  id: string;
  name: string;
  email: string;
  fatherName: string | null;
  branch: string | null;
  semester: number | null;
  usn: string | null;
  cvUrl: string | null;
  enrollments: StudentDetailEnrollment[];
};

export function StudentDetailView({ student, basePath }: { student: StudentDetail; basePath: string }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-indigo">{student.name}</h2>
          <EditStudentDialog
            student={{
              id: student.id,
              name: student.name,
              fatherName: student.fatherName,
              branch: student.branch,
              semester: student.semester,
              usn: student.usn,
            }}
          />
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-indigo">{student.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">USN</dt>
            <dd className="text-indigo">{student.usn ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Father&apos;s Name</dt>
            <dd className="text-indigo">{student.fatherName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Branch</dt>
            <dd className="text-indigo">{student.branch ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Semester</dt>
            <dd className="text-indigo">{student.semester ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">CV</dt>
            <dd>
              {student.cvUrl ? (
                <a href={student.cvUrl} target="_blank" rel="noopener noreferrer" className="text-indigo underline">
                  View CV
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Enrollments ({student.enrollments.length})</p>
          <p className="mt-1 text-xs text-muted-foreground">Click a course to see session-by-session progress.</p>
        </div>
        {student.enrollments.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Not enrolled in any course yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {student.enrollments.map((e) => (
              <Link
                key={e.id}
                href={`${basePath}?studentId=${student.id}&enrollmentId=${e.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-cream/60"
              >
                <div>
                  <p className="text-sm font-medium text-indigo">{e.courseName}</p>
                  <p className="text-xs text-muted-foreground">
                    Trainer: {e.trainerName ?? "Not yet assigned"} &middot; {e.present}/{e.total} classes attended
                  </p>
                </div>
                <Badge
                  className={
                    e.eligible
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  }
                >
                  {e.pct}% {e.eligible ? "· Eligible" : "· Not Yet Eligible"}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
