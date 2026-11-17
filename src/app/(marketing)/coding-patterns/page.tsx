import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";

export const metadata: Metadata = {
  title: "Coding Pattern Artifacts",
  description: "Interactive visualisers for all 14 DSA coding-pattern levels from Learn Being Forward.",
};

const LEVELS = [
  { slug: "level-01", name: "Programming Basics" },
  { slug: "level-02", name: "Arrays and Strings" },
  { slug: "level-03", name: "Searching and Sorting" },
  { slug: "level-04", name: "Hashing" },
  { slug: "level-05", name: "Linked Lists" },
  { slug: "level-06", name: "Stacks and Queues" },
  { slug: "level-07", name: "Recursion and Backtracking" },
  { slug: "level-08", name: "Trees" },
  { slug: "level-09", name: "Heaps" },
  { slug: "level-10", name: "Graphs" },
  { slug: "level-11", name: "Greedy" },
  { slug: "level-12", name: "Dynamic Programming" },
  { slug: "level-13", name: "Bit Manipulation" },
  { slug: "level-14", name: "Advanced Patterns" },
] as const;

export default function CodingPatternArtifactsPage() {
  return (
    <PublicShell
      header={{
        active: "courses",
        eyebrow: "Coding Pattern Artifacts",
        title: (
          <>
            14 levels, 100 <em>DSA coding patterns</em>
          </>
        ),
        description: "Interactive visualisers for every level — Java by default, with a Python toggle inside each one.",
      }}
    >
      <section className="card lift">
        <div className="grid" style={{ ["--min" as string]: "260px" }}>
          {LEVELS.map((level, i) => (
            <Link
              key={level.slug}
              className="box hover stack"
              style={{ gap: 12, textDecoration: "none", color: "inherit" }}
              href={`/coding-patterns/${level.slug}`}
            >
              <div className="split">
                <span className="icon-box navy">
                  <Icon name="grid" size={20} />
                </span>
                <span className="pill gold">Level {String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="h3">{level.name}</h3>
              <span style={{ fontWeight: 600, color: "var(--navy)" }}>Open visualiser →</span>
            </Link>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
