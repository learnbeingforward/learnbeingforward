import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.courseModule.findMany();
  let created = 0;

  for (const mod of modules) {
    const existing = await prisma.courseSubModule.count({ where: { courseModuleId: mod.id } });
    if (existing > 0) continue;

    const topics: string[] = JSON.parse(mod.topics || "[]");
    for (const [i, title] of topics.entries()) {
      await prisma.courseSubModule.create({
        data: { courseModuleId: mod.id, title, order: i },
      });
      created++;
    }
  }

  console.log(`Backfilled ${created} sub-modules across ${modules.length} modules.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
