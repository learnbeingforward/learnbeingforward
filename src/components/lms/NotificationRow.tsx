"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { markNotificationRead } from "@/lib/actions/notifications";

export function NotificationRow({
  id,
  title,
  message,
  href,
  read,
  createdAt,
}: {
  id: string;
  title: string;
  message: string | null;
  href: string | null;
  read: boolean;
  createdAt: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (!read) await markNotificationRead(id);
      if (href) router.push(href);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-cream/60 ${
        read ? "" : "bg-indigo/5"
      }`}
    >
      {!read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500" />}
      <div className={read ? "ml-5 min-w-0 flex-1" : "min-w-0 flex-1"}>
        <p className={`text-sm ${read ? "text-indigo/80" : "font-semibold text-indigo"}`}>{title}</p>
        {message && <p className="mt-0.5 text-xs text-muted-foreground">{message}</p>}
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
    </button>
  );
}
