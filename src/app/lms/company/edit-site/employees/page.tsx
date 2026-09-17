import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createTeamMember, deleteTeamMember } from "@/lib/actions/site-content";
import { parseJsonArray } from "@/lib/json-array";
import { CreateTrainerLoginForm } from "@/components/lms/CreateTrainerLoginForm";

export default async function EditEmployeesPage() {
  const members = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });

  return (
    <DashboardShell title="Employees" subtitle="Edit site — Team profiles" navLinks={navLinks}>
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
          Create Trainer Login
        </h2>
        <p className="mb-3 max-w-2xl text-sm text-muted-foreground">
          This creates an internal login for the LMS trainer dashboard — separate from the public
          Team page profile below. A trainer doesn&apos;t need a public Team entry to log in, and
          adding one here doesn&apos;t publish anything publicly.
        </p>
        <CreateTrainerLoginForm />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Add New Employee / Trainer
          </h2>
          <form action={createTeamMember} className="space-y-5 rounded-xl border border-border bg-white p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="role">Role / Designation</Label>
                <Input id="role" name="role" required className="mt-1.5" placeholder="e.g. Full-Stack Trainer" />
              </div>
              <div>
                <Label htmlFor="experienceYears">Years of Experience</Label>
                <Input id="experienceYears" name="experienceYears" type="number" min="0" required className="mt-1.5" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="isFreelancer" name="isFreelancer" className="size-4" />
                <Label htmlFor="isFreelancer" className="cursor-pointer">Freelance Trainer</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="background">Background</Label>
              <Textarea id="background" name="background" rows={2} className="mt-1.5" placeholder="Short summary of their expertise" />
            </div>

            <div>
              <Label htmlFor="specialties">Specialties (comma-separated)</Label>
              <Input id="specialties" name="specialties" className="mt-1.5" placeholder="React, Node.js, MongoDB" />
            </div>

            <div>
              <Label htmlFor="colleges">Colleges Trained At (comma-separated, freelancers only)</Label>
              <Input id="colleges" name="colleges" className="mt-1.5" placeholder="RV College of Engineering, PES University" />
            </div>

            <div>
              <Label htmlFor="photoUrl">Photo URL (optional)</Label>
              <Input id="photoUrl" name="photoUrl" className="mt-1.5" placeholder="https://... (leave blank for a generated avatar)" />
            </div>

            <div>
              <Label htmlFor="cvUrl">CV / Profile PDF URL (optional)</Label>
              <Input id="cvUrl" name="cvUrl" className="mt-1.5" placeholder="https://... link to a hosted PDF" />
            </div>

            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">
              Add Employee
            </Button>
          </form>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Current Team ({members.length})
          </h2>
          <div className="max-h-[700px] space-y-3 overflow-y-auto">
            {members.map((m) => {
              const specialties = parseJsonArray(m.specialties);
              return (
                <div key={m.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-indigo">
                      {m.name} {m.isFreelancer && <Badge className="ml-1 bg-indigo/10 text-indigo hover:bg-indigo/10">Freelance</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.role} &middot; {m.experienceYears} yrs</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {specialties.map((s) => (
                        <span key={s} className="rounded-full bg-cream px-2 py-0.5 text-[10px] text-indigo/80">{s}</span>
                      ))}
                    </div>
                  </div>
                  <DeleteButton action={deleteTeamMember.bind(null, m.id)} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
