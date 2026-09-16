import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";
import { BlobBackground } from "@/components/shared/BlobBackground";
import { TechIconRow } from "@/components/shared/TechIconRow";
import { ModuleCard } from "@/components/shared/ModuleCard";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json-array";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) return {};
  return { title: course.name, description: course.shortDescription ?? course.description.slice(0, 140) };
}

export default async function CourseDetailPage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const [course, technologies] = await Promise.all([
    prisma.course.findUnique({
      where: { slug },
      include: { modules: { orderBy: { order: "asc" } } },
    }),
    prisma.technology.findMany(),
  ]);
  if (!course) notFound();

  const techLookup = new Map(technologies.map((t) => [t.slug, { name: t.name, iconName: t.iconName }]));
  const heroTechs = parseJsonArray(course.techSlugs)
    .map((tslug) => {
      const tech = techLookup.get(tslug);
      return tech ? { slug: tslug, ...tech } : null;
    })
    .filter((t): t is { slug: string; name: string; iconName: string } => Boolean(t));

  const trackTitles = Array.from(new Set(course.modules.map((m) => m.trackTitle)));

  return (
    <>
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20">
        <BlobBackground />
        <div className="container-page relative">
          <Reveal>
            <Link href="/courses" className="text-sm font-medium text-indigo hover:underline">
              &larr; All courses
            </Link>

            {course.isPlaceholder && (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-gold/40 bg-gold/10 p-4 text-sm text-indigo">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold" />
                <p>
                  <strong>Placeholder curriculum.</strong> No real syllabus has been provided for
                  this course yet — the outline below is a reasonable generic structure and needs
                  to be replaced with real content.
                </p>
              </div>
            )}

            <h1 className="mt-6 max-w-2xl text-3xl font-bold text-indigo sm:text-4xl md:text-5xl">
              {course.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {course.description}
            </p>

            <TechIconRow techs={heroTechs} className="mt-6" />
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <Reveal>
            <h2 className="text-2xl font-bold text-indigo sm:text-3xl">What You&apos;ll Learn</h2>
          </Reveal>

          <div className="mt-10 space-y-12">
            {trackTitles.map((trackTitle) => (
              <div key={trackTitle}>
                <h3 className="mb-5 text-lg font-semibold text-indigo">{trackTitle}</h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {course.modules
                    .filter((m) => m.trackTitle === trackTitle)
                    .map((mod, i) => (
                      <ModuleCard key={mod.id} module={mod} techLookup={techLookup} delay={i * 0.05} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-page">
          <Reveal>
            <div className="rounded-2xl bg-indigo px-6 py-12 text-center text-white sm:px-14">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Want this course for your college or company?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-white/70">
                Talk to us about bringing the {course.name} curriculum to your students or new
                hires.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  render={<Link href="/contact" />}
                  nativeButton={false}
                  size="lg"
                  className="bg-gold text-indigo hover:bg-gold/90"
                >
                  Enroll your college
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  render={<Link href="/contact" />}
                  nativeButton={false}
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  Contact us about this course
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
