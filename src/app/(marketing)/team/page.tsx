import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { TeamMemberCard } from "@/components/shared/TeamMemberCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Employees & Trainers",
  description: "Meet the employees and freelance trainers behind Learn Being Forward's training programs.",
};

export const revalidate = 0;

export default async function TeamPage() {
  const teamMembers = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <PageHero
        eyebrow="Employees & Trainers"
        title="The people behind the training"
        description="A mix of full-time employees and freelance trainers who deliver our programs across colleges and companies."
      />

      <section className="pb-24">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, i) => (
              <TeamMemberCard key={member.id} member={member} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
