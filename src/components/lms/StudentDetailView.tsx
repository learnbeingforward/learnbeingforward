import { Badge } from "@/components/ui/badge";

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
  name: string;
  email: string;
  branch: string | null;
  semester: number | null;
  usn: string | null;
  cvUrl: string | null;
  enrollments: StudentDetailEnrollment[];
};

export function StudentDetailView({ student }: { student: StudentDetail }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-indigo">{student.name}</h2>
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
        </div>
        {student.enrollments.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Not enrolled in any course yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {student.enrollments.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
