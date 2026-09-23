import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const APTITUDE_MODULES = ["Quantitative Aptitude", "Logical Reasoning", "Verbal Reasoning", "Non-Verbal Reasoning"];
const SOFT_SKILL_MODULES = ["Communication", "Group Discussion", "Interview Preparation", "Resume Building"];
const TECHNICAL_COURSE_SLUGS = [
  "full-stack-development",
  "frontend-development",
  "backend-development",
  "data-science-ai-fundamentals",
  "robotics",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const ptp = await prisma.course.findUnique({
    where: { slug: "placement-training-program" },
    include: { modules: true },
  });
  if (!ptp) throw new Error("placement-training-program course not found");

  // Tag existing standalone technical courses.
  await prisma.course.updateMany({
    where: { slug: { in: TECHNICAL_COURSE_SLUGS } },
    data: { domain: "TECHNICAL" },
  });

  // Rename + re-tag PTP itself — it keeps only the Java/DSA modules going forward.
  await prisma.course.update({
    where: { id: ptp.id },
    data: { name: "Java & DSA", domain: "TECHNICAL" },
  });

  let maxOrder = (await prisma.course.aggregate({ _max: { order: true } }))._max.order ?? 0;

  // One new Course per Aptitude area, re-parenting its existing module + submodules.
  for (const moduleTitle of APTITUDE_MODULES) {
    const mod = ptp.modules.find((m) => m.title === moduleTitle);
    if (!mod) {
      console.warn(`Module not found under PTP: ${moduleTitle}`);
      continue;
    }
    maxOrder += 1;
    const course = await prisma.course.create({
      data: {
        slug: slugify(moduleTitle),
        name: moduleTitle,
        category: "Aptitude",
        domain: "APTITUDE",
        shortDescription: `${moduleTitle} — placement aptitude training.`,
        description: `Deep, interview-focused ${moduleTitle} training with worked examples and shortcuts.`,
        order: maxOrder,
      },
    });
    await prisma.courseModule.update({
      where: { id: mod.id },
      data: { courseId: course.id, trackTitle: moduleTitle },
    });
    await prisma.courseContent.updateMany({
      where: { courseModuleId: mod.id },
      data: { courseId: course.id },
    });
    console.log(`Created course "${moduleTitle}" (${course.id}) and re-parented its module + content.`);
  }

  // One new "Soft Skills" Course bundling all 4 soft-skill modules together.
  maxOrder += 1;
  const softSkillsCourse = await prisma.course.create({
    data: {
      slug: "soft-skills",
      name: "Soft Skills",
      category: "Soft Skills",
      domain: "SOFT_SKILL",
      shortDescription: "Communication, group discussion, interview prep and resume building.",
      description:
        "A complete soft-skills training bundle covering communication, group discussion, interview preparation, and resume building — everything needed to present well in a placement process.",
      order: maxOrder,
    },
  });
  for (const moduleTitle of SOFT_SKILL_MODULES) {
    const mod = ptp.modules.find((m) => m.title === moduleTitle);
    if (!mod) {
      console.warn(`Module not found under PTP: ${moduleTitle}`);
      continue;
    }
    await prisma.courseModule.update({
      where: { id: mod.id },
      data: { courseId: softSkillsCourse.id, trackTitle: "Soft Skills" },
    });
    await prisma.courseContent.updateMany({
      where: { courseModuleId: mod.id },
      data: { courseId: softSkillsCourse.id },
    });
  }
  console.log(`Created course "Soft Skills" (${softSkillsCourse.id}) and re-parented its 4 modules + content.`);

  console.log("Done.");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
