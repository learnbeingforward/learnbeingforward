import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getIconByName } from "@/lib/icon-catalog";
import { PublicShell } from "@/components/lbf/PublicShell";

export const metadata: Metadata = { title: "Technologies" };
export const revalidate = 0;

const CATEGORY_LABELS: Record<string, string> = {
  LANGUAGES: "Languages",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DATABASES: "Databases",
  TOOLS_DEVOPS: "Tools & DevOps",
  DATA_AI: "Data & AI",
  APTITUDE: "Aptitude",
  SOFT_SKILLS: "Soft skills",
  ROBOTICS: "Robotics",
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);
const GOLD_PILLS = new Set(["APTITUDE", "SOFT_SKILLS"]);

export default async function TechnologiesPage() {
  const technologies = await prisma.technology.findMany({ orderBy: { order: "asc" } });
  const byCategory = new Map<string, typeof technologies>();
  for (const t of technologies) {
    if (!byCategory.has(t.category)) byCategory.set(t.category, []);
    byCategory.get(t.category)!.push(t);
  }

  return (
    <PublicShell
      header={{
        active: "technologies",
        eyebrow: "Technologies",
        title: (
          <>
            Everything we teach, <em>in one place</em>
          </>
        ),
        description: "The languages, frameworks, tools and skill areas covered across our courses.",
      }}
    >
      <section className="card lift">
        <div className="grid" style={{ ["--min" as string]: "280px" }}>
          {CATEGORY_ORDER.filter((cat) => byCategory.has(cat)).map((cat) => {
            const items = byCategory.get(cat)!;
            return (
              <div key={cat} className="box">
                <div className="split">
                  <h2 className="h3">{CATEGORY_LABELS[cat]}</h2>
                  <span className={`pill${GOLD_PILLS.has(cat) ? " gold" : ""}`}>{items.length}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 14 }}>
                  {items.map((t) => {
                    const LogoIcon = getIconByName(t.iconName);
                    return (
                      <div key={t.id} title={t.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 76 }}>
                        <span className="icon-box" style={{ width: 44, height: 44 }}>
                          {LogoIcon && <LogoIcon size={22} />}
                        </span>
                        <span className="small muted" style={{ textAlign: "center" }}>{t.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PublicShell>
  );
}
