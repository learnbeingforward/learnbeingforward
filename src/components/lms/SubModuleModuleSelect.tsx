"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ModuleOption = { id: string; title: string; course: { name: string } };

export function SubModuleModuleSelect({ modules }: { modules: ModuleOption[] }) {
  return (
    <Select name="courseModuleId" required>
      <SelectTrigger className="mt-1.5 w-full">
        <SelectValue placeholder="Select module">
          {(value: string | null) => {
            const m = modules.find((x) => x.id === value);
            return m ? `${m.course.name} — ${m.title}` : "Select module";
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {modules.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {m.course.name} — {m.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
