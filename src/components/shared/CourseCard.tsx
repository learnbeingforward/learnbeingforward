import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Course } from "@/data/courses";
import { getTechsBySlugs } from "@/data/technologies";
import { Reveal } from "@/components/shared/Reveal";

export function CourseCard({ course, delay = 0 }: { course: Course; delay?: number }) {
  const techs = getTechsBySlugs(course.techSlugs).slice(0, 5);

  return (
    <Reveal delay={delay}>
      <Link
        href={`/courses/${course.slug}`}
        className="group flex h-full flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
      >
        {course.isPlaceholder && (
          <span className="mb-3 inline-block w-fit rounded-full bg-gold/25 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo">
            Placeholder syllabus
          </span>
        )}
        <h3 className="text-lg font-semibold text-indigo">{course.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {course.shortDescription}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {techs.map((tech) => {
            const Icon = tech.icon;
            return <Icon key={tech.slug} className="size-5 text-indigo/70" title={tech.name} />;
          })}
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo">
          View curriculum
          <ArrowRight className="size-4 text-gold transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </Reveal>
  );
}
