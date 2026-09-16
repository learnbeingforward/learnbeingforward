import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { TeamMemberCard } from "@/components/shared/TeamMemberCard";
import { teamMembers } from "@/data/team";

export const metadata: Metadata = {
  title: "Employees & Trainers",
  description: "Meet the employees and freelance trainers behind Learn Being Forward's training programs.",
};

export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Employees & Trainers"
        title="The people behind the training"
        description="A mix of full-time employees and freelance trainers who deliver our programs across colleges and companies."
      />

      <section className="pb-24">
        <div className="container-page">
          <p className="mb-8 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm text-indigo">
            Demo profiles shown below — real team data, photos, and CVs will replace this
            placeholder content.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, i) => (
              <TeamMemberCard key={member.slug} member={member} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
