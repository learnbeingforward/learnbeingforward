"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { updateStudentProfile, type UpdateProfileState } from "@/lib/actions/profile";

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

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">
            Full Name
            <RequiredMark />
          </Label>
          <Input id="name" name="name" required defaultValue={student.name} className="mt-1.5" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={student.email} disabled className="mt-1.5 bg-cream" />
        </div>
        <div>
          <Label>College</Label>
          <Input value={student.collegeName ?? "—"} disabled className="mt-1.5 bg-cream" />
        </div>
        <div>
          <Label htmlFor="branch">Branch (optional)</Label>
          <Input id="branch" name="branch" defaultValue={student.branch ?? ""} className="mt-1.5" placeholder="e.g. Computer Science" />
        </div>
        <div>
          <Label htmlFor="semester">Semester (optional)</Label>
          <Input id="semester" name="semester" type="number" min="1" max="8" defaultValue={student.semester ?? ""} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="usn">USN / Roll Number (optional)</Label>
          <Input id="usn" name="usn" defaultValue={student.usn ?? ""} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="fatherName">Father&apos;s Name (optional)</Label>
          <Input id="fatherName" name="fatherName" defaultValue={student.fatherName ?? ""} className="mt-1.5" />
        </div>
      </div>

      <FileUploadField name="photoUrl" label="Profile Photo (optional)" category="photo" defaultUrl={student.photoUrl} />
      <FileUploadField name="cvUrl" label="CV / Resume (optional)" category="cv" defaultUrl={student.cvUrl} />

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
