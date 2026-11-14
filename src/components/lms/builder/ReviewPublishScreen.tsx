import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuilderHeader, BuilderCard, BuilderFooter, StepCircles, Pill } from "./shared";

export function ReviewPublishScreen({
  assessment,
  backHref,
  sections,
  draftCodingQuestions,
}: {
  assessment: { id: string; title: string; published: boolean };
  backHref: string;
  sections: { name: string; questionCount: number; totalMarks: number }[];
  draftCodingQuestions: { id: string; questionText: string; sectionName: string | null }[];
}) {
  const totalQuestions = sections.reduce((sum, s) => sum + s.questionCount, 0);
  const totalMarks = sections.reduce((sum, s) => sum + s.totalMarks, 0);
  const blocked = draftCodingQuestions.length > 0 || totalQuestions === 0;

  return (
    <div>
      <BuilderHeader backHref={`${backHref}&step=2`} backLabel="Back to Assessment" breadcrumb={assessment.title} title="Review & Publish" />
      <BuilderCard>
        <StepCircles current={4} />

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-cream p-4 text-center">
            <p className="text-2xl font-bold text-indigo">{sections.length}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Sections</p>
          </div>
          <div className="rounded-xl bg-cream p-4 text-center">
            <p className="text-2xl font-bold text-indigo">{totalQuestions}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Questions</p>
          </div>
          <div className="rounded-xl bg-cream p-4 text-center">
            <p className="text-2xl font-bold text-indigo">{totalMarks}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total Marks</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {sections.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm">
              <span className="font-medium text-indigo">{s.name}</span>
              <span className="text-muted-foreground">{s.questionCount} questions · {s.totalMarks} marks</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          {blocked ? (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-red-700">
                <AlertTriangle className="size-4" /> Publishing is blocked
              </p>
              <ul className="mt-2 space-y-1 text-xs text-red-700">
                {totalQuestions === 0 && <li>— Add at least one question.</li>}
                {draftCodingQuestions.map((q) => (
                  <li key={q.id}>
                    — &quot;{q.questionText.slice(0, 60)}&quot; in {q.sectionName ?? "its section"} hasn&apos;t passed validation —{" "}
                    <Link
                      href={`${backHref}&screen=add-coding&sectionName=${encodeURIComponent(q.sectionName ?? "")}&questionId=${q.id}`}
                      className="underline"
                    >
                      Fix
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-lg border border-green-300 bg-green-50 p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
                <CheckCircle2 className="size-4" /> Everything checks out — ready to send to students.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5">
          <Button type="button" variant="outline" render={<Link href={`${backHref}&step=2`} />} nativeButton={false} className="border-border text-indigo">
            ‹ Back to Edit
          </Button>
          {assessment.published && <Pill variant="success">Published</Pill>}
          <Button
            disabled={blocked}
            render={<Link href={`${backHref}&mode=send`} />}
            nativeButton={false}
            className="bg-indigo text-white hover:bg-indigo/90 disabled:pointer-events-none disabled:opacity-50"
          >
            Finish &amp; Send to Students ›
          </Button>
        </div>
      </BuilderCard>
      <BuilderFooter />
    </div>
  );
}
