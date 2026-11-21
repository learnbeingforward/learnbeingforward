import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { getIconByName } from "@/lib/icon-catalog";
import { TECH_CATEGORY_LABELS, TECH_CATEGORY_ORDER } from "@/lib/tech-categories";
import { IconPicker } from "@/components/lms/IconPicker";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { createTechnology, deleteTechnology } from "@/lib/actions/site-content";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function EditTechnologiesPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const technologies = await prisma.technology.findMany({ orderBy: { order: "asc" } });

  return (
    <AppShell
      nav={nav}
      active="edit-site"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Edit Site › Technologies"
      title="Technologies"
      subtitle="Technology names with matching logos."
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
            Add new technology
          </h2>
          <form action={createTechnology} className="stack" style={{ gap: 16 }}>
            <label className="field">
              <span>
                Technology name <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="name" required placeholder="e.g. Kubernetes" />
            </label>
            <label className="field">
              <span>
                Category <span className="req" aria-hidden="true">*</span>
              </span>
              <select className="select" name="category" required defaultValue="">
                <option value="" disabled>
                  Select category
                </option>
                {TECH_CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat}>
                    {TECH_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </label>
            <div className="field">
              Logo <span className="req" aria-hidden="true">*</span>
              <IconPicker name="iconName" />
            </div>
            <button className="btn btn-primary" type="submit">
              <Icon name="plus" size={16} />
              Add technology
            </button>
          </form>
        </section>

        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Current technologies ({technologies.length})
          </h2>
          <ul className="list" style={{ maxHeight: 600, overflowY: "auto" }}>
            {technologies.map((tech) => {
              const TechIcon = getIconByName(tech.iconName);
              return (
                <li key={tech.id} className="list-row">
                  {TechIcon && <TechIcon size={20} style={{ color: "var(--navy)" }} />}
                  <div className="grow">
                    <div className="strong">{tech.name}</div>
                    <div className="small muted">{TECH_CATEGORY_LABELS[tech.category]}</div>
                  </div>
                  <DeleteButton action={deleteTechnology.bind(null, tech.id)} />
                </li>
              );
            })}
            {technologies.length === 0 && <p className="empty">No technologies yet.</p>}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
