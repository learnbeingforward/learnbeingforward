"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Play, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function CodingQuestionPanel({ assignmentId, question }: { assignmentId: string; question: Question }) {
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
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <p className="mb-1 whitespace-pre-wrap text-base font-medium leading-relaxed text-indigo">
        {question.questionText}{" "}
        <span className="text-xs font-normal text-muted-foreground">
          ({question.marks} mark{question.marks !== 1 ? "s" : ""})
        </span>
      </p>
      {passed !== null && total !== null && (
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-indigo">
          <CheckCircle2 className="size-3.5 text-green-600" /> Last submitted: {passed}/{total} test cases passed
        </p>
      )}

      {question.visibleTestCases.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example Test Cases</p>
          {question.visibleTestCases.map((tc, i) => (
            <div key={tc.id} className="grid gap-2 rounded-lg bg-cream p-3 text-xs sm:grid-cols-2">
              <div>
                <p className="font-medium text-indigo">Input {i + 1}</p>
                <pre className="mt-1 whitespace-pre-wrap font-mono text-indigo/80">{tc.input || "(none)"}</pre>
              </div>
              <div>
                <p className="font-medium text-indigo">Expected Output</p>
                <pre className="mt-1 whitespace-pre-wrap font-mono text-indigo/80">{tc.expectedOutput}</pre>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Plus additional hidden test cases that only run when you submit — their inputs aren&apos;t shown.
          </p>
        </div>
      )}

      <div className="mb-2">
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
        className="w-full rounded-lg border border-border bg-indigo-dark p-3 font-mono text-sm text-white outline-none focus-visible:border-ring"
        placeholder="Write your code here..."
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={isRunning} onClick={handleRun} className="border-border text-indigo">
          {isRunning ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          Run
        </Button>
        <Button type="button" disabled={isSubmitting} onClick={handleSubmitCode} className="bg-indigo text-white hover:bg-indigo/90">
          {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
          Submit Code
        </Button>
      </div>

      {runResult?.error && <p className="mt-3 text-sm text-destructive">{runResult.error}</p>}
      {runResult?.ok && runResult.results && (
        <div className="mt-3 space-y-2">
          {runResult.results.map((r, i) => (
            <div key={i} className={`rounded-lg border p-3 text-xs ${r.passed ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
              <p className={`flex items-center gap-1.5 font-medium ${r.passed ? "text-green-700" : "text-red-700"}`}>
                {r.passed ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                Example {i + 1}: {r.passed ? "Passed" : "Failed"}
              </p>
              {!r.passed && (
                <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                  <div>
                    <p className="font-medium text-indigo">Expected</p>
                    <pre className="whitespace-pre-wrap font-mono">{r.expectedOutput}</pre>
                  </div>
                  <div>
                    <p className="font-medium text-indigo">Your Output</p>
                    <pre className="whitespace-pre-wrap font-mono">{r.actualOutput || "(no output)"}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {submitResult?.error && <p className="mt-3 text-sm text-destructive">{submitResult.error}</p>}
      {submitResult?.ok && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-green-700">
          <CheckCircle2 className="size-4" /> {submitResult.testCasesPassed}/{submitResult.testCasesTotal} test cases
          passed — {submitResult.marksAwarded}/{question.marks} marks
        </p>
      )}
    </div>
  );
}
