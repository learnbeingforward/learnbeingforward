import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { getLucideIcon, LUCIDE_CATALOG } from "@/lib/lucide-catalog";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createHomeFeature, deleteHomeFeature } from "@/lib/actions/site-content";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function EditHomePage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const features = await prisma.homeFeature.findMany({ orderBy: { order: "asc" } });

  return (
    <AppShell nav={nav} active="edit-site" user={shellUser} hasUnread={hasUnread} crumb="Overview › Edit Site › Home Page" title="Home Page" subtitle="Edit site — What We Do pillars">
      <div className="row">
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>Add new pillar</h2>
          <form action={createHomeFeature} className="space-y-5">
            <div>
              <Label htmlFor="icon">Icon<RequiredMark /></Label>
              <Select name="icon" required>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select icon" /></SelectTrigger>
                <SelectContent>
                  {LUCIDE_CATALOG.map((i) => <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Title<RequiredMark /></Label>
              <Input id="title" name="title" required className="mt-1.5" placeholder="e.g. AI & Emerging Tech Training" />
            </div>
            <div>
              <Label htmlFor="description">Description<RequiredMark /></Label>
              <Textarea id="description" name="description" required rows={3} className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">Add Pillar</Button>
          </form>
        </section>

        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>Current pillars ({features.length})</h2>
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
