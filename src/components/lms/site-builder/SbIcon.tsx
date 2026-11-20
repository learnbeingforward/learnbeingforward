import { Icon, type IconName } from "@/components/lbf/icons";

export function SbIcon({ name, size = 16 }: { name: string; size?: number }) {
  return <Icon name={(name as IconName) ?? "grid"} size={size} />;
}
