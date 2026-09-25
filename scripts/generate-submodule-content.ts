import { PrismaClient } from "@prisma/client";
import { renderSubModulePdf } from "./render-submodule-pdf";
import type { CourseSubModuleContentData } from "./content/submodule-types";
import path from "node:path";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function loadAllCourseData(): Promise<CourseSubModuleContentData[]> {
  const modules = await Promise.all([
    import("./content/submodules/placement-training-program-technical"),
    import("./content/submodules/quantitative-aptitude"),
    import("./content/submodules/logical-reasoning"),
    import("./content/submodules/verbal-reasoning"),
    import("./content/submodules/non-verbal-reasoning"),
    import("./content/submodules/soft-skills"),
    import("./content/submodules/full-stack-development"),
    import("./content/submodules/frontend-development"),
    import("./content/submodules/backend-development"),
    import("./content/submodules/data-science-ai-fundamentals"),
  ]);
  return modules.map((m) => m.default as CourseSubModuleContentData);
}

async function main() {
  const allCourseData = await loadAllCourseData();
  const outRoot = path.join(process.cwd(), "public", "uploads", "course-content", "submodules");

  let generated = 0;
  const touchedModuleIds = new Set<string>();

  // Group content by courseSlug in case any course's content is split across files.
  const bySlug = new Map<string, CourseSubModuleContentData["submodules"]>();
  for (const courseData of allCourseData) {
    const list = bySlug.get(courseData.courseSlug) ?? [];
    list.push(...courseData.submodules);
    bySlug.set(courseData.courseSlug, list);
  }

  for (const [courseSlug, submodules] of bySlug.entries()) {
    const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
    if (!course) {
      console.warn(`Skipping unknown course slug: ${courseSlug}`);
      continue;
    }

    const dbModules = await prisma.courseModule.findMany({
      where: { courseId: course.id },
      include: { subModules: true },
    });

    for (const smContent of submodules) {
      const dbModule = dbModules.find((m) => m.title === smContent.moduleTitle);
      if (!dbModule) {
        console.warn(`  [${course.name}] Skipping unknown module "${smContent.moduleTitle}"`);
        continue;
      }
      const dbSubModule = dbModule.subModules.find((sm) => sm.title === smContent.subModuleTitle);
      if (!dbSubModule) {
        console.warn(`  [${course.name} / ${dbModule.title}] Skipping unknown sub-module "${smContent.subModuleTitle}"`);
        continue;
      }

      const fileSlug = slugify(`${smContent.moduleTitle}-${smContent.subModuleTitle}`);
      const outDir = path.join(outRoot, courseSlug);
      await renderSubModulePdf(course.name, smContent, outDir, fileSlug);
      const fileUrl = `/uploads/course-content/submodules/${courseSlug}/${fileSlug}.pdf`;

      const existing = await prisma.courseContent.findFirst({
        where: { courseId: course.id, courseSubModuleId: dbSubModule.id },
      });

      if (existing) {
        await prisma.contentLink.deleteMany({ where: { courseContentId: existing.id } });
        await prisma.courseContent.update({
          where: { id: existing.id },
          data: {
            title: smContent.subModuleTitle,
            fileUrl,
            courseModuleId: dbModule.id,
            links: { create: smContent.links.map((l, i) => ({ label: l.label, url: l.url, order: i })) },
          },
        });
      } else {
        await prisma.courseContent.create({
          data: {
            courseId: course.id,
            courseModuleId: dbModule.id,
            courseSubModuleId: dbSubModule.id,
            title: smContent.subModuleTitle,
            fileUrl,
            links: { create: smContent.links.map((l, i) => ({ label: l.label, url: l.url, order: i })) },
          },
        });
      }

      touchedModuleIds.add(dbModule.id);
      generated++;
      console.log(`Generated: ${course.name} — ${dbModule.title} — ${smContent.subModuleTitle}`);
    }
  }

  // Retire the old module-level (no sub-module) content rows for modules that
  // now have real sub-module content, since the new navigation drills straight
  // from module -> sub-module and a leftover flat module PDF would just be a
  // confusing duplicate entry.
  let retired = 0;
  for (const moduleId of touchedModuleIds) {
    const staleModuleLevel = await prisma.courseContent.findMany({
      where: { courseModuleId: moduleId, courseSubModuleId: null },
    });
    for (const row of staleModuleLevel) {
      await prisma.contentAccessRequest.deleteMany({ where: { courseContentId: row.id } });
      await prisma.contentLink.deleteMany({ where: { courseContentId: row.id } });
      await prisma.courseContent.delete({ where: { id: row.id } });
      retired++;
    }
  }

  console.log(`\nDone. Generated ${generated} sub-module PDFs. Retired ${retired} superseded module-level PDFs.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
