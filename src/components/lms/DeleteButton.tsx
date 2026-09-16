"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <Button
        type="submit"
        variant="outline"
        size="icon-sm"
        className="border-border text-muted-foreground hover:border-red-300 hover:text-red-600"
        title="Delete"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </form>
  );
}
