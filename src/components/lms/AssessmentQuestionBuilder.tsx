"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addAssessmentQuestion, deleteAssessmentQuestion, type AddQuestionState } from "@/lib/actions/assessments";

export type BuilderQuestion = {
  id: string;
  order: number;
  questionType: "MCQ" | "WRITTEN" | "CODING";
  questionText: string;
  marks: number;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
  testCaseCount?: number;
};

const CODING_MARK_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50];

type TestCaseRow = { key: number; hidden: boolean };

export function AssessmentQuestionBuilder({
  assessmentId,
  questions,
}: {
  assessmentId: string;
  questions: BuilderQuestion[];
}) {
  const [questionType, setQuestionType] = useState<"MCQ" | "WRITTEN" | "CODING">("MCQ");
  const [formKey, setFormKey] = useState(0);
  const [testCaseRows, setTestCaseRows] = useState<TestCaseRow[]>([
    { key: 0, hidden: false },
    { key: 1, hidden: false },
    { key: 2, hidden: false },
    { key: 3, hidden: true },
  ]);
  const nextTestCaseKey = Math.max(0, ...testCaseRows.map((r) => r.key)) + 1;
  const [state, formAction, isPending] = useActionState<AddQuestionState, FormData>(
    addAssessmentQuestion.bind(null, assessmentId),
    null
  );
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) {
      setFormKey((k) => k + 1);
      setTestCaseRows([
        { key: 0, hidden: false },
        { key: 1, hidden: false },
        { key: 2, hidden: false },
        { key: 3, hidden: true },
      ]);
    }
  }

  return (
    <div className="space-y-6">
      {questions.length > 0 && (
        <div className="rounded-xl border border-border bg-white">
          <div className="border-b border-border p-4">
            <p className="text-sm font-semibold text-indigo">
              Questions Added ({questions.length}) — {questions.reduce((s, q) => s + q.marks, 0)} total marks
            </p>
          </div>
          <div className="divide-y divide-border">
            {questions.map((q, i) => (
              <div key={q.id} className="flex items-start justify-between gap-3 p-3">
                <div>
                  <p className="text-sm text-indigo">
                    <span className="font-semibold">Q{i + 1}.</span> {q.questionText}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {q.questionType === "MCQ" ? "Multiple Choice" : q.questionType === "CODING" ? "Coding" : "Written"}
                    {q.questionType === "CODING" && q.testCaseCount ? ` · ${q.testCaseCount} test cases` : ""} &middot;{" "}
                    {q.marks} mark{q.marks !== 1 ? "s" : ""}
                  </p>
                </div>
                <form action={deleteAssessmentQuestion.bind(null, q.id)}>
                  <Button type="submit" variant="outline" size="icon-sm" className="border-border text-muted-foreground hover:text-red-600">
                    <Trash2 className="size-3.5" />
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      <form key={formKey} action={formAction} className="space-y-4 rounded-xl border border-border bg-white p-6">
        <p className="text-sm font-semibold text-indigo">Question {questions.length + 1}</p>

        <div>
          <Label htmlFor="questionText">
            Question
            <RequiredMark />
          </Label>
          <Textarea id="questionText" name="questionText" required rows={3} className="mt-1.5" placeholder="Type the question here..." />
        </div>

        <div>
          <Label>
            Question Type
            <RequiredMark />
          </Label>
          <div className="mt-1.5 flex gap-2">
            <button
              type="button"
              onClick={() => setQuestionType("MCQ")}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                questionType === "MCQ" ? "border-indigo bg-indigo text-white" : "border-border text-muted-foreground hover:text-indigo"
              }`}
            >
              Multiple Choice
            </button>
            <button
              type="button"
              onClick={() => setQuestionType("WRITTEN")}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                questionType === "WRITTEN" ? "border-indigo bg-indigo text-white" : "border-border text-muted-foreground hover:text-indigo"
              }`}
            >
              Written Answer
            </button>
            <button
              type="button"
              onClick={() => setQuestionType("CODING")}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                questionType === "CODING" ? "border-indigo bg-indigo text-white" : "border-border text-muted-foreground hover:text-indigo"
              }`}
            >
              Coding
            </button>
          </div>
          <input type="hidden" name="questionType" value={questionType} />
        </div>

        {questionType === "CODING" ? (
          <div className="space-y-4">
            <div>
              <Label>Starter Code (optional, per language)</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Pre-filled in the student&apos;s editor when they pick that language. Leave blank for an empty editor.
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {[
                  { name: "starterPython", label: "Python" },
                  { name: "starterJava", label: "Java" },
                  { name: "starterC", label: "C" },
                  { name: "starterCpp", label: "C++" },
                ].map((lang) => (
                  <div key={lang.name}>
                    <Label htmlFor={lang.name} className="text-xs">
                      {lang.label}
                    </Label>
                    <textarea
                      id={lang.name}
                      name={lang.name}
                      rows={4}
                      spellCheck={false}
                      className="mt-1 w-full rounded-lg border border-border bg-indigo-dark p-2 font-mono text-xs text-white outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label>
                  Test Cases
                  <RequiredMark />
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-border text-indigo"
                  onClick={() => setTestCaseRows((prev) => [...prev, { key: nextTestCaseKey, hidden: true }])}
                >
                  Add Test Case
                </Button>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">
                Visible test cases are shown to the student as examples. Hidden ones only run in the background when
                they submit — at least one visible test case is required.
              </p>
              <div className="space-y-3">
                {testCaseRows.map((row, i) => (
                  <div key={row.key} className="rounded-lg border border-border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-indigo">Test Case {i + 1}</p>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-indigo">
                          <input
                            type="checkbox"
                            checked={row.hidden}
                            onChange={() =>
                              setTestCaseRows((prev) =>
                                prev.map((r) => (r.key === row.key ? { ...r, hidden: !r.hidden } : r))
                              )
                            }
                            className="accent-indigo"
                          />
                          Hidden
                        </label>
                        <input type="hidden" name="testCaseHidden" value={String(row.hidden)} />
                        {testCaseRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTestCaseRows((prev) => prev.filter((r) => r.key !== row.key))}
                            className="text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">Input</Label>
                        <Textarea name="testCaseInput" rows={2} className="mt-1 font-mono text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs">Expected Output</Label>
                        <Textarea name="testCaseOutput" rows={2} className="mt-1 font-mono text-xs" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : questionType === "MCQ" ? (
          <div className="space-y-3">
            {(["A", "B", "C", "D"] as const).map((letter) => (
              <div key={letter}>
                <Label htmlFor={`option${letter}`}>
                  Option {letter}
                  <RequiredMark />
                </Label>
                <Input id={`option${letter}`} name={`option${letter}`} required className="mt-1.5" />
              </div>
            ))}
            <div>
              <Label>
                Correct Option
                <RequiredMark />
              </Label>
              <div className="mt-1.5 flex gap-2">
                {(["A", "B", "C", "D"] as const).map((letter) => (
                  <label
                    key={letter}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm has-[:checked]:border-indigo has-[:checked]:bg-indigo/5"
                  >
                    <input type="radio" name="correctOption" value={letter} required className="accent-indigo" />
                    {letter}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="writtenHint">Expected Answer Format</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              The student will see an open paragraph text box to write their answer. Written answers need to be
              graded manually from the Submissions page since free text can&apos;t be auto-scored.
            </p>
          </div>
        )}

        <div className="max-w-[180px]">
          <Label htmlFor="marks">
            Marks for this question
            <RequiredMark />
          </Label>
          <Select name="marks" defaultValue="1">
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(questionType === "CODING" ? CODING_MARK_OPTIONS : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} mark{n !== 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state?.ok && (
          <p className="flex items-center gap-1.5 text-sm text-green-700">
            <CheckCircle2 className="size-4" /> Question added — write the next one below, or finish up top.
          </p>
        )}

        <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Add Question
        </Button>
      </form>
    </div>
  );
}
