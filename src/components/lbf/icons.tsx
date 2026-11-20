// Renders exactly what the design renders for an icon: <svg><use href="#i-name"/></svg>,
// referencing the hidden sprite from IconSprite.tsx. Per the design spec, pages must not
// use lucide/heroicons icons — only the design's own SVG sprite.
import { ICONS } from "./IconSprite";

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}
