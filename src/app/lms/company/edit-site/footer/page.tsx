import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { Button } from "@/components/ui/button";
import { createFooterLink, deleteFooterLink } from "@/lib/actions/site-content";

export default async function EditFooterPage() {
  const links = await prisma.footerLink.findMany({ orderBy: { order: "asc" } });

  return (
    <DashboardShell title="Footer Links" subtitle="Edit site — Quick links" navLinks={navLinks}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Add New Link
          </h2>
          <form action={createFooterLink} className="space-y-5 rounded-xl border border-border bg-white p-6">
            <div>
              <Label htmlFor="label">
                Label
                <RequiredMark />
              </Label>
              <Input id="label" name="label" required className="mt-1.5" placeholder="e.g. Careers" />
            </div>
            <div>
              <Label htmlFor="href">
                Link (path or URL)
                <RequiredMark />
              </Label>
              <Input id="href" name="href" required className="mt-1.5" placeholder="/careers" />
            </div>
            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">
              Add Link
            </Button>
          </form>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Current Links ({links.length})
          </h2>
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-indigo">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.href}</p>
                </div>
                <DeleteButton action={deleteFooterLink.bind(null, link.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
