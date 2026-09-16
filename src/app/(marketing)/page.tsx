import { Hero } from "@/components/sections/Hero";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { TechMarquee } from "@/components/sections/TechMarquee";
import { StatBand } from "@/components/sections/StatBand";
import { ClosingCta } from "@/components/sections/ClosingCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhatWeDo />
      <TechMarquee />
      <StatBand />
      <ClosingCta />
    </>
  );
}
