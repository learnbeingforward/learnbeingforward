"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestTraining, type RequestTrainingState } from "@/lib/actions/college-contracts";
import { BRANCH_OPTIONS } from "@/lib/constants";

type College = { id: string; name: string };
type Course = { id: string; name: string };

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CSR: "CSR (Free)",
  PER_STUDENT_HOURLY: "Paid — Per Student, Per Hour",
  PER_DAY_FLAT: "Paid — Flat Rate Per Day",
};

export function RequestTrainingForm({ colleges, courses }: { colleges: College[]; courses: Course[] }) {
  const [state, formAction, isPending] = useActionState<RequestTrainingState, FormData>(
    requestTraining,
    null
  );
  const [contractType, setContractType] = useState("");

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="collegeId">
            College
            <RequiredMark />
          </Label>
          <Select name="collegeId" required>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select college">
                {(value: string | null) => colleges.find((c) => c.id === value)?.name ?? "Select college"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {colleges.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="courseId">
            Course
            <RequiredMark />
          </Label>
          <Select name="courseId" required>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select course">
                {(value: string | null) => courses.find((c) => c.id === value)?.name ?? "Select course"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="contractType">
          Training Type
          <RequiredMark />
        </Label>
        <Select name="contractType" required value={contractType} onValueChange={(v) => setContractType(String(v))}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue placeholder="Select training type">
              {(value: string | null) => (value ? CONTRACT_TYPE_LABELS[value] : "Select training type")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="targetBranch">Restrict to Branch (optional)</Label>
          <Select name="targetBranch">
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="All branches" />
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
          <Label htmlFor="targetSemester">Restrict to Semester (optional)</Label>
          <Select name="targetSemester">
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="All semesters" />
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

      {contractType === "PER_STUDENT_HOURLY" && (
        <div>
          <Label htmlFor="ratePerStudentHour">
            Rate (₹ per student, per hour)
            <RequiredMark />
          </Label>
          <Input id="ratePerStudentHour" name="ratePerStudentHour" type="number" min="1" required className="mt-1.5" placeholder="e.g. 50" />
        </div>
      )}

      {contractType === "PER_DAY_FLAT" && (
        <div>
          <Label htmlFor="flatRatePerDay">
            Flat Rate (₹ per day)
            <RequiredMark />
          </Label>
          <Input id="flatRatePerDay" name="flatRatePerDay" type="number" min="1" required className="mt-1.5" placeholder="e.g. 20000" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="minStudents">
            Minimum Students
            <RequiredMark />
          </Label>
          <Input id="minStudents" name="minStudents" type="number" min="1" required defaultValue={100} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="totalDays">
            Total Training Days
            <RequiredMark />
          </Label>
          <Input id="totalDays" name="totalDays" type="number" min="1" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="startDate">
            Start Date
            <RequiredMark />
          </Label>
          <Input id="startDate" name="startDate" type="date" required className="mt-1.5" />
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Training request sent to the college.</p>}

      <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Send Training Request
      </Button>
    </form>
  );
}
