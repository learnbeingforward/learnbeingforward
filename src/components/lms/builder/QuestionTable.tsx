"use client";

import { useTransition } from "react";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";
import { reorderAssessmentQuestion, deleteAssessmentQuestion } from "@/lib/actions/assessments";
import { Pill } from "./shared";

export type TableQuestion = {
  id: string;
  order: number;
  questionType: "MCQ" | "WRITTEN" | "CODING";
  questionText: string;
  title?: string | null;
  marks: number;
  difficulty: string | null;
  status: string | null;
  testCaseCount: number;
  hiddenTestCaseCount: number;
};

export function QuestionTable({
  assessmentId,
  sectionName,
  kind,
  backHref,
  questions,
}: {
  assessmentId: string;
  sectionName: string;
  kind: "APTITUDE" | "TECHNICAL" | "CODING";
  backHref: string;
  questions: TableQuestion[];
}) {
  const [isPending, startTransition] = useTransition();

  function move(id: string, direction: "up" | "down") {
    startTransition(() => reorderAssessmentQuestion(id, direction));
  }
  function remove(id: string) {
    if (!confirm("Delete this question? This can't be undone.")) return;
    startTransition(() => deleteAssessmentQuestion(id));
  }

  if (questions.length === 0) {
    return <p className="rounded-lg border border-dashed border-border bg-cream p-4 text-center text-xs text-muted-foreground">No questions in this section yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead className="border-b border-border bg-cream text-left uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="p-2.5">#</th>
            <th className="p-2.5">Question</th>
            <th className="p-2.5">Difficulty</th>
            {kind === "CODING" && <th className="p-2.5">Test cases</th>}
            {kind === "CODING" && <th className="p-2.5">Status</th>}
            <th className="p-2.5">Marks</th>
            <th className="p-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {questions.map((q, i) => (
            <tr key={q.id}>
              <td className="p-2.5 text-indigo">{i + 1}</td>
              <td className="max-w-xs truncate p-2.5 text-indigo">{q.title || q.questionText}</td>
              <td className="p-2.5">
                {q.difficulty && (
                  <Pill variant={q.difficulty === "HARD" ? "danger" : q.difficulty === "MEDIUM" ? "warning" : "success"}>
                    {q.difficulty}
                  </Pill>
                )}
              </td>
              {kind === "CODING" && (
                <td className="p-2.5 text-muted-foreground">
                  {q.testCaseCount - q.hiddenTestCaseCount} visible · {q.hiddenTestCaseCount} hidden
                </td>
              )}
              {kind === "CODING" && (
                <td className="p-2.5">
                  {q.status === "VALIDATED" ? (
                    <Pill variant="success">✓ Validated</Pill>
                  ) : (
                    <a href={`${backHref}&screen=add-coding&sectionName=${encodeURIComponent(sectionName)}&questionId=${q.id}`} className="underline">
                      <Pill variant="draft">Draft</Pill>
                    </a>
                  )}
                </td>
              )}
              <td className="p-2.5 text-indigo">{q.marks}</td>
              <td className="whitespace-nowrap p-2.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" disabled={isPending || i === 0} onClick={() => move(q.id, "up")} className="rounded p-1 text-muted-foreground hover:bg-cream disabled:opacity-30">
                    <ArrowUp className="size-3" />
                  </button>
                  <button type="button" disabled={isPending || i === questions.length - 1} onClick={() => move(q.id, "down")} className="rounded p-1 text-muted-foreground hover:bg-cream disabled:opacity-30">
                    <ArrowDown className="size-3" />
                  </button>
                  <a
                    href={`${backHref}&screen=add-${kind.toLowerCase()}&sectionName=${encodeURIComponent(sectionName)}&questionId=${q.id}`}
                    className="px-1.5 font-semibold text-indigo underline underline-offset-2"
                  >
                    Edit
                  </a>
                  <button type="button" disabled={isPending} onClick={() => remove(q.id)} className="rounded p-1 text-red-500 hover:bg-red-50">
                    {isPending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
