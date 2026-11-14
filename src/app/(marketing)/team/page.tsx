import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json-array";
import { PublicShell } from "@/components/lbf/PublicShell";
import { TeamExplorer, type ExplorerMember } from "@/components/lbf/TeamExplorer";

export const metadata: Metadata = {
  title: "Employees & Trainers",
  description: "Meet the employees and freelance trainers behind Learn Being Forward's training programs.",
};

export const revalidate = 0;

export default async function TeamPage() {
  const teamMembers = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });

  const members: ExplorerMember[] = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    experienceYears: m.experienceYears,
    isFreelancer: m.isFreelancer,
    specialties: parseJsonArray(m.specialties),
    colleges: parseJsonArray(m.colleges),
    photoUrl: m.photoUrl,
    initials: m.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }));

  return (
    <PublicShell
      header={{
        active: "team",
        eyebrow: "Employees & trainers",
        title: (
          <>
            The people behind <em>the training</em>
          </>
        ),
        description: "Full-time employees and freelance trainers who deliver our programs across colleges and companies.",
      }}
    >
      <section className="card lift">
        <TeamExplorer members={members} />
      </section>
    </PublicShell>
  );
}
