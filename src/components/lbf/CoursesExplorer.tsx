"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "./icons";
import { CODING_PATTERN_LEVELS } from "@/lib/coding-patterns";

export type ExplorerCourse = {
  slug: string;
  name: string;
  blurb: string;
  domain: "TECHNICAL" | "APTITUDE" | "SOFT_SKILL";
  flagship: boolean;
};

const DOMAIN_ICONS: Record<string, IconName> = {
  TECHNICAL: "code",
  APTITUDE: "target",
  SOFT_SKILL: "message",
};

// Per-course icons, matching the design exactly — falls back to the domain's
// default icon for any course slug not listed here.
const COURSE_ICONS: Record<string, IconName> = {
  "placement-training-program": "code",
  "full-stack-development": "layers",
  "frontend-development": "grid",
  "backend-development": "settings",
  "data-science-ai-fundamentals": "chart",
  robotics: "target",
  programming: "file",
  "quantitative-aptitude": "target",
  "logical-reasoning": "layers",
  "verbal-reasoning": "book",
  "non-verbal-reasoning": "grid",
  "soft-skills": "message",
};

const TABS = [
  { key: "ALL", label: "All" },
  { key: "TECHNICAL", label: "Technical" },
  { key: "APTITUDE", label: "Aptitude" },
  { key: "SOFT_SKILL", label: "Soft skills" },
  { key: "CODING_PATTERNS", label: "Coding patterns" },
] as const;

const GROUP_LABELS: Record<string, string> = {
  TECHNICAL: "Technical courses",
  APTITUDE: "Aptitude training",
  SOFT_SKILL: "Soft skills",
};

export function CoursesExplorer({ courses, codingPatternsPrice }: { courses: ExplorerCourse[]; codingPatternsPrice: number }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("ALL");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      ALL: courses.length + CODING_PATTERN_LEVELS.length,
      TECHNICAL: courses.filter((c) => c.domain === "TECHNICAL").length,
      APTITUDE: courses.filter((c) => c.domain === "APTITUDE").length,
      SOFT_SKILL: courses.filter((c) => c.domain === "SOFT_SKILL").length,
      CODING_PATTERNS: CODING_PATTERN_LEVELS.length,
    }),
    [courses]
  );

  const filtered = courses.filter((c) => {
    if (tab !== "ALL" && tab !== c.domain) return false;
    if (query.trim() && !c.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  const q = query.trim().toLowerCase();
  const filteredLevels = CODING_PATTERN_LEVELS.filter((l) => !q || l.name.toLowerCase().includes(q));
  const showCodingPatterns = (tab === "ALL" || tab === "CODING_PATTERNS") && filteredLevels.length > 0;

  const groups: ExplorerCourse["domain"][] = ["TECHNICAL", "APTITUDE", "SOFT_SKILL"];

  return (
    <>
      <div className="toolbar">
        <div className="tabs" role="tablist" style={{ margin: 0, border: 0 }}>
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
              {t.label} ({counts[t.key]})
            </button>
          ))}
        </div>
        <label className="search">
          <Icon name="search" size={16} />
          <input
            className="input"
            type="search"
            placeholder="Search courses"
            aria-label="Search courses"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {groups.map((domain) => {
        const inGroup = filtered.filter((c) => c.domain === domain);
        if (inGroup.length === 0) return null;
        return (
          <div key={domain}>
            <h2 className="label" style={{ margin: domain === "TECHNICAL" ? "8px 0 14px" : "32px 0 14px" }}>
              {GROUP_LABELS[domain]}
            </h2>
            {domain === "TECHNICAL" ? (
              <div className="grid" style={{ ["--min" as string]: "280px" }}>
                {inGroup.map((c) => (
                  <Link key={c.slug} className="box hover stack" style={{ gap: 12, textDecoration: "none", color: "inherit" }} href={`/courses/${c.slug}`}>
                    <div className="split">
                      <span className="icon-box navy">
                        <Icon name={COURSE_ICONS[c.slug] ?? DOMAIN_ICONS[c.domain]} size={20} />
                      </span>
                      {c.flagship && <span className="pill gold">Flagship</span>}
                    </div>
                    <h3 className="h3">{c.name}</h3>
                    <p className="muted">{c.blurb}</p>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>View curriculum →</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid" style={{ ["--min" as string]: "240px" }}>
                {inGroup.map((c) => (
                  <Link key={c.slug} className="list-row" style={{ textDecoration: "none", color: "inherit" }} href={`/courses/${c.slug}`}>
                    <span className="icon-box gold">
                      <Icon name={COURSE_ICONS[c.slug] ?? DOMAIN_ICONS[c.domain]} size={20} />
                    </span>
                    <span className="grow">
                      <span className="h3" style={{ display: "block" }}>{c.name}</span>
                      <span className="muted small">{c.blurb}</span>
                    </span>
                    <Icon name="chevR" size={16} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {showCodingPatterns && (
        <div>
          <h2 className="label" style={{ margin: "32px 0 14px" }}>Coding patterns</h2>
          <div className="cp-feature">
            <div className="cp-f-text">
              <div className="cp-num" style={{ color: "var(--gold)" }}>
                Interactive · 14 levels · 100 patterns
              </div>
              <h3>Coding Pattern Visualisers</h3>
              <p>
                Watch every DSA pattern run step by step, with the code line highlighted as it happens. The first
                pattern in each level is free; the rest come with the Coding Patterns course.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                <Link className="btn btn-gold" href="/coding-patterns">
                  <Icon name="play" size={16} />
                  Open Coding Patterns
                </Link>
                <Link className="btn cp-f-ghost" href="/buy/coding-patterns">
                  <Icon name="cart" size={16} />
                  Get the full course · ₹{codingPatternsPrice}
                </Link>
              </div>
            </div>
            <div className="cp-f-levels">
              {filteredLevels.map((level, i) => (
                <Link key={level.slug} className="cp-chip" href={`/coding-patterns/${level.slug}`}>
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  {level.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && !showCodingPatterns && <p className="empty">No courses match your search.</p>}
    </>
  );
}
