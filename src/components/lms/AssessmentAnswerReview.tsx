"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, Circle } from "lucide-react";
import { GradeWrittenAnswerForm } from "@/components/lms/GradeWrittenAnswerForm";

export type ReviewAnswer = {
  answerId: string | null;
  questionId: string;
  questionType: "MCQ" | "WRITTEN" | "CODING";
  questionText: string;
  marks: number;
  marksAwarded: number | null;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
  selectedOption: string | null;
  writtenAnswer: string | null;
  codeSubmission: string | null;
  codeLanguage: string | null;
  testCasesPassed: number | null;
  testCasesTotal: number | null;
};

type Status = "correct" | "wrong" | "partial" | "needs_grading" | "not_attempted";

function isAnswered(a: ReviewAnswer): boolean {
  if (a.questionType === "MCQ") return !!a.selectedOption;
  if (a.questionType === "WRITTEN") return !!a.writtenAnswer?.trim();
  return !!a.codeSubmission?.trim();
}

function statusOf(a: ReviewAnswer): Status {
  if (!isAnswered(a)) return "not_attempted";
  if (a.questionType === "WRITTEN" && a.marksAwarded === null) return "needs_grading";
  const awarded = a.marksAwarded ?? 0;
  if (awarded >= a.marks) return "correct";
  if (awarded <= 0) return "wrong";
  return "partial";
}

const STATUS_META: Record<Status, { circle: string; dot: string; label: string }> = {
  correct: { circle: "border-green-400 bg-green-50 text-green-700", dot: "bg-green-500", label: "Correct" },
  wrong: { circle: "border-red-400 bg-red-50 text-red-700", dot: "bg-red-500", label: "Wrong" },
  partial: { circle: "border-amber-400 bg-amber-50 text-amber-700", dot: "bg-amber-500", label: "Partial" },
  needs_grading: { circle: "border-indigo/40 bg-indigo/5 text-indigo", dot: "bg-indigo", label: "Needs Grading" },
  not_attempted: { circle: "border-border bg-white text-muted-foreground", dot: "bg-muted-foreground", label: "Not Attempted" },
};

function StatTile({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`rounded-xl p-4 text-center ${className}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide">{label}</p>
    </div>
  );
}

function QuestionDetail({ answer, index, editable }: { answer: ReviewAnswer; index: number; editable: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="whitespace-pre-wrap text-sm font-medium text-indigo">
          Q{index + 1}. {answer.questionText}
        </p>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {answer.marksAwarded ?? 0}/{answer.marks} marks
        </span>
      </div>

      {answer.questionType === "MCQ" ? (
        <div className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
          {(["A", "B", "C", "D"] as const).map((letter) => {
            const text = answer[`option${letter}` as "optionA"];
            const isSelected = answer.selectedOption === letter;
            const isCorrectOption = answer.correctOption === letter;
            return (
              <p
                key={letter}
                className={`whitespace-pre-wrap rounded-lg px-2.5 py-1.5 ${
                  isCorrectOption
                    ? "bg-green-50 font-medium text-green-700"
                    : isSelected
                      ? "bg-red-50 font-medium text-red-700"
                      : "text-muted-foreground"
                }`}
              >
                {letter}. {text} {isSelected && "(selected)"} {isCorrectOption && "(correct)"}
              </p>
            );
          })}
        </div>
      ) : answer.questionType === "WRITTEN" ? (
        <div className="mt-3 space-y-2">
          <p className="rounded-lg bg-cream p-3 text-sm text-indigo">
            {answer.writtenAnswer || <span className="text-muted-foreground">No answer given.</span>}
          </p>
          {editable && answer.answerId && (
            <GradeWrittenAnswerForm answerId={answer.answerId} maxMarks={answer.marks} currentMarks={answer.marksAwarded} />
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            {answer.codeSubmission
              ? `${answer.codeLanguage ?? "code"} — ${answer.testCasesPassed ?? 0}/${answer.testCasesTotal ?? 0} test cases passed`
              : "No code submitted."}
          </p>
          {answer.codeSubmission && (
            <pre className="overflow-x-auto rounded-lg bg-indigo-dark p-3 text-xs text-white">{answer.codeSubmission}</pre>
          )}
        </div>
      )}
    </div>
  );
}

/** Shared by the student's "your result" page and the admin's submission-review
 * page — a color-coded question map (green=correct, red=wrong, amber=partial,
 * indigo=needs grading, grey=not attempted) that only reveals a question's actual
 * answer once clicked, instead of dumping every answer on the page at once.
 * `editable` additionally shows the marks-entry form for written answers. */
export function AssessmentAnswerReview({ answers, editable = false }: { answers: ReviewAnswer[]; editable?: boolean }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = {
    correct: answers.filter((a) => statusOf(a) === "correct").length,
    wrong: answers.filter((a) => statusOf(a) === "wrong").length,
    partial: answers.filter((a) => statusOf(a) === "partial").length,
    needs_grading: answers.filter((a) => statusOf(a) === "needs_grading").length,
    not_attempted: answers.filter((a) => statusOf(a) === "not_attempted").length,
  };
  const selectedIndex = answers.findIndex((a) => a.questionId === selectedId);
  const selected = selectedIndex >= 0 ? answers[selectedIndex] : null;

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Correct" value={counts.correct} className="bg-green-50 text-green-700" />
        <StatTile label="Wrong" value={counts.wrong} className="bg-red-50 text-red-700" />
        <StatTile label="Not Attempted" value={counts.not_attempted} className="bg-cream text-indigo" />
        {(counts.partial > 0 || counts.needs_grading > 0) && (
          <StatTile
            label={counts.needs_grading > 0 ? "Needs Grading" : "Partial Credit"}
            value={counts.needs_grading > 0 ? counts.needs_grading : counts.partial}
            className="bg-indigo/5 text-indigo"
          />
        )}
      </div>

      <div className="mb-4 rounded-xl border border-border bg-white p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Question Map — click a question to see what was answered
        </p>
        <div className="flex flex-wrap gap-2">
          {answers.map((a, i) => {
            const status = statusOf(a);
            const meta = STATUS_META[status];
            const isSelected = selectedId === a.questionId;
            return (
              <button
                key={a.questionId}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : a.questionId)}
                className={`relative flex size-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${meta.circle} ${
                  isSelected ? "ring-2 ring-indigo ring-offset-2" : ""
                }`}
                title={`Q${i + 1}: ${meta.label}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-green-500" /> Correct
          </span>
          <span className="flex items-center gap-1.5">
            <XCircle className="size-3.5 text-red-500" /> Wrong
          </span>
          {counts.partial > 0 && (
            <span className="flex items-center gap-1.5">
              <Circle className="size-3.5 fill-amber-500 text-amber-500" /> Partial
            </span>
          )}
          {counts.needs_grading > 0 && (
            <span className="flex items-center gap-1.5">
              <HelpCircle className="size-3.5 text-indigo" /> Needs Grading
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Circle className="size-3.5 text-muted-foreground" /> Not Attempted
          </span>
        </div>
      </div>

      {selected ? (
        <QuestionDetail answer={selected} index={selectedIndex} editable={editable} />
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">Click a question number above to see the details.</p>
      )}
    </div>
  );
}
