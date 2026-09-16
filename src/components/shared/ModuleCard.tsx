import { Reveal } from "@/components/shared/Reveal";
import { getIconByName } from "@/lib/icon-catalog";
import { parseJsonArray } from "@/lib/json-array";

type TechLookup = Map<string, { name: string; iconName: string }>;

export type ModuleCardData = {
  id: string;
  title: string;
  topics: string;
  techSlugs: string | null;
  delivery: string | null;
};

export function ModuleCard({
  module: mod,
  techLookup,
  delay = 0,
}: {
  module: ModuleCardData;
  techLookup: TechLookup;
  delay?: number;
}) {
  const topics = parseJsonArray(mod.topics);
  const techs = parseJsonArray(mod.techSlugs)
    .map((slug) => ({ slug, ...techLookup.get(slug) }))
    .filter((t): t is { slug: string; name: string; iconName: string } => Boolean(t.name));

  return (
    <Reveal delay={delay}>
      <div className="flex h-full flex-col rounded-xl border border-border bg-white p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-semibold text-indigo">{mod.title}</h3>
          <div className="flex shrink-0 gap-1.5">
            {techs.slice(0, 3).map((tech) => {
              const Icon = getIconByName(tech.iconName);
              if (!Icon) return null;
              return <Icon key={tech.slug} className="size-5 text-gold" title={tech.name} />;
            })}
          </div>
        </div>

        <ul className="flex-1 space-y-1.5 text-sm text-muted-foreground">
          {topics.map((topic) => (
            <li key={topic} className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-gold" />
              {topic}
            </li>
          ))}
        </ul>

        {mod.delivery && (
          <p className="mt-4 border-t border-border pt-3 text-xs italic text-muted-foreground">
            {mod.delivery}
          </p>
        )}
      </div>
    </Reveal>
  );
}
