"use client";

import { useActionState, useMemo, useState } from "react";
import { Icon } from "@/components/lbf/icons";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { createSessionContent, type CreateSessionContentState } from "@/lib/actions/session-content";

type Course = { id: string; name: string };
type Module = { id: string; title: string; courseId: string };
type SubModule = { id: string; title: string; courseModuleId: string };

export function UploadContentForm({
  courses,
  modules,
  subModules = [],
}: {
  courses: Course[];
  modules: Module[];
  subModules?: SubModule[];
}) {
  const [state, formAction, isPending] = useActionState<CreateSessionContentState, FormData>(
    createSessionContent,
    null
  );
  const [courseId, setCourseId] = useState("");
  const [courseModuleId, setCourseModuleId] = useState("");

  const courseModules = useMemo(() => modules.filter((m) => m.courseId === courseId), [modules, courseId]);
  const subModuleOptions = useMemo(
    () => subModules.filter((sm) => sm.courseModuleId === courseModuleId),
    [subModules, courseModuleId]
  );

  return (
    <form action={formAction} className="stack" style={{ gap: 14 }}>
      <label className="field">
        <span>
          Title <span className="req" aria-hidden="true">*</span>
        </span>
        <input className="input" type="text" name="title" required placeholder="e.g. Arrays & Time Complexity" />
      </label>
      <label className="field">
        <span>
          Description <span className="req" aria-hidden="true">*</span>
        </span>
        <textarea className="textarea" name="description" required rows={3} />
      </label>
      <div className="grid" style={{ ["--min" as string]: "200px" }}>
        <label className="field">
          <span>
            Course <span className="req" aria-hidden="true">*</span>
          </span>
          <select
            className="select"
            name="courseId"
            required
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setCourseModuleId("");
            }}
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>
            Module <span className="req" aria-hidden="true">*</span>
          </span>
          <select
            className="select"
            name="courseModuleId"
            required
            disabled={!courseId}
            value={courseModuleId}
            onChange={(e) => setCourseModuleId(e.target.value)}
          >
            <option value="">{courseId ? "Select module" : "Select a course first"}</option>
            {courseModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      {subModuleOptions.length > 0 && (
        <label className="field">
          <span>Sub-Module (optional)</span>
          <select className="select" name="courseSubModuleId">
            <option value="">Select sub-module (if any)</option>
            {subModuleOptions.map((sm) => (
              <option key={sm.id} value={sm.id}>
                {sm.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <FileUploadField name="fileUrl" typeFieldName="fileType" label="File (PDF, PPT or Word)" category="content" />

      {state?.error && <span className="error-text">{state.error}</span>}
      {state?.ok && <span className="small" style={{ color: "var(--success-text)" }}>Uploaded.</span>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        <Icon name="upload" size={16} />
        {isPending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
