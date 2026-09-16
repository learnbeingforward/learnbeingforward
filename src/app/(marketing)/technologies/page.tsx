import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Reveal } from "@/components/shared/Reveal";
import { prisma } from "@/lib/prisma";
import { getIconByName } from "@/lib/icon-catalog";
import { TECH_CATEGORY_LABELS, TECH_CATEGORY_ORDER } from "@/lib/tech-categories";

export const metadata: Metadata = {
  title: "Technologies",
  description: "Every technology, language, and skill area taught across Learn Being Forward's courses.",
};

export const revalidate = 0;

export default async function TechnologiesPage() {
  const technologies = await prisma.technology.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <PageHero
        eyebrow="Technologies"
        title="Everything we teach, in one place"
        description="A full grid of the languages, frameworks, tools, and skill areas covered across our courses."
      />

      <section className="pb-24">
        <div className="container-page space-y-14">
          {TECH_CATEGORY_ORDER.map((category) => {
            const items = technologies.filter((t) => t.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category}>
                <Reveal>
                  <h2 className="mb-5 text-xl font-semibold text-indigo">
                    {TECH_CATEGORY_LABELS[category]}
                  </h2>
                </Reveal>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {items.map((tech, i) => {
                    const Icon = getIconByName(tech.iconName);
                    if (!Icon) return null;
                    return (
                      <Reveal key={tech.slug} delay={i * 0.03}>
                        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white px-3 py-5 text-center shadow-sm">
                          <Icon className="size-9 text-indigo" aria-hidden />
                          <span className="text-xs font-medium text-muted-foreground">
                            {tech.name}
                          </span>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
