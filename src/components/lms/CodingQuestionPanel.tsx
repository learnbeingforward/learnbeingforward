"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Play, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { runStudentCode, submitCodingAnswer, type RunCodeState, type SubmitCodeState } from "@/lib/actions/assessments";

type Question = {
  id: string;
  questionText: string;
  marks: number;
  starterCode: string | null;
  timeLimitSeconds: number | null;
  visibleTestCases: { id: string; input: string; expectedOutput: string }[];
  savedCode: string | null;
  savedLanguage: string | null;
  testCasesPassed: number | null;
  testCasesTotal: number | null;
};

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
] as const;

function parseStarterCode(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function CodingQuestionPanel({
  assignmentId,
  question,
  onSubmitted,
}: {
  assignmentId: string;
  question: Question;
  onSubmitted?: (result: { code: string; language: string; passed: number; total: number }) => void;
}) {
  const starterMap = parseStarterCode(question.starterCode);
  const [language, setLanguage] = useState(question.savedLanguage ?? "python");
  const [code, setCode] = useState(question.savedCode ?? starterMap[question.savedLanguage ?? "python"] ?? "");
  const [isRunning, startRun] = useTransition();
  const [isSubmitting, startCodeSubmit] = useTransition();
  const [runResult, setRunResult] = useState<RunCodeState>(null);
  const [submitResult, setSubmitResult] = useState<SubmitCodeState>(null);
  const [passed, setPassed] = useState(question.testCasesPassed);
  const [total, setTotal] = useState(question.testCasesTotal);

  function handleLanguageChange(next: string | null) {
    if (!next) return;
    setLanguage(next);
    // Only swap in the starter template if the student hasn't typed anything of
    // their own yet for this language — never clobber real work.
    if (!code.trim() || code === starterMap[language]) {
      setCode(starterMap[next] ?? "");
    }
  }

  function handleRun() {
    setRunResult(null);
    startRun(async () => {
      const result = await runStudentCode(assignmentId, question.id, language, code);
      setRunResult(result);
    });
  }

  function handleSubmitCode() {
    setSubmitResult(null);
    startCodeSubmit(async () => {
      const fd = new FormData();
      fd.set("language", language);
      fd.set("code", code);
      const result = await submitCodingAnswer(assignmentId, question.id, fd);
      setSubmitResult(result);
      if (result?.ok) {
        setPassed(result.testCasesPassed ?? null);
        setTotal(result.testCasesTotal ?? null);
        onSubmitted?.({ code, language, passed: result.testCasesPassed ?? 0, total: result.testCasesTotal ?? 0 });
      }
    });
  }

  return (
    <div className="box">
      <p className="strong" style={{ whiteSpace: "pre-wrap", fontSize: 16, lineHeight: 1.6 }}>
        {question.questionText}{" "}
        <span className="small muted" style={{ fontWeight: 400 }}>
          ({question.marks} mark{question.marks !== 1 ? "s" : ""})
        </span>
      </p>
      <p className="small muted" style={{ marginTop: 4, marginBottom: 12 }}>Time limit: {question.timeLimitSeconds ?? 8} sec per test case</p>
      {passed !== null && total !== null && (
        <p className="small" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <CheckCircle2 className="size-3.5" style={{ color: "var(--success)" }} /> Last submitted: {passed}/{total} test cases passed
        </p>
      )}

      {question.visibleTestCases.length > 0 && (
        <div className="stack" style={{ gap: 8, marginBottom: 16 }}>
          <p className="label">Example Test Cases</p>
          {question.visibleTestCases.map((tc, i) => (
            <div key={tc.id} className="grid small" style={{ ["--min" as string]: "180px", background: "var(--surface)", borderRadius: 10, padding: 12 }}>
              <div>
                <p className="strong">Input {i + 1}</p>
                <pre className="code" style={{ marginTop: 4, background: "transparent", color: "inherit", padding: 0 }}>{tc.input || "(none)"}</pre>
              </div>
              <div>
                <p className="strong">Expected Output</p>
                <pre className="code" style={{ marginTop: 4, background: "transparent", color: "inherit", padding: 0 }}>{tc.expectedOutput}</pre>
              </div>
            </div>
          ))}
          <p className="small muted">
            Plus additional hidden test cases that only run when you submit — their inputs aren&apos;t shown.
          </p>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-40">
            <SelectValue>{(value: string | null) => LANGUAGES.find((l) => l.value === value)?.label ?? "Language"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={14}
        className="code"
        style={{ width: "100%", resize: "vertical", outline: "none" }}
        placeholder="Write your code here..."
      />

      <div className="row" style={{ marginTop: 12 }}>
        <button type="button" disabled={isRunning} onClick={handleRun} className="btn btn-sm">
          {isRunning ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          Run
        </button>
        <button type="button" disabled={isSubmitting} onClick={handleSubmitCode} className="btn btn-primary btn-sm">
          {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
          Submit Code
        </button>
      </div>

      {runResult?.error && <div className="alert danger" style={{ marginTop: 12 }}>{runResult.error}</div>}
      {runResult?.ok && runResult.results && (() => {
        const compileFailure = runResult.results.find((r) => r.verdict === "compile_error" || r.verdict === "runtime_error");
        const allPassed = runResult.results.every((r) => r.passed);
        return (
          <div style={{ marginTop: 12 }}>
            {compileFailure ? (
              <div className="alert danger" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <p className="strong" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <XCircle className="size-4" />
                  {compileFailure.verdict === "compile_error" ? "Compilation error" : "Runtime error"}
                </p>
                <pre className="code" style={{ marginTop: 8 }}>{compileFailure.actualOutput}</pre>
                <p className="small" style={{ marginTop: 8 }}>Fix it and press Run again. Run is never scored.</p>
              </div>
            ) : (
              <>
                <p className="small strong" style={{ marginBottom: 8 }}>
                  {runResult.results.filter((r) => r.passed).length} / {runResult.results.length} visible tests passed
                </p>
                <div className="stack" style={{ gap: 8 }}>
                  {runResult.results.map((r, i) =>
                    r.passed ? (
                      <div key={i} className="alert success small" style={{ fontWeight: 600 }}>
                        <CheckCircle2 className="size-3.5 shrink-0" /> Test {i + 1} &middot; Passed
                      </div>
                    ) : (
                      <div key={i} className="alert danger" style={{ flexDirection: "column", alignItems: "stretch" }}>
                        <p className="small strong" style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                          <span className="pill danger">Wrong Answer</span>
                          Test {i + 1}
                        </p>
                        <div className="grid small" style={{ ["--min" as string]: "140px" }}>
                          <div>
                            <p className="strong">Input</p>
                            <pre style={{ marginTop: 2, whiteSpace: "pre-wrap", fontFamily: "var(--mono)" }}>{r.input || "(none)"}</pre>
                          </div>
                          <div>
                            <p className="strong">Expected</p>
                            <pre style={{ marginTop: 2, whiteSpace: "pre-wrap", fontFamily: "var(--mono)" }}>{r.expectedOutput}</pre>
                          </div>
                          <div>
                            <p className="strong">Your Output</p>
                            <pre style={{ marginTop: 2, whiteSpace: "pre-wrap", fontFamily: "var(--mono)", background: "rgba(185,28,28,.08)", borderRadius: 6, padding: 4 }}>{r.actualOutput || "(no output)"}</pre>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <p className="small muted" style={{ marginTop: 8 }}>
                  {allPassed
                    ? "Looks good. Press Submit to run the hidden tests."
                    : "Hidden tests are not run on Run. They run only when you press Submit."}
                </p>
              </>
            )}
          </div>
        );
      })()}

      {submitResult?.error && !submitResult.compileErrorDetail && <div className="alert danger" style={{ marginTop: 12 }}>{submitResult.error}</div>}
      {submitResult?.compileErrorDetail && (
        <div className="alert danger" style={{ marginTop: 12, flexDirection: "column", alignItems: "stretch" }}>
          <p className="strong" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <XCircle className="size-4" /> Compilation error
          </p>
          <pre className="code" style={{ marginTop: 8 }}>{submitResult.compileErrorDetail}</pre>
          <p className="small" style={{ marginTop: 8 }}>This submission wasn&apos;t scored and didn&apos;t use a submission attempt.</p>
        </div>
      )}
      {submitResult?.ok && (
        <div style={{ marginTop: 12 }}>
          <div
            className={`split ${submitResult.testCasesPassed === submitResult.testCasesTotal ? "tile success" : submitResult.testCasesPassed && submitResult.testCasesPassed > 0 ? "tile warning" : "tile danger"}`}
          >
            <div>
              <p className="strong" style={{ fontSize: 15 }}>
                {submitResult.testCasesPassed}/{submitResult.testCasesTotal} tests passed
              </p>
              {submitResult.submittedAt && (
                <p className="small muted" style={{ marginTop: 2 }}>
                  Submitted at {new Date(submitResult.submittedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  {submitResult.submissionNumber ? ` · Submission #${submitResult.submissionNumber}` : ""}
                </p>
              )}
            </div>
            <p className="strong">
              {submitResult.marksAwarded}/{question.marks} marks
            </p>
          </div>
          {submitResult.tests && (
            <div className="stack" style={{ gap: 4, marginTop: 8 }}>
              {submitResult.tests.map((t, i) => (
                <div key={i} className={`split small ${t.verdict === "passed" ? "" : ""}`} style={{ padding: "6px 12px", borderRadius: 8, background: t.verdict === "passed" ? "var(--success-soft)" : "var(--danger-soft)", color: t.verdict === "passed" ? "var(--success-text)" : "var(--danger-text)" }}>
                  <span className="strong" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {t.verdict === "passed" ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                    {t.label}
                  </span>
                  {t.verdict !== "passed" && (
                    <span className="pill danger">
                      {t.verdict === "wrong_answer"
                        ? "Wrong Answer"
                        : t.verdict === "time_limit_exceeded"
                          ? "Time Limit Exceeded"
                          : t.verdict === "runtime_error"
                            ? "Runtime Error"
                            : "Compile Error"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="small muted" style={{ marginTop: 8 }}>
            Hidden inputs are never shown. You can change your code and submit again; your last submission is scored.
          </p>
        </div>
      )}
    </div>
  );
}
