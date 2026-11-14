// Shared visual shell for the 5 Admin/Creator-builder screens (Create
// Assessment, Add Aptitude Question, Add Technical Question, Add Coding
// Question, and the Run/Submit panels) — one header band + pulled-up white
// card so every screen reads as one system, in the company's own palette
// only (indigo/gold/cream — no colours outside the existing theme tokens).
import Link from "next/link";

export const selectClass =
  "h-10 w-full rounded-lg border border-border bg-white px-2.5 text-sm text-indigo outline-none focus-visible:border-indigo";
export const inputClass =
  "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-indigo outline-none focus-visible:border-indigo";
export const labelClass = "mb-1.5 block text-xs font-semibold text-indigo";
export const sectionLabelClass = "text-[11px] font-bold uppercase tracking-wide text-muted-foreground";

export function BuilderHeader({
  backHref,
  backLabel,
  breadcrumb,
  title,
  rightSlot,
}: {
  backHref?: string;
  backLabel?: string;
  breadcrumb?: string;
  title: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="-mx-4 rounded-t-2xl bg-indigo px-6 pb-24 pt-6 text-white sm:-mx-6 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-4">
        <div>
          {backHref ? (
            <Link href={backHref} className="text-xs font-semibold uppercase tracking-wide text-white/60 hover:text-white">
              ← {backLabel ?? "Back"}
            </Link>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Admin · Assessment Builder</p>
          )}
        </div>
        <div className="text-center">
          {breadcrumb && <p className="text-xs text-white/50">{breadcrumb}</p>}
          <h1 className="mt-0.5 text-xl font-bold">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">{rightSlot}</div>
      </div>
    </div>
  );
}

export function BuilderCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto -mt-20 max-w-6xl rounded-2xl border border-border bg-white p-6 shadow-lg sm:p-8">
      {children}
    </div>
  );
}

export function BuilderFooter() {
  return <p className="mt-8 text-center text-[11px] text-muted-foreground">Powered by Learn Being Forward</p>;
}

export function StepCircles({ current }: { current: 1 | 2 | 3 | 4 }) {
  const steps = [
    { n: 1, label: "Details" },
    { n: 2, label: "Sections & questions" },
    { n: 3, label: "Proctoring & rules" },
    { n: 4, label: "Review & publish" },
  ] as const;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-5">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          <div
            className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              s.n <= current ? "bg-indigo text-white" : "border border-border text-muted-foreground"
            }`}
          >
            {s.n}
          </div>
          <span className={`text-sm font-semibold ${s.n === current ? "text-indigo" : s.n < current ? "text-indigo/70" : "text-muted-foreground"}`}>
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="mx-2 h-px w-8 bg-border sm:w-16" />}
        </div>
      ))}
    </div>
  );
}

type PillVariant = "primary" | "success" | "warning" | "danger" | "hidden" | "draft" | "neutral";

const PILL_CLASSES: Record<PillVariant, string> = {
  primary: "bg-indigo/10 text-indigo",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  hidden: "bg-indigo-dark text-white",
  draft: "bg-cream text-muted-foreground border border-border",
  neutral: "bg-cream text-indigo",
};

export function Pill({ children, variant = "neutral" }: { children: React.ReactNode; variant?: PillVariant }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${PILL_CLASSES[variant]}`}>
      {children}
    </span>
  );
}

export function InfoBox({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg bg-cream p-3 text-xs text-indigo">{children}</div>;
}

export function ReadinessBox({ missing }: { missing: string[] }) {
  if (missing.length === 0) {
    return (
      <div className="rounded-lg bg-green-50 p-3 text-xs font-medium text-green-700">
        ✓ Ready to save — all required fields are filled in.
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
      ✗ Still needed: {missing.join(", ")}.
    </div>
  );
}
