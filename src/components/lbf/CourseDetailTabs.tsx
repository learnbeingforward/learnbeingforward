"use client";

import { useState } from "react";

const TABS = [
  { key: "learn", label: "What you'll learn" },
  { key: "format", label: "Format" },
  { key: "faqs", label: "FAQs" },
] as const;

/** The "What you'll learn / Format / FAQs" tab strip on a course detail page.
 * Only "What you'll learn" has real content (the track/module breakdown,
 * passed as children) — Format and FAQs aren't backed by any data yet. */
export function CourseDetailTabs({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("learn");

  return (
    <>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "learn" && children}
      {tab === "format" && <p className="muted">Format details for this course aren&apos;t published yet.</p>}
      {tab === "faqs" && <p className="muted">FAQs for this course aren&apos;t published yet.</p>}
    </>
  );
}
