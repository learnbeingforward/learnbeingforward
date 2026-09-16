import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";
import type { TeamMember } from "@/data/team";

export function TeamMemberCard({ member, delay = 0 }: { member: TeamMember; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div className="flex h-full flex-col items-center rounded-xl border border-border bg-white p-6 text-center shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://api.dicebear.com/9.x/personas/svg?seed=${member.avatarSeed}`}
          alt=""
          width={88}
          height={88}
          loading="lazy"
          className="size-[88px] rounded-full bg-cream"
        />

        <h3 className="mt-4 font-semibold text-indigo">{member.name}</h3>
        <p className="text-sm font-medium text-indigo">{member.role}</p>
        <p className="mt-1 text-xs text-muted-foreground">{member.experienceYears} years experience</p>

        {member.isFreelancer && (
          <Badge className="mt-3 bg-indigo/10 text-indigo hover:bg-indigo/10">Freelance Trainer</Badge>
        )}

        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {member.specialties.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-indigo/80"
            >
              {tag}
            </span>
          ))}
        </div>

        {member.isFreelancer && member.colleges && member.colleges.length > 0 && (
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Trained at: {member.colleges.join(", ")}
          </p>
        )}

        <Button
          render={<a href={member.cvUrl} download />}
          nativeButton={false}
          variant="outline"
          size="sm"
          className="mt-5 border-gold text-indigo hover:bg-gold"
        >
          <Download className="size-4" />
          Download Profile
        </Button>
      </div>
    </Reveal>
  );
}
