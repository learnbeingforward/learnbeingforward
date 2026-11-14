import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { Button } from "@/components/ui/button";
import { createContactProfile, deleteContactProfile } from "@/lib/actions/site-content";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function EditContactsPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const profiles = await prisma.contactProfile.findMany({ orderBy: { order: "asc" } });

  return (
    <AppShell nav={nav} active="edit-site" user={shellUser} hasUnread={hasUnread} crumb="Overview › Edit Site › Contacts" title="Contacts" subtitle="Edit site — Contact page profiles">
      <div className="row">
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>Add new contact person</h2>
          <form action={createContactProfile} className="space-y-5">
            <div>
              <Label htmlFor="name">Full Name<RequiredMark /></Label>
              <Input id="name" name="name" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="role">Role<RequiredMark /></Label>
              <Input id="role" name="role" required className="mt-1.5" placeholder="e.g. Placement Coordinator" />
            </div>
            <div>
              <Label htmlFor="email">Email<RequiredMark /></Label>
              <Input id="email" name="email" type="email" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="phone">Phone<RequiredMark /></Label>
              <Input id="phone" name="phone" required className="mt-1.5" placeholder="+91 98765 43210" />
            </div>
            <div>
              <Label htmlFor="photoUrl">Photo URL (optional)</Label>
              <Input id="photoUrl" name="photoUrl" className="mt-1.5" placeholder="https://... (leave blank for a generated avatar)" />
            </div>
            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">Add Contact</Button>
          </form>
        </section>

        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>Current contacts ({profiles.length})</h2>
          <ul className="list">
            {profiles.map((p) => (
              <li key={p.id} className="list-row">
                <div className="grow">
                  <div className="strong">{p.name}</div>
                  <div className="small muted">{p.role} · {p.email}</div>
                </div>
                <DeleteButton action={deleteContactProfile.bind(null, p.id)} />
              </li>
            ))}
            {profiles.length === 0 && <p className="empty">No contact profiles yet.</p>}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
