"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveContractRate, type ApproveRateState } from "@/lib/actions/college-contracts";

export function ApproveContractRateForm({
  contractId,
  contractType,
}: {
  contractId: string;
  contractType: string;
}) {
  const [state, formAction, isPending] = useActionState<ApproveRateState, FormData>(
    approveContractRate.bind(null, contractId),
    null
  );

  if (state?.ok) {
    return <p className="text-xs font-medium text-green-700">Sent to college.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {contractType === "PER_STUDENT_HOURLY" && (
          <Input
            name="ratePerStudentHour"
            type="number"
            min="1"
            required
            placeholder="₹/student/hr"
            className="h-8 w-32 text-sm"
          />
        )}
        {contractType === "PER_DAY_FLAT" && (
          <Input
            name="flatRatePerDay"
            type="number"
            min="1"
            required
            placeholder="₹/day"
            className="h-8 w-32 text-sm"
          />
        )}
        <Button type="submit" size="sm" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          Send to College
        </Button>
      </div>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
