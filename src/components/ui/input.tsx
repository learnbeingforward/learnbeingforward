import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const [revealed, setRevealed] = React.useState(false);
  const isPassword = type === "password";

  const input = (
    <InputPrimitive
      type={isPassword && revealed ? "text" : type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        isPassword && "pr-8",
        className
      )}
      {...props}
    />
  );

  if (!isPassword) return input;

  return (
    <span className="relative block w-full">
      {input}
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        aria-label={revealed ? "Hide password" : "Show password"}
        aria-pressed={revealed}
        tabIndex={-1}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground"
      >
        {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </span>
  );
}

export { Input }
