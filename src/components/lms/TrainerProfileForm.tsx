"use client";

import { useActionState } from "react";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { updateTrainerProfile, type UpdateTrainerProfileState } from "@/lib/actions/trainers";

type Trainer = {
  name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  cvUrl: string | null;
  hourlyRate: number;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  bankName: string | null;
};

export function TrainerProfileForm({ trainer }: { trainer: Trainer }) {
  const [state, formAction, isPending] = useActionState<UpdateTrainerProfileState, FormData>(
    updateTrainerProfile,
    null
  );
  const initials = trainer.name.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return (
    <form action={formAction}>
      <div className="row">
        <section className="card grow">
          <div className="split" style={{ marginBottom: 18 }}>
            <h2 className="h2">Personal details</h2>
          </div>
          <div className="stack" style={{ gap: 16 }}>
            <div className="stat-inline">
              <span className="avatar lg">{initials}</span>
              <div>
                <div className="h3">{trainer.name}</div>
                <div className="small muted">{trainer.email}</div>
              </div>
            </div>
            <div className="grid" style={{ ["--min" as string]: "220px" }}>
              <label className="field">
                <span>
                  Name <span className="req" aria-hidden="true">*</span>
                </span>
                <input className="input" type="text" value={trainer.name} disabled />
              </label>
              <label className="field">
                <span>Email</span>
                <input className="input" type="email" value={trainer.email ?? ""} disabled />
                <span className="hint">Ask the admin to change your login email.</span>
              </label>
              <label className="field">
                <span>Phone</span>
                <input className="input" type="tel" name="phone" defaultValue={trainer.phone ?? ""} />
              </label>
              <label className="field">
                <span>Hourly rate</span>
                <input className="input" value={`₹${trainer.hourlyRate} / hr`} disabled />
                <span className="hint">Set by the company admin.</span>
              </label>
            </div>
            <label className="field">
              <span>About you</span>
              <textarea className="textarea" name="bio" rows={4} defaultValue={trainer.bio ?? ""} />
              <span className="hint">Shown to admins when assigning batches.</span>
            </label>
            <FileUploadField name="cvUrl" label="CV / resume" category="cv" defaultUrl={trainer.cvUrl} />
          </div>
        </section>

        <section className="card side">
          <div className="split" style={{ marginBottom: 18 }}>
            <h2 className="h2">Bank details (for invoice payments)</h2>
          </div>
          <div className="alert warning" style={{ marginBottom: 16 }}>
            <span>
              Account holder, account number and IFSC are <strong>required before you can generate an invoice</strong>.
            </span>
          </div>
          <div className="stack" style={{ gap: 14 }}>
            <label className="field">
              <span>
                Account holder name <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="bankAccountName" defaultValue={trainer.bankAccountName ?? ""} />
            </label>
            <label className="field">
              <span>
                Account number <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="bankAccountNumber" defaultValue={trainer.bankAccountNumber ?? ""} />
            </label>
            <label className="field">
              <span>
                IFSC code <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="bankIfsc" defaultValue={trainer.bankIfsc ?? ""} />
            </label>
            <label className="field">
              <span>Bank name</span>
              <input className="input" type="text" name="bankName" defaultValue={trainer.bankName ?? ""} />
            </label>
          </div>
        </section>
      </div>

      <div className="actionbar">
        <span>{state?.ok && "Saved."}{state?.error && <span className="error-text">{state.error}</span>}</span>
        <button className="btn btn-primary" type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
