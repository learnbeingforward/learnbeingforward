import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";

export const metadata: Metadata = {
  title: "Coding Pattern Artifacts",
  description: "Interactive visualisers for all 14 DSA coding-pattern levels from Learn Being Forward.",
};

const LEVELS = [
  { file: "level-01.html", name: "Programming Basics" },
  { file: "level-02.html", name: "Arrays and Strings" },
  { file: "level-03.html", name: "Searching and Sorting" },
  { file: "level-04.html", name: "Hashing" },
  { file: "level-05.html", name: "Linked Lists" },
  { file: "level-06.html", name: "Stacks and Queues" },
  { file: "level-07.html", name: "Recursion and Backtracking" },
  { file: "level-08.html", name: "Trees" },
  { file: "level-09.html", name: "Heaps" },
  { file: "level-10.html", name: "Graphs" },
  { file: "level-11.html", name: "Greedy" },
  { file: "level-12.html", name: "Dynamic Programming" },
  { file: "level-13.html", name: "Bit Manipulation" },
  { file: "level-14.html", name: "Advanced Patterns" },
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
            <a
              key={level.file}
              className="box hover stack"
              style={{ gap: 12, textDecoration: "none", color: "inherit" }}
              href={`/coding-patterns/${level.file}`}
            >
              <div className="split">
                <span className="icon-box navy">
                  <Icon name="grid" size={20} />
                </span>
                <span className="pill gold">Level {String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="h3">{level.name}</h3>
              <span style={{ fontWeight: 600, color: "var(--navy)" }}>Open visualiser →</span>
            </a>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
