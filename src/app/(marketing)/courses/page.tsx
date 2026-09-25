import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { CourseCard } from "@/components/shared/CourseCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Courses",
  description: "Explore placement-focused technical training courses from Learn Being Forward.",
};

export const revalidate = 0;

export default async function CoursesPage() {
  const [courses, technologies] = await Promise.all([
    prisma.course.findMany({ orderBy: { order: "asc" } }),
    prisma.technology.findMany(),
  ]);
  const techLookup = new Map(technologies.map((t) => [t.slug, { name: t.name, iconName: t.iconName }]));

  return (
    <>
      <PageHero
        eyebrow="Courses"
        title="Training built for placement outcomes"
        description="From our flagship multi-track placement program to focused frontend, backend, data, and robotics courses — everything is built around what students actually need to get hired."
      />

      <section className="pb-24">
        <div className="container-page space-y-14">
          {DOMAIN_ORDER.map((domain) => {
            const domainCourses = courses.filter((c) => c.domain === domain);
            if (domainCourses.length === 0) return null;
            return (
              <div key={domain}>
                <h2 className="mb-6 text-xl font-bold text-indigo">{DOMAIN_LABELS[domain]}</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {domainCourses.map((course, i) => (
                    <CourseCard key={course.slug} course={course} techLookup={techLookup} delay={i * 0.06} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

const DOMAIN_ORDER = ["TECHNICAL", "APTITUDE", "SOFT_SKILL"] as const;
const DOMAIN_LABELS: Record<(typeof DOMAIN_ORDER)[number], string> = {
  TECHNICAL: "Technical Courses",
  APTITUDE: "Aptitude Training",
  SOFT_SKILL: "Soft Skills",
};
