"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Maximize, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  startAssessmentAttempt,
  saveAssessmentAnswer,
  submitAssessmentAttempt,
  recordAssessmentViolation,
} from "@/lib/actions/assessments";

const VIOLATION_LIMIT = 3;

type Question = {
  id: string;
  questionType: "MCQ" | "WRITTEN";
  questionText: string;
  marks: number;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  savedAnswer: string | null;
};

export function TakeAssessmentClient({
  assignmentId,
  assessmentTitle,
  questions,
  initialViolationCount,
}: {
  assignmentId: string;
  assessmentTitle: string;
  questions: Question[];
  initialViolationCount: number;
}) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.savedAnswer ?? ""]))
  );
  const [violationCount, setViolationCount] = useState(initialViolationCount);
  const [warning, setWarning] = useState<string | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const handlingViolation = useRef(false);
  const finished = useRef(false);

  const reportViolation = useCallback(
    async (reason: string) => {
      if (finished.current || handlingViolation.current) return;
      handlingViolation.current = true;
      try {
        const result = await recordAssessmentViolation(assignmentId);
        setViolationCount(result.violationCount);
        if (result.autoSubmitted) {
          finished.current = true;
          setAutoSubmitted(true);
          setWarning(null);
          setTimeout(() => router.push("/lms/student/assessments"), 4000);
        } else {
          setWarning(
            `Warning ${result.violationCount}/${VIOLATION_LIMIT}: ${reason}. After ${VIOLATION_LIMIT} warnings the assessment is submitted automatically.`
          );
        }
      } finally {
        handlingViolation.current = false;
      }
    },
    [assignmentId, router]
  );

  useEffect(() => {
    if (!started) return;

    function handleVisibilityChange() {
      if (document.hidden) {
        reportViolation("you switched away from this tab");
      }
    }
    function handleFullscreenChange() {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);
      if (!inFullscreen && !finished.current) {
        reportViolation("you left full-screen mode");
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [started, reportViolation]);

  async function handleStart() {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen can be denied by the browser — the tab/visibility check still applies either way.
    }
    await startAssessmentAttempt(assignmentId);
    setStarted(true);
  }

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (saveTimers.current[questionId]) clearTimeout(saveTimers.current[questionId]);
    saveTimers.current[questionId] = setTimeout(() => {
      saveAssessmentAnswer(assignmentId, questionId, value);
    }, 600);
  }

  async function handleSubmit() {
    setSubmitting(true);
    finished.current = true;
    // Flush any pending debounced saves immediately before submitting.
    for (const [questionId, timer] of Object.entries(saveTimers.current)) {
      clearTimeout(timer);
      await saveAssessmentAnswer(assignmentId, questionId, answers[questionId] ?? "");
    }
    await submitAssessmentAttempt(assignmentId);
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    }
    router.push("/lms/student/assessments");
  }

  if (autoSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-dark p-6 text-center text-white">
        <div>
          <AlertTriangle className="mx-auto mb-4 size-12 text-red-400" />
          <h1 className="text-xl font-bold">Assessment Submitted Automatically</h1>
          <p className="mt-2 max-w-md text-sm text-white/70">
            You left the assessment screen {VIOLATION_LIMIT} times, so it was submitted automatically with
            whatever answers were saved. Redirecting you back...
          </p>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-dark p-6 text-center text-white">
        <div className="max-w-md">
          <h1 className="text-xl font-bold">{assessmentTitle}</h1>
          <p className="mt-3 text-sm text-white/70">
            This assessment runs full-screen. Once started, do not switch tabs, minimize the window, or leave
            full-screen — each time counts as a violation, and after {VIOLATION_LIMIT} the assessment is
            submitted automatically with whatever you&apos;ve answered so far.
          </p>
          <p className="mt-2 text-sm text-white/70">{questions.length} questions &middot; {questions.reduce((s, q) => s + q.marks, 0)} marks total.</p>
          <Button onClick={handleStart} className="mt-6 bg-gold text-indigo hover:bg-gold-light">
            <Maximize className="size-4" /> Start Assessment (Full-Screen)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-0 z-10 border-b border-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="font-semibold text-indigo">{assessmentTitle}</h1>
            <p className="text-xs text-muted-foreground">
              {!isFullscreen && "Not in full-screen — "}Violations: {violationCount}/{VIOLATION_LIMIT}
            </p>
          </div>
          {!isFullscreen && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => document.documentElement.requestFullscreen().catch(() => {})}
              className="border-amber-400 text-amber-700"
            >
              <Maximize className="size-3.5" /> Return to Full-Screen
            </Button>
          )}
        </div>
      </div>

      {warning && (
        <div className="mx-auto mt-4 max-w-3xl rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mr-1.5 inline size-4" /> {warning}
        </div>
      )}

      <div className="mx-auto max-w-3xl space-y-4 p-6">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-xl border border-border bg-white p-5">
            <p className="mb-3 text-sm font-medium text-indigo">
              Q{i + 1}. {q.questionText}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({q.marks} mark{q.marks !== 1 ? "s" : ""})
              </span>
            </p>
            {q.questionType === "MCQ" ? (
              <div className="space-y-2">
                {(["A", "B", "C", "D"] as const).map((letter) => {
                  const text = q[`option${letter}` as "optionA"];
                  return (
                    <label
                      key={letter}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-indigo has-[:checked]:bg-indigo/5"
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={letter}
                        checked={answers[q.id] === letter}
                        onChange={() => handleAnswerChange(q.id, letter)}
                        className="accent-indigo"
                      />
                      {letter}. {text}
                    </label>
                  );
                })}
              </div>
            ) : (
              <Textarea
                rows={5}
                value={answers[q.id] ?? ""}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                placeholder="Write your answer here..."
              />
            )}
          </div>
        ))}

        <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-indigo text-white hover:bg-indigo/90">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Submit Assessment
        </Button>
      </div>
    </div>
  );
}
