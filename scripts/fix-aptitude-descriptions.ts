/**
 * One-time content fix, kept idempotent: an earlier migration gave each
 * aptitude course a shortDescription like "Quantitative Aptitude — placement
 * aptitude training.", but the design's course list just shows the plain
 * "Placement aptitude training" under the course name. Re-applies that exact
 * text on every deploy so production matches without a manual DB edit.
 */
import { prisma } from "../src/lib/prisma";

const SLUGS = ["quantitative-aptitude", "logical-reasoning", "verbal-reasoning", "non-verbal-reasoning"];

async function main() {
  for (const slug of SLUGS) {
    await prisma.course.updateMany({
      where: { slug },
      data: { shortDescription: "Placement aptitude training" },
    });
  }
  console.log(`fix-aptitude-descriptions: synced ${SLUGS.length} course(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
