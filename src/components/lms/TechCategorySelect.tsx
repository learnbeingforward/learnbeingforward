"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TECH_CATEGORY_LABELS, TECH_CATEGORY_ORDER } from "@/lib/tech-categories";

export function TechCategorySelect() {
  return (
    <Select name="category" required>
      <SelectTrigger className="mt-1.5 w-full">
        <SelectValue placeholder="Select category">
          {(value: string | null) => (value ? TECH_CATEGORY_LABELS[value as keyof typeof TECH_CATEGORY_LABELS] : "Select category")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TECH_CATEGORY_ORDER.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {TECH_CATEGORY_LABELS[cat]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
