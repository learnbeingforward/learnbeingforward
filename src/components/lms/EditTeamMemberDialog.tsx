"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
      <DialogTrigger
        className="min-w-0 flex-1 rounded-lg p-1 text-left transition-colors hover:bg-cream/60"
      >
        <p className="text-sm font-semibold text-indigo">
          {member.name}{" "}
          {member.isFreelancer && (
            <Badge className="ml-1 bg-indigo/10 text-indigo hover:bg-indigo/10">Freelance</Badge>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {member.role} &middot; {member.experienceYears} yrs
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {member.specialties.map((s) => (
            <span key={s} className="rounded-full bg-cream px-2 py-0.5 text-[10px] text-indigo/80">
              {s}
            </span>
          ))}
        </div>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {member.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor={`edit-name-${member.id}`}>
                Full Name
                <RequiredMark />
              </Label>
              <Input id={`edit-name-${member.id}`} name="name" required defaultValue={member.name} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor={`edit-role-${member.id}`}>
                Role / Designation
                <RequiredMark />
              </Label>
              <Input id={`edit-role-${member.id}`} name="role" required defaultValue={member.role} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor={`edit-experience-${member.id}`}>
                Years of Experience
                <RequiredMark />
              </Label>
              <Input
                id={`edit-experience-${member.id}`}
                name="experienceYears"
                type="number"
                min="0"
                required
                defaultValue={member.experienceYears}
                className="mt-1.5"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id={`edit-freelancer-${member.id}`}
                name="isFreelancer"
                defaultChecked={member.isFreelancer}
                className="size-4"
              />
              <Label htmlFor={`edit-freelancer-${member.id}`} className="cursor-pointer">
                Freelance Trainer
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor={`edit-background-${member.id}`}>Background (optional)</Label>
            <Textarea
              id={`edit-background-${member.id}`}
              name="background"
              rows={2}
              defaultValue={member.background ?? ""}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor={`edit-specialties-${member.id}`}>Specialties (optional, comma-separated)</Label>
            <Input
              id={`edit-specialties-${member.id}`}
              name="specialties"
              defaultValue={member.specialties.join(", ")}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor={`edit-colleges-${member.id}`}>
              Colleges Trained At (optional, comma-separated, freelancers only)
            </Label>
            <Input
              id={`edit-colleges-${member.id}`}
              name="colleges"
              defaultValue={member.colleges.join(", ")}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor={`edit-photo-${member.id}`}>Photo URL (optional)</Label>
            <Input
              id={`edit-photo-${member.id}`}
              name="photoUrl"
              defaultValue={member.photoUrl ?? ""}
              className="mt-1.5"
              placeholder="https://... (leave blank for a generated avatar)"
            />
          </div>

          <div>
            <Label htmlFor={`edit-cv-${member.id}`}>CV / Profile PDF URL (optional)</Label>
            <Input
              id={`edit-cv-${member.id}`}
              name="cvUrl"
              defaultValue={member.cvUrl ?? ""}
              className="mt-1.5"
              placeholder="https://... link to a hosted PDF"
            />
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
