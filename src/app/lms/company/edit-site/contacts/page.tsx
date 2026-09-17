import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { Button } from "@/components/ui/button";
import { createContactProfile, deleteContactProfile } from "@/lib/actions/site-content";

export default async function EditContactsPage() {
  const profiles = await prisma.contactProfile.findMany({ orderBy: { order: "asc" } });

  return (
    <DashboardShell title="Contacts" subtitle="Edit site — Contact page profiles" navLinks={navLinks}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Add New Contact Person
          </h2>
          <form action={createContactProfile} className="space-y-5 rounded-xl border border-border bg-white p-6">
            <div>
              <Label htmlFor="name">
                Full Name
                <RequiredMark />
              </Label>
              <Input id="name" name="name" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="role">
                Role
                <RequiredMark />
              </Label>
              <Input id="role" name="role" required className="mt-1.5" placeholder="e.g. Placement Coordinator" />
            </div>
            <div>
              <Label htmlFor="email">
                Email
                <RequiredMark />
              </Label>
              <Input id="email" name="email" type="email" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="phone">
                Phone
                <RequiredMark />
              </Label>
              <Input id="phone" name="phone" required className="mt-1.5" placeholder="+91 98765 43210" />
            </div>
            <div>
              <Label htmlFor="photoUrl">Photo URL (optional)</Label>
              <Input id="photoUrl" name="photoUrl" className="mt-1.5" placeholder="https://... (leave blank for a generated avatar)" />
            </div>
            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">
              Add Contact
            </Button>
          </form>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Current Contacts ({profiles.length})
          </h2>
          <div className="space-y-2">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-indigo">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.role} &middot; {p.email}</p>
                </div>
                <DeleteButton action={deleteContactProfile.bind(null, p.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
