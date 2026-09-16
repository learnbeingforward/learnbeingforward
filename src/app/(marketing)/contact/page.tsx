import type { Metadata } from "next";
import { Mail, Phone, User } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ContactProfileCard } from "@/components/shared/ContactProfileCard";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/shared/Reveal";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Learn Being Forward for courses, campus partnerships, and placements.",
};

export const revalidate = 0;

export default async function ContactPage() {
  const [contactProfiles, settings] = await Promise.all([
    prisma.contactProfile.findMany({ orderBy: { order: "asc" } }),
    getSiteSettings(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk training"
        description="Whether you're a college, a company, or a student — reach out and our team will get back to you."
      />

      <section className="pb-20">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contactProfiles.map((profile, i) => (
              <ContactProfileCard key={profile.id} profile={profile} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <h2 className="text-2xl font-bold text-indigo sm:text-3xl">Send us a message</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Fill out the form and our team will get in touch about courses, partnerships, or
              placements.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl bg-indigo p-8 text-white sm:p-10">
              <h3 className="text-xl font-semibold">Company Contact</h3>
              <ul className="mt-6 space-y-4 text-sm text-white/80">
                <li className="flex items-center gap-3">
                  <User className="size-5 text-gold-light" /> {settings.companyContactName}
                </li>
                <li>
                  <a
                    href={`tel:${settings.companyContactPhone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-3 hover:text-white"
                  >
                    <Phone className="size-5 text-gold-light" /> {settings.companyContactPhone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${settings.companyContactEmail}`}
                    className="flex items-center gap-3 hover:text-white"
                  >
                    <Mail className="size-5 text-gold-light" /> {settings.companyContactEmail}
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
