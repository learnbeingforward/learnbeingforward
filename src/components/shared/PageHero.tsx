import { Reveal } from "@/components/shared/Reveal";
import { BlobBackground } from "@/components/shared/BlobBackground";
import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-cream py-16 sm:py-20">
      <BlobBackground />
      <div className="container-page relative text-center">
        <Reveal>
          {eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">{eyebrow}</p>
          )}
          <h1 className="mx-auto max-w-3xl text-3xl font-bold text-indigo sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
