import { ICONS } from "@/components/lbf/icons";

export function SbIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Cmp = ICONS[name] ?? ICONS.grid;
  return <Cmp size={size} />;
}
