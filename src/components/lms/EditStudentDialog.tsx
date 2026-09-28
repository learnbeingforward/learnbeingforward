"use client";

import { useActionState, useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRANCH_OPTIONS } from "@/lib/constants";
import { updateStudentDetailsByStaff, type UpdateStudentDetailsState } from "@/lib/actions/profile";

export type EditableStudent = {
  id: string;
  name: string;
  fatherName: string | null;
  branch: string | null;
  semester: number | null;
  usn: string | null;
};

export function EditStudentDialog({ student }: { student: EditableStudent }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<UpdateStudentDetailsState, FormData>(
    updateStudentDetailsByStaff.bind(null, student.id),
    null
  );

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="border-border text-indigo">
            <Pencil className="size-3.5" /> Edit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {student.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor={`edit-student-name-${student.id}`}>
              Full Name
              <RequiredMark />
            </Label>
            <Input
              id={`edit-student-name-${student.id}`}
              name="name"
              required
              defaultValue={student.name}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor={`edit-student-father-${student.id}`}>Father&apos;s Name</Label>
            <Input
              id={`edit-student-father-${student.id}`}
              name="fatherName"
              defaultValue={student.fatherName ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor={`edit-student-usn-${student.id}`}>USN / Roll Number</Label>
            <Input
              id={`edit-student-usn-${student.id}`}
              name="usn"
              defaultValue={student.usn ?? ""}
              className="mt-1.5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor={`edit-student-branch-${student.id}`}>Branch</Label>
              <Select name="branch" defaultValue={student.branch ?? undefined}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {BRANCH_OPTIONS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`edit-student-semester-${student.id}`}>Semester</Label>
              <Select name="semester" defaultValue={student.semester ? String(student.semester) : undefined}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Semester {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
