import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FILES = [
  { slug: "quantitative-aptitude", moduleTitle: "Quantitative Aptitude" },
  { slug: "logical-reasoning", moduleTitle: "Logical Reasoning" },
  { slug: "verbal-reasoning", moduleTitle: "Verbal Reasoning" },
  { slug: "non-verbal-reasoning", moduleTitle: "Non-Verbal Reasoning" },
];

async function main() {
  let created = 0;
  for (const { slug, moduleTitle } of FILES) {
    const content = (await import(`./content/submodules/${slug}`)).default as {
      submodules: { subModuleTitle: string }[];
    };

    const course = await prisma.course.findUniqueOrThrow({ where: { slug } });
    const courseModule = await prisma.courseModule.findFirstOrThrow({
      where: { courseId: course.id, title: moduleTitle },
      include: { subModules: true },
    });

    const existingTitles = new Set(courseModule.subModules.map((sm) => sm.title));
    let order = courseModule.subModules.length;

    for (const sm of content.submodules) {
      if (existingTitles.has(sm.subModuleTitle)) continue;
      await prisma.courseSubModule.create({
        data: { courseModuleId: courseModule.id, title: sm.subModuleTitle, order },
      });
      order++;
      created++;
      console.log(`Added sub-module: ${moduleTitle} — ${sm.subModuleTitle}`);
    }
  }
  console.log(`\nDone. Created ${created} new sub-modules.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
