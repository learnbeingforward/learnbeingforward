import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { getLucideIcon, LUCIDE_CATALOG } from "@/lib/lucide-catalog";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { createHomeFeature, deleteHomeFeature } from "@/lib/actions/site-content";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function EditHomePage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const features = await prisma.homeFeature.findMany({ orderBy: { order: "asc" } });

  return (
    <AppShell
      nav={nav}
      active="edit-site"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Edit Site › Home Page"
      title="Home page"
      subtitle={'"What we do" pillars shown on the public homepage.'}
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
            Add new pillar
          </h2>
          <form action={createHomeFeature} className="stack" style={{ gap: 16 }}>
            <label className="field">
              <span>
                Icon <span className="req" aria-hidden="true">*</span>
              </span>
              <select className="select" name="icon" required defaultValue="">
                <option value="" disabled>
                  Select icon
                </option>
                {LUCIDE_CATALOG.map((i) => (
                  <option key={i.name} value={i.name}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>
                Title <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="title" required placeholder="e.g. AI & Emerging Tech Training" />
            </label>
            <label className="field">
              <span>
                Description <span className="req" aria-hidden="true">*</span>
              </span>
              <textarea className="textarea" name="description" required rows={3} />
            </label>
            <button className="btn btn-primary" type="submit">
              <Icon name="plus" size={16} />
              Add pillar
            </button>
          </form>
        </section>

        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Current pillars ({features.length})
          </h2>
          <ul className="list">
            {features.map((f) => {
              const FeatureIcon = getLucideIcon(f.icon);
              return (
                <li key={f.id} className="list-row">
                  <span className="icon-box navy">{FeatureIcon && <FeatureIcon size={18} />}</span>
                  <div className="grow">
                    <div className="strong">{f.title}</div>
                    <div className="small muted">{f.description}</div>
                  </div>
                  <DeleteButton action={deleteHomeFeature.bind(null, f.id)} />
                </li>
              );
            })}
            {features.length === 0 && <p className="empty">No pillars yet.</p>}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
