import { Reveal } from "@/components/shared/Reveal";

const stats = [
  { value: "6+", label: "Languages Taught" },
  { value: "10+", label: "Frameworks Covered" },
  { value: "75+", label: "Colleges Trained" },
  { value: "1000s", label: "Students Placement-Ready" },
];

export function StatBand() {
  return (
    <section className="bg-indigo-dark py-16 text-white">
      <div className="container-page grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08} className="text-center">
            <p className="font-sans text-3xl font-bold text-gold-light sm:text-4xl">{stat.value}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-white/60 sm:text-sm">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
