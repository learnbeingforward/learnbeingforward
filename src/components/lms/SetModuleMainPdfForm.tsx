"use client";

import { useActionState } from "react";
import { BookOpen, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { setModuleMainPdf, removeModuleMainPdf, type SetModuleMainPdfState } from "@/lib/actions/course-content";

export function SetModuleMainPdfForm({
  courseModuleId,
  mainPdfTitle,
  mainPdfUrl,
}: {
  courseModuleId: string;
  mainPdfTitle: string | null;
  mainPdfUrl: string | null;
}) {
  const [state, formAction, isPending] = useActionState<SetModuleMainPdfState, FormData>(
    setModuleMainPdf.bind(null, courseModuleId),
    null
  );

  return (
    <div className="mb-4 rounded-xl border border-indigo/20 bg-indigo/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="size-4 text-indigo" />
        <p className="text-sm font-semibold text-indigo">Course Book PDF</p>
      </div>

      {mainPdfUrl ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3">
          <a href={mainPdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo underline">
            <Download className="size-3.5" />
            {mainPdfTitle}
          </a>
          <DeleteButton action={removeModuleMainPdf.bind(null, courseModuleId)} />
        </div>
      ) : (
        <p className="mb-3 text-xs text-muted-foreground">
          No course book attached yet. This is the whole-book PDF for this module — kept separate from the
          content items below, and gated behind its own access request.
        </p>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] flex-1">
          <Label htmlFor={`mainPdfTitle-${courseModuleId}`}>Title</Label>
          <Input
            id={`mainPdfTitle-${courseModuleId}`}
            name="mainPdfTitle"
            defaultValue={mainPdfTitle ?? ""}
            placeholder="e.g. Python Programming — Complete Notes"
            className="mt-1.5"
          />
        </div>
        <FileUploadField name="mainPdfUrl" label="PDF" category="content" defaultUrl={mainPdfUrl} />
        <Button type="submit" disabled={isPending} size="sm" className="bg-indigo text-white hover:bg-indigo/90">
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          {mainPdfUrl ? "Replace" : "Attach"}
        </Button>
      </form>
      {state?.error && <p className="mt-2 text-xs text-destructive">{state.error}</p>}
    </div>
  );
}
