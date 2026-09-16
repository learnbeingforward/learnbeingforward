import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { getIconByName } from "@/lib/icon-catalog";
import { TECH_CATEGORY_LABELS, TECH_CATEGORY_ORDER } from "@/lib/tech-categories";
import { IconPicker } from "@/components/lms/IconPicker";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTechnology, deleteTechnology } from "@/lib/actions/site-content";

export default async function EditTechnologiesPage() {
  const technologies = await prisma.technology.findMany({ orderBy: { order: "asc" } });

  return (
    <DashboardShell title="Technologies" subtitle="Edit site — Technologies" navLinks={navLinks}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Add New Technology
          </h2>
          <form action={createTechnology} className="space-y-5 rounded-xl border border-border bg-white p-6">
            <div>
              <Label htmlFor="name">Technology Name</Label>
              <Input id="name" name="name" required className="mt-1.5" placeholder="e.g. Kubernetes" />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select category">
                    {(value: string | null) => (value ? TECH_CATEGORY_LABELS[value] : "Select category")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TECH_CATEGORY_ORDER.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {TECH_CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Logo</Label>
              <div className="mt-1.5">
                <IconPicker name="iconName" />
              </div>
            </div>

            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">
              Add Technology
            </Button>
          </form>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Current Technologies ({technologies.length})
          </h2>
          <div className="max-h-[600px] space-y-2 overflow-y-auto rounded-xl border border-border bg-white p-4">
            {technologies.map((tech) => {
              const Icon = getIconByName(tech.iconName);
              return (
                <div
                  key={tech.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-cream px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="size-5 text-indigo" />}
                    <div>
                      <p className="text-sm font-medium text-indigo">{tech.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {TECH_CATEGORY_LABELS[tech.category]}
                      </p>
                    </div>
                  </div>
                  <DeleteButton action={deleteTechnology.bind(null, tech.id)} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
