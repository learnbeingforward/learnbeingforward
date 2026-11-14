import type { Metadata } from "next";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: "Learn Being Forward's mission, pillars, and founder story.",
};

const PILLARS = [
  { icon: "book", title: "Courses", description: "Hands-on programming, full-stack, aptitude and soft-skills training built around real placement needs." },
  { icon: "building", title: "Campus partnerships", description: "Direct partnerships with schools, colleges, universities and companies bring training straight to students." },
  { icon: "briefcase", title: "Placements", description: "Structured placement support that carries students from classroom training into career outcomes." },
] as const;

export default function AboutPage() {
  return (
    <PublicShell
      header={{
        active: "about",
        eyebrow: "About us",
        title: (
          <>
            Building job-ready talent, <em>together</em>
          </>
        ),
        description: "A skills-training company working directly with schools, colleges & universities and companies — from classroom to career.",
      }}
    >
      <section className="card lift">
        <p style={{ fontSize: 16, maxWidth: 900 }}>
          Learn Being Forward builds job-ready talent through hands-on programming, full-stack development, aptitude
          and soft-skills training — backed by direct campus partnerships and placement support.
        </p>

        <div className="section">
          <div className="eyebrow">Our three pillars</div>
          <div className="grid" style={{ ["--min" as string]: "260px", marginTop: 16 }}>
            {PILLARS.map((p) => (
              <div key={p.title} className="box stack" style={{ gap: 10 }}>
                <span className="icon-box navy">
                  <Icon name={p.icon} size={20} />
                </span>
                <h3 className="h3">{p.title}</h3>
                <p className="muted">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="section box"
          style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", background: "var(--surface)", border: 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/founder-lohit-kumar.webp"
            alt="Lohit Kumar, Founder & Lead Trainer"
            style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", flex: "none" }}
          />
          <div style={{ flex: "1 1 420px" }}>
            <div className="eyebrow" style={{ color: "var(--gold-text)" }}>
              Founder &amp; lead trainer
            </div>
            <h2 className="h2" style={{ marginTop: 4 }}>
              Lohit Kumar
            </h2>
            <p className="muted" style={{ marginTop: 8 }}>
              A technical trainer who has personally trained students across 75+ colleges in programming, full-stack
              development, aptitude and placement preparation — and built the Learn Being Forward curriculum around
              where students actually fall short.
            </p>
          </div>
          <div className="grid" style={{ ["--min" as string]: "120px", flex: "1 1 300px" }}>
            <div className="tile" style={{ background: "#fff" }}>
              <div className="label">Colleges</div>
              <div className="value">75+</div>
            </div>
            <div className="tile" style={{ background: "#fff" }}>
              <div className="label">Experience</div>
              <div className="value">4+ yrs</div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
