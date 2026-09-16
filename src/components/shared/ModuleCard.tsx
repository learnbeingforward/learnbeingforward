import type { CourseModule } from "@/data/courses";
import { getTechsBySlugs } from "@/data/technologies";
import { Reveal } from "@/components/shared/Reveal";

export function ModuleCard({ module: mod, delay = 0 }: { module: CourseModule; delay?: number }) {
  const techs = getTechsBySlugs(mod.techSlugs);

  return (
    <Reveal delay={delay}>
      <div className="flex h-full flex-col rounded-xl border border-border bg-white p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-semibold text-indigo">{mod.title}</h3>
          <div className="flex shrink-0 gap-1.5">
            {techs.slice(0, 3).map((tech) => {
              const Icon = tech.icon;
              return <Icon key={tech.slug} className="size-5 text-gold" title={tech.name} />;
            })}
          </div>
        </div>

        <ul className="flex-1 space-y-1.5 text-sm text-muted-foreground">
          {mod.topics.map((topic) => (
            <li key={topic} className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-gold" />
              {topic}
            </li>
          ))}
        </ul>

        <p className="mt-4 border-t border-border pt-3 text-xs italic text-muted-foreground">
          {mod.delivery}
        </p>
      </div>
    </Reveal>
  );
}
