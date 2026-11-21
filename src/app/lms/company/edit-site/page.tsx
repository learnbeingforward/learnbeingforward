import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon, type IconName } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { getSiteSettings } from "@/lib/site-settings";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

function EsCard({
  icon,
  pill,
  title,
  description,
  editHref,
  viewHref,
}: {
  icon: IconName;
  pill: string;
  title: string;
  description: string;
  editHref: string;
  viewHref: string;
}) {
  return (
    <article className="box es-card">
      <div className="split" style={{ alignItems: "flex-start" }}>
        <span className="icon-box navy">
          <Icon name={icon} size={20} />
        </span>
        <span className="pill">{pill}</span>
      </div>
      <h3 className="h3" style={{ marginTop: 12 }}>
        {title}
      </h3>
      <p className="muted small" style={{ flex: 1 }}>
        {description}
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <Link className="btn btn-primary btn-sm" href={editHref}>
          <Icon name="edit" size={16} />
          Edit
        </Link>
        <Link className="btn btn-sm" href={viewHref} target="_blank">
          <Icon name="eye" size={16} />
          View
        </Link>
      </div>
    </article>
  );
}

export default async function EditSitePage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const [homeFeatureCount, courseCount, technologyCount, teamCount, contactCount, buyListingCount, pendingOrderCount, footerLinkCount, siteSettings] =
    await Promise.all([
      prisma.homeFeature.count(),
      prisma.course.count(),
      prisma.technology.count(),
      prisma.teamMember.count(),
      prisma.contactProfile.count(),
      prisma.buyListing.count(),
      prisma.courseOrder.count({ where: { status: "PENDING" } }),
      prisma.footerLink.count(),
      getSiteSettings(),
    ]);

  return (
    <AppShell
      nav={nav}
      active="edit-site"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Edit Site"
      title="Edit Site"
      subtitle="Change what the public website shows."
      actions={
        <Link className="btn btn-ghost-light" href="/" target="_blank">
          <Icon name="eye" size={16} />
          View live site
        </Link>
      }
    >
      <div className="alert gold">
        <Icon name="globe" size={18} className="shrink-0" />
        <span>
          Everything here goes straight to the public website — no redeploy. Use <b>View</b> to check a page after you save.
        </span>
      </div>

      <section className="card">
        <div className="split" style={{ marginBottom: 18 }}>
          <h2 className="h2">Pages on the website</h2>
        </div>
        <div className="grid" style={{ ["--min" as string]: "260px" }}>
          <EsCard
            icon="home"
            pill={`${homeFeatureCount} pillar${homeFeatureCount !== 1 ? "s" : ""}`}
            title="Home page"
            description={'"What we do" pillars, hero text and the featured book strip.'}
            editHref="/lms/company/edit-site/home"
            viewHref="/"
          />
          <EsCard
            icon="book"
            pill={`${courseCount} course${courseCount !== 1 ? "s" : ""}`}
            title="Courses"
            description='Course cards and curriculum. New courses come from Course Studio — switch "Show on website".'
            editHref="/lms/company/edit-site/courses"
            viewHref="/courses"
          />
          <EsCard
            icon="code"
            pill={`${technologyCount} technolog${technologyCount !== 1 ? "ies" : "y"}`}
            title="Technologies"
            description="Technology names with matching logos."
            editHref="/lms/company/edit-site/technologies"
            viewHref="/technologies"
          />
          <EsCard
            icon="users"
            pill={`${teamCount} profile${teamCount !== 1 ? "s" : ""}`}
            title="Team"
            description="Trainer and employee profiles."
            editHref="/lms/company/edit-site/employees"
            viewHref="/team"
          />
          <EsCard
            icon="mail"
            pill={`${contactCount} contact${contactCount !== 1 ? "s" : ""}`}
            title="Contact"
            description="Contact-section profiles."
            editHref="/lms/company/edit-site/contacts"
            viewHref="/contact"
          />
        </div>
      </section>

      <section className="card">
        <div className="split" style={{ marginBottom: 18 }}>
          <h2 className="h2">Store</h2>
        </div>
        <div className="grid" style={{ ["--min" as string]: "260px" }}>
          <EsCard
            icon="cart"
            pill={`${buyListingCount} listing${buyListingCount !== 1 ? "s" : ""}${pendingOrderCount > 0 ? ` · ${pendingOrderCount} order${pendingOrderCount !== 1 ? "s" : ""} to verify` : ""}`}
            title="Buy"
            description="Sell course books: prices, free preview pages, who can buy, UPI payments and orders."
            editHref="/lms/company/edit-site/buy"
            viewHref="/buy"
          />
        </div>
      </section>

      <section className="card">
        <div className="split" style={{ marginBottom: 18 }}>
          <h2 className="h2">Across every page</h2>
        </div>
        <div className="grid" style={{ ["--min" as string]: "260px" }}>
          <EsCard
            icon="link"
            pill={`${footerLinkCount} link${footerLinkCount !== 1 ? "s" : ""}`}
            title="Footer links"
            description="Quick links shown in the footer."
            editHref="/lms/company/edit-site/footer"
            viewHref="/"
          />
          <EsCard
            icon="phone"
            pill={siteSettings.companyContactPhone}
            title="Company contact"
            description="Name, phone and email in the footer and on the Contact page."
            editHref="/lms/company/edit-site/company-contact"
            viewHref="/contact"
          />
        </div>
      </section>
    </AppShell>
  );
}
