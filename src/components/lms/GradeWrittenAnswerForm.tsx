"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { gradeWrittenAnswer } from "@/lib/actions/assessments";

export function GradeWrittenAnswerForm({
  answerId,
  maxMarks,
  currentMarks,
}: {
  answerId: string;
  maxMarks: number;
  currentMarks: number | null;
}) {
  const [marks, setMarks] = useState(String(currentMarks ?? 0));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(currentMarks !== null);

  async function handleSave() {
    setSaving(true);
    await gradeWrittenAnswer(answerId, Number.parseInt(marks, 10));
    setSaving(false);
    setSaved(true);
  }

  const options = Array.from({ length: maxMarks + 1 }, (_, i) => i);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={marks}
        onValueChange={(v) => {
          setMarks(String(v));
          setSaved(false);
        }}
      >
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n} / {maxMarks}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" size="sm" onClick={handleSave} disabled={saving} className="bg-indigo text-white hover:bg-indigo/90">
        {saving && <Loader2 className="size-3.5 animate-spin" />}
        {saved ? "Saved" : "Save Marks"}
      </Button>
    </div>
  );
}
