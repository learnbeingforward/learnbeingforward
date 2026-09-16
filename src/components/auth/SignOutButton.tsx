"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="border-border text-muted-foreground hover:text-indigo"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="size-4" />
      Log Out
    </Button>
  );
}
