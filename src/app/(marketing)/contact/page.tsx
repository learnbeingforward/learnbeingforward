import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";
import { ContactForm } from "@/components/sections/ContactForm";

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
    <PublicShell
      header={{
        active: "contact",
        eyebrow: "Contact",
        title: (
          <>
            Let&apos;s talk <em>training</em>
          </>
        ),
        description: "Whether you're a college, a company or a student — reach out and our team will get back to you.",
      }}
    >
      <div className="row lift">
        <section className="card grow">
          <h2 className="title">Send us a message</h2>
          <p className="subtitle">Tell us about courses, partnerships or placements.</p>
          <ContactForm />
        </section>

        <aside className="side stack">
          <div className="card" style={{ background: "var(--navy)", color: "#fff" }}>
            <div className="eyebrow" style={{ color: "var(--gold)" }}>
              Company contact
            </div>
            <h3 className="h3" style={{ color: "#fff", marginTop: 8 }}>
              {settings.companyContactName}
            </h3>
            <ul className="list" style={{ marginTop: 14 }}>
              <li>
                <a href={`tel:${settings.companyContactPhone.replace(/\s+/g, "")}`} style={{ color: "#fff", display: "flex", gap: 10, alignItems: "center" }}>
                  <Icon name="phone" size={16} />
                  {settings.companyContactPhone}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.companyContactEmail}`} style={{ color: "#fff", display: "flex", gap: 10, alignItems: "center" }}>
                  <Icon name="mail" size={16} />
                  {settings.companyContactEmail}
                </a>
              </li>
            </ul>
          </div>

          {contactProfiles.length > 0 && (
            <div className="card">
              <div className="label">Reach the right team</div>
              <ul className="list" style={{ marginTop: 12 }}>
                {contactProfiles.map((p) => (
                  <li key={p.id} className="list-row">
                    <div className="grow">
                      <div className="strong">{p.name}</div>
                      <div className="small muted">{p.role}</div>
                    </div>
                    <a className="btn btn-sm btn-icon" href={`mailto:${p.email}`} aria-label={`Email ${p.name}`}>
                      <Icon name="mail" size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </PublicShell>
  );
}
