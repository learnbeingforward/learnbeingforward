"use client";

import { useActionState } from "react";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { updateStudentProfile, type UpdateProfileState } from "@/lib/actions/profile";
import { BRANCH_OPTIONS } from "@/lib/constants";

type Student = {
  name: string;
  email: string;
  collegeName: string | null;
  usn: string | null;
  fatherName: string | null;
  branch: string | null;
  semester: number | null;
  photoUrl: string | null;
  cvUrl: string | null;
};

export function StudentProfileForm({ student }: { student: Student }) {
  const [state, formAction, isPending] = useActionState<UpdateProfileState, FormData>(
    updateStudentProfile,
    null
  );
  const initials = student.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <form action={formAction} className="stack" style={{ gap: 16 }}>
      <div className="stat-inline">
        <span className="avatar lg">{initials}</span>
        <FileUploadField name="photoUrl" label="Upload photo" category="photo" defaultUrl={student.photoUrl} compact />
      </div>
      <div className="grid" style={{ ["--min" as string]: "220px" }}>
        <label className="field">
          <span>
            Full name <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" type="text" name="name" required defaultValue={student.name} />
        </label>
        <label className="field">
          <span>Email</span>
          <input className="input" value={student.email} disabled />
        </label>
        <label className="field">
          <span>College</span>
          <input className="input" value={student.collegeName ?? "—"} disabled />
        </label>
      </div>
      <div className="grid" style={{ ["--min" as string]: "200px" }}>
        <label className="field">
          <span>Branch</span>
          <select className="select" name="branch" defaultValue={student.branch ?? ""}>
            <option value="">Select branch</option>
            {BRANCH_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Semester</span>
          <select className="select" name="semester" defaultValue={student.semester ?? ""}>
            <option value="">Select semester</option>
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>USN / roll number</span>
          <input className="input" type="text" name="usn" defaultValue={student.usn ?? ""} />
        </label>
        <label className="field">
          <span>Father&apos;s name</span>
          <input className="input" type="text" name="fatherName" defaultValue={student.fatherName ?? ""} />
        </label>
      </div>

      <FileUploadField
        name="cvUrl"
        label="CV / resume"
        category="cv"
        defaultUrl={student.cvUrl}
        listRow
        emptyText="No CV uploaded — placement teams can't share your profile yet."
      />

      {state?.ok && <span className="small" style={{ color: "var(--success-text)" }}>Saved.</span>}
      {state?.error && <span className="error-text">{state.error}</span>}

      <div className="split">
        <span className="hint">Email and college are managed by your college.</span>
        <button className="btn btn-primary" type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
