"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSessionModule } from "@/lib/actions/batches";

export function SessionModuleSelect({
  sessionId,
  currentModuleId,
  modules,
  topic,
}: {
  sessionId: string;
  currentModuleId: string | null;
  modules: { id: string; title: string }[];
  topic: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    const fd = new FormData();
    if (value && value !== "none") fd.set("courseModuleId", value);
    startTransition(() => updateSessionModule(sessionId, fd));
  }

  return (
    <div className="flex items-center gap-1.5">
      <Select value={currentModuleId ?? "none"} onValueChange={handleChange}>
        <SelectTrigger className="h-7 w-48 text-xs">
          <SelectValue>
            {(value: string | null) =>
              value && value !== "none" ? modules.find((m) => m.id === value)?.title : topic || "No module set"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">{topic ? `No module (topic: ${topic})` : "No module set"}</SelectItem>
          {modules.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
    </div>
  );
}
