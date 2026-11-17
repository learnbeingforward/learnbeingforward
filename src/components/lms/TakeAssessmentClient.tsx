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
  FlipHorizontal,
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
  setCameraPosition,
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
  sectionName: string | null;
  snippetLanguage: string | null;
  snippetCode: string | null;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  answerType: string | null;
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

// Standard MediaPipe FaceMesh canonical landmark indices (468-point model, same
// indices regardless of face/camera) — nose tip, outer eye corners, forehead and
// chin. A cheap, heuristic head-pose proxy: where the nose sits relative to the
// eye midpoint, normalized by face size, isn't a real 3D pose estimate, but it's
// consistent enough session-to-session to catch a LARGE deviation from how the
// student was sitting during calibration, which is all "are you still looking at
// roughly the same place" actually needs.
function getGazeOffset(keypoints: { x: number; y: number }[]): { dx: number; dy: number } | null {
  const nose = keypoints[1];
  const leftEye = keypoints[33];
  const rightEye = keypoints[263];
  const forehead = keypoints[10];
  const chin = keypoints[152];
  if (!nose || !leftEye || !rightEye || !forehead || !chin) return null;
  const faceWidth = Math.abs(rightEye.x - leftEye.x) || 1;
  const faceHeight = Math.abs(chin.y - forehead.y) || 1;
  const eyeMidX = (leftEye.x + rightEye.x) / 2;
  const eyeMidY = (leftEye.y + rightEye.y) / 2;
  return { dx: (nose.x - eyeMidX) / faceWidth, dy: (nose.y - eyeMidY) / faceHeight };
}

const GAZE_DEVIATION_THRESHOLD = 0.55;
const GAZE_SUSTAINED_CHECKS = 3;
const NO_FACE_SUSTAINED_CHECKS = 4;
const AI_FLAG_COOLDOWN_MS = 60_000;

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
  blockCopyPaste = false,
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
  blockCopyPaste?: boolean;
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
  const [checkStatus, setCheckStatus] = useState<Record<"camera" | "position" | "microphone" | "audio" | "system", "pending" | "checking" | "passed" | "failed">>({
    camera: "pending",
    position: "pending",
    microphone: "pending",
    audio: "pending",
    system: "pending",
  });
  const [cameraPositionValue, setCameraPositionValue] = useState<string | null>(null);
  const [mirrorPreview, setMirrorPreview] = useState(true);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [micLevel, setMicLevel] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // Shown after all system checks pass, before the exam actually starts — reading
  // this (and agreeing to it) is what triggers full-screen + the timer, not the
  // system check screen itself.
  const [showInstructions, setShowInstructions] = useState(false);
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
  // Shown once, right after the MCQ/written phase is submitted, before the
  // student moves into the locked-in coding phase — recaps that phase alone
  // and requires an explicit "Continue" click rather than silently jumping in.
  const [showPhaseSummary, setShowPhaseSummary] = useState(false);
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

  // Blocks copy/cut/paste for the whole exam window when the admin turned it on
  // for this assessment — independent of proctoring, so it applies even to a
  // non-proctored assessment if the admin wants it.
  useEffect(() => {
    if (!started || !blockCopyPaste) return;
    const block = (e: ClipboardEvent) => e.preventDefault();
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("paste", block);
    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("paste", block);
    };
  }, [started, blockCopyPaste]);

  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const leaveHandled = useRef(false);
  const audioViolationHandled = useRef(false);
  const finished = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const checkPreviewVideoRef = useRef<HTMLVideoElement | null>(null);
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

  // ---------- AI proctor (entirely client-side — no video ever leaves the browser,
  // only the one frame captured at the moment something is flagged) ----------
  // Object detector (phone / extra people) and face-landmark detector (gaze),
  // loaded lazily once the camera check passes so they're warm well before the
  // exam actually starts. `unknown` here rather than their real types since the
  // libraries are dynamic-imported — see loadAiModels.
  const cocoModelRef = useRef<{ detect: (input: HTMLVideoElement) => Promise<{ class: string; score: number }[]> } | null>(null);
  const faceModelRef = useRef<{
    estimateFaces: (input: HTMLVideoElement) => Promise<{ keypoints: { x: number; y: number; name?: string }[] }[]>;
  } | null>(null);
  const aiModelsLoadingRef = useRef(false);
  // Baseline horizontal/vertical nose-vs-eye-and-face-box offset ratio, sampled
  // during the audio calibration step while the student looks at their screen
  // normally — "looking away" is flagged as a large deviation from THIS, not
  // against some fixed assumption about head position.
  const gazeBaselineRef = useRef<{ dx: number; dy: number } | null>(null);
  const gazeAwayStreakRef = useRef(0);
  const noFaceStreakRef = useRef(0);
  // One cooldown timestamp per flag reason so a sustained issue (e.g. the phone
  // stays on the desk in view) produces one flagged snapshot, not one every few
  // seconds for as long as it's visible.
  const lastFlagAtRef = useRef<Record<string, number>>({});

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

  // Live preview on the system-check screen itself, once the camera step passes.
  useEffect(() => {
    if (checkStatus.camera !== "passed") return;
    const video = checkPreviewVideoRef.current;
    const stream = camStreamRef.current;
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    }
  }, [checkStatus.camera]);

  // Kick off the (multi-MB) AI model download the moment system-check opens,
  // instead of waiting for the camera step to pass — it used to start there,
  // which made the very next step (Camera Position) feel like it was hanging
  // while TensorFlow initialized on the main thread. Starting it this early
  // means it's usually done well before the student reaches that step.
  useEffect(() => {
    if (preExamChecking) void loadAiModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preExamChecking]);

  // Live mic-level meter shown on the system-check screen once the microphone
  // check has passed — purely visual feedback that the mic is actually picking
  // up sound, separate from the audio-calibration baseline capture.
  useEffect(() => {
    if (checkStatus.microphone !== "passed" || !preExamChecking) return;
    const stream = micStreamRef.current;
    if (!stream) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    let raf = 0;
    function tick() {
      analyser.getByteTimeDomainData(data);
      let sumSquares = 0;
      for (const v of data) {
        const centered = v - 128;
        sumSquares += centered * centered;
      }
      const rms = Math.sqrt(sumSquares / data.length);
      setMicLevel(Math.min(1, rms / 40));
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => {
      cancelAnimationFrame(raf);
      audioCtx.close().catch(() => {});
    };
  }, [checkStatus.microphone, preExamChecking]);

  // ---------- Proctoring: webcam snapshots ----------

  /** Grabs one frame from the live camera and uploads it — the only thing ever
   * sent anywhere is this single still image, never a video stream or recording.
   * `reason` is set only for AI-proctor-triggered captures (see below); routine
   * periodic ones leave it unset. */
  function captureSnapshot(reason?: string) {
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
        if (reason) body.set("reason", reason);
        fetch("/api/assessment-snapshots", { method: "POST", body }).catch(() => {});
      },
      "image/jpeg",
      0.7
    );
  }

  useEffect(() => {
    if (!started || !proctoringEnabled) return;
    const id = setInterval(() => captureSnapshot(), SNAPSHOT_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, proctoringEnabled, assignmentId]);

  // ---------- AI proctor: object detection (phone / extra people) + gaze ----------
  //
  // Runs entirely in the browser via TensorFlow.js — no frame is ever sent
  // anywhere unless something is actually flagged, and even then it's one still
  // image, not a stream. Deliberately doesn't touch violationCount/autoSubmit:
  // vision detection on a webcam is far less reliable than the deterministic
  // tab-switch/audio checks, so a false positive here should never end someone's
  // exam — it only flags a snapshot for a human admin to actually look at.

  function flagIfOffCooldown(reason: string) {
    const last = lastFlagAtRef.current[reason] ?? 0;
    if (Date.now() - last < AI_FLAG_COOLDOWN_MS) return;
    lastFlagAtRef.current[reason] = Date.now();
    captureSnapshot(reason);
  }

  useEffect(() => {
    if (!started || !proctoringEnabled) return;
    const id = setInterval(() => {
      if (finished.current) return;
      const video = captureVideoRef.current;
      const cocoModel = cocoModelRef.current;
      if (!video || video.readyState < 2 || !cocoModel) return;
      cocoModel
        .detect(video)
        .then((predictions) => {
          const phone = predictions.find((p) => p.class === "cell phone" && p.score > 0.5);
          if (phone) {
            flagIfOffCooldown("phone_detected");
            return;
          }
          const peopleCount = predictions.filter((p) => p.class === "person" && p.score > 0.5).length;
          if (peopleCount > 1) flagIfOffCooldown("multiple_people");
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, proctoringEnabled]);

  useEffect(() => {
    if (!started || !proctoringEnabled) return;
    const id = setInterval(() => {
      if (finished.current) return;
      const video = captureVideoRef.current;
      const faceModel = faceModelRef.current;
      if (!video || video.readyState < 2 || !faceModel) return;
      faceModel
        .estimateFaces(video)
        .then((faces) => {
          if (faces.length === 0) {
            noFaceStreakRef.current += 1;
            gazeAwayStreakRef.current = 0;
            if (noFaceStreakRef.current >= NO_FACE_SUSTAINED_CHECKS) {
              flagIfOffCooldown("no_face");
              noFaceStreakRef.current = 0;
            }
            return;
          }
          noFaceStreakRef.current = 0;

          const baseline = gazeBaselineRef.current;
          if (!baseline) return; // calibration never captured one — skip gaze checks
          const offset = getGazeOffset(faces[0].keypoints);
          if (!offset) return;
          const deviation = Math.hypot(offset.dx - baseline.dx, offset.dy - baseline.dy);
          if (deviation > GAZE_DEVIATION_THRESHOLD) {
            gazeAwayStreakRef.current += 1;
            if (gazeAwayStreakRef.current >= GAZE_SUSTAINED_CHECKS) {
              flagIfOffCooldown("looking_away");
              gazeAwayStreakRef.current = 0;
            }
          } else {
            gazeAwayStreakRef.current = 0;
          }
        })
        .catch(() => {});
    }, 2500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, proctoringEnabled]);

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
      // Threshold is ~65-70% above whatever the room's own ambient level turned out
      // to be during calibration, not a fixed loudness — a quiet room flags a quiet
      // voice, a noisier room needs a little more to stand out above it. Kept only a
      // tiny floor so true silence doesn't trigger on sensor noise alone.
      const threshold = audioBaselineRef.current * 1.675 + 2;

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

  /** Loads the object-detection (phone/person) and face-landmark (gaze) models in
   * the background. Best-effort: if this fails (slow connection, old device), the
   * exam still runs fine with just the existing tab-switch/audio checks — the AI
   * proctor is an enhancement, not a dependency. */
  async function loadAiModels() {
    if (aiModelsLoadingRef.current || (cocoModelRef.current && faceModelRef.current)) return;
    aiModelsLoadingRef.current = true;
    try {
      const tf = await import("@tensorflow/tfjs");
      await tf.ready();
      const [cocoSsd, faceLandmarksDetection] = await Promise.all([
        import("@tensorflow-models/coco-ssd"),
        import("@tensorflow-models/face-landmarks-detection"),
      ]);
      const [cocoModel, faceModel] = await Promise.all([
        cocoSsd.load({ base: "lite_mobilenet_v2" }),
        faceLandmarksDetection.createDetector(faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh, {
          runtime: "tfjs",
          refineLandmarks: false,
          maxFaces: 1,
        }),
      ]);
      cocoModelRef.current = cocoModel;
      faceModelRef.current = faceModel;
    } catch (err) {
      console.error("[ai-proctor] Failed to load detection models:", err);
    } finally {
      aiModelsLoadingRef.current = false;
    }
  }

  async function refreshDeviceLists() {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setCameraDevices(all.filter((d) => d.kind === "videoinput"));
      setMicDevices(all.filter((d) => d.kind === "audioinput"));
    } catch {
      // Device labels just won't be populated — not fatal.
    }
  }

  async function handleCheckCamera(deviceId?: string) {
    setCheckStatus((s) => ({ ...s, camera: "checking" }));
    try {
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      });
      camStreamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      if (track) setSelectedCameraId(track.getSettings().deviceId ?? "");
      setCheckStatus((s) => ({ ...s, camera: "passed" }));
      void loadAiModels();
      void refreshDeviceLists();
    } catch {
      setCheckStatus((s) => ({ ...s, camera: "failed" }));
    }
  }

  function handleSelectCameraPosition(position: string) {
    setCameraPositionValue(position);
    setCheckStatus((s) => ({ ...s, position: "passed" }));
    void setCameraPosition(assignmentId, position).catch(() => {});
  }

  async function handleCheckMicrophone(deviceId?: string) {
    setCheckStatus((s) => ({ ...s, microphone: "checking" }));
    try {
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      // autoGainControl/noiseSuppression/echoCancellation are all enabled by default
      // and actively fight the live violation detector: AGC in particular
      // renormalizes the input level within a second or two of a loud burst, so
      // sustained shouting reads as loud only briefly. Disabling them keeps the raw
      // mic level the RMS check actually relies on.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: false,
          noiseSuppression: false,
          echoCancellation: false,
          ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        },
      });
      micStreamRef.current = stream;
      const track = stream.getAudioTracks()[0];
      if (track) setSelectedMicId(track.getSettings().deviceId ?? "");
      setCheckStatus((s) => ({ ...s, microphone: "passed" }));
      void refreshDeviceLists();
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

    // Gaze baseline is sampled on a slower cadence in parallel, while the student
    // looks at their screen normally for this same quiet stretch — only if the
    // face model finished loading in time. If not, the AI proctor simply skips
    // gaze checks for this session; phone/multi-person detection is unaffected.
    const gazeSamples: { dx: number; dy: number }[] = [];
    const gazeVideo = captureVideoRef.current;
    const gazeModel = faceModelRef.current;
    const gazeTimer =
      gazeModel && gazeVideo
        ? setInterval(() => {
            gazeModel
              .estimateFaces(gazeVideo)
              .then((faces) => {
                const offset = faces[0] ? getGazeOffset(faces[0].keypoints) : null;
                if (offset) gazeSamples.push(offset);
              })
              .catch(() => {});
          }, 400)
        : null;

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

    if (gazeTimer) clearInterval(gazeTimer);
    if (gazeSamples.length > 0) {
      gazeBaselineRef.current = {
        dx: gazeSamples.reduce((a, s) => a + s.dx, 0) / gazeSamples.length,
        dy: gazeSamples.reduce((a, s) => a + s.dy, 0) / gazeSamples.length,
      };
    }

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

      // Request full-screen FIRST, immediately off the click — before any other
      // async work. Browsers only honor requestFullscreen() while the click's
      // "user activation" is still live, and an intervening await (e.g. the
      // video.play() below) can quietly burn through that window, making the
      // browser silently reject the request even though the user did click.
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Denied by the browser — the leave-detection checks still apply either way.
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

      setPreExamChecking(false);
      setShowInstructions(false);
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
    setShowPhaseSummary(true);
    setSubmittingMcqPhase(false);
  }

  function handleContinueToCodingPhase() {
    setMcqPhaseSubmitted(true);
    setCurrentIndex(0);
    setShowPhaseSummary(false);
  }

  function isQuestionAnswered(sq: (typeof questions)[number]) {
    if (sq.questionType === "CODING") return !!codingSubmissions[sq.id];
    const value = answers[sq.id];
    return !!value && value.trim() !== "";
  }

  function formatElapsed(totalMinutes: number) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  /** The compact stat-tiles + question-map block shared by the end-of-phase
   * interstitial and the final submitted screen — `qs` scopes it to just the
   * phase in question (or the whole assessment for the final screen). */
  function renderSummaryStats(qs: typeof questions) {
    const answeredCount = qs.filter(isQuestionAnswered).length;
    const bookmarkedCount = qs.filter((q) => bookmarked[q.id]).length;
    const elapsedMinutes =
      remainingSeconds !== null ? Math.round((durationMinutes * 60 - remainingSeconds) / 60) : null;
    return (
      <>
        <div className="grid" style={{ ["--min" as string]: "140px" }}>
          <div className="tile">
            <div className="label">Total Questions</div>
            <div className="value">{qs.length}</div>
          </div>
          <div className="tile success">
            <div className="label">Attempted</div>
            <div className="value">{answeredCount}</div>
          </div>
          <div className="tile warning">
            <div className="label">Not Attempted</div>
            <div className="value">{qs.length - answeredCount}</div>
          </div>
          <div className="tile gold">
            <div className="label">Bookmarked</div>
            <div className="value">{bookmarkedCount}</div>
          </div>
          {elapsedMinutes !== null && (
            <div className="tile">
              <div className="label">Time Taken</div>
              <div className="value">{formatElapsed(elapsedMinutes)}</div>
            </div>
          )}
        </div>

        <div>
          <p className="label" style={{ marginBottom: 10 }}>Question Map</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {qs.map((q, i) => {
              const answered = isQuestionAnswered(q);
              const isBookmarked = bookmarked[q.id];
              return (
                <div
                  key={q.id}
                  title={`Q${i + 1}${answered ? " · attempted" : " · not attempted"}${isBookmarked ? " · bookmarked" : ""}`}
                  style={{
                    position: "relative",
                    flex: "0 0 auto",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    background: answered ? "var(--success-soft)" : "transparent",
                    color: answered ? "var(--success-text)" : "var(--danger)",
                    border: answered ? "none" : "1.5px dashed var(--danger)",
                  }}
                >
                  {i + 1}
                  {isBookmarked && (
                    <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "var(--gold)" }} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="row" style={{ gap: 18, marginTop: 12 }}>
            <span className="small muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--success-soft)", display: "inline-block" }} /> Attempted
            </span>
            <span className="small muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px dashed var(--danger)", display: "inline-block" }} /> Not attempted
            </span>
            <span className="small muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} /> Bookmarked
            </span>
          </div>
        </div>
      </>
    );
  }

  if (showPhaseSummary) {
    const answeredCount = mcqQuestions.filter(isQuestionAnswered).length;
    return (
      <div className="lbf-scope" style={{ minHeight: "100vh", paddingBottom: 40 }}>
        <header className="app-band">
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16 }}>
            <p className="strong" style={{ color: "#fff" }}>{assessmentTitle}</p>
            <span className="small" style={{ color: "var(--on-navy-muted)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>
              Section Submitted
            </span>
          </div>
        </header>

        <main className="container">
          <section className="card lift stack">
            <div style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--border)", paddingBottom: 20 }}>
              <span className="icon-box" style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success-soft)", color: "var(--success)" }}>
                <CheckCircle2 className="size-8" />
              </span>
              <div>
                <h1 className="h2">Multiple Choice &amp; Written section submitted</h1>
                <p className="small muted" style={{ marginTop: 2 }}>
                  {answeredCount}/{mcqQuestions.length} answered. This section is now locked — you&apos;ll move on to the Coding section next.
                </p>
              </div>
            </div>

            {renderSummaryStats(mcqQuestions)}

            <div className="alert info">
              <CheckCircle2 className="size-5 shrink-0" />
              <div>
                <p className="strong">Up next: the Coding section</p>
                <p className="small" style={{ marginTop: 2 }}>
                  {codingQuestions.length} coding question{codingQuestions.length !== 1 ? "s" : ""}. The timer keeps running — click below when you&apos;re ready.
                </p>
              </div>
            </div>

            <button onClick={handleContinueToCodingPhase} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
              Continue to Coding Section <ChevronRight className="size-4" />
            </button>
          </section>
          <p className="app-footer">Powered by Learn Being Forward</p>
        </main>
      </div>
    );
  }

  if (showSummary) {
    const AUTO_SUBMIT_MESSAGE: Record<NonNullable<typeof autoSubmitReason>, string> = {
      time: "Your time was up, so the assessment was submitted automatically with whatever answers were saved.",
      violation: "You left the assessment screen and didn't return in time, so it was submitted automatically with whatever answers were saved.",
      audio: "Too much background noise was detected, so the assessment was submitted automatically with whatever answers were saved.",
    };

    function renderQuestionCard(sq: (typeof questions)[number], globalIndex: number) {
      if (sq.questionType === "CODING") {
        const sub = codingSubmissions[sq.id];
        return (
          <div key={sq.id} className="box">
            <div className="split" style={{ alignItems: "flex-start" }}>
              <p className="small strong" style={{ whiteSpace: "pre-wrap" }}>
                Q{globalIndex + 1}. {sq.questionText}
              </p>
              <span className={`pill ${sub ? "info" : ""}`} style={{ flexShrink: 0 }}>
                {sub ? `${sub.passed}/${sub.total} test cases passed` : "Not attempted"}
              </span>
            </div>
            {sub ? (
              <pre className="code" style={{ marginTop: 8 }}>{sub.code || "(empty submission)"}</pre>
            ) : (
              <p className="small muted" style={{ marginTop: 8 }}>You didn&apos;t submit code for this question.</p>
            )}
          </div>
        );
      }

      const value = answers[sq.id];
      const answered = !!value && value.trim() !== "";
      return (
        <div key={sq.id} className="box">
          <div className="split" style={{ alignItems: "flex-start" }}>
            <p className="small strong" style={{ whiteSpace: "pre-wrap" }}>
              Q{globalIndex + 1}. {sq.questionText}
            </p>
            {!answered && <span className="pill" style={{ flexShrink: 0 }}>Skipped</span>}
          </div>
          {sq.questionType === "MCQ" ? (
            answered ? (
              <p className="small" style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
                {sq.answerType === "NUMERIC"
                  ? value
                  : value
                      .split(",")
                      .map((letter) => `${letter}. ${sq[`option${letter}` as "optionA"] ?? ""}`)
                      .join("; ")}
              </p>
            ) : (
              <p className="small muted" style={{ marginTop: 8 }}>No option selected.</p>
            )
          ) : answered ? (
            <p className="small" style={{ marginTop: 8, whiteSpace: "pre-wrap", background: "var(--surface)", borderRadius: 10, padding: 12 }}>{value}</p>
          ) : (
            <p className="small muted" style={{ marginTop: 8 }}>No answer given.</p>
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

    return (
      <div className="lbf-scope" style={{ minHeight: "100vh", paddingBottom: 40 }}>
        <header className="app-band">
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16 }}>
            <p className="strong" style={{ color: "#fff" }}>{assessmentTitle}</p>
            <span className="small" style={{ color: "var(--on-navy-muted)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>Assessment Completed</span>
          </div>
        </header>

        <main className="container">
          <section className="card lift stack">
            {autoSubmitted && autoSubmitReason && (
              <div className="alert danger">
                <AlertTriangle className="size-5 shrink-0" />
                <div>
                  <p className="strong">Assessment Submitted Automatically</p>
                  <p className="small" style={{ marginTop: 2 }}>{AUTO_SUBMIT_MESSAGE[autoSubmitReason]}</p>
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--border)", paddingBottom: 20 }}>
              <span className="icon-box" style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success-soft)", color: "var(--success)" }}>
                <CheckCircle2 className="size-8" />
              </span>
              <div>
                <h1 className="h2">Your assessment has been submitted</h1>
                <p className="small muted" style={{ marginTop: 2 }}>
                  Here&apos;s what was recorded for every question — review it, then head back to your assessments.
                </p>
              </div>
            </div>

            {renderSummaryStats(questions)}

            <div>
              <p className="label" style={{ marginBottom: 10 }}>Section-wise Summary</p>
              <div className="stack" style={{ gap: 14 }}>
                {sections.map((section) => {
                  const sectionAnswered = section.qs.filter(isQuestionAnswered).length;
                  const pct = section.qs.length > 0 ? Math.round((sectionAnswered / section.qs.length) * 100) : 0;
                  return (
                    <div key={section.label}>
                      <div className="split" style={{ marginBottom: 8 }}>
                        <p className="strong">{section.label}</p>
                        <p className="small muted">
                          {sectionAnswered}/{section.qs.length} attempted
                        </p>
                      </div>
                      <div className="progress">
                        <span style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {sections.map((section) => {
              const sectionAnswered = section.qs.filter(isQuestionAnswered).length;
              return (
                <div key={section.label}>
                  <div className="split" style={{ marginBottom: 10 }}>
                    <p className="label">{section.label} — Full Review</p>
                    <p className="small muted">
                      {sectionAnswered}/{section.qs.length} attempted
                    </p>
                  </div>
                  <div className="stack" style={{ gap: 12 }}>
                    {section.qs.map((sq) => renderQuestionCard(sq, questions.findIndex((x) => x.id === sq.id)))}
                  </div>
                </div>
              );
            })}

            <div className="alert info">
              <CheckCircle2 className="size-5 shrink-0" />
              <div>
                <p className="strong">Your result will be shared after evaluation</p>
                <p className="small" style={{ marginTop: 2 }}>
                  We&apos;re compiling your answers, running any submitted code against all test cases, and
                  reviewing proctoring activity. You&apos;ll be notified once your result is ready — you don&apos;t
                  need to do anything else.
                </p>
              </div>
            </div>

            <button onClick={() => router.push("/lms/student/assessments")} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
              Go to Dashboard <ChevronRight className="size-4" />
            </button>
          </section>
          <p className="app-footer">Powered by Learn Being Forward</p>
        </main>
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
    setShowInstructions(false);
    await beginExam();
  }

  if (needsFullscreenClick) {
    return (
      <div className="lbf-scope" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--navy)", padding: 24 }}>
        <div className="card" style={{ maxWidth: 420, textAlign: "center" }}>
          <Maximize className="size-10" style={{ color: "var(--gold)", margin: "0 auto" }} />
          <h1 className="h2" style={{ marginTop: 14 }}>Enter Full-Screen to Begin</h1>
          <p className="small muted" style={{ marginTop: 10 }}>
            Your camera and microphone are ready. One last step — click below to enter full-screen, which starts
            the assessment immediately.
          </p>
          <button onClick={handleEnterFullscreenAndBegin} className="btn btn-gold" style={{ marginTop: 18 }}>
            <Maximize className="size-4" /> Enter Full-Screen &amp; Start
          </button>
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
        key: "position" as const,
        label: "Camera Position",
        icon: Video,
        hint: "Where is your webcam, relative to your screen? This helps us tell the AI proctor what \"looking at your screen\" should look like for you.",
        failHint: "",
        action: () => {},
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
    const CAMERA_POSITION_OPTIONS = [
      { value: "TOP_CENTER", label: "Top Center" },
      { value: "TOP_LEFT", label: "Top Left" },
      { value: "TOP_RIGHT", label: "Top Right" },
      { value: "BOTTOM_LEFT", label: "Bottom Left" },
      { value: "BOTTOM_RIGHT", label: "Bottom Right" },
    ];

    return (
      <div className="lbf-scope">
        <header className="app-band">
          <div className="container" style={{ paddingTop: 16 }}>
            <div className="split" style={{ marginBottom: 14 }}>
              <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>{assessmentTitle}</h1>
              <span className={`pill ${allPassed ? "success" : "gold"}`} style={{ background: allPassed ? undefined : "var(--navy-3)", color: allPassed ? undefined : "#fff" }}>
                {allPassed && <CheckCircle2 className="size-3.5" />} {steps.filter((s) => checkStatus[s.key] === "passed").length} of {steps.length} checks passed
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {[
                { n: 1, label: "System check" },
                { n: 2, label: "Instructions" },
                { n: 3, label: "Start test" },
              ].map((s, i, arr) => (
                <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        fontSize: 12,
                        fontWeight: 700,
                        background: s.n === 1 ? "#fff" : "transparent",
                        color: s.n === 1 ? "var(--navy)" : "var(--on-navy-muted)",
                        border: s.n === 1 ? "none" : "1px solid var(--navy-3)",
                      }}
                    >
                      {s.n}
                    </span>
                    <span className="small" style={{ color: s.n === 1 ? "#fff" : "var(--on-navy-muted)", fontWeight: s.n === 1 ? 600 : 400 }}>
                      {s.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && <span style={{ width: 24, height: 1, background: "var(--navy-3)" }} />}
                </div>
              ))}
            </div>
          </div>
        </header>

        <main className="container">
          <section className="card lift stack" style={{ gap: 16, padding: 20 }}>
            <div>
              <h2 className="h2" style={{ fontSize: 18 }}>Let&apos;s make sure your system is ready</h2>
              <p className="small muted" style={{ marginTop: 2 }}>
                Complete these {steps.length} checks in order — each needs a quick permission or a few seconds — before you can start the assessment.
              </p>
            </div>

            <div className="row" style={{ alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 240px", minWidth: 220, maxWidth: 280 }}>
                <div className="split" style={{ marginBottom: 8 }}>
                  <p className="label" style={{ margin: 0 }}>Camera preview</p>
                  {checkStatus.camera === "passed" && (
                    <button type="button" onClick={() => setMirrorPreview((v) => !v)} className="btn btn-sm">
                      <FlipHorizontal className="size-3.5" /> {mirrorPreview ? "Mirrored" : "Not mirrored"}
                    </button>
                  )}
                </div>
                <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "var(--navy)", aspectRatio: "4/3" }}>
                  <video
                    ref={checkPreviewVideoRef}
                    muted
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: checkStatus.camera === "passed" ? "block" : "none",
                      transform: mirrorPreview ? "scaleX(-1)" : undefined,
                    }}
                  />
                  {checkStatus.camera !== "passed" && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-navy-muted)" }}>
                      <Video className="size-10" />
                    </div>
                  )}
                  {checkStatus.camera === "passed" && (
                    <span className="pill danger" style={{ position: "absolute", top: 10, left: 10 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} /> LIVE
                    </span>
                  )}
                </div>
                {checkStatus.audio === "checking" && (
                  <p className="small" style={{ marginTop: 10, color: "var(--gold-text)", fontWeight: 600 }}>Listening for background noise… {calibrationSecondsLeft}s</p>
                )}
              </div>

              <div style={{ flex: "2 1 360px", minWidth: 280, display: "flex", flexDirection: "column", gap: 6 }}>
                <p className="label">System checks</p>
                {steps.map((step, i) => {
                  const status = checkStatus[step.key];
                  const Icon = step.icon;
                  const isActive = i === firstPendingIndex;
                  const showHint = status !== "passed";
                  return (
                    <div
                      key={step.key}
                      className="box"
                      style={{
                        padding: 10,
                        ...(status === "passed"
                          ? { borderColor: "var(--success)", background: "var(--success-soft)" }
                          : status === "failed"
                            ? { borderColor: "var(--danger)", background: "var(--danger-soft)" }
                            : undefined),
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span className="icon-box navy" style={{ width: 32, height: 32 }}><Icon className="size-4" /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="small strong">{i + 1}. {step.label}</p>
                          {showHint && (
                            <p className="small muted" style={{ marginTop: 2, fontSize: 11.5 }}>{status === "failed" ? step.failHint : step.hint}</p>
                          )}
                          {step.key === "position" && status === "passed" && cameraPositionValue && (
                            <p className="small" style={{ marginTop: 2, color: "var(--gold-text)", fontWeight: 600 }}>
                              {CAMERA_POSITION_OPTIONS.find((o) => o.value === cameraPositionValue)?.label}
                            </p>
                          )}
                        </div>
                        {status === "passed" && <CheckCircle2 className="size-5 shrink-0" style={{ color: "var(--success)" }} />}
                        {status === "failed" && <XCircle className="size-5 shrink-0" style={{ color: "var(--danger)" }} />}
                        {status !== "passed" && step.key !== "position" && (
                          <button type="button" disabled={!isActive || status === "checking"} onClick={() => step.action()} className="btn btn-gold btn-sm" style={{ flexShrink: 0 }}>
                            {status === "checking" ? <Loader2 className="size-4 animate-spin" /> : status === "failed" ? "Retry" : "Check"}
                          </button>
                        )}
                      </div>
                      {step.key === "camera" && status === "passed" && cameraDevices.length > 1 && (
                        <select
                          value={selectedCameraId}
                          onChange={(e) => void handleCheckCamera(e.target.value)}
                          className="select"
                          style={{ marginTop: 6, height: 30, fontSize: 11.5 }}
                        >
                          {cameraDevices.map((d) => (
                            <option key={d.deviceId} value={d.deviceId}>{d.label || "Camera"}</option>
                          ))}
                        </select>
                      )}
                      {step.key === "microphone" && status === "passed" && (
                        <div style={{ marginTop: 6 }}>
                          {micDevices.length > 1 && (
                            <select
                              value={selectedMicId}
                              onChange={(e) => void handleCheckMicrophone(e.target.value)}
                              className="select"
                              style={{ height: 30, fontSize: 11.5, marginBottom: 6 }}
                            >
                              {micDevices.map((d) => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || "Microphone"}</option>
                              ))}
                            </select>
                          )}
                          <div className="progress" style={{ height: 5 }}>
                            <span style={{ width: `${Math.round(micLevel * 100)}%`, transition: "width .1s linear" }} />
                          </div>
                        </div>
                      )}
                      {step.key === "position" && status !== "passed" && (
                        <div className="grid" style={{ ["--min" as string]: "110px", gap: 6, marginTop: 6 }}>
                          {CAMERA_POSITION_OPTIONS.map((opt) => (
                            <button key={opt.value} type="button" disabled={!isActive} onClick={() => handleSelectCameraPosition(opt.value)} className="btn btn-sm">
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {mediaError && <div className="alert danger">{mediaError}</div>}

            <button
              onClick={() => {
                setPreExamChecking(false);
                setShowInstructions(true);
              }}
              disabled={!allPassed}
              className="btn btn-primary"
              style={{ alignSelf: "flex-end", opacity: allPassed ? 1 : 0.4 }}
            >
              Next: Instructions <ChevronRight className="size-4" />
            </button>
          </section>
          <p className="app-footer">Powered by Learn Being Forward</p>
        </main>
      </div>
    );
  }

  if (showInstructions) {
    const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
    const sectionLabels = hasCodingQuestions ? ["Multiple Choice & Written", "Coding"] : ["All Questions"];
    const violations = [
      {
        violation: "Switching tabs / windows, or leaving full-screen",
        detectedBy: "Browser visibility + full-screen events",
        severity: "WARNING" as const,
        outcome: `Up to ${VIOLATION_LIMIT} warnings, then auto-submitted with whatever was answered.`,
      },
      {
        violation: "Background noise above your calibrated baseline",
        detectedBy: "Live microphone level (Web Audio API)",
        severity: "WARNING" as const,
        outcome: `Up to ${AUDIO_VIOLATION_LIMIT} warnings, then auto-submitted with whatever was answered.`,
      },
      {
        violation: "A phone, another person, or looking away from the screen",
        detectedBy: "In-browser AI proctor (TensorFlow.js — nothing is uploaded except one flagged snapshot)",
        severity: "FLAGGED FOR REVIEW" as const,
        outcome: "A single still image is captured and sent to the admin to review — this does not auto-submit by itself.",
      },
    ];
    const severityPill: Record<string, string> = {
      WARNING: "warning",
      "FLAGGED FOR REVIEW": "info",
    };

    return (
      <div className="lbf-scope">
        <header className="app-band">
          <div className="container" style={{ paddingTop: 16 }}>
            <div className="split">
              <button
                type="button"
                onClick={() => {
                  setShowInstructions(false);
                  setPreExamChecking(true);
                }}
                className="btn btn-ghost-light btn-sm"
              >
                <ChevronLeft className="size-3.5" /> System Check
              </button>
              <div style={{ textAlign: "center" }}>
                <p className="strong" style={{ color: "#fff" }}>{assessmentTitle}</p>
                <p className="small" style={{ color: "var(--on-navy-muted)", marginTop: 2 }}>Step 2 of 3 · Read before you start</p>
              </div>
              <span className="pill success"><CheckCircle2 className="size-3.5" /> All system checks passed</span>
            </div>
          </div>
        </header>

        <main className="container">
          <section className="card lift stack">
            <div>
              <h1 className="h2">Instructions &amp; Rules</h1>
              <p className="small muted" style={{ marginTop: 4 }}>
                Please read everything on this page. The timer starts only when you click Start Assessment.
              </p>
            </div>

            <div className="grid" style={{ ["--min" as string]: "140px" }}>
              {[
                { label: "Duration", value: `${durationMinutes} min` },
                { label: "Questions", value: String(questions.length) },
                { label: "Sections", value: sectionLabels.join(", ") },
                { label: "Total Marks", value: String(totalMarks) },
              ].map((tile) => (
                <div key={tile.label} className="tile">
                  <div className="label">{tile.label}</div>
                  <div className="value">{tile.value}</div>
                </div>
              ))}
            </div>

            <div className="row" style={{ alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 300px" }}>
                <p className="label" style={{ marginBottom: 10 }}>General Instructions</p>
                <ol className="stack" style={{ gap: 8, paddingLeft: 20, fontSize: 14 }}>
                  <li>Once started, this assessment runs full-screen for the entire duration.</li>
                  <li>Do not switch tabs, minimize the window, or exit full-screen — each time counts as a violation.</li>
                  <li>Answer every question within the time limit — it auto-submits at 00:00 with whatever is saved.</li>
                  {hasCodingQuestions && (
                    <li>
                      Coding questions are a separate, locked-in phase — once you finish the multiple-choice/written
                      section, you can&apos;t return to it.
                    </li>
                  )}
                  <li>Your answers are saved automatically as you go — no need to click anything to save.</li>
                  <li>Keep your room quiet and your camera in view of your face for the whole assessment.</li>
                </ol>
              </div>

              <div className="box" style={{ flex: "1 1 260px", background: "var(--surface)" }}>
                <p className="strong" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Video className="size-5" /> AI Proctoring is ON
                </p>
                <p className="small muted" style={{ marginTop: 6 }}>
                  These are monitored for the full session and reviewed by an admin afterward:
                </p>
                <div className="row" style={{ marginTop: 10, gap: 8 }}>
                  {["Webcam video (live AI analysis only — never recorded)", "Microphone audio level", "Tab & window switches", "Full-screen exit"].map((chip) => (
                    <span key={chip} className="chip">{chip}</span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="label" style={{ marginBottom: 10 }}>Violations &amp; What Happens</p>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Violation</th><th>Detected By</th><th>What Happens</th></tr>
                  </thead>
                  <tbody>
                    {violations.map((v) => (
                      <tr key={v.violation}>
                        <td className="strong">{v.violation}</td>
                        <td className="small muted">{v.detectedBy}</td>
                        <td>
                          <div className={`pill ${severityPill[v.severity]}`} style={{ marginBottom: 4 }}>{v.severity}</div>
                          <p className="small muted">{v.outcome}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <label className="check box" style={{ background: "var(--surface)" }}>
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
              <span>
                I have read the instructions. I agree to be monitored through my camera and microphone, and I
                understand that malpractice can lead to disqualification.
              </span>
            </label>

            {mediaError && <div className="alert danger">{mediaError}</div>}

            <div className="split">
              <button
                type="button"
                onClick={() => {
                  setShowInstructions(false);
                  setPreExamChecking(true);
                }}
                className="btn btn-sm"
              >
                ‹ Back to System Check
              </button>
              <button onClick={handleFinalStart} disabled={!agreedToTerms || starting} className="btn btn-primary" style={{ opacity: !agreedToTerms || starting ? 0.4 : 1 }}>
                {starting ? <Loader2 className="size-4 animate-spin" /> : <Maximize className="size-4" />}
                Start Assessment
              </button>
            </div>
          </section>
          <p className="app-footer">Powered by Learn Being Forward</p>
        </main>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="lbf-scope" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--navy)", padding: 24 }}>
        <div className="card" style={{ maxWidth: 440, textAlign: "center" }}>
          <h1 className="h2">{assessmentTitle}</h1>
          <p className="small muted" style={{ marginTop: 12 }}>
            This assessment runs full-screen and lasts <strong>{durationMinutes} minutes</strong>. Once started,
            do not switch tabs, minimize the window, or leave full-screen — each time counts as a violation, and
            after {VIOLATION_LIMIT} the assessment is submitted automatically with whatever you&apos;ve answered
            so far. If you don&apos;t return to full-screen within {RETURN_GRACE_SECONDS} seconds of leaving, it
            submits immediately.
          </p>
          {proctoringEnabled && (
            <p className="small muted" style={{ marginTop: 8 }}>
              This assessment is proctored — you will be watched on camera and your audio will be monitored for
              the entire duration. Unexpected noise is flagged as a violation, up to {AUDIO_VIOLATION_LIMIT}{" "}
              warnings.
            </p>
          )}
          <p className="small muted" style={{ marginTop: 8 }}>{questions.length} questions &middot; {questions.reduce((s, q) => s + q.marks, 0)} marks total.</p>
          {mediaError && <div className="alert danger" style={{ marginTop: 12 }}>{mediaError}</div>}
          <button onClick={proctoringEnabled ? () => setPreExamChecking(true) : handleStart} disabled={starting} className="btn btn-gold" style={{ marginTop: 20 }}>
            {starting ? <Loader2 className="size-4 animate-spin" /> : <Maximize className="size-4" />}
            {proctoringEnabled ? "Start System Check" : "Start Assessment (Full-Screen)"}
          </button>
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
      <div className="lbf-scope" style={{ minHeight: "100vh" }}>
        <header className="app-band" style={{ padding: "16px 0" }}>
          <div className="container split">
            <button type="button" onClick={() => setShowAllProblems(false)} className="btn btn-ghost-light btn-sm">
              <ChevronLeft className="size-3.5" /> Back to Assessment
            </button>
            <p className="strong" style={{ color: "#fff" }}>{assessmentTitle}</p>
          </div>
        </header>
        <main className="container stack" style={{ paddingTop: 24, paddingBottom: 24 }}>
          {sections.map((section) => (
            <section key={section.label} className="card">
              <div className="split" style={{ marginBottom: 14 }}>
                <p className="label">{section.label}</p>
                <p className="small muted">
                  {section.qs.filter(isAnswered).length}/{section.qs.length} attempted
                </p>
              </div>
              <div className="grid" style={{ ["--min" as string]: "110px" }}>
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
                      className="box"
                      style={
                        !isCurrentPhase
                          ? { cursor: "not-allowed", opacity: 0.5, textAlign: "left" }
                          : done
                            ? { borderColor: "var(--success)", background: "var(--success-soft)", textAlign: "left" }
                            : { textAlign: "left" }
                      }
                    >
                      <div className="split">
                        <span className="strong">Q{questions.findIndex((x) => x.id === sq.id) + 1}</span>
                        {bookmarked[sq.id] && <Bookmark className="size-3.5" style={{ color: "var(--gold)", fill: "var(--gold)" }} />}
                      </div>
                      <p className="small muted" style={{ marginTop: 4 }}>
                        {sq.questionType === "CODING" ? "Coding" : sq.questionType === "MCQ" ? "MCQ" : "Written"}
                      </p>
                      <p className="small" style={{ marginTop: 2, fontWeight: 600, color: done ? "var(--success-text)" : "var(--muted)" }}>
                        {done ? "Attempted" : "Not attempted"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="lbf-scope" style={{ minHeight: "100vh", paddingBottom: 110 }}>
      {/* HEADER BAND */}
      <header className="app-band" style={{ padding: "16px 0" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <button type="button" onClick={() => setShowAllProblems(true)} className="btn btn-ghost-light btn-sm">
            <ChevronLeft className="size-3.5" /> All Problems
          </button>

          <div style={{ textAlign: "center" }}>
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#fff" }}>
              <Clock className="size-5" style={{ color: "var(--gold)" }} />
              {renderTimer()}
            </p>
            <p className="small" style={{ color: "var(--on-navy-muted)", marginTop: 2 }}>
              Time left in this assessment session
            </p>
          </div>

          <div style={{ width: 200 }}>
            <div className="progress on-navy">
              <span style={{ width: `${activeQuestions.length ? (answeredCount / activeQuestions.length) * 100 : 0}%` }} />
            </div>
            <p className="small" style={{ textAlign: "right", color: "var(--on-navy-muted)", marginTop: 4 }}>
              {answeredCount}/{activeQuestions.length} Questions attempted
            </p>
          </div>
        </div>
      </header>

      {(!isFullscreen || warning || audioWarning) && (
        <div className="container stack" style={{ gap: 8, paddingTop: 16 }}>
          {!isFullscreen && (
            <div className="alert warning" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle className="size-4" /> Not in full-screen — Violations: {violationCount}/{VIOLATION_LIMIT}
                {proctoringEnabled && <> &middot; Audio: {audioViolationCount}/{AUDIO_VIOLATION_LIMIT}</>}
              </span>
              <button onClick={() => document.documentElement.requestFullscreen().catch(() => {})} className="btn btn-gold btn-sm">
                <Maximize className="size-3.5" /> Return to Full-Screen
              </button>
            </div>
          )}
          {warning && (
            <div className="alert danger">
              <AlertTriangle className="size-4 shrink-0" /> {warning}
            </div>
          )}
          {audioWarning && (
            <div className="alert warning">
              <AlertTriangle className="size-4 shrink-0" /> {audioWarning}
            </div>
          )}
        </div>
      )}

      {hasCodingQuestions && (
        <p className="container small strong" style={{ marginTop: 16, textAlign: "center", textTransform: "uppercase", letterSpacing: ".04em" }}>
          {inCodingPhase ? "Phase 2 — Coding" : "Phase 1 — Multiple Choice & Written"}
        </p>
      )}

      {/* MAIN CARD — overlaps the header band */}
      <div className="container">
        <div className="card lift" style={{ padding: 0, overflow: "hidden" }}>
          {/* question navigation strip */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, overflowX: "auto", borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "12px 16px" }}>
            <button
              type="button"
              disabled={!hasPrevWindow}
              onClick={() => setNavWindowStart((w) => Math.max(0, w - NAV_WINDOW_SIZE))}
              className="small strong"
              style={{ flexShrink: 0, textTransform: "uppercase", letterSpacing: ".04em", opacity: hasPrevWindow ? 1 : 0.3 }}
            >
              ‹ Prev
            </button>
            <div style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 6 }}>
              {navWindowQuestions.map((nq, idx) => {
                const i = navWindowStart + idx;
                const current = i === currentIndex;
                const done = isAnswered(nq);
                return (
                  <button
                    key={nq.id}
                    type="button"
                    onClick={() => jumpTo(i)}
                    className="small strong"
                    style={{
                      position: "relative",
                      display: "flex",
                      flexShrink: 0,
                      width: 36,
                      height: 36,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: current ? "var(--navy)" : "#fff",
                      color: current ? "#fff" : done ? "var(--navy)" : "var(--muted)",
                      border: current ? "none" : "1px solid var(--border)",
                    }}
                    title={`Question ${i + 1}${done ? " (answered)" : ""}`}
                  >
                    {i + 1}
                    {done && <span style={{ position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: "50%", background: current ? "#fff" : "var(--success)" }} />}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={!hasNextWindow}
              onClick={() => setNavWindowStart((w) => w + NAV_WINDOW_SIZE)}
              className="small strong"
              style={{ flexShrink: 0, textTransform: "uppercase", letterSpacing: ".04em", opacity: hasNextWindow ? 1 : 0.3 }}
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
              <div className="p-6" style={{ borderRight: "1px solid var(--border)" }}>
                <div className="split" style={{ marginBottom: 4, alignItems: "flex-start" }}>
                  <p className="strong">{assessmentTitle}</p>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(q.id)}
                    title={bookmarked[q.id] ? "Remove bookmark" : "Mark for review"}
                    className="shrink-0"
                  >
                    <Bookmark className="size-5" style={bookmarked[q.id] ? { color: "var(--gold)", fill: "var(--gold)" } : { color: "var(--muted)" }} />
                  </button>
                </div>
                <p className="row" style={{ gap: 6, marginBottom: 16 }}>
                  <span className="pill">{q.questionType === "MCQ" ? "MCQ" : "Written"}</span>
                  {q.sectionName && <span className="pill info">{q.sectionName}</span>}
                </p>
                {q.snippetCode && (
                  <div style={{ marginBottom: 12 }}>
                    {q.snippetLanguage && <p className="label" style={{ marginBottom: 4 }}>{q.snippetLanguage}</p>}
                    <pre className="code select-none">{q.snippetCode}</pre>
                  </div>
                )}
                <p className="label" style={{ marginBottom: 8 }}>Description</p>
                <div style={{ maxHeight: "50vh", overflowY: "auto", paddingRight: 4 }}>
                  <p style={{ whiteSpace: "pre-wrap", fontSize: 16, lineHeight: 1.6 }}>{q.questionText}</p>
                  <p className="small muted" style={{ marginTop: 8 }}>
                    {q.marks} mark{q.marks !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* answer panel */}
              <div className="p-6">
                <div className="split" style={{ marginBottom: 4 }}>
                  <p className="strong">Answer choices</p>
                  <span className={`pill ${isAnswered(q) ? "success" : ""}`}>
                    {isAnswered(q) ? <CheckCircle2 className="size-3" /> : <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--muted)", display: "inline-block" }} />}
                    {isAnswered(q) ? "Solved" : "Unsolved"}
                  </span>
                </div>
                <p className="small muted" style={{ marginBottom: 16 }}>Please choose a correct answer.</p>

                {q.questionType === "MCQ" && q.answerType === "NUMERIC" ? (
                  <input
                    type="number"
                    step="any"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Enter your numeric answer"
                    className="input"
                    style={{ height: 44, maxWidth: 280, fontSize: 16 }}
                  />
                ) : q.questionType === "MCQ" ? (
                  <div className="stack" style={{ gap: 8 }}>
                    {(["A", "B", "C", "D"] as const).map((letter) => {
                      const text = q[`option${letter}` as "optionA"];
                      const isMultiple = q.answerType === "MULTIPLE";
                      const selectedLetters = (answers[q.id] ?? "").split(",").filter(Boolean);
                      const selected = isMultiple ? selectedLetters.includes(letter) : answers[q.id] === letter;
                      return (
                        <label
                          key={letter}
                          className="check"
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: selected ? "1px solid var(--navy)" : "1px solid transparent",
                            background: selected ? "var(--gold-soft)" : "var(--surface)",
                          }}
                        >
                          <input
                            type={isMultiple ? "checkbox" : "radio"}
                            name={`q-${q.id}`}
                            value={letter}
                            checked={selected}
                            onChange={() => {
                              if (!isMultiple) {
                                handleAnswerChange(q.id, letter);
                                return;
                              }
                              const next = selected ? selectedLetters.filter((l) => l !== letter) : [...selectedLetters, letter];
                              handleAnswerChange(q.id, next.sort().join(","));
                            }}
                          />
                          <span style={{ whiteSpace: "pre-wrap" }}>
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

                <p className="app-footer">Powered by Learn Being Forward</p>
              </div>
            </div>
          )}
        </div>

        {!inCodingPhase && hasCodingQuestions && isLast && (
          <p className="small muted" style={{ marginTop: 12, textAlign: "center" }}>
            Once you finish this phase, you can&apos;t come back to these questions — review your answers first.
          </p>
        )}
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-3 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2">
          <button onClick={() => jumpTo(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="btn btn-sm">
            <ChevronLeft className="size-3.5" /> Previous Problem
          </button>
          <button onClick={() => setReviewing(true)} className="btn btn-sm btn-danger">
            <Square className="size-3 fill-current" /> Finish &amp; Submit
          </button>
          <button onClick={() => setShowAllProblems(true)} className="btn btn-sm">
            <List className="size-3.5" /> Back to All Problems
          </button>
          <button onClick={() => jumpTo(Math.min(activeQuestions.length - 1, currentIndex + 1))} disabled={currentIndex === activeQuestions.length - 1} className="btn btn-sm">
            Next Problem <ChevronRight className="size-3.5" />
          </button>
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
          <video
            ref={videoRef}
            muted
            playsInline
            className="size-full object-cover"
            style={{ transform: mirrorPreview ? "scaleX(-1)" : undefined }}
          />
          <span className="pointer-events-none absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
            REC
          </span>
          <div className="absolute right-1.5 top-1.5 flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMirrorPreview((v) => !v);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded bg-black/50 p-1 text-white hover:bg-black/70"
              title={mirrorPreview ? "Un-mirror preview" : "Mirror preview"}
            >
              <FlipHorizontal className="size-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setWebcamExpanded((v) => !v);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded bg-black/50 p-1 text-white hover:bg-black/70"
              title={webcamExpanded ? "Collapse" : "Expand"}
            >
              {webcamExpanded ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
            </button>
          </div>
        </div>
      )}

      {/* FINISH & SUBMIT confirmation modal */}
      {reviewing && (
        <div className="lbf-scope" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(20,28,46,.6)", padding: 16 }}>
          <div className="card" style={{ width: "100%", maxWidth: 420 }}>
            <h2 className="h2">
              {!inCodingPhase && hasCodingQuestions ? "Finish Phase 1 & Continue to Coding?" : "Finish & Submit Assignment?"}
            </h2>
            <p className="small muted" style={{ marginTop: 4 }}>This can&apos;t be undone once confirmed.</p>
            <div className="grid" style={{ ["--min" as string]: "100px", marginTop: 16, textAlign: "center" }}>
              <div className="tile success">
                <div className="value">{reviewQuestions.length - unansweredCount}</div>
                <div className="label">Attempted</div>
              </div>
              <div className="tile">
                <div className="value">{unansweredCount}</div>
                <div className="label">Unattempted</div>
              </div>
              <div className="tile gold">
                <div className="value">{bookmarkedCount}</div>
                <div className="label">Bookmarked</div>
              </div>
            </div>
            <div className="split" style={{ marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={() => setReviewing(false)} className="btn">
                Cancel
              </button>
              {!inCodingPhase && hasCodingQuestions ? (
                <button onClick={handleSubmitMcqPhase} disabled={submittingMcqPhase} className="btn btn-danger">
                  {submittingMcqPhase && <Loader2 className="size-4 animate-spin" />}
                  Continue to Coding
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting} className="btn btn-danger">
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {leaveDeadline !== null && (
        <div className="lbf-scope" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(20,28,46,.7)" }}>
          <div className="card" style={{ margin: 16, maxWidth: 360, textAlign: "center" }}>
            <AlertTriangle className="size-10" style={{ color: "var(--danger)", margin: "0 auto 12px" }} />
            <h2 className="h2">You left the assessment screen</h2>
            <p className="small muted" style={{ marginTop: 8 }}>
              Return to full-screen now, or the assessment will be submitted automatically in{" "}
              <strong>{leaveSecondsLeft}s</strong>.
            </p>
            <button onClick={handleReturnToFullscreen} className="btn btn-gold" style={{ width: "100%", marginTop: 16 }}>
              <Maximize className="size-4" /> Return to Full-Screen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
