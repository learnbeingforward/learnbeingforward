import Link from "next/link";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon, type IconName } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

const sections: { href: string; icon: IconName; title: string; description: string }[] = [
  { href: "/lms/company/edit-site/courses", icon: "book", title: "Courses", description: "Add new courses and curriculum modules — shown on the Courses page." },
  { href: "/lms/company/edit-site/technologies", icon: "code", title: "Technologies", description: "Add a new technology with a matching logo — shown on the Technologies page." },
  { href: "/lms/company/edit-site/employees", icon: "users", title: "Employees", description: "Add a new trainer or employee profile — shown on the Team page." },
  { href: "/lms/company/edit-site/contacts", icon: "mail", title: "Contacts", description: "Add a new contact-section profile — shown on the Contact page." },
  { href: "/lms/company/edit-site/home", icon: "home", title: "Home Page", description: "Add a new \"What We Do\" pillar on the homepage." },
  { href: "/lms/company/edit-site/footer", icon: "link", title: "Footer Links", description: "Add or remove quick links shown in the footer." },
  { href: "/lms/company/edit-site/company-contact", icon: "phone", title: "Company Contact", description: "Edit the name, phone, and email shown in the footer and Contact page." },
];

export default async function EditSitePage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  return (
    <AppShell
      nav={nav}
      active="edit-site"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Edit Site"
      title="Edit Site"
      subtitle="Changes here go straight to the live site — no redeploy needed."
      actions={<Link className="btn btn-ghost-light" href="/" target="_blank"><Icon name="eye" size={16} />View live site</Link>}
    >
      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "260px" }}>
          {sections.map((section) => (
            <Link key={section.href} className="box hover stack" style={{ gap: 10, textDecoration: "none", color: "inherit" }} href={section.href}>
              <span className="icon-box navy"><Icon name={section.icon} size={20} /></span>
              <h3 className="h3">{section.title}</h3>
              <p className="muted">{section.description}</p>
              <span className="small" style={{ fontWeight: 600, color: "var(--navy)" }}>Open →</span>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
