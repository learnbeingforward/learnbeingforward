"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setSectionShuffle, searchQuestionBank, copyQuestionFromBank, type BankQuestion } from "@/lib/actions/assessments";
import { Pill } from "./shared";

const KIND_META = {
  APTITUDE: { icon: "≡", pill: "MCQ" },
  TECHNICAL: { icon: "▣", pill: "MCQ + CODE SNIPPETS" },
  CODING: { icon: "</>", pill: "CODE · 4 LANGUAGES" },
} as const;

export function SectionCard({
  assessmentId,
  backHref,
  name,
  kind,
  questionCount,
  totalMarks,
  shuffleEnabled,
  selected,
  onSelect,
}: {
  assessmentId: string;
  backHref: string;
  name: string;
  kind: "APTITUDE" | "TECHNICAL" | "CODING";
  questionCount: number;
  totalMarks: number;
  shuffleEnabled: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const meta = KIND_META[kind];
  const [shuffle, setShuffle] = useState(shuffleEnabled);
  const [isSavingShuffle, startShuffle] = useTransition();
  const [bankOpen, setBankOpen] = useState(false);
  const [bankQuery, setBankQuery] = useState("");
  const [bankResults, setBankResults] = useState<BankQuestion[]>([]);
  const [isSearching, startSearch] = useTransition();
  const [isAdding, startAdd] = useTransition();

  function toggleShuffle() {
    const next = !shuffle;
    setShuffle(next);
    startShuffle(() => setSectionShuffle(assessmentId, name, next));
  }

  function runBankSearch(q: string) {
    setBankQuery(q);
    startSearch(async () => {
      const results = await searchQuestionBank(kind, q, assessmentId);
      setBankResults(results);
    });
  }

  function addFromBank(questionId: string) {
    startAdd(async () => {
      await copyQuestionFromBank(assessmentId, questionId, name);
    });
  }

  const addHref = `${backHref}&screen=add-${kind.toLowerCase()}&sectionName=${encodeURIComponent(name)}`;

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border bg-white p-4 ${selected ? "border-indigo ring-1 ring-indigo" : "border-border"} ${onSelect ? "cursor-pointer" : ""}`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-indigo/10 text-lg text-indigo">{meta.icon}</div>
        <Pill variant="primary">{meta.pill}</Pill>
      </div>
      <p className="text-base font-bold text-indigo">{name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{questionCount === 0 ? "No questions yet" : `${questionCount} question${questionCount !== 1 ? "s" : ""}`}</p>
      <div className="mt-3 flex items-center gap-4 text-xs text-indigo">
        <span><strong>{questionCount}</strong> questions</span>
        <span><strong>{totalMarks}</strong> marks</span>
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs text-indigo">
        <input type="checkbox" checked={shuffle} onChange={toggleShuffle} disabled={isSavingShuffle} className="accent-indigo" />
        Shuffle question order per student
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={addHref}>
          <Button type="button" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
            + Create Question
          </Button>
        </Link>
        <Button type="button" size="sm" variant="outline" onClick={() => setBankOpen((v) => !v)} className="border-border text-indigo">
          Add From Bank
        </Button>
      </div>

      {bankOpen && (
        <div className="mt-3 rounded-lg border border-dashed border-border bg-cream p-3">
          <div className="flex items-center gap-2">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              value={bankQuery}
              onChange={(e) => runBankSearch(e.target.value)}
              placeholder="Search existing questions..."
              className="h-8 flex-1 rounded-md border border-border bg-white px-2 text-xs text-indigo outline-none"
            />
            {isSearching && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          </div>
          <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">
            {bankResults.length === 0 && !isSearching && (
              <p className="py-2 text-center text-[11px] text-muted-foreground">
                {bankQuery ? "No matches." : "Type to search other assessments' questions."}
              </p>
            )}
            {bankResults.map((q) => (
              <div key={q.id} className="flex items-center justify-between gap-2 rounded-md bg-white p-2 text-xs">
                <div className="min-w-0">
                  <p className="truncate text-indigo">{q.questionText}</p>
                  <p className="text-[10px] text-muted-foreground">{q.assessmentTitle} · {q.marks} marks</p>
                </div>
                <Button type="button" size="sm" variant="outline" disabled={isAdding} onClick={() => addFromBank(q.id)} className="h-7 shrink-0 border-border px-2 text-[10px] text-indigo">
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
