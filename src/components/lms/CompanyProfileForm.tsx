"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
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

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">
            Name
            <RequiredMark />
          </Label>
          <Input id="name" name="name" required defaultValue={admin.name} className="mt-1.5" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={admin.email} disabled className="mt-1.5 bg-cream" />
        </div>
      </div>

      <FileUploadField name="photoUrl" label="Photo (optional)" category="photo" defaultUrl={admin.photoUrl} />

      {showBank && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Bank Details (auto-included on college invoices)
          </h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="companyBankAccountName">Account Holder (optional)</Label>
              <Input
                id="companyBankAccountName"
                name="companyBankAccountName"
                defaultValue={bank.companyBankAccountName ?? ""}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="companyBankName">Bank Name (optional)</Label>
              <Input id="companyBankName" name="companyBankName" defaultValue={bank.companyBankName ?? ""} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="companyBankAccountNumber">Account Number (optional)</Label>
              <Input
                id="companyBankAccountNumber"
                name="companyBankAccountNumber"
                defaultValue={bank.companyBankAccountNumber ?? ""}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="companyBankIfsc">IFSC (optional)</Label>
              <Input id="companyBankIfsc" name="companyBankIfsc" defaultValue={bank.companyBankIfsc ?? ""} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="companyGstNumber">GST Number (optional)</Label>
              <Input id="companyGstNumber" name="companyGstNumber" defaultValue={bank.companyGstNumber ?? ""} className="mt-1.5" />
            </div>
          </div>
        </div>
      )}

      {state?.ok && (
        <p className="flex items-center gap-1.5 text-sm text-green-700">
          <CheckCircle2 className="size-4" /> Saved.
        </p>
      )}
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Save
      </Button>
    </form>
  );
}
