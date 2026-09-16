"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintCertificateButton() {
  return (
    <Button onClick={() => window.print()} className="bg-indigo text-white hover:bg-indigo/90">
      <Printer className="size-4" />
      Print / Save as PDF
    </Button>
  );
}
