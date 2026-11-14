import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { getSiteSettings } from "@/lib/site-settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { Button } from "@/components/ui/button";
import { updateSiteSettings } from "@/lib/actions/site-content";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function EditCompanyContactPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const settings = await getSiteSettings();

  return (
    <AppShell
      nav={nav}
      active="edit-site"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Edit Site › Company Contact"
      title="Company Contact"
      subtitle="This shows in the footer on every page and in the “Company Contact” block on the Contact page."
    >
      <section className="card" style={{ maxWidth: 480 }}>
        <form action={updateSiteSettings} className="space-y-5">
          <div>
            <Label htmlFor="companyContactName">Name<RequiredMark /></Label>
            <Input id="companyContactName" name="companyContactName" required defaultValue={settings.companyContactName} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="companyContactPhone">Phone<RequiredMark /></Label>
            <Input id="companyContactPhone" name="companyContactPhone" required defaultValue={settings.companyContactPhone} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="companyContactEmail">Email<RequiredMark /></Label>
            <Input id="companyContactEmail" name="companyContactEmail" type="email" required defaultValue={settings.companyContactEmail} className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">Save Changes</Button>
        </form>
      </section>
    </AppShell>
  );
}
