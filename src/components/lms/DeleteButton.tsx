"use client";

import { Icon } from "@/components/lbf/icons";

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <button type="submit" className="btn-icon danger" title="Delete">
        <Icon name="trash" size={16} />
      </button>
    </form>
  );
}
