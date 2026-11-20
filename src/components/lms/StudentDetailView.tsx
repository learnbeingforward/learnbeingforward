import Link from "next/link";
import { Icon } from "@/components/lbf/icons";
import { EditStudentDialog } from "@/components/lms/EditStudentDialog";
import { deleteStudentAccount } from "@/lib/actions/accounts";
import { certificationBadge } from "@/lib/college-data";

export type StudentDetailEnrollment = {
  id: string;
  courseName: string;
  trainerName: string | null;
  present: number;
  total: number;
  pct: number;
  eligible: boolean;
  certificationStatus: string;
  batchId: string | null;
  batchCollegeId: string | null;
  batchName: string | null;
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

export function StudentDetailView({
  student,
  basePath,
  batchLinkBase,
  canDelete = false,
}: {
  student: StudentDetail;
  basePath: string;
  /** Where "View Batch" should point — the company admin and college portals have
   * separate batch pages, so this must be passed explicitly by the caller rather
   * than guessed from basePath. Omit to hide the link entirely (e.g. for a viewer
   * with no batches page of their own). */
  batchLinkBase?: (batchId: string, batchCollegeId: string | null) => string;
  /** Shows the permanent "Delete Student Account" action — only the company admin
   * side is authorized to call it, so college callers must leave this off. */
  canDelete?: boolean;
}) {
  const initials = student.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="row">
      <section className="card side">
        <div className="split" style={{ marginBottom: 18 }}>
          <h2 className="h2">Profile</h2>
        </div>
        <div className="stack" style={{ gap: 18 }}>
          <div className="stat-inline">
            <span className="avatar lg">{initials}</span>
            <div>
              <div className="h3">{student.name}</div>
              <div className="small muted">{student.email}</div>
            </div>
          </div>
          <div className="grid" style={{ ["--min" as string]: "160px" }}>
            <div>
              <div className="label">USN</div>
              <div className="strong" style={{ marginTop: 4 }}>{student.usn ?? "—"}</div>
            </div>
            <div>
              <div className="label">Father&apos;s name</div>
              <div className="strong" style={{ marginTop: 4 }}>{student.fatherName ?? "—"}</div>
            </div>
            <div>
              <div className="label">Branch</div>
              <div className="strong" style={{ marginTop: 4 }}>{student.branch ?? "—"}</div>
            </div>
            <div>
              <div className="label">Semester</div>
              <div className="strong" style={{ marginTop: 4 }}>{student.semester ?? "—"}</div>
            </div>
            <div>
              <div className="label">CV</div>
              <div className="strong" style={{ marginTop: 4 }}>
                {student.cvUrl ? (
                  <a href={student.cvUrl} target="_blank" rel="noopener noreferrer">
                    View CV
                  </a>
                ) : (
                  <span className="muted">Not uploaded</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
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
            {canDelete && (
              <form action={deleteStudentAccount.bind(null, student.id)}>
                <button className="btn btn-sm btn-danger" type="submit">
                  <Icon name="trash" size={16} />
                  Delete student account
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="card grow">
        <div className="split" style={{ marginBottom: 18 }}>
          <h2 className="h2">Enrollments ({student.enrollments.length})</h2>
        </div>
        <p className="small muted" style={{ margin: "-8px 0 14px" }}>
          Click a course to see session-by-session attendance.
        </p>
        {student.enrollments.length === 0 ? (
          <p className="muted">Not enrolled in any course yet.</p>
        ) : (
          <div className="stack" style={{ gap: 12 }}>
            {student.enrollments.map((e) => {
              const badge = certificationBadge(e.certificationStatus, e.eligible);
              const progressTone = e.pct >= 75 ? "success" : "danger";
              return (
                <Link key={e.id} className="box enr" href={`${basePath}?studentId=${student.id}&enrollmentId=${e.id}`}>
                  <div className="split" style={{ flexWrap: "wrap", gap: 8, alignItems: "flex-start" }}>
                    <div>
                      <div className="h3">{e.courseName}</div>
                      <div className="small muted">
                        Trainer: {e.trainerName ?? "Not yet assigned"} · {e.present}/{e.total} classes attended
                      </div>
                      {e.batchId ? (
                        <div className="small muted">Batch: {e.batchName}</div>
                      ) : (
                        <div className="small muted">Not placed in a training batch yet</div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className={`pill ${badge.pillClass}`}>{badge.label}</span>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <div className={`progress ${progressTone}`} style={{ width: 120 }}>
                            <span style={{ width: `${e.pct}%` }} />
                          </div>
                          <span className="small strong">{e.pct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!e.batchId && e.total > 0 && (
                    <div className="alert warning" style={{ marginTop: 12, padding: "8px 12px" }}>
                      <Icon name="target" size={16} />
                      <span>
                        No trainer or batch is linked, but {e.total} classes are recorded — link the batch so the record is complete.
                      </span>
                    </div>
                  )}
                  <span className="small strong" style={{ color: "var(--navy)", marginTop: 10, display: "inline-flex", gap: 4, alignItems: "center" }}>
                    Session-by-session progress
                    <Icon name="arrowR" size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
