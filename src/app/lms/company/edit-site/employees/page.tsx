import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { createTeamMember, deleteTeamMember, updateSiteSettings } from "@/lib/actions/site-content";
import { parseJsonArray } from "@/lib/json-array";
import { getSiteSettings } from "@/lib/site-settings";
import { CreateTrainerLoginForm } from "@/components/lms/CreateTrainerLoginForm";
import { EditTeamMemberDialog } from "@/components/lms/EditTeamMemberDialog";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function EditEmployeesPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const [members, siteSettings] = await Promise.all([prisma.teamMember.findMany({ orderBy: { order: "asc" } }), getSiteSettings()]);

  return (
    <AppShell
      nav={nav}
      active="edit-site"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Edit Site › Employees"
      title="Employees & contacts"
      subtitle="Profiles shown on the public Team and Contact pages."
      actions={
        <Link className="btn btn-ghost-light" href="/lms/company/edit-site">
          <Icon name="arrowL" size={16} />
          Back to Edit Site
        </Link>
      }
    >
      <section className="card">
        <h2 className="h2" style={{ marginBottom: 4 }}>
          Create trainer login
        </h2>
        <p className="small muted" style={{ marginBottom: 18, maxWidth: 640 }}>
          This creates an internal login for the LMS trainer dashboard — separate from the public Team page profile below. A trainer doesn&apos;t
          need a public Team entry to log in, and adding one here doesn&apos;t publish anything publicly.
        </p>
        <CreateTrainerLoginForm />
      </section>

      <div className="row">
        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Add employee / trainer profile
          </h2>
          <form action={createTeamMember} className="stack" style={{ gap: 16 }}>
            <div className="stat-inline">
              <span className="avatar lg">+</span>
              <FileUploadField name="photoUrl" label="Upload photo" category="photo" compact />
            </div>
            <div className="grid" style={{ ["--min" as string]: "200px" }}>
              <label className="field">
                <span>
                  Full name <span className="req" aria-hidden="true">*</span>
                </span>
                <input className="input" type="text" name="name" required />
              </label>
              <label className="field">
                <span>
                  Role / title <span className="req" aria-hidden="true">*</span>
                </span>
                <input className="input" type="text" name="role" required placeholder="e.g. Aptitude Trainer" />
              </label>
            </div>
            <div className="grid" style={{ ["--min" as string]: "200px" }}>
              <label className="field">
                <span>Experience (years)</span>
                <input className="input" type="number" min={0} name="experienceYears" />
              </label>
              <label className="field">
                <span>Type</span>
                <select className="select" name="isFreelancer" defaultValue="">
                  <option value="">Full-time employee</option>
                  <option value="on">Freelance trainer</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span>Background (optional)</span>
              <textarea className="textarea" name="background" rows={2} placeholder="Short summary of their expertise" />
            </label>
            <label className="field">
              <span>Skills (comma separated)</span>
              <input className="input" type="text" name="specialties" placeholder="Java, Spring Boot, SQL" />
            </label>
            <label className="field">
              <span>Colleges trained at (freelance)</span>
              <input className="input" type="text" name="colleges" placeholder="RV College of Engineering, PES University" />
            </label>
            <FileUploadField name="cvUrl" label="CV / profile PDF (optional)" category="cv" />
            <div className="split">
              <span />
              <button className="btn btn-primary" type="submit">
                <Icon name="plus" size={16} />
                Add profile
              </button>
            </div>
          </form>
        </section>

        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 4 }}>
            Company contact
          </h2>
          <p className="subtitle" style={{ marginBottom: 18 }}>
            Shown in the footer and on the Contact page.
          </p>
          <form action={updateSiteSettings} className="stack" style={{ gap: 16 }}>
            <label className="field">
              <span>
                Name <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="companyContactName" required defaultValue={siteSettings.companyContactName} />
            </label>
            <label className="field">
              <span>
                Phone <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="tel" name="companyContactPhone" required defaultValue={siteSettings.companyContactPhone} />
            </label>
            <label className="field">
              <span>
                Email <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="email" name="companyContactEmail" required defaultValue={siteSettings.companyContactEmail} />
            </label>
            <button className="btn btn-primary" type="submit">
              Save company contact
            </button>
          </form>
        </section>
      </div>

      <section className="card">
        <div className="split" style={{ marginBottom: 18 }}>
          <h2 className="h2">Published profiles ({members.length})</h2>
        </div>
        <div className="table-wrap">
          <table className="table m-cards" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>Profile</th>
                <th>Experience</th>
                <th>Type</th>
                <th>Order</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const specialties = parseJsonArray(m.specialties);
                const colleges = parseJsonArray(m.colleges);
                const initials = m.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <tr key={m.id}>
                    <td data-label="Profile">
                      <div className="stat-inline">
                        <span className="avatar sm">{initials}</span>
                        <div>
                          <div className="strong">{m.name}</div>
                          <div className="small muted">{m.role}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Experience">{m.experienceYears} yrs</td>
                    <td data-label="Type">
                      <span className={`pill ${m.isFreelancer ? "info" : ""}`}>{m.isFreelancer ? "Freelance" : "Employee"}</span>
                    </td>
                    <td data-label="Order">{m.order}</td>
                    <td data-label="" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <EditTeamMemberDialog
                        member={{
                          id: m.id,
                          name: m.name,
                          role: m.role,
                          experienceYears: m.experienceYears,
                          background: m.background,
                          specialties,
                          isFreelancer: m.isFreelancer,
                          colleges,
                          photoUrl: m.photoUrl,
                          cvUrl: m.cvUrl,
                        }}
                      />
                      <DeleteButton action={deleteTeamMember.bind(null, m.id)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {members.length === 0 && <p className="empty">No team profiles yet.</p>}
      </section>
    </AppShell>
  );
}
