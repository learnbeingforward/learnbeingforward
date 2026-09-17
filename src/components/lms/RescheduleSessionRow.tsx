"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rescheduleSession } from "@/lib/actions/college-contracts";

export function RescheduleSessionRow({ sessionId, currentDate }: { sessionId: string; currentDate: string }) {
  const [saved, setSaved] = useState(false);
  const action = rescheduleSession.bind(null, sessionId);

  if (saved) {
    return <span className="text-xs text-green-700">Rescheduled.</span>;
  }

  return (
    <form
      action={async (formData) => {
        await action(formData);
        setSaved(true);
      }}
      className="flex items-center gap-2"
    >
      <Input type="date" name="newDate" defaultValue={currentDate} className="h-8 w-40 text-xs" />
      <Button type="submit" size="sm" variant="outline" className="border-border text-indigo">
        Reschedule
      </Button>
    </form>
  );
}
