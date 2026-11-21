"use client";

import { useActionState } from "react";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { updateCompanyProfile, type UpdateProfileState } from "@/lib/actions/profile";

type Admin = { name: string; email: string; photoUrl: string | null };
type CompanyBank = {
  companyBankAccountName: string | null;
  companyBankAccountNumber: string | null;
  companyBankIfsc: string | null;
  companyBankName: string | null;
  companyGstNumber: string | null;
};

export function CompanyProfileForm({
  admin,
  bank,
  showBank = true,
}: {
  admin: Admin;
  bank: CompanyBank;
  showBank?: boolean;
}) {
  const [state, formAction, isPending] = useActionState<UpdateProfileState, FormData>(
    updateCompanyProfile,
    null
  );
  const initials = admin.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <form action={formAction} className="stack" style={{ gap: 16 }}>
      <div className="stat-inline">
        <span className="avatar lg">{initials}</span>
        <div>
          <FileUploadField name="photoUrl" label="Change photo" category="photo" defaultUrl={admin.photoUrl} compact />
          <div className="hint" style={{ marginTop: 6 }}>
            JPG or PNG, up to 2 MB
          </div>
        </div>
      </div>
      <div className="grid" style={{ ["--min" as string]: "220px" }}>
        <label className="field">
          <span>
            Name <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" type="text" name="name" required defaultValue={admin.name} />
        </label>
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" value={admin.email} disabled />
        </label>
      </div>

      {showBank && (
        <>
          <div className="label" style={{ marginTop: 8 }}>
            Bank details · auto-included on college invoices
          </div>
          <div className="grid" style={{ ["--min" as string]: "200px" }}>
            <label className="field">
              <span>Account holder</span>
              <input className="input" type="text" name="companyBankAccountName" defaultValue={bank.companyBankAccountName ?? ""} />
            </label>
            <label className="field">
              <span>Bank name</span>
              <input className="input" type="text" name="companyBankName" defaultValue={bank.companyBankName ?? ""} />
            </label>
            <label className="field">
              <span>Account number</span>
              <input className="input" type="text" name="companyBankAccountNumber" defaultValue={bank.companyBankAccountNumber ?? ""} />
            </label>
            <label className="field">
              <span>IFSC</span>
              <input className="input" type="text" name="companyBankIfsc" defaultValue={bank.companyBankIfsc ?? ""} />
            </label>
            <label className="field">
              <span>GST number</span>
              <input className="input" type="text" name="companyGstNumber" defaultValue={bank.companyGstNumber ?? ""} />
            </label>
          </div>
        </>
      )}

      {state?.ok && <span className="small" style={{ color: "var(--success-text)" }}>Saved.</span>}
      {state?.error && <span className="error-text">{state.error}</span>}

      <div className="split">
        <span />
        <button className="btn btn-primary" type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
