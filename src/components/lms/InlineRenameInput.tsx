"use client";

import { useState } from "react";

export function InlineRenameInput({
  defaultValue,
  action,
  ariaLabel,
}: {
  defaultValue: string;
  action: (value: string) => Promise<void>;
  ariaLabel: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <input
      className="st-title"
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value.trim() && value !== defaultValue) action(value);
      }}
    />
  );
}
