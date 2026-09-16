import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { getSiteSettings } from "@/lib/site-settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSiteSettings } from "@/lib/actions/site-content";

export default async function EditCompanyContactPage() {
  const settings = await getSiteSettings();

  return (
    <DashboardShell title="Company Contact" subtitle="Edit site — Footer & Contact page" navLinks={navLinks}>
      <p className="mb-6 max-w-xl text-sm text-muted-foreground">
        This shows in the footer on every page and in the &ldquo;Company Contact&rdquo; block on
        the Contact page.
      </p>
      <form action={updateSiteSettings} className="max-w-md space-y-5 rounded-xl border border-border bg-white p-6">
        <div>
          <Label htmlFor="companyContactName">Name</Label>
          <Input
            id="companyContactName"
            name="companyContactName"
            required
            defaultValue={settings.companyContactName}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="companyContactPhone">Phone</Label>
          <Input
            id="companyContactPhone"
            name="companyContactPhone"
            required
            defaultValue={settings.companyContactPhone}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="companyContactEmail">Email</Label>
          <Input
            id="companyContactEmail"
            name="companyContactEmail"
            type="email"
            required
            defaultValue={settings.companyContactEmail}
            className="mt-1.5"
          />
        </div>
        <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">
          Save Changes
        </Button>
      </form>
    </DashboardShell>
  );
}
