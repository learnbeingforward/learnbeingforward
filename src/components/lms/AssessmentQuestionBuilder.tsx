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
  questionType: "MCQ" | "WRITTEN";
  questionText: string;
  marks: number;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
};

export function AssessmentQuestionBuilder({
  assessmentId,
  questions,
}: {
  assessmentId: string;
  questions: BuilderQuestion[];
}) {
  const [questionType, setQuestionType] = useState<"MCQ" | "WRITTEN">("MCQ");
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, isPending] = useActionState<AddQuestionState, FormData>(
    addAssessmentQuestion.bind(null, assessmentId),
    null
  );
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) setFormKey((k) => k + 1);
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
                    {q.questionType === "MCQ" ? "Multiple Choice" : "Written"} &middot; {q.marks} mark
                    {q.marks !== 1 ? "s" : ""}
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
          </div>
          <input type="hidden" name="questionType" value={questionType} />
        </div>

        {questionType === "MCQ" ? (
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
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
