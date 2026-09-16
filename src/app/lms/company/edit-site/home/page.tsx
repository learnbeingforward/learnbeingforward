import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { getLucideIcon, LUCIDE_CATALOG } from "@/lib/lucide-catalog";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createHomeFeature, deleteHomeFeature } from "@/lib/actions/site-content";

export default async function EditHomePage() {
  const features = await prisma.homeFeature.findMany({ orderBy: { order: "asc" } });

  return (
    <DashboardShell title="Home Page" subtitle="Edit site — What We Do pillars" navLinks={navLinks}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Add New Pillar
          </h2>
          <form action={createHomeFeature} className="space-y-5 rounded-xl border border-border bg-white p-6">
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Select name="icon" required>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {LUCIDE_CATALOG.map((i) => (
                    <SelectItem key={i.name} value={i.name}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required className="mt-1.5" placeholder="e.g. AI & Emerging Tech Training" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" required rows={3} className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">
              Add Pillar
            </Button>
          </form>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Current Pillars ({features.length})
          </h2>
          <div className="space-y-3">
            {features.map((f) => {
              const Icon = getLucideIcon(f.icon);
              return (
                <div key={f.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-white p-4">
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
                      {Icon && <Icon className="size-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-indigo">{f.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{f.description}</p>
                    </div>
                  </div>
                  <DeleteButton action={deleteHomeFeature.bind(null, f.id)} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
