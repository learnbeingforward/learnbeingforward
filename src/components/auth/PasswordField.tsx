"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** A native `.input`-styled password field with a show/hide eye button —
 * for the auth pages, which use react-hook-form's `register()` spread
 * directly on a plain `<input>` rather than the shadcn Input component
 * (which already gets this from src/components/ui/input.tsx). */
export const PasswordField = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function PasswordField(
  { className, ...props },
  ref
) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span className="pw-wrap">
      <input ref={ref} type={revealed ? "text" : "password"} className={className ?? "input"} {...props} />
      <button
        type="button"
        className="pw-eye"
        aria-label={revealed ? "Hide password" : "Show password"}
        aria-pressed={revealed}
        tabIndex={-1}
        onClick={() => setRevealed((v) => !v)}
      >
        {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </span>
  );
});
