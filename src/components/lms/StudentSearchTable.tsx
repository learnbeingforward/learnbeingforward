"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/lbf/icons";

export type SearchableStudent = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  collegeName?: string;
  branch: string | null;
  semester: number | null;
  courseName: string;
  pct: number;
  eligible: boolean;
  certificationStatus?: string;
  cvUrl: string | null;
};

const ATTENDANCE_FILTERS = ["any", "below75", "eligible", "issued"] as const;

export function StudentSearchTable({
  rows,
  showCollege = false,
}: {
  rows: SearchableStudent[];
  showCollege?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("all");
  const [semester, setSemester] = useState("all");
  const [course, setCourse] = useState("all");
  const [attendance, setAttendance] = useState<(typeof ATTENDANCE_FILTERS)[number]>("any");
  const pathname = usePathname();

  const branches = useMemo(() => Array.from(new Set(rows.map((r) => r.branch).filter((b): b is string => !!b))).sort(), [rows]);
  const semesters = useMemo(() => Array.from(new Set(rows.map((r) => r.semester).filter((s): s is number => !!s))).sort((a, b) => a - b), [rows]);
  const courses = useMemo(() => Array.from(new Set(rows.map((r) => r.courseName))).sort(), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) return false;
      if (branch !== "all" && r.branch !== branch) return false;
      if (semester !== "all" && String(r.semester) !== semester) return false;
      if (course !== "all" && r.courseName !== course) return false;
      if (attendance === "below75" && r.pct >= 75) return false;
      if (attendance === "eligible" && !(r.eligible && r.certificationStatus !== "ISSUED")) return false;
      if (attendance === "issued" && r.certificationStatus !== "ISSUED") return false;
      return true;
    });
  }, [rows, query, branch, semester, course, attendance]);

  return (
    <>
      <div className="toolbar">
        <div className="filters">
          <label className="search">
            <Icon name="search" size={16} />
            <input
              className="input"
              type="search"
              placeholder="Search by name or email"
              aria-label="Search by name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select className="select" value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="all">All branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select className="select" value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="all">All semesters</option>
            {semesters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="select" value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="all">All courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className="select" value={attendance} onChange={(e) => setAttendance(e.target.value as typeof attendance)}>
            <option value="any">Any attendance</option>
            <option value="below75">Below 75%</option>
            <option value="eligible">Eligible</option>
            <option value="issued">Issued</option>
          </select>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table m-cards" style={{ minWidth: 1000 }}>
          <thead>
            <tr>
              <th>Student</th>
              {showCollege && <th>College</th>}
              <th>Branch</th>
              <th>Sem</th>
              <th>Course</th>
              <th>Attendance</th>
              <th>CV</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const initials = r.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <tr key={r.id}>
                  <td data-label="Student">
                    <div className="stat-inline">
                      <span className="avatar sm">{initials}</span>
                      <div>
                        <a className="strong" href={`${pathname}?studentId=${r.studentId}`}>
                          {r.name}
                        </a>
                        <div className="small muted">{r.email}</div>
                      </div>
                    </div>
                  </td>
                  {showCollege && <td data-label="College">{r.collegeName}</td>}
                  <td data-label="Branch">{r.branch ?? "—"}</td>
                  <td data-label="Sem">{r.semester ?? "—"}</td>
                  <td data-label="Course">{r.courseName}</td>
                  <td data-label="Attendance">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className={`progress${r.pct < 75 ? " gold" : ""}`} style={{ width: 80 }}>
                        <span style={{ width: `${r.pct}%` }} />
                      </div>
                      {r.pct}%
                      {r.certificationStatus === "ISSUED" && <span className="pill success">Issued</span>}
                      {r.certificationStatus !== "ISSUED" && r.eligible && <span className="pill warning">Eligible</span>}
                    </div>
                  </td>
                  <td data-label="CV">
                    {r.cvUrl ? (
                      <a href={r.cvUrl} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={showCollege ? 7 : 6} className="muted" style={{ textAlign: "center" }}>
                  No students match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
