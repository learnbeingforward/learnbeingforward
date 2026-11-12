"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronLeft, ChevronRight, Maximize, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  startAssessmentAttempt,
  saveAssessmentAnswer,
  submitAssessmentAttempt,
  recordAssessmentViolation,
  recordAssessmentTimeout,
  recordAudioViolation,
  submitMcqPhase,
} from "@/lib/actions/assessments";
import { CodingQuestionPanel } from "@/components/lms/CodingQuestionPanel";

const VIOLATION_LIMIT = 3;
const AUDIO_VIOLATION_LIMIT = 3;
const RETURN_GRACE_SECONDS = 5;
const CALIBRATION_SECONDS = 4;
const SNAPSHOT_INTERVAL_MS = 30_000;
const AUDIO_CHECK_INTERVAL_MS = 300;
// Sliding window for "sustained" noise: human speech naturally dips below the
// threshold between words, so requiring an unbroken streak above it almost never
// fires for real talking. Instead, look at the last WINDOW checks and flag it once
// enough of them (not all) were loud — that catches sustained talking while still
// ignoring a single cough or chair creak.
const AUDIO_WINDOW_SIZE = Math.round(2_000 / AUDIO_CHECK_INTERVAL_MS);
const AUDIO_WINDOW_FRACTION = 0.4;

type Question = {
  id: string;
  questionType: "MCQ" | "WRITTEN" | "CODING";
  questionText: string;
  marks: number;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  savedAnswer: string | null;
  starterCode: string | null;
  visibleTestCases: { id: string; input: string; expectedOutput: string }[];
  savedCode: string | null;
  savedLanguage: string | null;
  testCasesPassed: number | null;
  testCasesTotal: number | null;
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
  availableUntil,
  proctoringEnabled,
  initialAudioViolationCount,
  hasCodingQuestions,
  initialMcqPhaseSubmitted,
}: {
  assignmentId: string;
  assessmentTitle: string;
  questions: Question[];
  initialViolationCount: number;
  durationMinutes: number;
  startedAt: string | null;
  availableUntil: string | null;
  proctoringEnabled: boolean;
  initialAudioViolationCount: number;
  hasCodingQuestions: boolean;
  initialMcqPhaseSubmitted: boolean;
}) {
  const router = useRouter();
  // Mixed assessments run in two one-way phases: every MCQ/written question first,
  // then — once explicitly submitted — the coding questions. An assessment with no
  // coding questions never touches this at all and behaves exactly as before.
  const mcqQuestions = questions.filter((q) => q.questionType !== "CODING");
  const codingQuestions = questions.filter((q) => q.questionType === "CODING");
  const [mcqPhaseSubmitted, setMcqPhaseSubmitted] = useState(initialMcqPhaseSubmitted || mcqQuestions.length === 0);
  const [submittingMcqPhase, setSubmittingMcqPhase] = useState(false);
  const activeQuestions = hasCodingQuestions ? (mcqPhaseSubmitted ? codingQuestions : mcqQuestions) : questions;
  const [started, setStarted] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationSecondsLeft, setCalibrationSecondsLeft] = useState(CALIBRATION_SECONDS);
  // Browsers only grant fullscreen from a fresh click — the automatic attempt right
  // after the camera/mic prompt usually works, but if the browser consumed the user
  // gesture while that permission UI was open, it silently fails. Rather than
  // starting the exam outside full-screen with no explanation, this forces one more
  // unmissable click to actually enter it before any question is shown.
  const [needsFullscreenClick, setNeedsFullscreenClick] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.savedAnswer ?? ""]))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [violationCount, setViolationCount] = useState(initialViolationCount);
  const [audioViolationCount, setAudioViolationCount] = useState(initialAudioViolationCount);
  const [warning, setWarning] = useState<string | null>(null);
  const [audioWarning, setAudioWarning] = useState<string | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [timedOutMessage, setTimedOutMessage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [leaveDeadline, setLeaveDeadline] = useState<number | null>(null);
  const [leaveSecondsLeft, setLeaveSecondsLeft] = useState(RETURN_GRACE_SECONDS);
  // null = default bottom-right corner (via CSS classes); once dragged, pinned to
  // an explicit pixel position anywhere on screen instead.
  const [pipPos, setPipPos] = useState<{ top: number; left: number } | null>(null);
  const pipDragRef = useRef<{ startX: number; startY: number; startTop: number; startLeft: number } | null>(null);

  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const leaveHandled = useRef(false);
  const audioViolationHandled = useRef(false);
  const finished = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // A second, offscreen <video> created in JS (not JSX) so it exists from the moment
  // the camera stream is granted — the visible preview <video> only mounts once
  // `started` is true, which is too late: snapshot capture needs a playing video
  // element the whole time, including during calibration.
  const captureVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioBaselineRef = useRef(0);
  const audioWindowRef = useRef<boolean[]>([]);

  function stopMedia() {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    captureVideoRef.current?.pause();
    captureVideoRef.current = null;
  }

  useEffect(() => stopMedia, []);

  // ---------- Exam-duration / window-close countdown ----------

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
    stopMedia();
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
    // Fullscreen may already have been entered before this listener was attached
    // (during calibration) — sync the real current state instead of assuming false,
    // otherwise the header wrongly claims "Not in full-screen" the whole exam.
    setIsFullscreen(!!document.fullscreenElement);

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
    stopMedia();
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
      stopMedia();
      setAutoSubmitted(true);
      setTimeout(() => router.push("/lms/student/assessments"), 4000);
    } else {
      setWarning(
        `Warning ${result.violationCount}/${VIOLATION_LIMIT}: you left the assessment screen. After ${VIOLATION_LIMIT} warnings the assessment is submitted automatically.`
      );
    }
  }

  // ---------- Proctoring: attach the live stream to the visible preview once it mounts ----------

  useEffect(() => {
    if (!started || !proctoringEnabled) return;
    const video = videoRef.current;
    const stream = mediaStreamRef.current;
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    }
  }, [started, proctoringEnabled]);

  // ---------- Proctoring: webcam snapshots ----------

  useEffect(() => {
    if (!started || !proctoringEnabled) return;
    const id = setInterval(() => {
      const video = captureVideoRef.current;
      if (!video || video.readyState < 2) return;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const body = new FormData();
          body.set("assignmentId", assignmentId);
          body.set("image", blob, "snapshot.jpg");
          fetch("/api/assessment-snapshots", { method: "POST", body }).catch(() => {});
        },
        "image/jpeg",
        0.7
      );
    }, SNAPSHOT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [started, proctoringEnabled, assignmentId]);

  // ---------- Proctoring: real-time audio-level monitoring ----------

  useEffect(() => {
    if (!started || !proctoringEnabled || finished.current) return;
    const id = setInterval(() => {
      const analyser = analyserRef.current;
      if (!analyser) return;
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);
      let sumSquares = 0;
      for (const v of data) {
        const centered = v - 128;
        sumSquares += centered * centered;
      }
      const rms = Math.sqrt(sumSquares / data.length);
      // Was baseline*3+10 — too high a bar, so only shouting (not normal talking)
      // ever crossed it. Lowered so a student simply speaking during the exam
      // reliably registers as "loud" for this check, not just raised voices.
      const threshold = audioBaselineRef.current * 1.6 + 6;

      const window = audioWindowRef.current;
      window.push(rms > threshold);
      if (window.length > AUDIO_WINDOW_SIZE) window.shift();

      const loudFraction = window.filter(Boolean).length / window.length;
      if (window.length >= AUDIO_WINDOW_SIZE && loudFraction >= AUDIO_WINDOW_FRACTION && !audioViolationHandled.current) {
        audioViolationHandled.current = true;
        audioWindowRef.current = [];
        void handleAudioViolation();
      }
    }, AUDIO_CHECK_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, proctoringEnabled]);

  async function handleAudioViolation() {
    if (finished.current) {
      audioViolationHandled.current = false;
      return;
    }
    const result = await recordAudioViolation(assignmentId);
    setAudioViolationCount(result.audioViolationCount);
    if (result.autoSubmitted) {
      finished.current = true;
      stopMedia();
      setAutoSubmitted(true);
      setTimeout(() => router.push("/lms/student/assessments"), 4000);
    } else {
      setAudioWarning(
        `Audio warning ${result.audioViolationCount}/${AUDIO_VIOLATION_LIMIT}: noise detected. After ${AUDIO_VIOLATION_LIMIT} warnings the assessment is submitted automatically.`
      );
      audioWindowRef.current = [];
      audioViolationHandled.current = false;
    }
  }

  // ---------- Draggable camera preview ----------

  function handlePipPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    pipDragRef.current = { startX: e.clientX, startY: e.clientY, startTop: rect.top, startLeft: rect.left };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePipPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = pipDragRef.current;
    if (!drag) return;
    const el = e.currentTarget;
    const top = Math.min(Math.max(0, drag.startTop + (e.clientY - drag.startY)), window.innerHeight - el.offsetHeight);
    const left = Math.min(Math.max(0, drag.startLeft + (e.clientX - drag.startX)), window.innerWidth - el.offsetWidth);
    setPipPos({ top, left });
  }

  function handlePipPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    pipDragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  // ---------- Start flow (with optional camera/mic calibration) ----------

  async function beginExam() {
    await startAssessmentAttempt(assignmentId);
    const base = startedAt ? new Date(startedAt).getTime() : Date.now();
    const durationDeadline = base + durationMinutes * 60_000;
    const windowDeadline = availableUntil ? new Date(availableUntil).getTime() : Infinity;
    setDeadline(Math.min(durationDeadline, windowDeadline));
    setStarted(true);
  }

  async function handleStart() {
    setStarting(true);
    setMediaError(null);

    if (!proctoringEnabled) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen can be denied by the browser — the leave-detection checks still apply either way.
      }
      try {
        await beginExam();
      } catch (err) {
        setMediaError(err instanceof Error ? err.message : "Couldn't start the assessment.");
      }
      setStarting(false);
      return;
    }

    try {
      // Ask for the camera/mic BEFORE entering full-screen — the permission prompt
      // itself knocks the page straight back out of full-screen in most browsers, so
      // requesting full-screen first just gets silently cancelled. Asking first and
      // entering full-screen once the prompt is already closed avoids that entirely.
      // autoGainControl/noiseSuppression/echoCancellation are all enabled by default
      // and actively fight this detector: AGC in particular renormalizes the input
      // level within a second or two of a loud burst, so sustained shouting reads as
      // loud only briefly before the browser quietly turns it back down — producing
      // just one violation instead of one per sustained window. Disabling them keeps
      // the raw mic level the RMS check actually relies on.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { autoGainControl: false, noiseSuppression: false, echoCancellation: false },
      });
      mediaStreamRef.current = stream;

      const captureVideo = document.createElement("video");
      captureVideo.muted = true;
      captureVideo.playsInline = true;
      captureVideo.srcObject = stream;
      await captureVideo.play().catch(() => {});
      captureVideoRef.current = captureVideo;

      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Denied by the browser — the leave-detection checks still apply either way.
      }

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      setStarting(false);
      setCalibrating(true);
      setCalibrationSecondsLeft(CALIBRATION_SECONDS);

      const samples: number[] = [];
      const calibrationStart = Date.now();
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          const data = new Uint8Array(analyser.fftSize);
          analyser.getByteTimeDomainData(data);
          let sumSquares = 0;
          for (const v of data) {
            const centered = v - 128;
            sumSquares += centered * centered;
          }
          samples.push(Math.sqrt(sumSquares / data.length));

          const elapsed = Date.now() - calibrationStart;
          setCalibrationSecondsLeft(Math.max(0, Math.ceil((CALIBRATION_SECONDS * 1000 - elapsed) / 1000)));
          if (elapsed >= CALIBRATION_SECONDS * 1000) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });

      audioBaselineRef.current = samples.length > 0 ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;
      setCalibrating(false);

      if (document.fullscreenElement) {
        await beginExam();
      } else {
        // The earlier automatic request didn't take — ask for one explicit click
        // instead of silently starting the exam in a normal browser tab.
        setNeedsFullscreenClick(true);
      }
    } catch (err) {
      stopMedia();
      setMediaError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Camera and microphone access is required for this assessment. Please allow access and try again."
          : "Couldn't access your camera/microphone. Please check your device and try again."
      );
    }
    setStarting(false);
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
    stopMedia();
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

  async function handleSubmitMcqPhase() {
    setSubmittingMcqPhase(true);
    for (const [questionId, timer] of Object.entries(saveTimers.current)) {
      clearTimeout(timer);
      await saveAssessmentAnswer(assignmentId, questionId, answers[questionId] ?? "");
    }
    await submitMcqPhase(assignmentId);
    setMcqPhaseSubmitted(true);
    setCurrentIndex(0);
    setSubmittingMcqPhase(false);
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

  async function handleEnterFullscreenAndBegin() {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Still denied — the leave-detection checks apply regardless once the exam starts.
    }
    setNeedsFullscreenClick(false);
    await beginExam();
  }

  if (needsFullscreenClick) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-dark p-6 text-center text-white">
        <div className="max-w-md">
          <Maximize className="mx-auto mb-4 size-10 text-gold" />
          <h1 className="text-xl font-bold">Enter Full-Screen to Begin</h1>
          <p className="mt-3 text-sm text-white/70">
            Your camera and microphone are ready. One last step — click below to enter full-screen, which starts
            the assessment immediately.
          </p>
          <Button onClick={handleEnterFullscreenAndBegin} className="mt-6 bg-gold text-indigo hover:bg-gold-light">
            <Maximize className="size-4" /> Enter Full-Screen & Start
          </Button>
        </div>
      </div>
    );
  }

  if (calibrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-dark p-6 text-center text-white">
        <div className="max-w-md">
          <Video className="mx-auto mb-4 size-10 text-gold" />
          <h1 className="text-xl font-bold">Calibrating your microphone</h1>
          <p className="mt-3 text-sm text-white/70">
            Please stay quiet for a few seconds. Once calibration finishes, speaking or background noise above
            this level will count as a violation — please remain quiet for the entire assessment, just as you are
            now.
          </p>
          <p className="mt-4 text-3xl font-bold text-gold">{calibrationSecondsLeft}s</p>
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
          {proctoringEnabled && (
            <p className="mt-2 text-sm text-white/70">
              This assessment is proctored — you will be watched on camera and your audio will be monitored for
              the entire duration. Unexpected noise is flagged as a violation, up to {AUDIO_VIOLATION_LIMIT}{" "}
              warnings.
            </p>
          )}
          <p className="mt-2 text-sm text-white/70">{questions.length} questions &middot; {questions.reduce((s, q) => s + q.marks, 0)} marks total.</p>
          {mediaError && (
            <p className="mt-3 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{mediaError}</p>
          )}
          <Button onClick={handleStart} disabled={starting} className="mt-6 bg-gold text-indigo hover:bg-gold-light">
            {starting ? <Loader2 className="size-4 animate-spin" /> : <Maximize className="size-4" />}
            Start Assessment (Full-Screen)
          </Button>
        </div>
      </div>
    );
  }

  const q = activeQuestions[currentIndex];
  const isLast = currentIndex === activeQuestions.length - 1;
  const inCodingPhase = hasCodingQuestions && mcqPhaseSubmitted;

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-0 z-10 border-b border-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="font-semibold text-indigo">{assessmentTitle}</h1>
            <p className="text-xs text-muted-foreground">
              {!isFullscreen && "Not in full-screen — "}Violations: {violationCount}/{VIOLATION_LIMIT}
              {proctoringEnabled && <> &middot; Audio: {audioViolationCount}/{AUDIO_VIOLATION_LIMIT}</>}
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
      {audioWarning && (
        <div className="mx-auto mt-4 max-w-3xl rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertTriangle className="mr-1.5 inline size-4" /> {audioWarning}
        </div>
      )}

      <div className="mx-auto max-w-3xl space-y-4 p-6">
        {hasCodingQuestions && (
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo">
            {inCodingPhase ? "Phase 2 — Coding" : "Phase 1 — Multiple Choice & Written"}
          </p>
        )}
        <p className="text-xs font-medium text-muted-foreground">
          Question {currentIndex + 1} of {activeQuestions.length}
        </p>

        {q.questionType === "CODING" ? (
          <CodingQuestionPanel key={q.id} assignmentId={assignmentId} question={q} />
        ) : (
          <div className="rounded-xl border border-border bg-white p-5">
            <p className="mb-3 whitespace-pre-wrap text-base font-medium leading-relaxed text-indigo">
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
                      className="flex items-start gap-2 rounded-lg border border-border px-3 py-2.5 text-base has-[:checked]:border-indigo has-[:checked]:bg-indigo/5"
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={letter}
                        checked={answers[q.id] === letter}
                        onChange={() => handleAnswerChange(q.id, letter)}
                        className="mt-1 shrink-0 accent-indigo"
                      />
                      <span className="whitespace-pre-wrap">
                        {letter}. {text}
                      </span>
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
                className="text-base"
              />
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="size-4" /> Back
          </Button>

          {isLast ? (
            !inCodingPhase && hasCodingQuestions ? (
              <Button onClick={handleSubmitMcqPhase} disabled={submittingMcqPhase} className="bg-indigo text-white hover:bg-indigo/90">
                {submittingMcqPhase && <Loader2 className="size-4 animate-spin" />}
                Submit & Continue to Coding <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="bg-indigo text-white hover:bg-indigo/90">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Submit Assessment
              </Button>
            )
          ) : (
            <Button
              onClick={() => setCurrentIndex((i) => Math.min(activeQuestions.length - 1, i + 1))}
              className="bg-indigo text-white hover:bg-indigo/90"
            >
              Next <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
        {!inCodingPhase && hasCodingQuestions && isLast && (
          <p className="text-center text-xs text-muted-foreground">
            Once you continue, you can&apos;t come back to these questions — review your answers first.
          </p>
        )}
      </div>

      {proctoringEnabled && (
        <div
          onPointerDown={handlePipPointerDown}
          onPointerMove={handlePipPointerMove}
          onPointerUp={handlePipPointerUp}
          style={pipPos ? { top: pipPos.top, left: pipPos.left } : undefined}
          className={`fixed z-20 h-24 w-32 cursor-move touch-none select-none overflow-hidden rounded-lg border-2 border-white shadow-lg ${
            pipPos ? "" : "bottom-4 right-4"
          }`}
        >
          <video ref={videoRef} muted playsInline className="size-full object-cover" />
          <span className="pointer-events-none absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
            REC
          </span>
        </div>
      )}

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
