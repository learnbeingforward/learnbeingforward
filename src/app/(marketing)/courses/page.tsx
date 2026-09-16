import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { CourseCard } from "@/components/shared/CourseCard";
import { courses } from "@/data/courses";

export const metadata: Metadata = {
  title: "Courses",
  description: "Explore placement-focused technical training courses from Learn Being Forward.",
};

export default function CoursesPage() {
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
            <CourseCard key={course.slug} course={course} delay={i * 0.06} />
          ))}
        </div>
      </section>
    </>
  );
}
