"use client";

import { useActionState, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { updateTeamMember, type UpdateTeamMemberState } from "@/lib/actions/site-content";

export type TeamMemberEditData = {
  id: string;
  name: string;
  role: string;
  experienceYears: number;
  background: string | null;
  specialties: string[];
  isFreelancer: boolean;
  colleges: string[];
  photoUrl: string | null;
  cvUrl: string | null;
};

export function EditTeamMemberDialog({ member }: { member: TeamMemberEditData }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<UpdateTeamMemberState, FormData>(
    updateTeamMember.bind(null, member.id),
    null
  );

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="btn btn-sm">Edit</DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {member.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="stack" style={{ gap: 16 }}>
          <div className="grid" style={{ ["--min" as string]: "200px" }}>
            <label className="field">
              <span>
                Full name <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="name" required defaultValue={member.name} />
            </label>
            <label className="field">
              <span>
                Role / designation <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="role" required defaultValue={member.role} />
            </label>
            <label className="field">
              <span>
                Years of experience <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="number" name="experienceYears" min={0} required defaultValue={member.experienceYears} />
            </label>
            <label className="check" style={{ alignSelf: "center" }}>
              <input type="checkbox" name="isFreelancer" defaultChecked={member.isFreelancer} /> Freelance trainer
            </label>
          </div>

          <label className="field">
            <span>Background (optional)</span>
            <textarea className="textarea" name="background" rows={2} defaultValue={member.background ?? ""} />
          </label>

          <label className="field">
            <span>Specialties (optional, comma-separated)</span>
            <input className="input" type="text" name="specialties" defaultValue={member.specialties.join(", ")} />
          </label>

          <label className="field">
            <span>Colleges trained at (optional, comma-separated, freelancers only)</span>
            <input className="input" type="text" name="colleges" defaultValue={member.colleges.join(", ")} />
          </label>

          <FileUploadField name="photoUrl" label="Photo (optional)" category="photo" defaultUrl={member.photoUrl} />
          <FileUploadField name="cvUrl" label="CV / profile PDF (optional)" category="cv" defaultUrl={member.cvUrl} />

          {state?.error && <span className="error-text">{state.error}</span>}

          <DialogFooter>
            <button className="btn btn-primary" type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
