import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json-array";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";

export const revalidate = 0;

export async function generateMetadata({ params }: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) return {};
  return { title: course.name, description: course.shortDescription ?? course.description.slice(0, 140) };
}

const DOMAIN_LABEL: Record<string, string> = {
  TECHNICAL: "Technical",
  APTITUDE: "Aptitude",
  SOFT_SKILL: "Soft skills",
};

export default async function CourseDetailPage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const [course, technologies] = await Promise.all([
    prisma.course.findUnique({ where: { slug }, include: { modules: { orderBy: { order: "asc" } } } }),
    prisma.technology.findMany(),
  ]);
  if (!course) notFound();

  const techLookup = new Map(technologies.map((t) => [t.slug, t.name]));
  const heroTechs = parseJsonArray(course.techSlugs)
    .map((s) => techLookup.get(s))
    .filter((n): n is string => Boolean(n));

  const trackTitles = Array.from(new Set(course.modules.map((m) => m.trackTitle)));
  const flagship = course.slug === "placement-training-program";

  return (
    <PublicShell
      header={{
        active: "courses",
        heroContent: (
          <div className="container" style={{ marginTop: 40 }}>
            <Link href="/courses" style={{ color: "var(--on-navy-muted)", textDecoration: "none", fontSize: 13 }}>
              ← All courses
            </Link>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginTop: 10 }}>
              <div style={{ maxWidth: 760 }}>
                <span className="pill gold">
                  {flagship ? "Flagship · " : ""}
                  {DOMAIN_LABEL[course.domain]}
                </span>
                <h1 style={{ color: "#fff", fontSize: 38, marginTop: 10 }}>{course.name}</h1>
                <p style={{ color: "var(--on-navy-muted)", marginTop: 10 }}>{course.description}</p>
              </div>
              {heroTechs.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {heroTechs.map((t) => (
                    <span key={t} className="pill on-navy">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ),
      }}
    >
      <div className="row lift">
        <section className="card grow">
          {course.isPlaceholder && (
            <p className="alert warning" style={{ marginBottom: 20 }}>
              <strong>Placeholder curriculum.</strong>&nbsp;No real syllabus has been provided for this course yet —
              the outline below needs to be replaced with real content.
            </p>
          )}

          {trackTitles.map((trackTitle) => {
            const mods = course!.modules.filter((m) => m.trackTitle === trackTitle);
            return (
              <div key={trackTitle} style={{ marginTop: trackTitle === trackTitles[0] ? 0 : 28 }}>
                <h2 className="label">{trackTitle}</h2>
                <div className="stack" style={{ gap: 12, marginTop: 12 }}>
                  {mods.map((mod, i) => {
                    const topics = parseJsonArray(mod.topics);
                    const globalIndex = course!.modules.findIndex((m) => m.id === mod.id) + 1;
                    return (
                      <details key={mod.id} className="box" open={i === 0 && trackTitle === trackTitles[0]}>
                        <summary className="split" style={{ cursor: "pointer", listStyle: "none" }}>
                          <span className="h3">
                            {String(globalIndex).padStart(2, "0")} · {mod.title}
                          </span>
                          <span className="pill">{topics.length} topics</span>
                        </summary>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                          {topics.map((t) => (
                            <span key={t} className="chip">
                              {t}
                            </span>
                          ))}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        <aside className="side stack">
          <div className="card stack" style={{ gap: 16 }}>
            <div className="h3">Course at a glance</div>
            <div className="list-row">
              <span className="icon-box">
                <Icon name="layers" size={18} />
              </span>
              <div className="grow">
                <div className="label">Modules</div>
                <div className="strong">
                  {course.modules.length} modules · {trackTitles.length} track{trackTitles.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div className="list-row">
              <span className="icon-box">
                <Icon name="users" size={18} />
              </span>
              <div className="grow">
                <div className="label">Delivery</div>
                <div>On campus or online</div>
              </div>
            </div>
            <div className="list-row">
              <span className="icon-box">
                <Icon name="award" size={18} />
              </span>
              <div className="grow">
                <div className="label">Outcome</div>
                <div>Capstone + mock interviews</div>
              </div>
            </div>
          </div>
          <div className="card" style={{ background: "var(--navy)", color: "#fff" }}>
            <h3 className="h3" style={{ color: "#fff" }}>
              Want this course for your college or company?
            </h3>
            <p style={{ color: "var(--on-navy-muted)", marginTop: 8 }}>
              Talk to us about bringing the {course.name} curriculum to your students or new hires.
            </p>
            <div className="stack" style={{ gap: 10, marginTop: 16 }}>
              <Link className="btn btn-gold" href="/contact">
                Enroll your college
              </Link>
              <Link className="btn btn-ghost-light" href="/contact">
                Contact us about this course
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </PublicShell>
  );
}
