import { Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import type { ContactProfile } from "@/data/contacts";

export function ContactProfileCard({ profile, delay = 0 }: { profile: ContactProfile; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div className="flex h-full flex-col items-center rounded-xl border border-border bg-white p-6 text-center shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://api.dicebear.com/9.x/personas/svg?seed=${profile.avatarSeed}`}
          alt=""
          width={72}
          height={72}
          loading="lazy"
          className="size-[72px] rounded-full bg-cream"
        />
        <h3 className="mt-4 font-semibold text-indigo">{profile.name}</h3>
        <p className="text-sm font-medium text-indigo">{profile.role}</p>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <a href={`mailto:${profile.email}`} className="flex items-center justify-center gap-2 hover:text-indigo">
            <Mail className="size-4 shrink-0" /> {profile.email}
          </a>
          <a href={`tel:${profile.phone.replace(/\s+/g, "")}`} className="flex items-center justify-center gap-2 hover:text-indigo">
            <Phone className="size-4 shrink-0" /> {profile.phone}
          </a>
        </div>
      </div>
    </Reveal>
  );
}
