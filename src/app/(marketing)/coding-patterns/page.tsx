import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";
import { CODING_PATTERN_LEVELS, TOTAL_CODING_PATTERNS } from "@/lib/coding-patterns";
import { hasFullCodingPatternsAccess } from "@/lib/coding-patterns-access";

export const metadata: Metadata = {
  title: "Coding Patterns",
  description: "Watch each data-structure and algorithm pattern run step by step, with the code line highlighted as it happens.",
};

export default async function CodingPatternsHubPage() {
  const owned = await hasFullCodingPatternsAccess();

  return (
    <PublicShell
      header={{
        active: "courses",
        eyebrow: "Coding Patterns",
        title: (
          <>
            100 patterns, <em>14 levels</em>
          </>
        ),
        description: "Watch each data-structure and algorithm pattern run step by step, with the code line highlighted as it happens.",
      }}
    >
      <section className="card lift">
        {owned ? (
          <div className="alert success" style={{ marginBottom: 16 }}>
            <Icon name="check" size={18} />
            <span>You own Coding Patterns — every pattern is unlocked.</span>
          </div>
        ) : (
          <div className="alert gold" style={{ marginBottom: 16 }}>
            <Icon name="lock" size={18} />
            <span>
              The first pattern in every level is free.{" "}
              <Link href="/buy/coding-patterns" style={{ color: "inherit", fontWeight: 700 }}>
                Get the course
              </Link>{" "}
              to unlock all {TOTAL_CODING_PATTERNS} patterns.
            </span>
          </div>
        )}
        <div className="cp-grid">
          {CODING_PATTERN_LEVELS.map((level, i) => (
            <Link key={level.slug} className="cp-card" href={`/coding-patterns/${level.slug}`}>
              <span className="cp-num">Level {String(i + 1).padStart(2, "0")}</span>
              <b>{level.name}</b>
              <small>
                {level.patternCount} patterns · {owned ? "all unlocked" : `1 free, ${level.patternCount - 1} with the course`}
              </small>
              <span className="cp-dots">
                {Array.from({ length: Math.min(level.patternCount, 6) }).map((_, dotIndex) => (
                  <i key={dotIndex} />
                ))}
              </span>
              <span className="cp-go">
                Open visualiser <Icon name="arrowR" size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="card">
        <div className="split" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 className="h3">Want the full notes for every pattern?</h2>
            <p className="muted small">All 14 course books with worked examples and practice problems.</p>
          </div>
          <Link className="btn btn-gold" href="/buy/coding-patterns">
            Get the Coding Patterns books
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
