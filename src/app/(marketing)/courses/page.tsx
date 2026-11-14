import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";
import { CoursesExplorer, type ExplorerCourse } from "@/components/lbf/CoursesExplorer";

export const metadata: Metadata = {
  title: "Courses",
  description: "Explore placement-focused technical training courses from Learn Being Forward.",
};

export const revalidate = 0;

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({ orderBy: { order: "asc" } });

  const explorerCourses: ExplorerCourse[] = courses.map((c) => ({
    slug: c.slug,
    name: c.name,
    blurb: c.shortDescription || c.description.slice(0, 140),
    domain: c.domain,
    flagship: c.slug === "placement-training-program",
  }));

  return (
    <PublicShell
      header={{
        active: "courses",
        eyebrow: "Courses",
        title: (
          <>
            Training built for <em>placement outcomes</em>
          </>
        ),
        description:
          "From our flagship Java & DSA program to focused frontend, backend, data and robotics courses — everything is built around what students need to get hired.",
      }}
    >
      <section className="card lift">
        <CoursesExplorer courses={explorerCourses} />
      </section>
    </PublicShell>
  );
}
