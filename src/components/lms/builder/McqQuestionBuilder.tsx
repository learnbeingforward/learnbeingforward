"use client";

// Screens 2 & 3 — "Add Aptitude Question" and "Add Technical Question". Same
// layout and components for both; `kind` only changes which top-row fields
// show (Topic/Sub-topic for aptitude vs Subject/Concept/Style for technical)
// and whether the code-snippet block + "run snippet to verify" button appear.
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  addAssessmentQuestion,
  updateAssessmentQuestion,
  runSnippetCheck,
  type AddQuestionState,
} from "@/lib/actions/assessments";
import { BuilderHeader, BuilderCard, BuilderFooter, inputClass, selectClass, labelClass, ReadinessBox } from "./shared";

const APTITUDE_TOPICS = ["Logical reasoning", "Quantitative", "Verbal"];
const TECHNICAL_SUBJECTS = ["OOP", "Data structures", "DBMS / SQL", "Operating systems", "Computer networks"];
const QUESTION_STYLES = [
  { value: "predict_output", label: "Predict the output" },
  { value: "find_error", label: "Find the error" },
  { value: "concept_mcq", label: "Concept MCQ" },
  { value: "fill_blank", label: "Fill in the blank (code)" },
];
const SNIPPET_LANGUAGES = ["java", "python", "c", "cpp", "sql"];
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

export type ExistingMcqQuestion = {
  id: string;
  questionText: string;
  marks: number;
  topic: string | null;
  subTopic: string | null;
  questionStyle: string | null;
  answerType: string | null;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
  correctOptions: string | null;
  numericAnswer: string | null;
  numericTolerance: string | null;
  snippetLanguage: string | null;
  snippetCode: string | null;
  difficulty: string | null;
  tags: string | null;
  negativeMarks: number | null;
  explanation: string | null;
};

export function McqQuestionBuilder({
  assessmentId,
  assessmentTitle,
  sectionName,
  kind,
  backHref,
  progressLabel,
  existing,
}: {
  assessmentId: string;
  assessmentTitle: string;
  sectionName: string;
  kind: "aptitude" | "technical";
  backHref: string;
  progressLabel?: string;
  existing?: ExistingMcqQuestion;
}) {
  const router = useRouter();
  const action = existing ? updateAssessmentQuestion.bind(null, existing.id) : addAssessmentQuestion.bind(null, assessmentId);
  const [state, formAction, isPending] = useActionState<AddQuestionState, FormData>(action, null);
  const [addAnother, setAddAnother] = useState(false);

  const [answerType, setAnswerType] = useState<"SINGLE" | "MULTIPLE" | "NUMERIC">(
    (existing?.answerType as "SINGLE" | "MULTIPLE" | "NUMERIC") || "SINGLE"
  );
  const [topic, setTopic] = useState(existing?.topic ?? "");
  const [questionText, setQuestionText] = useState(existing?.questionText ?? "");
  const questionRef = useRef<HTMLTextAreaElement>(null);

  function wrapSelection(before: string, after: string = before) {
    const el = questionRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value } = el;
    const selected = value.slice(selectionStart, selectionEnd) || "text";
    const next = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
    setQuestionText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart + before.length, selectionStart + before.length + selected.length);
    });
  }
  const [options, setOptions] = useState({
    A: existing?.optionA ?? "",
    B: existing?.optionB ?? "",
    C: existing?.optionC ?? "",
    D: existing?.optionD ?? "",
  });
  const [correctSingle, setCorrectSingle] = useState(existing?.correctOption ?? "");
  const [correctMultiple, setCorrectMultiple] = useState<string[]>(
    existing?.correctOptions ? existing.correctOptions.split(",").filter(Boolean) : []
  );
  const [snippetLanguage, setSnippetLanguage] = useState(existing?.snippetLanguage ?? (kind === "technical" ? "java" : ""));
  const [snippetCode, setSnippetCode] = useState(existing?.snippetCode ?? "");
  const [showSnippet, setShowSnippet] = useState(!!existing?.snippetCode);
  const [verifyState, setVerifyState] = useState<{ output?: string; error?: string } | null>(null);
  const [isVerifying, startVerify] = useTransition();

  useEffect(() => {
    if (state?.ok) {
      if (addAnother) {
        router.replace(`${backHref}&screen=add-${kind}&sectionName=${encodeURIComponent(sectionName)}`);
        router.refresh();
      } else {
        router.push(backHref);
      }
    }
  }, [state, addAnother, router, backHref, kind, sectionName]);

  function toggleMultiple(letter: string) {
    setCorrectMultiple((prev) => (prev.includes(letter) ? prev.filter((l) => l !== letter) : [...prev, letter]));
  }

  const missing: string[] = [];
  if (!questionText.trim()) missing.push("question text");
  if (answerType === "NUMERIC") {
    // numeric answer checked separately via required input
  } else {
    if (!options.A.trim() || !options.B.trim() || !options.C.trim() || !options.D.trim()) missing.push("4 options");
    if (answerType === "SINGLE" && !correctSingle) missing.push("1 correct answer");
    if (answerType === "MULTIPLE" && correctMultiple.length === 0) missing.push("at least 1 correct answer");
  }

  function runVerify() {
    setVerifyState(null);
    startVerify(async () => {
      const result = await runSnippetCheck(snippetLanguage, snippetCode);
      setVerifyState(result.ok ? { output: result.output } : { error: result.error });
    });
  }

  return (
    <div>
      <BuilderHeader
        backHref={backHref}
        backLabel="Back to Assessment"
        breadcrumb={`${assessmentTitle} › Section · ${sectionName}`}
        title={existing ? `Edit ${kind === "aptitude" ? "aptitude" : "technical"} question` : `New ${kind === "aptitude" ? "aptitude" : "technical"} question`}
        rightSlot={progressLabel ? <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">{progressLabel}</span> : null}
      />
      <BuilderCard>
        <form action={formAction} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <input type="hidden" name="questionType" value="MCQ" />
          <input type="hidden" name="sectionName" value={sectionName} />
          <input type="hidden" name="answerType" value={answerType} />

          <div className="space-y-5">
            {kind === "aptitude" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className={labelClass}>Topic</Label>
                  <select name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={selectClass}>
                    <option value="">Choose a topic</option>
                    {APTITUDE_TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className={labelClass}>Sub-topic</Label>
                  <Input name="subTopic" defaultValue={existing?.subTopic ?? ""} className="h-10" placeholder="e.g. Dice &amp; cubes" />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label className={labelClass}>Subject</Label>
                  <select name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={selectClass}>
                    <option value="">Choose a subject</option>
                    {TECHNICAL_SUBJECTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className={labelClass}>Concept</Label>
                  <Input name="subTopic" defaultValue={existing?.subTopic ?? ""} className="h-10" placeholder="e.g. Static members" />
                </div>
                <div>
                  <Label className={labelClass}>Question style</Label>
                  <select name="questionStyle" defaultValue={existing?.questionStyle ?? ""} className={selectClass}>
                    <option value="">Choose a style</option>
                    {QUESTION_STYLES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <Label className={labelClass}>Answer type</Label>
              <div className="inline-flex overflow-hidden rounded-lg border border-border">
                {(["SINGLE", "MULTIPLE", ...(kind === "aptitude" ? ["NUMERIC" as const] : [])] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAnswerType(t)}
                    className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                      answerType === t ? "bg-indigo text-white" : "bg-white text-indigo hover:bg-cream"
                    }`}
                  >
                    {t === "SINGLE" ? "Single correct" : t === "MULTIPLE" ? "Multiple correct" : "Numeric answer"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className={labelClass}>Question</Label>
              <div className="flex items-center gap-1 rounded-t-lg border border-b-0 border-border bg-cream px-2 py-1.5">
                {[
                  { label: "B", title: "Bold", before: "**" },
                  { label: "I", title: "Italic", before: "_" },
                  { label: "</>", title: "Inline code", before: "`" },
                  { label: "Σ", title: "Formula", before: "$", after: "$" },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    title={btn.title}
                    onClick={() => wrapSelection(btn.before, btn.after ?? btn.before)}
                    className="flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs font-bold text-indigo hover:bg-white"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <Textarea
                ref={questionRef}
                name="questionText"
                required
                rows={4}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="rounded-t-none text-sm"
                placeholder="Type the question here..."
              />
            </div>

            {kind === "technical" && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label className={labelClass}>Code snippet (optional)</Label>
                  <div className="flex items-center gap-2">
                    {showSnippet && (
                      <select
                        name="snippetLanguage"
                        value={snippetLanguage}
                        onChange={(e) => setSnippetLanguage(e.target.value)}
                        className="h-8 rounded-lg border border-border bg-white px-2 text-xs text-indigo"
                      >
                        {SNIPPET_LANGUAGES.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowSnippet((v) => !v)}
                      className="text-xs font-semibold text-indigo underline underline-offset-2"
                    >
                      {showSnippet ? "Remove snippet" : "+ Add snippet"}
                    </button>
                  </div>
                </div>
                {showSnippet && (
                  <>
                    <Textarea
                      name="snippetCode"
                      rows={8}
                      value={snippetCode}
                      onChange={(e) => setSnippetCode(e.target.value)}
                      spellCheck={false}
                      className="border-indigo-dark bg-indigo-dark font-mono text-xs text-white placeholder:text-white/40"
                      placeholder="class A { ... }"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Shown to students read-only, with syntax highlighting. Copy is disabled.
                    </p>
                  </>
                )}
              </div>
            )}

            <div>
              {answerType === "NUMERIC" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className={labelClass}>Correct value</Label>
                    <Input name="numericAnswer" required defaultValue={existing?.numericAnswer ?? ""} className="h-10" />
                  </div>
                  <div>
                    <Label className={labelClass}>Tolerance ±</Label>
                    <Input name="numericTolerance" defaultValue={existing?.numericTolerance ?? "0"} className="h-10" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label className={labelClass}>Options</Label>
                    <span className="text-[11px] text-muted-foreground">
                      {answerType === "SINGLE" ? "Select the radio to mark the correct answer" : "Check every correct answer"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(["A", "B", "C", "D"] as const).map((letter) => {
                      const isCorrect = answerType === "SINGLE" ? correctSingle === letter : correctMultiple.includes(letter);
                      return (
                        <div
                          key={letter}
                          className={`flex items-center gap-2.5 rounded-lg p-2 ${
                            isCorrect ? "border border-green-400 bg-green-50" : "border border-transparent bg-cream"
                          }`}
                        >
                          <input
                            type={answerType === "SINGLE" ? "radio" : "checkbox"}
                            name={answerType === "SINGLE" ? "correctOption" : "correctOptions"}
                            value={letter}
                            checked={isCorrect}
                            onChange={() =>
                              answerType === "SINGLE" ? setCorrectSingle(letter) : toggleMultiple(letter)
                            }
                            className="accent-green-600"
                          />
                          <span
                            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isCorrect ? "bg-green-600 text-white" : "bg-white text-indigo"
                            }`}
                          >
                            {letter}
                          </span>
                          <input
                            name={`option${letter}`}
                            value={options[letter]}
                            onChange={(e) => setOptions((prev) => ({ ...prev, [letter]: e.target.value }))}
                            className={`${inputClass} h-9 flex-1 bg-white font-mono text-xs`}
                          />
                          {isCorrect && <span className="shrink-0 text-[10px] font-bold uppercase text-green-700">Correct</span>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {kind === "technical" && showSnippet && (
              <div>
                <Button type="button" variant="outline" disabled={isVerifying} onClick={runVerify} className="border-border text-indigo">
                  {isVerifying ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
                  Run snippet to verify answer
                </Button>
                {verifyState?.output && (
                  <p className="mt-2 rounded-lg bg-indigo-dark px-3 py-2 font-mono text-xs text-green-300">
                    Output: {verifyState.output}
                  </p>
                )}
                {verifyState?.error && (
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-indigo-dark px-3 py-2 font-mono text-xs text-red-300">
                    {verifyState.error}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label className={labelClass}>Solution / explanation (shown only in the admin report)</Label>
              <Textarea name="explanation" rows={2} defaultValue={existing?.explanation ?? ""} className="text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <Label className={labelClass}>Marks (correct)</Label>
                <Input name="marks" type="number" min={1} max={10} defaultValue={existing?.marks ?? 1} className="h-10" />
              </div>
              <div>
                <Label className={labelClass}>Negative marks</Label>
                <Input name="negativeMarks" type="number" min={0} defaultValue={existing?.negativeMarks ?? 0} className="h-10" />
              </div>
              <div>
                <Label className={labelClass}>Difficulty</Label>
                <select name="difficulty" defaultValue={existing?.difficulty ?? "MEDIUM"} className={selectClass}>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className={labelClass}>Tags</Label>
                <Input name="tags" defaultValue={existing?.tags ?? ""} className="h-10" placeholder="comma, separated" />
              </div>
            </div>

            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Student preview</p>
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-base font-semibold text-indigo">{sectionName}</p>
              <p className="text-xs text-muted-foreground">≡ MCQ{topic ? ` · ${topic}` : ""}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-indigo">{questionText || "Your question text will appear here."}</p>
              {showSnippet && snippetCode && (
                <pre className="mt-3 overflow-x-auto rounded-lg bg-indigo-dark p-3 font-mono text-xs text-white">{snippetCode}</pre>
              )}
              {answerType !== "NUMERIC" && (
                <div className="mt-3 space-y-1.5">
                  {(["A", "B", "C", "D"] as const).map((letter) => (
                    <label key={letter} className="flex items-center gap-2 rounded-lg bg-cream px-2.5 py-1.5 text-sm text-indigo">
                      <input type={answerType === "SINGLE" ? "radio" : "checkbox"} disabled className="accent-indigo" />
                      {options[letter] || <span className="text-muted-foreground">Option {letter}</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-3">
              <ReadinessBox missing={missing} />
            </div>
          </div>

          <div className="col-span-full -mx-6 mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border px-6 pt-5 sm:-mx-8 sm:px-8">
            <Button type="button" variant="outline" onClick={() => router.push(backHref)} className="border-border text-indigo">
              Cancel
            </Button>
            <div className="flex gap-2">
              {!existing && (
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setAddAnother(true)}
                  className="border-border text-indigo"
                >
                  Save &amp; Add Another
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending}
                onClick={() => setAddAnother(false)}
                className="bg-indigo text-white hover:bg-indigo/90"
              >
                {isPending && <Loader2 className="size-3.5 animate-spin" />}
                Save Question
              </Button>
            </div>
          </div>
        </form>
      </BuilderCard>
      <BuilderFooter />
    </div>
  );
}
