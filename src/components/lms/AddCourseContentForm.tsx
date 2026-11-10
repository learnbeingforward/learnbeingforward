"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
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
import { FileUploadField } from "@/components/lms/FileUploadField";
import { createCourseContentWithHierarchy, type CreateCourseContentState } from "@/lib/actions/course-content";

type Course = { id: string; name: string };
type Module = { id: string; title: string; courseId: string };
type SubModule = { id: string; title: string; courseModuleId: string };

function ModeToggle({
  value,
  onChange,
  existingLabel,
  newLabel,
}: {
  value: "existing" | "new";
  onChange: (v: "existing" | "new") => void;
  existingLabel: string;
  newLabel: string;
}) {
  return (
    <div className="mb-1.5 flex gap-1 rounded-lg bg-cream p-1 text-xs font-medium">
      {(["existing", "new"] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`flex-1 rounded-md px-2 py-1 transition-colors ${
            value === opt ? "bg-indigo text-white" : "text-indigo/70 hover:text-indigo"
          }`}
        >
          {opt === "existing" ? existingLabel : newLabel}
        </button>
      ))}
    </div>
  );
}

export function AddCourseContentForm({
  courses,
  modules,
  subModules,
}: {
  courses: Course[];
  modules: Module[];
  subModules: SubModule[];
}) {
  const [state, formAction, isPending] = useActionState<CreateCourseContentState, FormData>(
    createCourseContentWithHierarchy,
    null
  );

  const [courseMode, setCourseMode] = useState<"existing" | "new">(courses.length > 0 ? "existing" : "new");
  const [courseId, setCourseId] = useState("");
  const [moduleMode, setModuleMode] = useState<"existing" | "new">("existing");
  const [moduleId, setModuleId] = useState("");
  const [subModuleMode, setSubModuleMode] = useState<"existing" | "new">("existing");

  const courseModules = useMemo(() => modules.filter((m) => m.courseId === courseId), [modules, courseId]);
  const moduleSubModules = useMemo(
    () => subModules.filter((sm) => sm.courseModuleId === moduleId),
    [subModules, moduleId]
  );

  const [links, setLinks] = useState<{ key: number }[]>([{ key: 0 }]);
  const nextKey = useMemo(() => Math.max(0, ...links.map((l) => l.key)) + 1, [links]);

  // A brand-new course has no modules yet, so module creation is forced; a
  // brand-new module has no sub-modules yet, so sub-module creation is forced too.
  const moduleIsForced = courseMode === "new";
  const subModuleIsForced = moduleIsForced || moduleMode === "new";

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div>
        <Label>
          Course
          <RequiredMark />
        </Label>
        <ModeToggle value={courseMode} onChange={setCourseMode} existingLabel="Existing Course" newLabel="New Course" />
        {courseMode === "existing" ? (
          <>
            <input type="hidden" name="courseMode" value="existing" />
            <Select
              name="courseId"
              required
              value={courseId}
              onValueChange={(v) => {
                setCourseId(String(v));
                setModuleId("");
              }}
            >
              <SelectTrigger className="w-full">
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
          </>
        ) : (
          <>
            <input type="hidden" name="courseMode" value="new" />
            <Input name="newCourseName" required placeholder="e.g. Full Stack Development" />
          </>
        )}
      </div>

      <div>
        <Label>
          Module
          <RequiredMark />
        </Label>
        {!moduleIsForced && (
          <ModeToggle value={moduleMode} onChange={setModuleMode} existingLabel="Existing Module" newLabel="New Module" />
        )}
        {!moduleIsForced && moduleMode === "existing" ? (
          <>
            <input type="hidden" name="moduleMode" value="existing" />
            <Select
              name="courseModuleId"
              required
              disabled={!courseId}
              value={moduleId}
              onValueChange={(v) => setModuleId(String(v))}
            >
              <SelectTrigger className="w-full">
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
          </>
        ) : (
          <>
            <input type="hidden" name="moduleMode" value="new" />
            <Input name="newModuleName" required placeholder="e.g. Backend Development" />
          </>
        )}
      </div>

      <div>
        <Label>Sub-Module</Label>
        {!subModuleIsForced && (
          <ModeToggle
            value={subModuleMode}
            onChange={setSubModuleMode}
            existingLabel="Existing Sub-Module"
            newLabel="New Sub-Module"
          />
        )}
        {!subModuleIsForced && subModuleMode === "existing" ? (
          <>
            <input type="hidden" name="subModuleMode" value="existing" />
            <Select name="courseSubModuleId" disabled={!moduleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={moduleId ? "Select sub-module" : "Select a module first"}>
                  {(value: string | null) => moduleSubModules.find((sm) => sm.id === value)?.title ?? "None"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {moduleSubModules.map((sm) => (
                  <SelectItem key={sm.id} value={sm.id}>
                    {sm.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : (
          <>
            <input type="hidden" name="subModuleMode" value="new" />
            <Input name="newSubModuleName" required placeholder="e.g. Node.js & Express" />
          </>
        )}
      </div>

      {!subModuleIsForced && subModuleMode === "existing" && (
        <div>
          <Label htmlFor="contentTitle">
            Content Title
            <RequiredMark />
          </Label>
          <Input id="contentTitle" name="contentTitle" required className="mt-1.5" placeholder="e.g. Routing & Middleware Notes" />
        </div>
      )}

      <FileUploadField name="fileUrl" label="Content PDF" category="content" />

      <div>
        <Label>Learn More Links (optional)</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          YouTube channels or websites where students can learn this topic further.
        </p>
        <div className="mt-2 space-y-2">
          {links.map((link) => (
            <div key={link.key} className="flex gap-2">
              <Input name="linkLabel" placeholder="Label, e.g. freeCodeCamp" className="flex-1" />
              <Input name="linkUrl" placeholder="https://..." className="flex-1" />
              {links.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-border"
                  onClick={() => setLinks((prev) => prev.filter((l) => l.key !== link.key))}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 border-border text-indigo"
          onClick={() => setLinks((prev) => [...prev, { key: nextKey }])}
        >
          <Plus className="size-4" />
          Add Link
        </Button>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Content added.</p>}

      <Button type="submit" disabled={isPending} className="w-full bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Add Content
      </Button>
    </form>
  );
}
