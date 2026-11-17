import { PrismaClient } from "@prisma/client";
import manifest from "./content/coding-patterns-manifest.json";

const prisma = new PrismaClient();

const COURSE_SLUG = "coding-patterns";

async function main() {
  let course = await prisma.course.findUnique({ where: { slug: COURSE_SLUG } });
  if (!course) {
    const maxOrder = await prisma.course.aggregate({ _max: { order: true } });
    course = await prisma.course.create({
      data: {
        slug: COURSE_SLUG,
        name: "Coding Patterns",
        shortDescription: "14 DSA coding patterns with worked examples and interactive visualisers.",
        description:
          "Fourteen levels covering 100 DSA coding patterns, each with a complete course book, worked examples in C/C++/Java/Python, and an interactive step-by-step visualiser. Internal training content — attach alongside DSA / Placement Training batches.",
        category: "Programming",
        domain: "TECHNICAL",
        isPlaceholder: true, // keeps this off the public marketing /courses list
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });
    console.log(`Created course: ${course.name}`);
  } else {
    console.log(`Using existing course: ${course.name}`);
  }

  let modulesCreated = 0;
  let subModulesCreated = 0;
  let contentCreated = 0;

  for (const level of manifest) {
    let mod = await prisma.courseModule.findFirst({ where: { courseId: course.id, title: level.name } });
    if (!mod) {
      mod = await prisma.courseModule.create({
        data: {
          courseId: course.id,
          title: level.name,
          topics: "[]",
          order: level.order,
          mainPdfTitle: level.bookTitle,
          mainPdfUrl: level.bookUrl,
        },
      });
      modulesCreated++;
    } else {
      mod = await prisma.courseModule.update({
        where: { id: mod.id },
        data: { order: level.order, mainPdfTitle: level.bookTitle, mainPdfUrl: level.bookUrl },
      });
    }

    // Module-level interactive visualiser link (no sub-module) — shown alongside the book.
    const existingArtifact = await prisma.courseContent.findFirst({
      where: { courseId: course.id, courseModuleId: mod.id, courseSubModuleId: null },
    });
    if (existingArtifact) {
      await prisma.courseContent.update({ where: { id: existingArtifact.id }, data: { fileUrl: level.artifactUrl } });
    } else {
      await prisma.courseContent.create({
        data: {
          courseId: course.id,
          courseModuleId: mod.id,
          title: "Interactive pattern visualiser",
          fileUrl: level.artifactUrl,
        },
      });
      contentCreated++;
    }

    for (const sm of level.subModules) {
      let subMod = await prisma.courseSubModule.findFirst({ where: { courseModuleId: mod.id, title: sm.title } });
      if (!subMod) {
        subMod = await prisma.courseSubModule.create({
          data: { courseModuleId: mod.id, title: sm.title, order: sm.order },
        });
        subModulesCreated++;
      } else {
        subMod = await prisma.courseSubModule.update({ where: { id: subMod.id }, data: { order: sm.order } });
      }

      const existingContent = await prisma.courseContent.findFirst({
        where: { courseId: course.id, courseSubModuleId: subMod.id },
      });
      if (existingContent) {
        await prisma.courseContent.update({ where: { id: existingContent.id }, data: { fileUrl: sm.fileUrl, title: sm.title } });
      } else {
        await prisma.courseContent.create({
          data: {
            courseId: course.id,
            courseModuleId: mod.id,
            courseSubModuleId: subMod.id,
            title: sm.title,
            fileUrl: sm.fileUrl,
          },
        });
        contentCreated++;
      }
    }
    console.log(`  ${level.name}: ${level.subModules.length} sub-modules`);
  }

  console.log(
    `\nDone. Modules created: ${modulesCreated}. Sub-modules created: ${subModulesCreated}. Content rows created: ${contentCreated}.`
  );
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
