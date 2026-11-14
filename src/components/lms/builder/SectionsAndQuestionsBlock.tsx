"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { addAssessmentSection, type SectionKind } from "@/lib/actions/assessments";
import { SectionCard } from "./SectionCard";
import { QuestionTable, type TableQuestion } from "./QuestionTable";
import { sectionLabelClass } from "./shared";

export type SectionInfo = {
  name: string;
  kind: SectionKind;
  shuffleEnabled: boolean;
  questions: TableQuestion[];
};

export function SectionsAndQuestionsBlock({
  assessmentId,
  backHref,
  sections,
}: {
  assessmentId: string;
  backHref: string;
  sections: SectionInfo[];
}) {
  const [selected, setSelected] = useState(sections.find((s) => s.questions.length > 0)?.name ?? sections[0]?.name ?? "");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<SectionKind>("APTITUDE");
  const [isPending, startTransition] = useTransition();

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  const totalMarks = sections.reduce((sum, s) => sum + s.questions.reduce((m, q) => m + q.marks, 0), 0);
  const activeSection = sections.find((s) => s.name === selected);

  function submitAddSection() {
    if (!newName.trim()) return;
    startTransition(async () => {
      await addAssessmentSection(assessmentId, newName.trim(), newKind);
      setNewName("");
      setAdding(false);
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className={sectionLabelClass}>2 · Sections &amp; Questions</p>
        <p className="text-sm font-semibold text-indigo">
          Total: {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} · {totalMarks} marks
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => (
          <SectionCard
            key={s.name}
            assessmentId={assessmentId}
            backHref={backHref}
            name={s.name}
            kind={s.kind}
            questionCount={s.questions.length}
            totalMarks={s.questions.reduce((m, q) => m + q.marks, 0)}
            shuffleEnabled={s.shuffleEnabled}
            selected={selected === s.name}
            onSelect={() => setSelected(s.name)}
          />
        ))}

        {adding ? (
          <div className="rounded-xl border border-dashed border-indigo/40 bg-cream p-4">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Section name"
              className="h-9 w-full rounded-md border border-border bg-white px-2 text-sm text-indigo outline-none"
            />
            <select
              value={newKind}
              onChange={(e) => setNewKind(e.target.value as SectionKind)}
              className="mt-2 h-9 w-full rounded-md border border-border bg-white px-2 text-xs text-indigo"
            >
              <option value="APTITUDE">Aptitude (MCQ)</option>
              <option value="TECHNICAL">Technical (MCQ + snippets)</option>
              <option value="CODING">Coding (4 languages)</option>
            </select>
            <div className="mt-2 flex gap-2">
              <button type="button" disabled={isPending} onClick={submitAddSection} className="flex items-center gap-1 rounded-md bg-indigo px-2.5 py-1.5 text-xs font-semibold text-white">
                {isPending && <Loader2 className="size-3 animate-spin" />} Add
              </button>
              <button type="button" onClick={() => setAdding(false)} className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex min-h-[180px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-indigo/40 hover:text-indigo"
          >
            <Plus className="size-5" />
            Add Section
          </button>
        )}
      </div>

      {activeSection && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Questions in Section · {activeSection.name}</p>
          <QuestionTable
            assessmentId={assessmentId}
            sectionName={activeSection.name}
            kind={activeSection.kind}
            backHref={backHref}
            questions={activeSection.questions}
          />
        </div>
      )}
    </div>
  );
}
