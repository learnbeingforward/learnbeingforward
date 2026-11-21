import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { createFooterLink, deleteFooterLink } from "@/lib/actions/site-content";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function EditFooterPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const links = await prisma.footerLink.findMany({ orderBy: { order: "asc" } });

  return (
    <AppShell
      nav={nav}
      active="edit-site"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Edit Site › Footer Links"
      title="Footer links"
      subtitle="Quick links shown in the footer."
      actions={
        <Link className="btn btn-ghost-light" href="/lms/company/edit-site">
          <Icon name="arrowL" size={16} />
          Back to Edit Site
        </Link>
      }
    >
      <div className="row">
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Add new link
          </h2>
          <form action={createFooterLink} className="stack" style={{ gap: 16 }}>
            <label className="field">
              <span>
                Label <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="label" required placeholder="e.g. Careers" />
            </label>
            <label className="field">
              <span>
                Link (path or URL) <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="href" required placeholder="/careers" />
            </label>
            <button className="btn btn-primary" type="submit">
              <Icon name="plus" size={16} />
              Add link
            </button>
          </form>
        </section>

        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Current links ({links.length})
          </h2>
          <ul className="list">
            {links.map((link) => (
              <li key={link.id} className="list-row">
                <div className="grow">
                  <div className="strong">{link.label}</div>
                  <div className="small muted">{link.href}</div>
                </div>
                <DeleteButton action={deleteFooterLink.bind(null, link.id)} />
              </li>
            ))}
            {links.length === 0 && <p className="empty">No footer links yet.</p>}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
