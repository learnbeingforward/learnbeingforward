import { PrismaClient } from "@prisma/client";
import { renderModulePdf } from "./render-pdf";
import type { CourseContentData } from "./content/types";
import path from "node:path";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function loadAllCourseData(): Promise<CourseContentData[]> {
  const modules = await Promise.all([
    import("./content/placement-training-program"),
    import("./content/full-stack-development"),
    import("./content/frontend-development"),
    import("./content/backend-development"),
    import("./content/data-science-ai-fundamentals"),
    import("./content/robotics"),
  ]);
  return modules.map((m) => m.default as CourseContentData);
}

async function main() {
  const allCourseData = await loadAllCourseData();
  const outRoot = path.join(process.cwd(), "public", "uploads", "course-content");

  let generated = 0;

  for (const courseData of allCourseData) {
    const course = await prisma.course.findUnique({ where: { slug: courseData.courseSlug } });
    if (!course) {
      console.warn(`Skipping unknown course slug: ${courseData.courseSlug}`);
      continue;
    }

    const dbModules = await prisma.courseModule.findMany({ where: { courseId: course.id } });

    for (const moduleContent of courseData.modules) {
      const dbModule = dbModules.find((m) => m.title === moduleContent.moduleTitle);
      if (!dbModule) {
        console.warn(`  Skipping unknown module "${moduleContent.moduleTitle}" in ${course.name}`);
        continue;
      }

      const fileSlug = slugify(moduleContent.moduleTitle);
      const outDir = path.join(outRoot, courseData.courseSlug);
      await renderModulePdf(course.name, moduleContent, outDir, fileSlug);
      const fileUrl = `/uploads/course-content/${courseData.courseSlug}/${fileSlug}.pdf`;

      const existing = await prisma.courseContent.findFirst({
        where: { courseId: course.id, courseModuleId: dbModule.id },
      });

      if (existing) {
        await prisma.contentLink.deleteMany({ where: { courseContentId: existing.id } });
        await prisma.courseContent.update({
          where: { id: existing.id },
          data: {
            title: moduleContent.moduleTitle,
            fileUrl,
            links: { create: moduleContent.links.map((l, i) => ({ label: l.label, url: l.url, order: i })) },
          },
        });
      } else {
        await prisma.courseContent.create({
          data: {
            courseId: course.id,
            courseModuleId: dbModule.id,
            title: moduleContent.moduleTitle,
            fileUrl,
            links: { create: moduleContent.links.map((l, i) => ({ label: l.label, url: l.url, order: i })) },
          },
        });
      }

      generated++;
      console.log(`Generated: ${course.name} — ${moduleContent.moduleTitle}`);
    }
  }

  console.log(`\nDone. Generated ${generated} module PDFs.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
