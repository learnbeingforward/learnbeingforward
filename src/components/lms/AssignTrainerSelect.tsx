"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Trainer = { id: string; name: string };

export function AssignTrainerSelect({
  batchId,
  trainers,
  currentTrainerId,
  action,
}: {
  batchId: string;
  trainers: Trainer[];
  currentTrainerId: string | null;
  action: (batchId: string, formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action.bind(null, batchId)} className="flex items-center gap-2">
      <Select name="trainerId" defaultValue={currentTrainerId ?? undefined}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Assign trainer">
            {(value: string | null) => trainers.find((t) => t.id === value)?.name ?? "Assign trainer"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {trainers.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" variant="outline" className="border-border text-indigo">
        Save
      </Button>
    </form>
  );
}
