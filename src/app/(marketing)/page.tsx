import { Hero } from "@/components/sections/Hero";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { TechMarquee } from "@/components/sections/TechMarquee";
import { StatBand } from "@/components/sections/StatBand";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

const MARQUEE_SLUGS = [
  "c", "cpp", "java", "python", "csharp", "javascript", "react", "angular",
  "vue", "nodejs", "django", "spring-boot", "dotnet", "mysql", "mongodb", "git",
];

export default async function HomePage() {
  const [homeFeatures, allTechnologies] = await Promise.all([
    prisma.homeFeature.findMany({ orderBy: { order: "asc" } }),
    prisma.technology.findMany({ orderBy: { order: "asc" } }),
  ]);

  const marqueeTech = allTechnologies.filter((t) => MARQUEE_SLUGS.includes(t.slug));
  const marqueeItems =
    marqueeTech.length > 0 ? marqueeTech : allTechnologies.slice(0, 16);

  return (
    <>
      <Hero />
      <WhatWeDo items={homeFeatures} />
      <TechMarquee technologies={marqueeItems} />
      <StatBand />
      <ClosingCta />
    </>
  );
}
