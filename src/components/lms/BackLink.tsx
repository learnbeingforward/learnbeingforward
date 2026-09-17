import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo/70 hover:text-indigo"
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  );
}
