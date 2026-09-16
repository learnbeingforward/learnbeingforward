import { Reveal } from "@/components/shared/Reveal";
import { getLucideIcon } from "@/lib/lucide-catalog";

export type HomeFeatureItem = { id: string; icon: string; title: string; description: string };

export function WhatWeDo({ items }: { items: HomeFeatureItem[] }) {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-indigo sm:text-4xl">What We Do</h2>
          <p className="mt-3 text-muted-foreground">
            {items.length} pillars that take students from the classroom to career-ready.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = getLucideIcon(item.icon);
            return (
              <Reveal key={item.id} delay={i * 0.08}>
                <div className="h-full rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
                    {Icon && <Icon className="size-5.5" />}
                  </div>
                  <h3 className="text-base font-semibold text-indigo">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
