import { prisma } from "../src/lib/prisma";

// Lohit Kumar set to 4+ years; everyone else reduced by 3 (floor of 1) per request.
const UPDATES: Record<string, number> = {
  "Lohit Kumar": 4,
  "Ananya Rao": 3,
  "Chidananda K": 7,
  "Sumitra S": 6,
  "Arjun Mehta": 2,
  "Priya Nair": 1,
  "Karthik Iyer": 4,
};

async function main() {
  for (const [name, years] of Object.entries(UPDATES)) {
    const existing = await prisma.teamMember.findFirst({ where: { name } });
    if (!existing) {
      console.warn(`Skipping "${name}" — not found.`);
      continue;
    }
    if (existing.experienceYears === years) {
      console.log(`Already up to date: ${name} (${years})`);
      continue;
    }
    await prisma.teamMember.update({ where: { id: existing.id }, data: { experienceYears: years } });
    console.log(`Updated ${name}: ${existing.experienceYears} -> ${years}`);
  }
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
