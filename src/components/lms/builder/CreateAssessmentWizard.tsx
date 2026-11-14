"use client";

// Screen 1 — "Create Assessment". Per the design spec, steps 1 (Details), 2
// (Sections & questions) and 3 (Proctoring & rules) all live on ONE
// scrolling page; the step circles are a progress/anchor indicator, not
// separate pages. Step 4 (Review & publish) is a distinct screen reached via
// the bottom "Review & Publish" button — see ReviewPublishScreen.tsx.
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateAssessmentSettings, type UpdateAssessmentSettingsState } from "@/lib/actions/assessments";
import { BuilderHeader, BuilderCard, BuilderFooter, StepCircles, inputClass, selectClass, labelClass, sectionLabelClass } from "./shared";
import { SectionsAndQuestionsBlock, type SectionInfo } from "./SectionsAndQuestionsBlock";

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const PROCTORING_TILES = [
  { key: "proctoringEnabled", label: "Webcam &amp; microphone recording" },
  { key: "requireScreenShare", label: "Entire-screen sharing" },
  { key: "requireFaceMatch", label: "Face match with ID photo" },
  { key: "blockCopyPaste", label: "Block copy / paste" },
] as const;

export function CreateAssessmentWizard({
  assessment,
  sections,
  backHref,
}: {
  assessment: {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    assessmentCode: string | null;
    passMark: number | null;
    availableFrom: string | null;
    availableUntil: string | null;
    proctoringEnabled: boolean;
    requireFaceMatch: boolean;
    requireScreenShare: boolean;
    blockCopyPaste: boolean;
    tabSwitchLimit: number;
    instructionsTemplate: string | null;
    submissionMessage: string | null;
  };
  sections: SectionInfo[];
  backHref: string;
}) {
  const router = useRouter();
  const action = updateAssessmentSettings.bind(null, assessment.id);
  const [state, formAction, isPending] = useActionState<UpdateAssessmentSettingsState, FormData>(action, null);
  const [goToReview, setGoToReview] = useState(false);
  const availableFromIsoRef = useRef<HTMLInputElement>(null);
  const availableUntilIsoRef = useRef<HTMLInputElement>(null);

  function toIso(value: string) {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
  }

  useEffect(() => {
    if (state?.ok && goToReview) {
      router.push(`${backHref}&step=4`);
    }
  }, [state, goToReview, router, backHref]);

  return (
    <div>
      <BuilderHeader
        breadcrumb="Assessments › Edit"
        title={assessment.title}
        rightSlot={
          <>
            <Button type="button" variant="outline" title="Coming soon" disabled className="border-white/30 bg-transparent text-white/70 hover:bg-transparent">
              Preview as Student
            </Button>
            <Button type="submit" form="assessment-settings-form" onClick={() => setGoToReview(false)} disabled={isPending} className="bg-white text-indigo hover:bg-white/90">
              {isPending && !goToReview && <Loader2 className="size-3.5 animate-spin" />}
              Save Draft
            </Button>
          </>
        }
      />
      <BuilderCard>
        <StepCircles current={2} />

        <form id="assessment-settings-form" action={formAction} className="space-y-10">
          <div>
            <p className={`${sectionLabelClass} mb-3`}>1 · Assessment Details</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className={labelClass}>Assessment name</Label>
                <Input name="title" required defaultValue={assessment.title} className="h-10" />
              </div>
              <div>
                <Label className={labelClass}>Assessment code</Label>
                <Input name="assessmentCode" defaultValue={assessment.assessmentCode ?? ""} className="h-10" placeholder="e.g. APT-2026-R1" />
              </div>
              <div>
                <Label className={labelClass}>Duration (minutes)</Label>
                <Input name="durationMinutes" type="number" min={1} required defaultValue={assessment.durationMinutes} className="h-10" />
              </div>
              <div>
                <Label className={labelClass}>Pass mark</Label>
                <Input name="passMark" type="number" min={0} defaultValue={assessment.passMark ?? ""} className="h-10" />
              </div>
              <div>
                <Label className={labelClass}>Opens on</Label>
                <Input
                  type="datetime-local"
                  required
                  defaultValue={assessment.availableFrom ? toLocalInputValue(new Date(assessment.availableFrom)) : ""}
                  onChange={(e) => {
                    if (availableFromIsoRef.current) availableFromIsoRef.current.value = toIso(e.target.value);
                  }}
                  className="h-10"
                />
                <input type="hidden" name="availableFrom" ref={availableFromIsoRef} defaultValue={assessment.availableFrom ?? ""} />
              </div>
              <div>
                <Label className={labelClass}>Closes on</Label>
                <Input
                  type="datetime-local"
                  required
                  defaultValue={assessment.availableUntil ? toLocalInputValue(new Date(assessment.availableUntil)) : ""}
                  onChange={(e) => {
                    if (availableUntilIsoRef.current) availableUntilIsoRef.current.value = toIso(e.target.value);
                  }}
                  className="h-10"
                />
                <input type="hidden" name="availableUntil" ref={availableUntilIsoRef} defaultValue={assessment.availableUntil ?? ""} />
              </div>
            </div>
            <div className="mt-4">
              <Label className={labelClass}>Description (shown to students)</Label>
              <Textarea name="description" rows={2} defaultValue={assessment.description ?? ""} className="text-sm" />
            </div>
          </div>
        </form>

        <div className="my-8 border-t border-border" />

        <SectionsAndQuestionsBlock assessmentId={assessment.id} backHref={backHref} sections={sections} />

        <div className="my-8 border-t border-border" />

        <div>
          <p className={`${sectionLabelClass} mb-3`}>3 · Proctoring &amp; Rules</p>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-2.5">
              {PROCTORING_TILES.map((tile) => (
                <label key={tile.key} className="flex items-center gap-2 rounded-lg bg-cream px-3 py-3 text-xs font-medium text-indigo">
                  <input
                    type="checkbox"
                    name={tile.key}
                    form="assessment-settings-form"
                    defaultChecked={assessment[tile.key as keyof typeof assessment] as boolean}
                    className="accent-indigo"
                  />
                  <span dangerouslySetInnerHTML={{ __html: tile.label }} />
                </label>
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <Label className={labelClass}>Tab switches allowed before auto-submit</Label>
                <Input
                  name="tabSwitchLimit"
                  form="assessment-settings-form"
                  type="number"
                  min={1}
                  defaultValue={assessment.tabSwitchLimit}
                  className="h-10 max-w-[140px]"
                />
              </div>
              <div>
                <Label className={labelClass}>Instructions shown before the assessment starts</Label>
                <Textarea
                  name="instructionsTemplate"
                  form="assessment-settings-form"
                  rows={2}
                  defaultValue={assessment.instructionsTemplate ?? ""}
                  placeholder="Leave blank to use the standard proctored-test instructions."
                  className="text-sm"
                />
              </div>
              <div>
                <Label className={labelClass}>Message shown after submission</Label>
                <Textarea
                  name="submissionMessage"
                  form="assessment-settings-form"
                  rows={2}
                  defaultValue={assessment.submissionMessage ?? ""}
                  placeholder="Leave blank to use the standard submission message."
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {state?.error && <p className="mt-4 text-sm text-destructive">{state.error}</p>}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5">
          <Button type="button" variant="outline" onClick={() => router.push("/lms/company/assessments")} className="border-border text-indigo">
            Cancel
          </Button>
          <Button
            type="submit"
            form="assessment-settings-form"
            onClick={() => setGoToReview(true)}
            disabled={isPending}
            className="bg-indigo text-white hover:bg-indigo/90"
          >
            {isPending && goToReview && <Loader2 className="size-3.5 animate-spin" />}
            Review &amp; Publish ›
          </Button>
        </div>
      </BuilderCard>
      <BuilderFooter />
    </div>
  );
}
