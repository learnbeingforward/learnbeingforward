"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  Maximize,
  Maximize2,
  Minimize2,
  Loader2,
  Mic,
  Monitor,
  Square,
  Video,
  Volume2,
  XCircle,
} from "lucide-react";
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
  timeLimitSeconds: number | null;
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

function formatClockParts(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h, m, s };
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
  alreadySubmitted,
  wasAutoSubmitted,
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
  alreadySubmitted: boolean;
  wasAutoSubmitted: boolean;
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
  const [codingAnswered, setCodingAnswered] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(codingQuestions.map((q) => [q.id, q.testCasesPassed !== null]))
  );
  const [reviewing, setReviewing] = useState(false);
  // Pure client-side "mark for review" flag — not graded, just a note-to-self the
  // student can toggle per question (shown in the overview screen and the finish
  // confirmation's counts).
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  // The question-number strip shows 10 at a time; this is which window (0, 10,
  // 20, …) is currently visible, independent of which question is actually open.
  const [navWindowStart, setNavWindowStart] = useState(0);
  const [showAllProblems, setShowAllProblems] = useState(false);
  const [webcamExpanded, setWebcamExpanded] = useState(false);
  const [started, setStarted] = useState(false);
  const [calibrationSecondsLeft, setCalibrationSecondsLeft] = useState(CALIBRATION_SECONDS);
  // Proctored assessments go through a sequential camera/mic/audio/system check
  // interface before the real "Start Assessment" button appears, instead of asking
  // for every permission at once — see handleCheckCamera etc. below.
  const [preExamChecking, setPreExamChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState<Record<"camera" | "microphone" | "audio" | "system", "pending" | "checking" | "passed" | "failed">>({
    camera: "pending",
    microphone: "pending",
    audio: "pending",
    system: "pending",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
  const [autoSubmitted, setAutoSubmitted] = useState(wasAutoSubmitted);
  const [autoSubmitReason, setAutoSubmitReason] = useState<"time" | "violation" | "audio" | null>(() => {
    if (!wasAutoSubmitted) return null;
    // Revisiting an already-auto-submitted attempt (no live event to know the exact
    // cause from) — infer it from whichever limit was actually hit.
    if (initialAudioViolationCount >= AUDIO_VIOLATION_LIMIT) return "audio";
    if (initialViolationCount >= VIOLATION_LIMIT) return "violation";
    return "time";
  });
  // Shown instead of an immediate redirect once the attempt is over (submitted,
  // auto-submitted, or auto-submitted on violation) — a recap of what was actually
  // answered, since a student otherwise has no way to tell what went through. Also
  // shown immediately on load if this attempt was already submitted earlier (e.g.
  // revisiting the URL), instead of the page.tsx redirect that used to happen here.
  const [showSummary, setShowSummary] = useState(alreadySubmitted);
  const [codingSubmissions, setCodingSubmissions] = useState<
    Record<string, { code: string; language: string; passed: number; total: number }>
  >(() =>
    Object.fromEntries(
      codingQuestions
        .filter((q) => q.testCasesPassed !== null)
        .map((q) => [
          q.id,
          { code: q.savedCode ?? "", language: q.savedLanguage ?? "python", passed: q.testCasesPassed ?? 0, total: q.testCasesTotal ?? 0 },
        ])
    )
  );
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
  // Camera and microphone are requested separately during the system-check steps
  // (so each gets its own tick/cross), then merged into one MediaStream for the
  // actual exam once both pass — see handleFinalStart.
  const camStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  function stopMedia() {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    camStreamRef.current?.getTracks().forEach((t) => t.stop());
    camStreamRef.current = null;
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
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
    setAutoSubmitReason("time");
    stopMedia();
    for (const [questionId, timer] of Object.entries(saveTimers.current)) {
      clearTimeout(timer);
      await saveAssessmentAnswer(assignmentId, questionId, answers[questionId] ?? "");
    }
    await submitAssessmentAttempt(assignmentId);
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    }
    setAutoSubmitted(true);
    setShowSummary(true);
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
    setAutoSubmitReason("violation");
    setAutoSubmitted(true);
    setShowSummary(true);
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
      setAutoSubmitReason("violation");
      setAutoSubmitted(true);
      setShowSummary(true);
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
      // Threshold is ~60-65% above whatever the room's own ambient level turned out
      // to be during calibration, not a fixed loudness — a quiet room flags a quiet
      // voice, a noisier room needs a little more to stand out above it. The old
      // flat "+6" offset dominated in genuinely quiet rooms (baseline near 0) and
      // pushed the real threshold well past 65% above baseline; kept only a tiny
      // floor so true silence doesn't trigger on sensor noise alone.
      const threshold = audioBaselineRef.current * 1.625 + 2;

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
      setAutoSubmitReason("audio");
      setAutoSubmitted(true);
      setShowSummary(true);
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

  // ---------- Keyboard shortcuts: ←/→ to move between questions, 1-4 to pick an MCQ option ----------

  useEffect(() => {
    if (!started || reviewing || showAllProblems || showSummary) return;
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || (e.target as HTMLElement | null)?.isContentEditable) return;
      if (e.key === "ArrowLeft") {
        setCurrentIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((i) => Math.min(activeQuestions.length - 1, i + 1));
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const current = activeQuestions[currentIndex];
        if (current && current.questionType === "MCQ") {
          handleAnswerChange(current.id, (["A", "B", "C", "D"] as const)[Number(e.key) - 1]);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, reviewing, showAllProblems, showSummary, currentIndex]);

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
    // Non-proctored assessments skip the camera/mic/audio system-check interface
    // entirely — there's nothing to check — and go straight to full-screen.
    setStarting(true);
    setMediaError(null);
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
  }

  // ---------- Pre-exam system check (proctored assessments only) ----------
  //
  // Four sequential checks — camera, microphone, audio calibration, system (full-
  // screen support) — each requested and confirmed one at a time with its own
  // tick/cross, instead of asking for every permission in one opaque prompt. The
  // camera and microphone streams are requested separately (so each gets its own
  // pass/fail) and merged into one MediaStream for the real exam once both pass.

  async function handleCheckCamera() {
    setCheckStatus((s) => ({ ...s, camera: "checking" }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      camStreamRef.current = stream;
      setCheckStatus((s) => ({ ...s, camera: "passed" }));
    } catch {
      setCheckStatus((s) => ({ ...s, camera: "failed" }));
    }
  }

  async function handleCheckMicrophone() {
    setCheckStatus((s) => ({ ...s, microphone: "checking" }));
    try {
      // autoGainControl/noiseSuppression/echoCancellation are all enabled by default
      // and actively fight the live violation detector: AGC in particular
      // renormalizes the input level within a second or two of a loud burst, so
      // sustained shouting reads as loud only briefly. Disabling them keeps the raw
      // mic level the RMS check actually relies on.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { autoGainControl: false, noiseSuppression: false, echoCancellation: false },
      });
      micStreamRef.current = stream;
      setCheckStatus((s) => ({ ...s, microphone: "passed" }));
    } catch {
      setCheckStatus((s) => ({ ...s, microphone: "failed" }));
    }
  }

  async function handleCheckAudioCalibration() {
    const micStream = micStreamRef.current;
    if (!micStream) {
      setCheckStatus((s) => ({ ...s, audio: "failed" }));
      return;
    }
    setCheckStatus((s) => ({ ...s, audio: "checking" }));
    setCalibrationSecondsLeft(CALIBRATION_SECONDS);

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const source = audioCtx.createMediaStreamSource(micStream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    audioContextRef.current = audioCtx;
    analyserRef.current = analyser;

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
    setCheckStatus((s) => ({ ...s, audio: "passed" }));
  }

  function handleCheckSystem() {
    setCheckStatus((s) => ({ ...s, system: "checking" }));
    const supported = typeof document.documentElement.requestFullscreen === "function";
    setCheckStatus((s) => ({ ...s, system: supported ? "passed" : "failed" }));
  }

  async function handleFinalStart() {
    setStarting(true);
    setMediaError(null);
    try {
      const camStream = camStreamRef.current;
      const micStream = micStreamRef.current;
      if (!camStream || !micStream) {
        throw new Error("Camera and microphone checks must pass before you can start.");
      }
      // Merge the already-granted tracks into one stream rather than asking for
      // camera+mic access a third time — the browser already has both open.
      const combined = new MediaStream([...camStream.getVideoTracks(), ...micStream.getAudioTracks()]);
      mediaStreamRef.current = combined;

      const captureVideo = document.createElement("video");
      captureVideo.muted = true;
      captureVideo.playsInline = true;
      captureVideo.srcObject = combined;
      await captureVideo.play().catch(() => {});
      captureVideoRef.current = captureVideo;

      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Denied by the browser — the leave-detection checks still apply either way.
      }

      setPreExamChecking(false);
      if (document.fullscreenElement) {
        await beginExam();
      } else {
        // The automatic request didn't take — ask for one explicit click instead
        // of silently starting the exam in a normal browser tab.
        setNeedsFullscreenClick(true);
      }
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : "Couldn't start the assessment.");
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
    setShowSummary(true);
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

  if (showSummary) {
    const AUTO_SUBMIT_MESSAGE: Record<NonNullable<typeof autoSubmitReason>, string> = {
      time: "Your time was up, so the assessment was submitted automatically with whatever answers were saved.",
      violation: "You left the assessment screen and didn't return in time, so it was submitted automatically with whatever answers were saved.",
      audio: "Too much background noise was detected, so the assessment was submitted automatically with whatever answers were saved.",
    };

    return (
      <div className="min-h-screen bg-indigo-dark p-6">
        <div className="mx-auto max-w-3xl">
          {autoSubmitted && autoSubmitReason && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-white">
              <AlertTriangle className="mt-0.5 size-6 shrink-0 text-red-400" />
              <div>
                <p className="font-semibold">Assessment Submitted Automatically</p>
                <p className="mt-1 text-sm text-white/70">{AUTO_SUBMIT_MESSAGE[autoSubmitReason]}</p>
              </div>
            </div>
          )}

          <h1 className="text-xl font-bold text-white">Your Submission</h1>
          <p className="mt-1 text-sm text-white/70">
            Here&apos;s what was recorded for every question, grouped the same way you answered them — review it,
            then head back to your assessments.
          </p>

          {(() => {
            function isQuestionAnswered(sq: (typeof questions)[number]) {
              if (sq.questionType === "CODING") return !!codingSubmissions[sq.id];
              const value = answers[sq.id];
              return !!value && value.trim() !== "";
            }

            function renderQuestionCard(sq: (typeof questions)[number], globalIndex: number) {
              if (sq.questionType === "CODING") {
                const sub = codingSubmissions[sq.id];
                return (
                  <div key={sq.id} className="rounded-xl border border-white/15 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="whitespace-pre-wrap text-sm font-medium text-white">
                        Q{globalIndex + 1}. {sq.questionText}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                          sub ? "bg-indigo-light/20 text-indigo-light" : "bg-white/10 text-white/60"
                        }`}
                      >
                        {sub ? `${sub.passed}/${sub.total} test cases passed` : "Not attempted"}
                      </span>
                    </div>
                    {sub ? (
                      <pre className="mt-2 overflow-x-auto rounded-lg bg-indigo-dark/60 p-3 text-xs text-white/80">
                        {sub.code || "(empty submission)"}
                      </pre>
                    ) : (
                      <p className="mt-2 text-sm text-white/50">You didn&apos;t submit code for this question.</p>
                    )}
                  </div>
                );
              }

              const value = answers[sq.id];
              const answered = !!value && value.trim() !== "";
              return (
                <div key={sq.id} className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="whitespace-pre-wrap text-sm font-medium text-white">
                      Q{globalIndex + 1}. {sq.questionText}
                    </p>
                    {!answered && (
                      <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/60">
                        Skipped
                      </span>
                    )}
                  </div>
                  {sq.questionType === "MCQ" ? (
                    answered ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-indigo-light">
                        {value}. {sq[`option${value}` as "optionA"]}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-white/50">No option selected.</p>
                    )
                  ) : answered ? (
                    <p className="mt-2 whitespace-pre-wrap rounded-lg bg-indigo-dark/60 p-3 text-sm text-white/80">{value}</p>
                  ) : (
                    <p className="mt-2 text-sm text-white/50">No answer given.</p>
                  )}
                </div>
              );
            }

            // Mixed assessments get two clearly separate sections, matching how the
            // student actually took it (MCQ/written phase, then a locked-in coding
            // phase) — otherwise auto-submitting mid-phase would bury "never even
            // reached" coding questions in among answered ones with no explanation.
            const sections: { label: string; qs: typeof questions }[] = hasCodingQuestions
              ? [
                  { label: "Multiple Choice & Written", qs: mcqQuestions },
                  { label: "Coding", qs: codingQuestions },
                ]
              : [{ label: "Questions", qs: questions }];

            return sections.map((section) => {
              const sectionAnswered = section.qs.filter(isQuestionAnswered).length;
              return (
                <div key={section.label} className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/60">{section.label}</p>
                    <p className="text-xs text-white/60">
                      {sectionAnswered}/{section.qs.length} attempted
                    </p>
                  </div>
                  <div className="space-y-3">
                    {section.qs.map((sq) => renderQuestionCard(sq, questions.findIndex((x) => x.id === sq.id)))}
                  </div>
                </div>
              );
            });
          })()}

          <Button
            onClick={() => router.push("/lms/student/assessments")}
            className="mt-6 w-full bg-gold text-indigo hover:bg-gold-light sm:w-auto"
          >
            Back to Assessments
          </Button>
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

  if (preExamChecking) {
    const steps = [
      {
        key: "camera" as const,
        label: "Camera",
        icon: Video,
        hint: "Grants camera access so the proctor can periodically confirm it's really you taking the assessment.",
        failHint: "Access was blocked. Allow camera access for this site in your browser's address-bar settings, then retry.",
        action: handleCheckCamera,
      },
      {
        key: "microphone" as const,
        label: "Microphone",
        icon: Mic,
        hint: "Grants microphone access so background noise can be monitored during the assessment.",
        failHint: "Access was blocked. Allow microphone access for this site in your browser's address-bar settings, then retry.",
        action: handleCheckMicrophone,
      },
      {
        key: "audio" as const,
        label: "Audio Calibration",
        icon: Volume2,
        hint: `Stay quiet for ${CALIBRATION_SECONDS} seconds so we can measure your room's normal background noise. Keep your surroundings this quiet — and your own volume low — for the whole assessment: anything noticeably louder than this baseline is flagged as a violation, up to ${AUDIO_VIOLATION_LIMIT} warnings before auto-submit.`,
        failHint: "Couldn't calibrate — make sure the microphone check above passed first, then retry.",
        action: handleCheckAudioCalibration,
      },
      {
        key: "system" as const,
        label: "System Check",
        icon: Monitor,
        hint: "Confirms your browser supports full-screen mode, which this assessment requires for the whole duration.",
        failHint: "Your browser doesn't support full-screen mode. Try the latest Chrome, Edge, or Firefox.",
        action: handleCheckSystem,
      },
    ];
    const allPassed = steps.every((s) => checkStatus[s.key] === "passed");
    const firstPendingIndex = steps.findIndex((s) => checkStatus[s.key] !== "passed");

    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-dark p-6">
        <div className="w-full max-w-lg">
          <h1 className="text-center text-xl font-bold text-white">Pre-Assessment System Check</h1>
          <p className="mt-2 text-center text-sm text-white/70">
            Complete these {steps.length} checks in order — each needs a quick permission or a few seconds — before
            you can start the assessment.
          </p>

          <div className="mt-6 space-y-3">
            {steps.map((step, i) => {
              const status = checkStatus[step.key];
              const Icon = step.icon;
              const isActive = i === firstPendingIndex;
              return (
                <div
                  key={step.key}
                  className={`rounded-xl border p-4 ${
                    status === "passed"
                      ? "border-green-400/40 bg-green-500/10"
                      : status === "failed"
                        ? "border-red-400/40 bg-red-500/10"
                        : "border-white/15 bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <Icon className="size-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {i + 1}. {step.label}
                      </p>
                      <p className="mt-0.5 text-xs text-white/60">{status === "failed" ? step.failHint : step.hint}</p>
                      {step.key === "audio" && status === "checking" && (
                        <p className="mt-1 text-xs font-semibold text-gold">Listening... {calibrationSecondsLeft}s</p>
                      )}
                    </div>
                    {status === "passed" && <CheckCircle2 className="size-6 shrink-0 text-green-400" />}
                    {status === "failed" && <XCircle className="size-6 shrink-0 text-red-400" />}
                    {status !== "passed" && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={!isActive || status === "checking"}
                        onClick={step.action}
                        className="shrink-0 bg-gold text-indigo hover:bg-gold-light disabled:opacity-40"
                      >
                        {status === "checking" ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : status === "failed" ? (
                          "Retry"
                        ) : (
                          "Check"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {allPassed && (
            <label className="mt-5 flex items-start gap-2 rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white/80">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 accent-gold"
              />
              <span>
                I understand this assessment is proctored — my camera and audio are monitored for the entire
                duration, switching tabs or leaving full-screen counts as a violation, and I agree not to use any
                outside help.
              </span>
            </label>
          )}

          {mediaError && <p className="mt-3 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{mediaError}</p>}

          <Button
            onClick={handleFinalStart}
            disabled={!allPassed || !agreedToTerms || starting}
            className="mt-5 w-full bg-gold text-indigo hover:bg-gold-light disabled:opacity-40"
          >
            {starting ? <Loader2 className="size-4 animate-spin" /> : <Maximize className="size-4" />}
            Start Assessment (Full-Screen)
          </Button>
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
          <Button
            onClick={proctoringEnabled ? () => setPreExamChecking(true) : handleStart}
            disabled={starting}
            className="mt-6 bg-gold text-indigo hover:bg-gold-light"
          >
            {starting ? <Loader2 className="size-4 animate-spin" /> : <Maximize className="size-4" />}
            {proctoringEnabled ? "Start System Check" : "Start Assessment (Full-Screen)"}
          </Button>
        </div>
      </div>
    );
  }

  const q = activeQuestions[currentIndex];
  const isLast = currentIndex === activeQuestions.length - 1;
  const inCodingPhase = hasCodingQuestions && mcqPhaseSubmitted;

  function isAnswered(question: Question) {
    if (question.questionType === "CODING") return !!codingAnswered[question.id];
    const value = answers[question.id];
    return !!value && value.trim() !== "";
  }

  // Scoped to whatever the student can actually still change — once the MCQ phase
  // is locked in, the finish-confirmation and overview screens shouldn't dangle the
  // already-submitted MCQ list in front of them as if it's still editable.
  const reviewQuestions = inCodingPhase ? codingQuestions : hasCodingQuestions ? mcqQuestions : questions;
  const unansweredCount = reviewQuestions.filter((rq) => !isAnswered(rq)).length;
  const bookmarkedCount = reviewQuestions.filter((rq) => bookmarked[rq.id]).length;
  const answeredCount = activeQuestions.filter(isAnswered).length;

  const NAV_WINDOW_SIZE = 10;
  const navWindowQuestions = activeQuestions.slice(navWindowStart, navWindowStart + NAV_WINDOW_SIZE);
  const hasPrevWindow = navWindowStart > 0;
  const hasNextWindow = navWindowStart + NAV_WINDOW_SIZE < activeQuestions.length;

  function jumpTo(i: number) {
    setCurrentIndex(i);
    setNavWindowStart(Math.floor(i / NAV_WINDOW_SIZE) * NAV_WINDOW_SIZE);
  }

  function toggleBookmark(id: string) {
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function renderTimer() {
    if (remainingSeconds === null) return <span className="text-2xl font-bold">--:--:--</span>;
    const { h, m, s } = formatClockParts(remainingSeconds);
    const danger = remainingSeconds < 300;
    return (
      <span className={`text-2xl font-bold tabular-nums ${danger ? "text-red-400" : "text-white"}`}>
        {h > 0 && (
          <>
            {h}
            <span className="text-sm font-medium">h</span>{" "}
          </>
        )}
        {String(m).padStart(2, "0")}
        <span className="text-sm font-medium">m</span>{" "}
        {String(s).padStart(2, "0")}
        <span className="text-sm font-medium">s</span>
      </span>
    );
  }

  // ---------- "All Problems" overview ----------

  if (showAllProblems) {
    const sections: { label: string; qs: Question[] }[] = hasCodingQuestions
      ? [
          { label: "Phase 1 — Multiple Choice & Written", qs: mcqQuestions },
          { label: "Phase 2 — Coding", qs: codingQuestions },
        ]
      : [{ label: assessmentTitle, qs: questions }];

    return (
      <div className="min-h-screen bg-cream">
        <div className="bg-indigo-dark px-6 py-5 text-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAllProblems(false)}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white"
            >
              <ChevronLeft className="size-3.5" /> Back to Assessment
            </button>
            <p className="text-sm font-semibold">{assessmentTitle}</p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl space-y-8 p-6">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{section.label}</p>
                <p className="text-xs text-muted-foreground">
                  {section.qs.filter(isAnswered).length}/{section.qs.length} attempted
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {section.qs.map((sq) => {
                  const globalIndex = activeQuestions.findIndex((aq) => aq.id === sq.id);
                  const isCurrentPhase = globalIndex !== -1;
                  const done = isAnswered(sq);
                  return (
                    <button
                      key={sq.id}
                      type="button"
                      disabled={!isCurrentPhase}
                      onClick={() => {
                        jumpTo(globalIndex);
                        setShowAllProblems(false);
                      }}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        !isCurrentPhase
                          ? "cursor-not-allowed border-border bg-white/50 opacity-50"
                          : done
                            ? "border-green-300 bg-green-50"
                            : "border-border bg-white hover:border-indigo/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-indigo">Q{questions.findIndex((x) => x.id === sq.id) + 1}</span>
                        {bookmarked[sq.id] && <Bookmark className="size-3.5 fill-gold text-gold" />}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {sq.questionType === "CODING" ? "Coding" : sq.questionType === "MCQ" ? "MCQ" : "Written"}
                      </p>
                      <p className={`mt-1 text-[11px] font-medium ${done ? "text-green-700" : "text-muted-foreground"}`}>
                        {done ? "Attempted" : "Not attempted"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-28">
      {/* HEADER BAND */}
      <div className="bg-indigo-dark px-4 py-6 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowAllProblems(true)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white"
          >
            <ChevronLeft className="size-3.5" /> All Problems
          </button>

          <div className="text-center">
            <p className="flex items-center justify-center gap-1.5">
              <Clock className="size-5 text-gold" />
              {renderTimer()}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
              Time left in this assessment session
            </p>
          </div>

          <div className="w-44 sm:w-52">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${activeQuestions.length ? (answeredCount / activeQuestions.length) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1 text-right text-[11px] text-white/70">
              {answeredCount}/{activeQuestions.length} Questions attempted
            </p>
          </div>
        </div>
      </div>

      {(!isFullscreen || warning || audioWarning) && (
        <div className="mx-auto max-w-6xl space-y-2 px-4 pt-4 sm:px-6">
          {!isFullscreen && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="size-4" /> Not in full-screen — Violations: {violationCount}/{VIOLATION_LIMIT}
                {proctoringEnabled && <> &middot; Audio: {audioViolationCount}/{AUDIO_VIOLATION_LIMIT}</>}
              </span>
              <Button
                size="sm"
                onClick={() => document.documentElement.requestFullscreen().catch(() => {})}
                className="bg-gold text-indigo hover:bg-gold-light"
              >
                <Maximize className="size-3.5" /> Return to Full-Screen
              </Button>
            </div>
          )}
          {warning && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              <AlertTriangle className="mr-1.5 inline size-4" /> {warning}
            </div>
          )}
          {audioWarning && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
              <AlertTriangle className="mr-1.5 inline size-4" /> {audioWarning}
            </div>
          )}
        </div>
      )}

      {hasCodingQuestions && (
        <p className="mx-auto mt-4 max-w-6xl px-4 text-center text-xs font-semibold uppercase tracking-wide text-indigo sm:px-6">
          {inCodingPhase ? "Phase 2 — Coding" : "Phase 1 — Multiple Choice & Written"}
        </p>
      )}

      {/* MAIN CARD — overlaps the header band */}
      <div className="mx-auto -mt-8 max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
          {/* question navigation strip */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto border-b border-border bg-cream/60 px-4 py-3">
            <button
              type="button"
              disabled={!hasPrevWindow}
              onClick={() => setNavWindowStart((w) => Math.max(0, w - NAV_WINDOW_SIZE))}
              className="shrink-0 text-xs font-semibold uppercase tracking-wide text-indigo disabled:opacity-30"
            >
              ‹ Prev
            </button>
            <div className="flex shrink-0 items-center gap-1.5">
              {navWindowQuestions.map((nq, idx) => {
                const i = navWindowStart + idx;
                const current = i === currentIndex;
                const done = isAnswered(nq);
                return (
                  <button
                    key={nq.id}
                    type="button"
                    onClick={() => jumpTo(i)}
                    className={`relative flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      current
                        ? "bg-indigo text-white"
                        : done
                          ? "border border-border bg-white text-indigo"
                          : "border border-border bg-white text-muted-foreground"
                    }`}
                    title={`Question ${i + 1}${done ? " (answered)" : ""}`}
                  >
                    {i + 1}
                    {done && <span className={`absolute bottom-1 size-1 rounded-full ${current ? "bg-white" : "bg-green-500"}`} />}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={!hasNextWindow}
              onClick={() => setNavWindowStart((w) => w + NAV_WINDOW_SIZE)}
              className="shrink-0 text-xs font-semibold uppercase tracking-wide text-indigo disabled:opacity-30"
            >
              Next ›
            </button>
          </div>

          {q.questionType === "CODING" ? (
            <div className="p-6">
              <CodingQuestionPanel
                key={q.id}
                assignmentId={assignmentId}
                question={q}
                onSubmitted={(result) => {
                  setCodingAnswered((prev) => ({ ...prev, [q.id]: true }));
                  setCodingSubmissions((prev) => ({ ...prev, [q.id]: result }));
                }}
              />
              <p className="mt-6 text-center text-[11px] text-muted-foreground">Powered by Learn Being Forward</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-[45%_55%]">
              {/* question panel */}
              <div className="border-border p-6 md:border-r">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <p className="font-bold text-indigo">{assessmentTitle}</p>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(q.id)}
                    title={bookmarked[q.id] ? "Remove bookmark" : "Mark for review"}
                    className="shrink-0"
                  >
                    <Bookmark className={`size-5 ${bookmarked[q.id] ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                  </button>
                </div>
                <p className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="rounded bg-cream px-1.5 py-0.5 font-medium">{q.questionType === "MCQ" ? "MCQ" : "Written"}</span>
                </p>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Description</p>
                <div className="max-h-[50vh] overflow-y-auto pr-1">
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-indigo">{q.questionText}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {q.marks} mark{q.marks !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* answer panel */}
              <div className="p-6">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="font-semibold text-indigo">Answer choices</p>
                  <span
                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                      isAnswered(q) ? "border-green-300 bg-green-50 text-green-700" : "border-border bg-cream text-muted-foreground"
                    }`}
                  >
                    {isAnswered(q) ? <CheckCircle2 className="size-3" /> : <span className="size-1.5 rounded-full bg-muted-foreground" />}
                    {isAnswered(q) ? "Solved" : "Unsolved"}
                  </span>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">Please choose a correct answer.</p>

                {q.questionType === "MCQ" ? (
                  <div className="space-y-2">
                    {(["A", "B", "C", "D"] as const).map((letter) => {
                      const text = q[`option${letter}` as "optionA"];
                      const selected = answers[q.id] === letter;
                      return (
                        <label
                          key={letter}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                            selected ? "border-indigo bg-indigo/5" : "border-transparent bg-cream hover:bg-cream/70"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={letter}
                            checked={selected}
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
                    rows={6}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Write your answer here..."
                    className="text-base"
                  />
                )}

                <p className="mt-6 text-center text-[11px] text-muted-foreground">Powered by Learn Being Forward</p>
              </div>
            </div>
          )}
        </div>

        {!inCodingPhase && hasCodingQuestions && isLast && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Once you finish this phase, you can&apos;t come back to these questions — review your answers first.
          </p>
        )}
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-3 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => jumpTo(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="border-border text-xs font-semibold uppercase tracking-wide text-indigo"
          >
            <ChevronLeft className="size-3.5" /> Previous Problem
          </Button>
          <Button
            variant="outline"
            onClick={() => setReviewing(true)}
            className="border-red-300 text-xs font-semibold uppercase tracking-wide text-red-600 hover:bg-red-50"
          >
            <Square className="size-3 fill-current" /> Finish &amp; Submit
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAllProblems(true)}
            className="border-border text-xs font-semibold uppercase tracking-wide text-indigo"
          >
            <List className="size-3.5" /> Back to All Problems
          </Button>
          <Button
            variant="outline"
            onClick={() => jumpTo(Math.min(activeQuestions.length - 1, currentIndex + 1))}
            disabled={currentIndex === activeQuestions.length - 1}
            className="border-border text-xs font-semibold uppercase tracking-wide text-indigo"
          >
            Next Problem <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* FLOATING WEBCAM PREVIEW */}
      {proctoringEnabled && (
        <div
          onPointerDown={handlePipPointerDown}
          onPointerMove={handlePipPointerMove}
          onPointerUp={handlePipPointerUp}
          style={pipPos ? { top: pipPos.top, left: pipPos.left } : undefined}
          className={`fixed z-40 cursor-move touch-none select-none overflow-hidden rounded-xl border-2 border-white shadow-lg transition-[width,height] ${
            webcamExpanded ? "h-56 w-72" : "h-24 w-32"
          } ${pipPos ? "" : "right-4 top-4"}`}
        >
          <video ref={videoRef} muted playsInline className="size-full object-cover" />
          <span className="pointer-events-none absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
            REC
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setWebcamExpanded((v) => !v);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute right-1.5 top-1.5 rounded bg-black/50 p-1 text-white hover:bg-black/70"
            title={webcamExpanded ? "Collapse" : "Expand"}
          >
            {webcamExpanded ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
          </button>
        </div>
      )}

      {/* FINISH & SUBMIT confirmation modal */}
      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-indigo">
              {!inCodingPhase && hasCodingQuestions ? "Finish Phase 1 & Continue to Coding?" : "Finish & Submit Assignment?"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">This can&apos;t be undone once confirmed.</p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-2xl font-bold text-green-700">{reviewQuestions.length - unansweredCount}</p>
                <p className="text-xs text-muted-foreground">Attempted</p>
              </div>
              <div className="rounded-lg bg-cream p-3">
                <p className="text-2xl font-bold text-indigo">{unansweredCount}</p>
                <p className="text-xs text-muted-foreground">Unattempted</p>
              </div>
              <div className="rounded-lg bg-gold/10 p-3">
                <p className="text-2xl font-bold text-gold">{bookmarkedCount}</p>
                <p className="text-xs text-muted-foreground">Bookmarked</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setReviewing(false)} className="border-border text-indigo">
                Cancel
              </Button>
              {!inCodingPhase && hasCodingQuestions ? (
                <Button onClick={handleSubmitMcqPhase} disabled={submittingMcqPhase} className="bg-red-600 text-white hover:bg-red-700">
                  {submittingMcqPhase && <Loader2 className="size-4 animate-spin" />}
                  Continue to Coding
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting} className="bg-red-600 text-white hover:bg-red-700">
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  Submit
                </Button>
              )}
            </div>
          </div>
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
