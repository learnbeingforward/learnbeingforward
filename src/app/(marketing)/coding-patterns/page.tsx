import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";
import { CODING_PATTERN_LEVELS as LEVELS } from "@/lib/coding-patterns";

export const metadata: Metadata = {
  title: "Coding Pattern Artifacts",
  description: "Interactive visualisers for all 14 DSA coding-pattern levels from Learn Being Forward.",
};

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
