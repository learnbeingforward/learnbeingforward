"use client";

import { useTransition } from "react";
import { Icon } from "@/components/lbf/icons";

export function TreeAddChildButton({
  action,
  title,
  promptLabel,
  variant = "icon",
}: {
  action: (title: string) => Promise<unknown>;
  title: string;
  promptLabel: string;
  variant?: "icon" | "full";
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const name = window.prompt(promptLabel);
    if (name && name.trim()) {
      const trimmed = name.trim();
      startTransition(async () => {
        await action(trimmed);
      });
    }
  }

  if (variant === "full") {
    return (
      <button className="btn btn-primary" type="button" disabled={isPending} onClick={handleClick}>
        <Icon name="plus" size={16} />
        {title}
      </button>
    );
  }

  return (
    <button className="btn-icon" type="button" title={title} disabled={isPending} onClick={handleClick}>
      <Icon name="plus" size={16} />
    </button>
  );
}
