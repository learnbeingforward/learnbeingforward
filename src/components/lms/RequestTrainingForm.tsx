"use client";

import { useActionState, useMemo, useState } from "react";
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
type Course = { id: string; name: string; slug: string; domain: string };

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CSR: "CSR (Free)",
  PER_STUDENT_HOURLY: "Paid — Per Student, Per Hour",
  PER_DAY_FLAT: "Paid — Flat Rate Per Day",
};

// Only these six aptitude selections are allowed — not every possible combination.
const APTITUDE_OPTIONS = [
  { label: "Quantitative only", slugs: ["quantitative-aptitude"] },
  { label: "Logical only", slugs: ["logical-reasoning"] },
  { label: "Verbal only", slugs: ["verbal-reasoning"] },
  { label: "Non-Verbal only", slugs: ["non-verbal-reasoning"] },
  { label: "Quantitative + Logical", slugs: ["quantitative-aptitude", "logical-reasoning"] },
  { label: "Verbal + Non-Verbal", slugs: ["verbal-reasoning", "non-verbal-reasoning"] },
];

export function RequestTrainingForm({
  colleges,
  courses,
  hideRate = false,
}: {
  colleges: College[];
  courses: Course[];
  hideRate?: boolean;
}) {
  const [state, formAction, isPending] = useActionState<RequestTrainingState, FormData>(
    requestTraining,
    null
  );
  const [contractType, setContractType] = useState("");

  const [wantsTechnical, setWantsTechnical] = useState(false);
  const [wantsAptitude, setWantsAptitude] = useState(false);
  const [wantsSoftSkill, setWantsSoftSkill] = useState(false);
  const [technicalCourseId, setTechnicalCourseId] = useState("");
  const [aptitudeOptionIndex, setAptitudeOptionIndex] = useState("");

  const technicalCourses = useMemo(() => courses.filter((c) => c.domain === "TECHNICAL"), [courses]);
  const softSkillCourse = useMemo(() => courses.find((c) => c.domain === "SOFT_SKILL"), [courses]);
  const courseBySlug = useMemo(() => new Map(courses.map((c) => [c.slug, c.id])), [courses]);

  const selectedCourseIds = useMemo(() => {
    const ids: string[] = [];
    if (wantsTechnical && technicalCourseId) ids.push(technicalCourseId);
    if (wantsAptitude && aptitudeOptionIndex !== "") {
      const option = APTITUDE_OPTIONS[Number(aptitudeOptionIndex)];
      for (const slug of option.slugs) {
        const id = courseBySlug.get(slug);
        if (id) ids.push(id);
      }
    }
    if (wantsSoftSkill && softSkillCourse) ids.push(softSkillCourse.id);
    return ids;
  }, [wantsTechnical, technicalCourseId, wantsAptitude, aptitudeOptionIndex, wantsSoftSkill, softSkillCourse, courseBySlug]);

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <input type="hidden" name="courseIds" value={selectedCourseIds.join(",")} />

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
        <Label>
          Domain(s)
          <RequiredMark />
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">Choose any combination of Technical, Aptitude, Soft Skill.</p>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-indigo">
            <input type="checkbox" className="size-4" checked={wantsTechnical} onChange={(e) => setWantsTechnical(e.target.checked)} />
            Technical
          </label>
          <label className="flex items-center gap-2 text-sm text-indigo">
            <input type="checkbox" className="size-4" checked={wantsAptitude} onChange={(e) => setWantsAptitude(e.target.checked)} />
            Aptitude
          </label>
          <label className="flex items-center gap-2 text-sm text-indigo">
            <input type="checkbox" className="size-4" checked={wantsSoftSkill} onChange={(e) => setWantsSoftSkill(e.target.checked)} />
            Soft Skill
          </label>
        </div>
      </div>

      {wantsTechnical && (
        <div>
          <Label htmlFor="technicalCourseId">
            Technical Course
            <RequiredMark />
          </Label>
          <Select value={technicalCourseId} onValueChange={(v) => setTechnicalCourseId(String(v))}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select a technical course">
                {(value: string | null) => technicalCourses.find((c) => c.id === value)?.name ?? "Select a technical course"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {technicalCourses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {wantsAptitude && (
        <div>
          <Label htmlFor="aptitudeOption">
            Aptitude Coverage
            <RequiredMark />
          </Label>
          <Select value={aptitudeOptionIndex} onValueChange={(v) => setAptitudeOptionIndex(String(v))}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select aptitude coverage">
                {(value: string | null) =>
                  value !== null && value !== "" ? APTITUDE_OPTIONS[Number(value)].label : "Select aptitude coverage"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {APTITUDE_OPTIONS.map((opt, i) => (
                <SelectItem key={opt.label} value={String(i)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {wantsSoftSkill && (
        <p className="rounded-lg bg-cream px-3 py-2 text-xs text-muted-foreground">
          The full Soft Skills course (Communication, Group Discussion, Interview Prep, Resume Building) will be included.
        </p>
      )}

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

      {!hideRate && contractType === "PER_STUDENT_HOURLY" && (
        <div>
          <Label htmlFor="ratePerStudentHour">
            Rate (₹ per student, per hour)
            <RequiredMark />
          </Label>
          <Input id="ratePerStudentHour" name="ratePerStudentHour" type="number" min="1" required className="mt-1.5" placeholder="e.g. 50" />
        </div>
      )}

      {!hideRate && contractType === "PER_DAY_FLAT" && (
        <div>
          <Label htmlFor="flatRatePerDay">
            Flat Rate (₹ per day)
            <RequiredMark />
          </Label>
          <Input id="flatRatePerDay" name="flatRatePerDay" type="number" min="1" required className="mt-1.5" placeholder="e.g. 20000" />
        </div>
      )}

      {hideRate && (contractType === "PER_STUDENT_HOURLY" || contractType === "PER_DAY_FLAT") && (
        <p className="rounded-lg bg-cream px-3 py-2 text-xs text-muted-foreground">
          The main company admin will set the rate before this is sent to the college.
        </p>
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

      {selectedCourseIds.length === 0 && (
        <p className="text-xs text-muted-foreground">Pick at least one domain and its course(s) before submitting.</p>
      )}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Training request sent to the college.</p>}

      <Button type="submit" disabled={isPending || selectedCourseIds.length === 0} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Send Training Request
      </Button>
    </form>
  );
}
