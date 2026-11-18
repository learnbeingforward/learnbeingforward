/**
 * Idempotent — seeds the initial Buy catalog with four starter listings so
 * the public /buy page isn't empty on first deploy. Skips any course slug
 * that already has a listing (admin-made changes, including price edits,
 * are never touched or reset by this re-running). "Data Structures" maps to
 * the Coding Patterns course — the closest real course with that content.
 */
import { prisma } from "../src/lib/prisma";

const SEED_LISTINGS: { slug: string; price: number; headline: string }[] = [
  { slug: "coding-patterns", price: 499, headline: "100 data-structure & algorithm patterns, worked through step by step." },
  { slug: "frontend-development", price: 399, headline: "A complete frontend development curriculum, from fundamentals to projects." },
  { slug: "robotics", price: 399, headline: "Hands-on robotics curriculum covering hardware and control systems." },
  { slug: "programming", price: 399, headline: "Core programming fundamentals across multiple languages." },
];

async function main() {
  for (const seed of SEED_LISTINGS) {
    const course = await prisma.course.findUnique({ where: { slug: seed.slug } });
    if (!course) {
      console.log(`seed-buy-listings: course "${seed.slug}" not found — skipping.`);
      continue;
    }

    const existing = await prisma.buyListing.findUnique({ where: { courseId: course.id } });
    if (existing) continue;

    const order = await prisma.buyListing.count();
    await prisma.buyListing.create({
      data: { courseId: course.id, price: seed.price, headline: seed.headline, order },
    });
    console.log(`seed-buy-listings: created listing for "${course.name}".`);
  }
}

main()
  .catch((err) => {
    console.error("seed-buy-listings failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
