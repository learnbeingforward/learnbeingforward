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

export function CoursesExplorer({ courses }: { courses: ExplorerCourse[] }) {
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
                        <Icon name={DOMAIN_ICONS[c.domain]} size={20} />
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
                      <Icon name={DOMAIN_ICONS[c.domain]} size={20} />
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
          <div className="split" style={{ margin: "32px 0 14px" }}>
            <h2 className="label" style={{ margin: 0 }}>Coding Patterns</h2>
            <Link href="/coding-patterns" className="small" style={{ fontWeight: 600, color: "var(--navy)" }}>
              View all artifacts →
            </Link>
          </div>
          <div className="grid" style={{ ["--min" as string]: "240px" }}>
            {filteredLevels.map((level, i) => (
              <Link
                key={level.slug}
                className="list-row"
                style={{ textDecoration: "none", color: "inherit" }}
                href={`/coding-patterns/${level.slug}`}
              >
                <span className="icon-box gold">
                  <Icon name="grid" size={20} />
                </span>
                <span className="grow">
                  <span className="h3" style={{ display: "block" }}>
                    Level {String(i + 1).padStart(2, "0")} · {level.name}
                  </span>
                  <span className="muted small">Interactive DSA pattern visualiser</span>
                </span>
                <Icon name="chevR" size={16} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && !showCodingPatterns && <p className="empty">No courses match your search.</p>}
    </>
  );
}
