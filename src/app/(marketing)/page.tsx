import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLucideIcon } from "@/lib/lucide-catalog";
import { getIconByName } from "@/lib/icon-catalog";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";

export const revalidate = 0;

const MARQUEE_SLUGS = [
  "c", "cpp", "java", "python", "csharp", "javascript", "react", "angular",
  "vue", "nodejs", "django", "spring-boot", "dotnet", "mysql", "mongodb", "git",
];

const STATS = [
  { label: "Languages taught", value: "6+" },
  { label: "Frameworks covered", value: "10+" },
  { label: "Colleges trained", value: "75+", gold: true },
  { label: "Students placement-ready", value: "1000s" },
];

const WHO_WE_TRAIN = [
  { icon: "book", title: "School students", note: "Programming foundations and robotics" },
  { icon: "building", title: "Colleges & universities", note: "Placement training on campus" },
  { icon: "briefcase", title: "Corporate freshers", note: "Onboarding bootcamps" },
] as const;

export default async function HomePage() {
  const [homeFeatures, allTechnologies, featuredListings] = await Promise.all([
    prisma.homeFeature.findMany({ orderBy: { order: "asc" } }),
    prisma.technology.findMany({ orderBy: { order: "asc" } }),
    prisma.buyListing.findMany({ where: { enabled: true, featured: true, audience: "PUBLIC" }, include: { course: true }, take: 4 }),
  ]);

  const marqueeTech = allTechnologies.filter((t) => MARQUEE_SLUGS.includes(t.slug));
  const techChips = marqueeTech.length > 0 ? marqueeTech : allTechnologies.slice(0, 16);

  return (
    <PublicShell
      header={{
        active: "home",
        tall: true,
        eyebrow: "Placement-focused technical training",
        title: (
          <>
            Learn Being <em>Future-Ready</em>
          </>
        ),
        description:
          "We deliver placement-focused technical training to school students, college & university students, and corporate freshers — through direct partnerships with colleges and companies.",
        actions: (
          <>
            <Link className="btn btn-gold" href="/courses">
              Explore courses <Icon name="arrowR" size={16} />
            </Link>
            <Link className="btn btn-ghost-light" href="/contact">
              Partner with us
            </Link>
          </>
        ),
      }}
    >
      <section className="card lift">
        <div className="grid" style={{ ["--min" as string]: "200px" }}>
          {STATS.map((s) => (
            <div key={s.label} className={`tile${s.gold ? " gold" : ""}`}>
              <div className="label">{s.label}</div>
              <div className="value">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="section">
          <div className="eyebrow">What we do</div>
          <h2 className="title" style={{ marginTop: 6 }}>
            {homeFeatures.length} pillars that take students from the classroom to career-ready
          </h2>
          <div className="grid" style={{ ["--min" as string]: "250px", marginTop: 20 }}>
            {homeFeatures.map((f) => {
              const FeatureIcon = getLucideIcon(f.icon);
              return (
                <article key={f.id} className="box hover stack" style={{ gap: 12 }}>
                  <span className="icon-box navy">{FeatureIcon && <FeatureIcon size={20} />}</span>
                  <h3 className="h3">{f.title}</h3>
                  <p className="muted">{f.description}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="section">
          <div className="split">
            <div>
              <div className="eyebrow">Technologies</div>
              <h2 className="h2" style={{ marginTop: 6 }}>
                What students learn with us
              </h2>
            </div>
            <Link href="/technologies">See all technologies →</Link>
          </div>
          <div style={{ position: "relative", overflow: "hidden", marginTop: 20, borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
            <div
              style={{
                position: "absolute",
                inset: "0 auto 0 0",
                width: 64,
                zIndex: 1,
                background: "linear-gradient(to right, var(--card), transparent)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "0 0 0 auto",
                width: 64,
                zIndex: 1,
                background: "linear-gradient(to left, var(--card), transparent)",
                pointerEvents: "none",
              }}
            />
            <div className="animate-marquee" style={{ display: "flex", width: "max-content", padding: "20px 0" }}>
              {[...techChips, ...techChips].map((t, i) => {
                const LogoIcon = getIconByName(t.iconName);
                return (
                  <div
                    key={`${t.id}-${i}`}
                    title={t.name}
                    style={{ display: "flex", flexShrink: 0, width: 130, flexDirection: "column", alignItems: "center", gap: 8, padding: "0 16px" }}
                  >
                    {LogoIcon && <LogoIcon size={40} color="var(--navy)" />}
                    <span className="small muted" style={{ textAlign: "center" }}>{t.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="section">
          <div className="eyebrow">Who we train</div>
          <div className="grid" style={{ ["--min" as string]: "260px", marginTop: 14 }}>
            {WHO_WE_TRAIN.map((w) => (
              <div key={w.title} className="list-row">
                <span className="icon-box gold">
                  <Icon name={w.icon} size={20} />
                </span>
                <div className="grow">
                  <div className="h3">{w.title}</div>
                  <div className="muted small">{w.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredListings.length > 0 && (
        <section className="card section">
          <div className="split" style={{ marginBottom: 14 }}>
            <div className="eyebrow">Own the course</div>
            <Link href="/buy" className="small" style={{ fontWeight: 600, color: "var(--navy)" }}>
              See all books →
            </Link>
          </div>
          <div className="grid" style={{ ["--min" as string]: "240px" }}>
            {featuredListings.map((listing) => {
              const off = listing.mrp && listing.mrp > listing.price ? Math.round((1 - listing.price / listing.mrp) * 100) : 0;
              return (
                <Link key={listing.id} className="box hover stack" style={{ gap: 8, textDecoration: "none", color: "inherit" }} href={`/buy/${listing.course.slug}`}>
                  <h3 className="h3">{listing.course.name}</h3>
                  {listing.headline && <p className="small muted">{listing.headline}</p>}
                  <span style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700, fontSize: 18, color: "var(--navy)" }}>₹{listing.price}</span>
                    {off > 0 && <span className="pill success">{off}% off</span>}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section
        className="card section"
        style={{
          background: "var(--navy)",
          color: "#fff",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <h2 className="title" style={{ color: "#fff" }}>
            Ready to build a placement-ready cohort?
          </h2>
          <p style={{ color: "var(--on-navy-muted)", marginTop: 8 }}>
            Partner with Learn Being Forward for campus training programs, or explore our courses to see what we teach.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn btn-gold" href="/contact">
            Partner with us
          </Link>
          <Link className="btn btn-ghost-light" href="/courses">
            Explore courses
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
