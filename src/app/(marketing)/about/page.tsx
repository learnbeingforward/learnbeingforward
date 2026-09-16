import type { Metadata } from "next";
import { GraduationCap, Handshake, Rocket } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Reveal } from "@/components/shared/Reveal";

export const metadata: Metadata = {
  title: "About",
  description: "Learn Being Forward's mission, pillars, and founder story.",
};

const pillars = [
  {
    icon: GraduationCap,
    title: "Courses",
    description: "Hands-on programming, full-stack, aptitude, and soft-skills training built around real placement needs.",
  },
  {
    icon: Handshake,
    title: "Campus Partnerships",
    description: "Direct partnerships with schools, colleges, universities, and companies bring training straight to students.",
  },
  {
    icon: Rocket,
    title: "Placements",
    description: "Structured placement support that carries students from classroom training into career outcomes.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Building job-ready talent, together"
        description="Learn Being Forward is a skills-training company working directly with schools, colleges & universities, and companies. We build job-ready talent through hands-on programming, full-stack development, aptitude and soft-skills training — backed by direct campus partnerships and placement support from classroom to career."
      />

      <section className="py-20">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-indigo sm:text-3xl">Our Three Pillars</h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 0.08}>
                <div className="h-full rounded-xl border border-border bg-white p-7 text-center shadow-sm">
                  <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full bg-indigo/10 text-indigo">
                    <pillar.icon className="size-6" />
                  </div>
                  <h3 className="font-semibold text-indigo">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-page">
          <Reveal>
            <div className="grid gap-10 rounded-2xl border border-border bg-white p-8 sm:grid-cols-[auto_1fr] sm:p-12">
              <div className="mx-auto flex size-32 shrink-0 items-center justify-center rounded-full bg-indigo/10 text-4xl font-bold text-indigo sm:size-40">
                LK
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo">
                  Founder &amp; Lead Trainer
                </p>
                <h2 className="mt-1 text-2xl font-bold text-indigo sm:text-3xl">Lohit Kumar</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Lohit Kumar is a technical trainer who has personally trained students across
                  75+ colleges in programming, full-stack development, aptitude, and placement
                  preparation. He has worked closely with students right before their campus
                  placements, and built the Learn Being Forward curriculum around where students
                  actually fall short.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
