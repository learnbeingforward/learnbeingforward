import { Logo } from "@/components/brand/Logo";
import { SignOutButton } from "@/components/auth/SignOutButton";

export function DashboardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-white">
        <div className="container-page flex h-16 items-center justify-between md:h-20">
          <Logo iconSize={32} textSize="text-lg" />
          <SignOutButton />
        </div>
      </header>

      <div className="container-page py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo">{subtitle}</p>
          <h1 className="mt-1 text-2xl font-bold text-indigo sm:text-3xl">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
