"use client";

import { useActionState } from "react";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { updateCollegeProfile, type UpdateProfileState } from "@/lib/actions/profile";

type College = {
  name: string;
  contactEmail: string | null;
  photoUrl: string | null;
};

export function CollegeProfileForm({ college }: { college: College }) {
  const [state, formAction, isPending] = useActionState<UpdateProfileState, FormData>(
    updateCollegeProfile,
    null
  );
  const initials = college.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <form action={formAction} className="stack" style={{ gap: 16 }}>
      <div className="stat-inline">
        <span className="avatar lg">{initials}</span>
        <FileUploadField name="photoUrl" label="Upload logo" category="photo" defaultUrl={college.photoUrl} compact />
      </div>
      <label className="field">
        <span>
          College name <span className="req" aria-hidden="true">*</span>
        </span>
        <input className="input" type="text" name="name" required defaultValue={college.name} />
      </label>
      <label className="field">
        <span>Contact email</span>
        <input className="input" type="email" name="contactEmail" defaultValue={college.contactEmail ?? ""} />
      </label>

      {state?.ok && <span className="small" style={{ color: "var(--success-text)" }}>Saved.</span>}
      {state?.error && <span className="error-text">{state.error}</span>}

      <div className="split">
        <span />
        <button className="btn btn-primary" type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
