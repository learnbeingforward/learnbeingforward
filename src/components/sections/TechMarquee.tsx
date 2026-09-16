"use client";

import { getIconByName } from "@/lib/icon-catalog";

export type MarqueeTech = { slug: string; name: string; iconName: string };

export function TechMarquee({ technologies }: { technologies: MarqueeTech[] }) {
  const items = [...technologies, ...technologies];

  return (
    <div className="group relative overflow-hidden border-y border-border bg-white py-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-32" />

      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {items.map((tech, i) => {
          const Icon = getIconByName(tech.iconName);
          if (!Icon) return null;
          return (
            <div
              key={`${tech.slug}-${i}`}
              className="flex w-[140px] shrink-0 flex-col items-center justify-center gap-2 px-6 sm:w-[168px]"
              title={tech.name}
            >
              <Icon className="size-10 text-indigo/80 transition-colors sm:size-12" aria-hidden />
              <span className="text-xs font-medium text-muted-foreground">{tech.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
