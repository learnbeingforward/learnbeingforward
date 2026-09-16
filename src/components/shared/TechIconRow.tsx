import type { Technology } from "@/data/technologies";
import { cn } from "@/lib/utils";

export function TechIconRow({
  techs,
  size = "md",
  className,
}: {
  techs: Technology[];
  size?: "sm" | "md";
  className?: string;
}) {
  const iconSize = size === "sm" ? "size-6" : "size-8";

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {techs.map((tech) => {
        const Icon = tech.icon;
        return (
          <span
            key={tech.slug}
            title={tech.name}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-indigo/80"
          >
            <Icon className={iconSize} aria-hidden />
            {tech.name}
          </span>
        );
      })}
    </div>
  );
}
