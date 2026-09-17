"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequiredMark } from "@/components/ui/required-mark";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { createSessionContent, type CreateSessionContentState } from "@/lib/actions/session-content";

type Course = { id: string; name: string };
type Module = { id: string; title: string; courseId: string };

export function UploadContentForm({ courses, modules }: { courses: Course[]; modules: Module[] }) {
  const [state, formAction, isPending] = useActionState<CreateSessionContentState, FormData>(
    createSessionContent,
    null
  );
  const [courseId, setCourseId] = useState("");

  const courseModules = useMemo(() => modules.filter((m) => m.courseId === courseId), [modules, courseId]);

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div>
        <Label htmlFor="title">
          Title
          <RequiredMark />
        </Label>
        <Input id="title" name="title" required className="mt-1.5" placeholder="e.g. Arrays & Time Complexity" />
      </div>
      <div>
        <Label htmlFor="description">
          Description
          <RequiredMark />
        </Label>
        <Textarea id="description" name="description" required rows={3} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="courseId">
          Course
          <RequiredMark />
        </Label>
        <Select name="courseId" required value={courseId} onValueChange={(v) => setCourseId(String(v))}>
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
      <div>
        <Label htmlFor="courseModuleId">
          Module
          <RequiredMark />
        </Label>
        <Select name="courseModuleId" required disabled={!courseId}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue placeholder={courseId ? "Select module" : "Select a course first"}>
              {(value: string | null) => courseModules.find((m) => m.id === value)?.title ?? "Select module"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {courseModules.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <FileUploadField name="fileUrl" typeFieldName="fileType" label="File (PDF, PPT, or Word)" category="content" />

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Uploaded.</p>}

      <Button type="submit" disabled={isPending} className="w-full bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Upload
      </Button>
    </form>
  );
}
