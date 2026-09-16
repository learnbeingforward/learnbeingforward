import Link from "next/link";
import { LogoIcon } from "./LogoIcon";
import { cn } from "@/lib/utils";

type LogoProps = {
  theme?: "dark" | "light";
  className?: string;
  iconSize?: number;
  textSize?: string;
};

/** Full lockup: icon mark + "Learn Being Forward" wordmark, "Forward" in gold. */
export function Logo({ theme = "dark", className, iconSize = 36, textSize = "text-xl" }: LogoProps) {
  const isLight = theme === "light";

  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 shrink-0", className)}
      aria-label="Learn Being Forward — home"
    >
      <LogoIcon
        variant={isLight ? "white" : "color"}
        className="shrink-0"
        style={{ width: iconSize, height: iconSize }}
      />
      <span className={cn("font-semibold leading-none tracking-tight", textSize)}>
        <span className={isLight ? "text-white" : "text-indigo"}>Learn Being </span>
        <span className="text-gold">Forward</span>
      </span>
    </Link>
  );
}
