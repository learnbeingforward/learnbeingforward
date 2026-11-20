"use client";

import { useActionState } from "react";
import { Icon } from "@/components/lbf/icons";
import { createStudentAccount, type CreateAccountState } from "@/lib/actions/accounts";
import { BRANCH_OPTIONS } from "@/lib/constants";

type College = { id: string; name: string };

export function AddStudentForm({ colleges }: { colleges?: College[] }) {
  const [state, formAction, isPending] = useActionState<CreateAccountState, FormData>(
    createStudentAccount,
    null
  );

  if (state?.ok && state.roster) {
    return (
      <div className="alert success">
        <Icon name="check" size={18} />
        <span>
          <strong>Student added to roster.</strong> <span className="mono">{state.email}</span> can now sign up on the
          login page — their name, email and college must match exactly what you entered here. Once they sign up,
          approve their registration under &ldquo;New Registrations&rdquo; in the Company dashboard before they can
          request courses.
        </span>
      </div>
    );
  }

  if (state?.ok) {
    return (
      <div className="alert success">
        <Icon name="check" size={18} />
        <span>
          <strong>Student account created.</strong> Share these credentials with the student — this password will
          not be shown again. Email: <span className="mono">{state.email}</span> · Password: <span className="mono">{state.password}</span>
        </span>
      </div>
    );
  }

  return (
    <form action={formAction} className="stack" style={{ gap: 16 }}>
      <div className="grid" style={{ ["--min" as string]: "220px" }}>
        <label className="field">
          <span>
            Full name <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" type="text" name="name" required />
        </label>
        <label className="field">
          <span>
            Email <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" type="email" name="email" required />
        </label>
      </div>
      <div className="grid" style={{ ["--min" as string]: "220px" }}>
        <label className="field">
          <span>USN / roll number</span>
          <input className="input" type="text" name="usn" />
        </label>
        <label className="field">
          <span>Father&apos;s name</span>
          <input className="input" type="text" name="fatherName" />
        </label>
      </div>
      <div className="grid" style={{ ["--min" as string]: "220px" }}>
        <label className="field">
          <span>Branch</span>
          <select className="select" name="branch" defaultValue="">
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
          <select className="select" name="semester" defaultValue="">
            <option value="">—</option>
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {colleges && (
        <label className="field">
          <span>College</span>
          <select className="select" name="collegeId" defaultValue="">
            <option value="">Select college</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {state?.error && <span className="error-text">{state.error}</span>}

      <div className="split">
        <span />
        <button className="btn btn-primary" type="submit" disabled={isPending}>
          <Icon name="plus" size={16} />
          {isPending ? "Adding…" : "Add to roster"}
        </button>
      </div>
    </form>
  );
}
