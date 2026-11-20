/**
 * One-time content fix, kept idempotent: the original seed assigned the
 * wrong Lucide icon to 3 of the 4 home-page pillars (Brain/GraduationCap/
 * Building2 instead of the design's Target/Building2/Briefcase). Re-applies
 * the correct icon by title on every deploy so production matches without
 * a manual DB edit.
 */
import { prisma } from "../src/lib/prisma";

const FIXES: Record<string, string> = {
  "Aptitude & Soft-Skills Training": "Target",
  "Placement Support & Campus Partnerships": "Building2",
  "Corporate Onboarding Training": "Briefcase",
};

async function main() {
  for (const [title, icon] of Object.entries(FIXES)) {
    await prisma.homeFeature.updateMany({ where: { title }, data: { icon } });
  }
  console.log(`fix-home-feature-icons: synced ${Object.keys(FIXES).length} feature(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
