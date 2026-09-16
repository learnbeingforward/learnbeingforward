import { Code2, Brain, GraduationCap, Building2 } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

const items = [
  {
    icon: Code2,
    title: "Programming & Full-Stack Training",
    description: "Hands-on training in languages and frameworks that make students job-ready developers.",
  },
  {
    icon: Brain,
    title: "Aptitude & Soft-Skills Training",
    description: "Quantitative, logical and verbal reasoning alongside communication and interview readiness.",
  },
  {
    icon: GraduationCap,
    title: "Placement Support & Campus Partnerships",
    description: "Direct campus partnerships that connect classroom training to real placement outcomes.",
  },
  {
    icon: Building2,
    title: "Corporate Onboarding Training",
    description: "Structured onboarding programs that get corporate freshers productive, faster.",
  },
];

export function WhatWeDo() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-indigo sm:text-4xl">What We Do</h2>
          <p className="mt-3 text-muted-foreground">
            Four pillars that take students from the classroom to career-ready.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="h-full rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
                  <item.icon className="size-5.5" />
                </div>
                <h3 className="text-base font-semibold text-indigo">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
