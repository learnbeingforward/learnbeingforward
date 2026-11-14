"use client";

// Screen 4 — "Add Coding Question" (9-section builder). Left nav lists the 9
// sections in fill-order; content below runs through them in the same order.
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  addAssessmentQuestion,
  updateAssessmentQuestion,
  runReferenceAgainstInput,
  validateCodingQuestion,
  type AddQuestionState,
  type ValidationCheck,
} from "@/lib/actions/assessments";
import { BuilderHeader, BuilderCard, BuilderFooter, inputClass, selectClass, labelClass, Pill } from "./shared";

const LANGUAGES = [
  { key: "python", label: "Python 3" },
  { key: "java", label: "Java" },
  { key: "c", label: "C" },
  { key: "cpp", label: "C++" },
] as const;
type LangKey = (typeof LANGUAGES)[number]["key"];
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

type TestCase = { id: string; isHidden: boolean; label: string; input: string; expectedOutput: string; weight: number };

export type ExistingCodingQuestion = {
  id: string;
  questionText: string;
  title: string | null;
  marks: number;
  topic: string | null;
  difficulty: string | null;
  timeLimitSeconds: number | null;
  inputFormat: string | null;
  outputFormat: string | null;
  constraints: string | null;
  sampleInput: string | null;
  sampleOutput: string | null;
  sampleExplanation: string | null;
  starterCode: string | null;
  editableRanges: string | null;
  referenceSolutionLanguage: string | null;
  referenceSolution: string | null;
  adminNote: string | null;
  scoringMode: string | null;
  submissionsMode: string | null;
  submissionsLimit: number | null;
  status: string | null;
  testCases: { id: string; isHidden: boolean; label: string | null; input: string; expectedOutput: string; weight: number | null }[];
};

const SECTIONS = [
  "Basics",
  "Problem statement",
  "Input & output format",
  "Constraints",
  "Sample & explanation",
  "Test cases",
  "Boilerplate (4 languages)",
  "Reference solution",
  "Validate & run rules",
];

let nextId = 0;
function tcId() {
  nextId += 1;
  return `new-${nextId}`;
}

export function CodingQuestionBuilder({
  assessmentId,
  assessmentTitle,
  sectionName,
  backHref,
  progressLabel,
  existing,
}: {
  assessmentId: string;
  assessmentTitle: string;
  sectionName: string;
  backHref: string;
  progressLabel?: string;
  existing?: ExistingCodingQuestion;
}) {
  const router = useRouter();
  const action = existing ? updateAssessmentQuestion.bind(null, existing.id) : addAssessmentQuestion.bind(null, assessmentId);
  const [state, formAction, isPending] = useActionState<AddQuestionState, FormData>(action, null);

  const starterMap = useMemo(() => {
    try {
      return JSON.parse(existing?.starterCode || "{}") as Record<string, string>;
    } catch {
      return {};
    }
  }, [existing]);
  const rangesMap = useMemo(() => {
    try {
      return JSON.parse(existing?.editableRanges || "{}") as Record<string, { enabled: boolean; range: string }>;
    } catch {
      return {};
    }
  }, [existing]);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [questionText, setQuestionText] = useState(existing?.questionText ?? "");
  const [sampleInput, setSampleInput] = useState(existing?.sampleInput ?? "");
  const [sampleOutput, setSampleOutput] = useState(existing?.sampleOutput ?? "");
  const [addSampleAsTest1, setAddSampleAsTest1] = useState(!existing);
  const [testCases, setTestCases] = useState<TestCase[]>(
    existing?.testCases.map((tc) => ({
      id: tc.id,
      isHidden: tc.isHidden,
      label: tc.label ?? "",
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      weight: tc.weight ?? 0,
    })) ?? []
  );
  const [activeLang, setActiveLang] = useState<LangKey>("python");
  const [enabledLangs, setEnabledLangs] = useState<Record<LangKey, boolean>>({
    python: rangesMap.python?.enabled !== false,
    java: rangesMap.java?.enabled !== false,
    c: rangesMap.c?.enabled !== false,
    cpp: rangesMap.cpp?.enabled !== false,
  });
  const [starterCode, setStarterCode] = useState<Record<LangKey, string>>({
    python: starterMap.python ?? "",
    java: starterMap.java ?? "",
    c: starterMap.c ?? "",
    cpp: starterMap.cpp ?? "",
  });
  const [editableRange, setEditableRange] = useState<Record<LangKey, string>>({
    python: rangesMap.python?.range ?? "",
    java: rangesMap.java?.range ?? "",
    c: rangesMap.c?.range ?? "",
    cpp: rangesMap.cpp?.range ?? "",
  });
  const [refLanguage, setRefLanguage] = useState(existing?.referenceSolutionLanguage ?? "python");
  const [refSolution, setRefSolution] = useState(existing?.referenceSolution ?? "");
  const [scoringMode, setScoringMode] = useState(existing?.scoringMode ?? "PARTIAL");
  const [submissionsMode, setSubmissionsMode] = useState(existing?.submissionsMode ?? "UNLIMITED_LAST");

  const [genBusy, setGenBusy] = useState<string | null>(null);
  const [isGenerating, startGenerate] = useTransition();
  const [checks, setChecks] = useState<ValidationCheck[] | null>(null);
  const [validateError, setValidateError] = useState<string | null>(null);
  const [isValidating, startValidate] = useTransition();

  useEffect(() => {
    if (state?.ok) router.push(backHref);
  }, [state, router, backHref]);

  function addTestCase(hidden: boolean) {
    setTestCases((prev) => [...prev, { id: tcId(), isHidden: hidden, label: "", input: "", expectedOutput: "", weight: 0 }]);
  }
  function updateTestCase(id: string, patch: Partial<TestCase>) {
    setTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, ...patch } : tc)));
  }
  function removeTestCase(id: string) {
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
  }

  function generateForTestCase(id: string) {
    const tc = testCases.find((t) => t.id === id);
    if (!tc) return;
    setGenBusy(id);
    startGenerate(async () => {
      const result = await runReferenceAgainstInput(refLanguage, refSolution, tc.input);
      if (result.ok) updateTestCase(id, { expectedOutput: result.output.trimEnd() });
      setGenBusy(null);
    });
  }

  function runValidate() {
    if (!existing) return;
    setValidateError(null);
    startValidate(async () => {
      const result = await validateCodingQuestion(existing.id);
      if (result.ok) setChecks(result.checks ?? []);
      else setValidateError(result.error ?? "Couldn't validate.");
    });
  }

  const allTestCases: TestCase[] = addSampleAsTest1
    ? [{ id: "sample", isHidden: false, label: "Sample", input: sampleInput, expectedOutput: sampleOutput, weight: 0 }, ...testCases]
    : testCases;
  const visibleCount = allTestCases.filter((t) => !t.isHidden).length;
  const hiddenCount = allTestCases.filter((t) => t.isHidden).length;
  const totalWeight = allTestCases.reduce((sum, t) => sum + (t.weight || 0), 0);
  const status = existing?.status ?? "DRAFT";

  return (
    <div>
      <BuilderHeader
        backHref={backHref}
        backLabel="Back to Assessment"
        breadcrumb={`${assessmentTitle} › Section · ${sectionName} · Coding`}
        title={existing ? "Edit coding question" : "New coding question"}
        rightSlot={progressLabel ? <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">{progressLabel}</span> : null}
      />
      <BuilderCard>
        <form action={formAction} className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Hidden form-data mirror of client state. Wrapped in one display:none
             div so none of these (including the per-test-case <span> wrappers)
             become stray CSS grid items in the 2-column layout below. */}
          <div style={{ display: "none" }}>
            <input type="hidden" name="questionType" value="CODING" />
            <input type="hidden" name="sectionName" value={sectionName} />
            {(["python", "java", "c", "cpp"] as const).map((l) => (
              <input key={l} type="hidden" name={`starter${l.charAt(0).toUpperCase() + l.slice(1)}`} value={starterCode[l]} readOnly />
            ))}
            {(["python", "java", "c", "cpp"] as const).map((l) => (
              <input key={`en-${l}`} type="hidden" name={`enabled${l.charAt(0).toUpperCase() + l.slice(1)}`} value={enabledLangs[l] ? "on" : "off"} readOnly />
            ))}
            {(["python", "java", "c", "cpp"] as const).map((l) => (
              <input key={`rg-${l}`} type="hidden" name={`range${l.charAt(0).toUpperCase() + l.slice(1)}`} value={editableRange[l]} readOnly />
            ))}
            {allTestCases.map((tc) => (
              <span key={tc.id}>
                <input type="hidden" name="testCaseInput" value={tc.input} readOnly />
                <input type="hidden" name="testCaseOutput" value={tc.expectedOutput} readOnly />
                <input type="hidden" name="testCaseHidden" value={tc.isHidden ? "true" : "false"} readOnly />
                <input type="hidden" name="testCaseLabel" value={tc.label} readOnly />
                <input type="hidden" name="testCaseWeight" value={tc.weight} readOnly />
              </span>
            ))}
          </div>

          {/* LEFT NAV */}
          <aside className="hidden lg:block">
            <div className="sticky top-4 rounded-xl border border-border bg-cream p-3">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Fill in this order</p>
              <ul className="space-y-0.5">
                {SECTIONS.map((label, i) => (
                  <li key={label}>
                    <a href={`#sec-${i + 1}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-indigo hover:bg-white">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-indigo/30 text-[10px] font-bold">
                        {i + 1}
                      </span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* CONTENT */}
          <div className="space-y-8">
            <section id="sec-1">
              <SectionHeading n={1} title="Basics" />
              <Label className={labelClass}>Question title</Label>
              <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10" placeholder="e.g. First Occurrence in a Sorted Array" />
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <Label className={labelClass}>Difficulty</Label>
                  <select name="difficulty" defaultValue={existing?.difficulty ?? "MEDIUM"} className={selectClass}>
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className={labelClass}>Topic</Label>
                  <Input name="topic" defaultValue={existing?.topic ?? ""} className="h-10" placeholder="Binary Search" />
                </div>
                <div>
                  <Label className={labelClass}>Time limit (sec)</Label>
                  <Input name="timeLimitSeconds" type="number" min={1} max={30} defaultValue={existing?.timeLimitSeconds ?? 8} className="h-10" />
                </div>
                <div>
                  <Label className={labelClass}>Marks</Label>
                  <Input name="marks" type="number" min={1} max={50} defaultValue={existing?.marks ?? 10} className="h-10" />
                </div>
              </div>
            </section>

            <section id="sec-2">
              <SectionHeading n={2} title="Problem statement" />
              <Textarea
                name="questionText"
                required
                rows={6}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="text-sm"
                placeholder="Describe the problem..."
              />
            </section>

            <section id="sec-3">
              <SectionHeading n={3} title="Input &amp; output format" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className={labelClass}>Input format</Label>
                  <Textarea name="inputFormat" rows={3} defaultValue={existing?.inputFormat ?? ""} className="font-mono text-xs" />
                </div>
                <div>
                  <Label className={labelClass}>Output format</Label>
                  <Textarea name="outputFormat" rows={3} defaultValue={existing?.outputFormat ?? ""} className="font-mono text-xs" />
                </div>
              </div>
            </section>

            <section id="sec-4">
              <SectionHeading n={4} title="Constraints" />
              <Textarea name="constraints" rows={3} defaultValue={existing?.constraints ?? ""} className="font-mono text-xs" placeholder={"1 ≤ N ≤ 10^5"} />
            </section>

            <section id="sec-5">
              <SectionHeading n={5} title="Sample input, output &amp; explanation" />
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label className={labelClass}>Sample input</Label>
                  <Textarea name="sampleInput" rows={4} value={sampleInput} onChange={(e) => setSampleInput(e.target.value)} className="bg-cream font-mono text-xs" />
                </div>
                <div>
                  <Label className={labelClass}>Sample output</Label>
                  <Textarea name="sampleOutput" rows={4} value={sampleOutput} onChange={(e) => setSampleOutput(e.target.value)} className="bg-cream font-mono text-xs" />
                </div>
                <div>
                  <Label className={labelClass}>Explanation</Label>
                  <Textarea name="sampleExplanation" rows={4} defaultValue={existing?.sampleExplanation ?? ""} className="text-xs" />
                </div>
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs text-indigo">
                <input
                  type="checkbox"
                  checked={addSampleAsTest1}
                  onChange={(e) => setAddSampleAsTest1(e.target.checked)}
                  className="accent-indigo"
                />
                Also add this sample as visible Test 1
              </label>
            </section>

            <section id="sec-6">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <SectionHeading n={6} title={`Test cases · ${visibleCount} visible · ${hiddenCount} hidden`} noMargin />
                <Button type="button" size="sm" onClick={() => addTestCase(true)} className="bg-indigo text-white hover:bg-indigo/90">
                  <Plus className="size-3.5" /> Add Test Case
                </Button>
              </div>
              <div className="mb-3 rounded-lg bg-indigo/10 p-3 text-xs text-indigo">
                Visible = runs on RUN CODE and is shown to the student. Hidden = runs only on SUBMIT CODE; input never shown.
              </div>

              <div className="space-y-3">
                {addSampleAsTest1 && (
                  <div className="rounded-lg border border-border p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Pill variant="primary">Visible</Pill>
                      <span className="text-xs font-semibold text-indigo">Sample (Test 1, from above)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Uses the Sample input/output entered in section 5 — nothing else to fill in here.</p>
                  </div>
                )}
                {testCases.map((tc, i) => (
                  <div key={tc.id} className="rounded-lg border border-border p-3">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateTestCase(tc.id, { isHidden: !tc.isHidden })}
                      >
                        <Pill variant={tc.isHidden ? "hidden" : "primary"}>{tc.isHidden ? "Hidden" : "Visible"}</Pill>
                      </button>
                      <input
                        value={tc.label}
                        onChange={(e) => updateTestCase(tc.id, { label: e.target.value })}
                        placeholder={`Test ${i + 1 + (addSampleAsTest1 ? 1 : 0)} label`}
                        className="h-7 flex-1 rounded-md border border-border bg-white px-2 text-xs text-indigo"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={tc.weight}
                          onChange={(e) => updateTestCase(tc.id, { weight: Number.parseInt(e.target.value, 10) || 0 })}
                          className="h-7 w-16 rounded-md border border-border bg-white px-1.5 text-xs text-indigo"
                        />
                        <span className="text-[11px] text-muted-foreground">%</span>
                      </div>
                      <button type="button" onClick={() => removeTestCase(tc.id)} className="rounded p-1 text-red-500 hover:bg-red-50">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Textarea
                        rows={2}
                        value={tc.input}
                        onChange={(e) => updateTestCase(tc.id, { input: e.target.value })}
                        placeholder="Input"
                        className="font-mono text-xs"
                      />
                      <div className="relative">
                        <Textarea
                          rows={2}
                          value={tc.expectedOutput}
                          onChange={(e) => updateTestCase(tc.id, { expectedOutput: e.target.value })}
                          placeholder="Expected output"
                          className="font-mono text-xs"
                        />
                        <button
                          type="button"
                          disabled={isGenerating || !refSolution}
                          onClick={() => generateForTestCase(tc.id)}
                          className="absolute right-1.5 top-1.5 rounded bg-indigo px-1.5 py-0.5 text-[10px] font-semibold text-white disabled:opacity-40"
                        >
                          {genBusy === tc.id ? <Loader2 className="size-3 animate-spin" /> : "Generate"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalWeight > 0 && totalWeight !== 100 && (
                <p className="mt-2 text-xs font-semibold text-red-600">Weights add up to {totalWeight}%, not 100%.</p>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">
                Weights are optional — leave them at 0 to score by test count instead. &quot;Generate&quot; fills a test&apos;s expected
                output by running the reference solution below against its input.
              </p>
            </section>

            <section id="sec-7">
              <SectionHeading n={7} title="Boilerplate code" />
              <p className="mb-2 text-[11px] text-muted-foreground">
                Students see this in the editor. Note the editable line range below — the rest is explained as locked in the instructions.
              </p>
              <div className="rounded-lg border border-border">
                <div className="flex flex-wrap items-center gap-1 border-b border-border bg-cream px-2 py-1.5">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.key}
                      type="button"
                      onClick={() => setActiveLang(l.key)}
                      className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold ${
                        activeLang === l.key ? "bg-indigo text-white" : "text-indigo hover:bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={enabledLangs[l.key]}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setEnabledLangs((prev) => ({ ...prev, [l.key]: e.target.checked }))}
                        className="accent-green-500"
                      />
                      {l.label}
                    </button>
                  ))}
                </div>
                <Textarea
                  rows={10}
                  value={starterCode[activeLang]}
                  onChange={(e) => setStarterCode((prev) => ({ ...prev, [activeLang]: e.target.value }))}
                  spellCheck={false}
                  className="rounded-none border-0 bg-indigo-dark font-mono text-xs text-white placeholder:text-white/40 focus-visible:ring-0"
                  placeholder="Starter / boilerplate code for this language..."
                />
                <div className="flex items-center gap-2 border-t border-border p-2">
                  <Label className="text-[11px] text-muted-foreground">Editable by student (lines)</Label>
                  <input
                    value={editableRange[activeLang]}
                    onChange={(e) => setEditableRange((prev) => ({ ...prev, [activeLang]: e.target.value })) }
                    placeholder="e.g. 3-6"
                    className="h-7 w-24 rounded-md border border-border bg-white px-2 text-xs text-indigo"
                  />
                  <span className="text-[11px] text-muted-foreground">— rest of the file stays locked for the student.</span>
                </div>
              </div>
            </section>

            <section id="sec-8">
              <div className="mb-2 flex items-center gap-2">
                <SectionHeading n={8} title="Reference solution" noMargin />
                <Pill variant="danger">Never shown to students</Pill>
              </div>
              <p className="mb-2 text-[11px] text-muted-foreground">Used to check that every expected output is correct before you publish.</p>
              <select
                name="referenceSolutionLanguage"
                value={refLanguage}
                onChange={(e) => setRefLanguage(e.target.value)}
                className={`${selectClass} mb-2 max-w-[160px]`}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.key} value={l.key}>{l.label}</option>
                ))}
              </select>
              <Textarea
                name="referenceSolution"
                rows={8}
                value={refSolution}
                onChange={(e) => setRefSolution(e.target.value)}
                spellCheck={false}
                className="bg-indigo-dark font-mono text-xs text-white placeholder:text-white/40"
              />
              <div className="mt-2">
                <Label className={labelClass}>Why these test cases (admin note)</Label>
                <Textarea name="adminNote" rows={2} defaultValue={existing?.adminNote ?? ""} className="text-xs" />
              </div>
            </section>

            <section id="sec-9">
              <SectionHeading n={9} title="Validate &amp; run rules" noMargin />
              <div className="mt-2 grid gap-4 lg:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-indigo">Validation results</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isValidating || !existing}
                      onClick={runValidate}
                      className="h-7 border-border px-2 text-[11px] text-indigo"
                      title={existing ? undefined : "Save the question first"}
                    >
                      {isValidating ? <Loader2 className="size-3 animate-spin" /> : "↻ Re-validate"}
                    </Button>
                  </div>
                  {validateError && <p className="text-xs text-destructive">{validateError}</p>}
                  <div className="space-y-1.5">
                    {(checks ?? []).map((c) => (
                      <div
                        key={c.label}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                          c.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          {c.passed ? <CheckCircle2 className="size-3.5" /> : null}
                          {c.label}
                        </span>
                        <span className="font-mono text-[11px]">{c.detail}</span>
                      </div>
                    ))}
                    {!checks && (
                      <p className="rounded-lg bg-cream p-3 text-[11px] text-muted-foreground">
                        {existing
                          ? `Status: ${status === "VALIDATED" ? "✓ Validated" : "Draft — click Re-validate."}`
                          : "Save this question first, then come back and validate it."}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-cream p-3 text-[11px] text-indigo">
                    RUN CODE runs visible tests only. Shows input, expected output, student output and any compile or runtime
                    error. Not scored.
                  </div>
                  <div className="rounded-lg bg-cream p-3 text-[11px] text-indigo">
                    SUBMIT CODE runs all tests. For hidden tests the student sees only the verdict (Passed, Wrong answer, Time
                    limit exceeded, Runtime error), never the input.
                  </div>
                  <div>
                    <Label className={labelClass}>Scoring</Label>
                    <select name="scoringMode" value={scoringMode} onChange={(e) => setScoringMode(e.target.value)} className={selectClass}>
                      <option value="PARTIAL">Partial marks by test weight</option>
                      <option value="ALL_OR_NOTHING">All or nothing</option>
                    </select>
                  </div>
                  <div>
                    <Label className={labelClass}>Submissions allowed</Label>
                    <select name="submissionsMode" value={submissionsMode} onChange={(e) => setSubmissionsMode(e.target.value)} className={selectClass}>
                      <option value="UNLIMITED_LAST">Unlimited (last submission counts)</option>
                      <option value="UNLIMITED_BEST">Unlimited (best submission counts)</option>
                      <option value="LIMITED">Limited</option>
                    </select>
                    {submissionsMode === "LIMITED" && (
                      <Input name="submissionsLimit" type="number" min={1} defaultValue={existing?.submissionsLimit ?? 3} className="mt-2 h-9 max-w-[120px]" />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5">
              <Button type="button" variant="outline" onClick={() => router.push(backHref)} className="border-border text-indigo">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
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

function SectionHeading({ n, title, noMargin }: { n: number; title: string; noMargin?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${noMargin ? "" : "mb-3"}`}>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo/10 text-xs font-bold text-indigo">{n}</span>
      <h3 className="text-sm font-bold text-indigo" dangerouslySetInnerHTML={{ __html: title }} />
    </div>
  );
}
