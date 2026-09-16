import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";

export function ClosingCta() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <Reveal>
          <div className="rounded-2xl bg-indigo px-6 py-14 text-center text-white sm:px-14">
            <h2 className="mx-auto max-w-xl text-3xl font-bold sm:text-4xl">
              Ready to build a placement-ready cohort?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/70">
              Partner with Learn Being Forward for campus training programs, or explore our
              courses to see what we teach.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                render={<Link href="/contact" />}
                nativeButton={false}
                size="lg"
                className="bg-gold text-indigo hover:bg-gold/90"
              >
                Partner With Us
              </Button>
              <Button
                render={<Link href="/courses" />}
                nativeButton={false}
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                Explore Courses
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
