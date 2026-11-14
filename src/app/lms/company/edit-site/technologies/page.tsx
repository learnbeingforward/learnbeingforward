import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { getIconByName } from "@/lib/icon-catalog";
import { TECH_CATEGORY_LABELS } from "@/lib/tech-categories";
import { IconPicker } from "@/components/lms/IconPicker";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { Button } from "@/components/ui/button";
import { createTechnology, deleteTechnology } from "@/lib/actions/site-content";
import { TechCategorySelect } from "@/components/lms/TechCategorySelect";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function EditTechnologiesPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const technologies = await prisma.technology.findMany({ orderBy: { order: "asc" } });

  return (
    <AppShell nav={nav} active="edit-site" user={shellUser} hasUnread={hasUnread} crumb="Overview › Edit Site › Technologies" title="Technologies" subtitle="Edit site — Technologies">
      <div className="row">
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>Add new technology</h2>
          <form action={createTechnology} className="space-y-5">
            <div>
              <Label htmlFor="name">Technology Name<RequiredMark /></Label>
              <Input id="name" name="name" required className="mt-1.5" placeholder="e.g. Kubernetes" />
            </div>
            <div>
              <Label htmlFor="category">Category<RequiredMark /></Label>
              <TechCategorySelect />
            </div>
            <div>
              <Label>Logo<RequiredMark /></Label>
              <div className="mt-1.5"><IconPicker name="iconName" /></div>
            </div>
            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">Add Technology</Button>
          </form>
        </section>

        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>Current technologies ({technologies.length})</h2>
          <div className="stack" style={{ gap: 8, maxHeight: 600, overflowY: "auto" }}>
            {technologies.map((tech) => {
              const TechIcon = getIconByName(tech.iconName);
              return (
                <div key={tech.id} className="list-row" style={{ background: "var(--surface)" }}>
                  {TechIcon && <TechIcon size={20} />}
                  <div className="grow">
                    <div className="strong">{tech.name}</div>
                    <div className="small muted">{TECH_CATEGORY_LABELS[tech.category]}</div>
                  </div>
                  <DeleteButton action={deleteTechnology.bind(null, tech.id)} />
                </div>
              );
            })}
            {technologies.length === 0 && <p className="empty">No technologies yet.</p>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
