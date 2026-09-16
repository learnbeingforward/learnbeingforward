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
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <CourseCard key={course.slug} course={course} techLookup={techLookup} delay={i * 0.06} />
          ))}
        </div>
      </section>
    </>
  );
}
