import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { createContactProfile, deleteContactProfile } from "@/lib/actions/site-content";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function EditContactsPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const profiles = await prisma.contactProfile.findMany({ orderBy: { order: "asc" } });

  return (
    <AppShell
      nav={nav}
      active="edit-site"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Edit Site › Contacts"
      title="Contact-section profiles"
      subtitle="Shown on the public Contact page."
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
            Add new contact person
          </h2>
          <form action={createContactProfile} className="stack" style={{ gap: 16 }}>
            <div className="stat-inline">
              <span className="avatar lg">+</span>
              <FileUploadField name="photoUrl" label="Upload photo" category="photo" compact />
            </div>
            <label className="field">
              <span>
                Full name <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="name" required />
            </label>
            <label className="field">
              <span>
                Role <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="role" required placeholder="e.g. Placement Coordinator" />
            </label>
            <label className="field">
              <span>
                Email <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="email" name="email" required />
            </label>
            <label className="field">
              <span>
                Phone <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="tel" name="phone" required placeholder="+91 98765 43210" />
            </label>
            <button className="btn btn-primary" type="submit">
              <Icon name="plus" size={16} />
              Add contact
            </button>
          </form>
        </section>

        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Current contacts ({profiles.length})
          </h2>
          <ul className="list">
            {profiles.map((p) => {
              const initials = p.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <li key={p.id} className="list-row">
                  <span className="avatar sm">{initials}</span>
                  <div className="grow">
                    <div className="strong">{p.name}</div>
                    <div className="small muted">
                      {p.role} · {p.email}
                    </div>
                  </div>
                  <DeleteButton action={deleteContactProfile.bind(null, p.id)} />
                </li>
              );
            })}
            {profiles.length === 0 && <p className="empty">No contact profiles yet.</p>}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
