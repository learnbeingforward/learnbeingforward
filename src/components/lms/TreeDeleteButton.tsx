"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/lbf/icons";

export function TreeDeleteButton({ action, title }: { action: () => Promise<{ ok: boolean; error?: string }>; title: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        className="btn-icon danger"
        type="button"
        title={title}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await action();
            if (!result.ok) setError(result.error ?? "Couldn't delete.");
          })
        }
      >
        <Icon name="trash" size={16} />
      </button>
      {error && (
        <span className="error-text" style={{ flexBasis: "100%" }}>
          {error}
        </span>
      )}
    </>
  );
}
