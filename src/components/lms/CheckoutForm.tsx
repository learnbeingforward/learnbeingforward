"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCourseOrder, type CreateOrderState } from "@/lib/actions/buy";

export function CheckoutForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<CreateOrderState, FormData>(
    createCourseOrder.bind(null, listingId),
    null
  );

  useEffect(() => {
    if (state?.ok && state.orderId && state.token) {
      router.push(`/buy/order/${state.orderId}?token=${state.token}`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-white p-6">
      <div>
        <Label htmlFor="buyerName">Your name</Label>
        <Input id="buyerName" name="buyerName" required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="buyerEmail">Email — your books are sent here</Label>
        <Input id="buyerEmail" name="buyerEmail" type="email" required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="buyerPhone">Phone (optional)</Label>
        <Input id="buyerPhone" name="buyerPhone" className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="utr">UPI transaction ID (UTR)</Label>
        <Input id="utr" name="utr" required pattern="\d{12}" maxLength={12} inputMode="numeric" placeholder="12-digit number from your UPI app" className="mt-1.5" />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="w-full bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        I have paid — submit
      </Button>
    </form>
  );
}
