import type { Metadata } from "next";
import { Mail, Phone, User } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ContactProfileCard } from "@/components/shared/ContactProfileCard";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/shared/Reveal";
import { contactProfiles } from "@/data/contacts";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Learn Being Forward for courses, campus partnerships, and placements.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk training"
        description="Whether you're a college, a company, or a student — reach out and our team will get back to you."
      />

      <section className="pb-20">
        <div className="container-page">
          <p className="mb-8 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm text-indigo">
            Demo contact profiles shown below — real contact-section profiles will replace this
            placeholder content.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contactProfiles.map((profile, i) => (
              <ContactProfileCard key={profile.slug} profile={profile} delay={i * 0.05} />
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
                  <User className="size-5 text-gold-light" /> Pavan Kumar
                </li>
                <li>
                  <a href="tel:+918557076391" className="flex items-center gap-3 hover:text-white">
                    <Phone className="size-5 text-gold-light" /> +91 85570 76391
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@learnbeingforward.in"
                    className="flex items-center gap-3 hover:text-white"
                  >
                    <Mail className="size-5 text-gold-light" /> info@learnbeingforward.in
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
