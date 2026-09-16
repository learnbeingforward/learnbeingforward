import { cn } from "@/lib/utils";

export function AttendanceBar({ pct, className }: { pct: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, pct));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-cream", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          clamped >= 75 ? "bg-gold" : "bg-indigo/60"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
