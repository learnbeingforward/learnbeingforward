"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronLeft, ChevronRight, Maximize, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  startAssessmentAttempt,
  saveAssessmentAnswer,
  submitAssessmentAttempt,
  recordAssessmentViolation,
  recordAssessmentTimeout,
} from "@/lib/actions/assessments";

const VIOLATION_LIMIT = 3;
const RETURN_GRACE_SECONDS = 5;

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

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function TakeAssessmentClient({
  assignmentId,
  assessmentTitle,
  questions,
  initialViolationCount,
  durationMinutes,
  startedAt,
}: {
  assignmentId: string;
  assessmentTitle: string;
  questions: Question[];
  initialViolationCount: number;
  durationMinutes: number;
  startedAt: string | null;
}) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.savedAnswer ?? ""]))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [violationCount, setViolationCount] = useState(initialViolationCount);
  const [warning, setWarning] = useState<string | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [timedOutMessage, setTimedOutMessage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [leaveDeadline, setLeaveDeadline] = useState<number | null>(null);
  const [leaveSecondsLeft, setLeaveSecondsLeft] = useState(RETURN_GRACE_SECONDS);

  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const leaveHandled = useRef(false);
  const finished = useRef(false);

  // ---------- Exam-duration countdown ----------

  useEffect(() => {
    if (!started || deadline === null || finished.current) return;
    const id = setInterval(() => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        clearInterval(id);
        void handleTimeUp();
      } else {
        setRemainingSeconds(Math.ceil(remaining / 1000));
      }
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, deadline]);

  async function handleTimeUp() {
    if (finished.current) return;
    finished.current = true;
    setTimedOutMessage(true);
    for (const [questionId, timer] of Object.entries(saveTimers.current)) {
      clearTimeout(timer);
      await saveAssessmentAnswer(assignmentId, questionId, answers[questionId] ?? "");
    }
    await submitAssessmentAttempt(assignmentId);
    setAutoSubmitted(true);
    setTimeout(() => router.push("/lms/student/assessments"), 4000);
  }

  // ---------- "Left the exam" detection (tab switch, window blur, exiting full-screen) ----------

  const triggerLeave = useCallback(() => {
    if (!started || finished.current || leaveHandled.current) return;
    leaveHandled.current = true;
    setLeaveDeadline(Date.now() + RETURN_GRACE_SECONDS * 1000);
    setLeaveSecondsLeft(RETURN_GRACE_SECONDS);
  }, [started]);

  useEffect(() => {
    if (!started) return;

    function handleVisibilityChange() {
      if (document.hidden) triggerLeave();
    }
    function handleBlur() {
      triggerLeave();
    }
    function handleFullscreenChange() {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);
      if (!inFullscreen) triggerLeave();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [started, triggerLeave]);

  useEffect(() => {
    if (leaveDeadline === null) return;
    const id = setInterval(() => {
      const remaining = leaveDeadline - Date.now();
      if (remaining <= 0) {
        clearInterval(id);
        void handleLeaveTimeout();
      } else {
        setLeaveSecondsLeft(Math.ceil(remaining / 1000));
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveDeadline]);

  async function handleLeaveTimeout() {
    if (finished.current) return;
    finished.current = true;
    setLeaveDeadline(null);
    await recordAssessmentTimeout(assignmentId);
    setAutoSubmitted(true);
    setTimeout(() => router.push("/lms/student/assessments"), 4000);
  }

  async function handleReturnToFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Denied by the browser — the violation is still recorded either way.
    }
    setLeaveDeadline(null);
    leaveHandled.current = false;
    const result = await recordAssessmentViolation(assignmentId);
    setViolationCount(result.violationCount);
    if (result.autoSubmitted) {
      finished.current = true;
      setAutoSubmitted(true);
      setTimeout(() => router.push("/lms/student/assessments"), 4000);
    } else {
      setWarning(
        `Warning ${result.violationCount}/${VIOLATION_LIMIT}: you left the assessment screen. After ${VIOLATION_LIMIT} warnings the assessment is submitted automatically.`
      );
    }
  }

  async function handleStart() {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen can be denied by the browser — the leave-detection checks still apply either way.
    }
    await startAssessmentAttempt(assignmentId);
    const base = startedAt ? new Date(startedAt).getTime() : Date.now();
    setDeadline(base + durationMinutes * 60_000);
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
            {timedOutMessage
              ? "Your time was up, so the assessment was submitted automatically with whatever answers were saved."
              : "You left the assessment screen and didn't return in time, so it was submitted automatically with whatever answers were saved."}{" "}
            Redirecting you back...
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
            This assessment runs full-screen and lasts <strong>{durationMinutes} minutes</strong>. Once started,
            do not switch tabs, minimize the window, or leave full-screen — each time counts as a violation, and
            after {VIOLATION_LIMIT} the assessment is submitted automatically with whatever you&apos;ve answered
            so far. If you don&apos;t return to full-screen within {RETURN_GRACE_SECONDS} seconds of leaving, it
            submits immediately.
          </p>
          <p className="mt-2 text-sm text-white/70">{questions.length} questions &middot; {questions.reduce((s, q) => s + q.marks, 0)} marks total.</p>
          <Button onClick={handleStart} className="mt-6 bg-gold text-indigo hover:bg-gold-light">
            <Maximize className="size-4" /> Start Assessment (Full-Screen)
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-0 z-10 border-b border-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="font-semibold text-indigo">{assessmentTitle}</h1>
            <p className="text-xs text-muted-foreground">
              {!isFullscreen && "Not in full-screen — "}Violations: {violationCount}/{VIOLATION_LIMIT}
              {remainingSeconds !== null && <> &middot; Time left: {formatClock(remainingSeconds)}</>}
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
        <p className="text-xs font-medium text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </p>

        <div className="rounded-xl border border-border bg-white p-5">
          <p className="mb-3 text-sm font-medium text-indigo">
            Q{currentIndex + 1}. {q.questionText}{" "}
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

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="size-4" /> Back
          </Button>

          {isLast ? (
            <Button onClick={handleSubmit} disabled={submitting} className="bg-indigo text-white hover:bg-indigo/90">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Submit Assessment
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="bg-indigo text-white hover:bg-indigo/90"
            >
              Next <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {leaveDeadline !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 max-w-sm rounded-xl bg-white p-6 text-center shadow-xl">
            <AlertTriangle className="mx-auto mb-3 size-10 text-red-500" />
            <h2 className="text-lg font-bold text-indigo">You left the assessment screen</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Return to full-screen now, or the assessment will be submitted automatically in{" "}
              <strong>{leaveSecondsLeft}s</strong>.
            </p>
            <Button
              onClick={handleReturnToFullscreen}
              className="mt-4 w-full bg-gold text-indigo hover:bg-gold-light"
            >
              <Maximize className="size-4" /> Return to Full-Screen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
