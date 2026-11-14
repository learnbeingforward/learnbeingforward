import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createTeamMember, deleteTeamMember } from "@/lib/actions/site-content";
import { parseJsonArray } from "@/lib/json-array";
import { CreateTrainerLoginForm } from "@/components/lms/CreateTrainerLoginForm";
import { EditTeamMemberDialog } from "@/components/lms/EditTeamMemberDialog";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function EditEmployeesPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const members = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });

  return (
    <AppShell nav={nav} active="edit-site" user={shellUser} hasUnread={hasUnread} crumb="Overview › Edit Site › Employees" title="Employees" subtitle="Edit site — Team profiles">
      <section className="card">
        <h2 className="h2" style={{ marginBottom: 4 }}>Create trainer login</h2>
        <p className="small muted" style={{ marginBottom: 18, maxWidth: 640 }}>
          This creates an internal login for the LMS trainer dashboard — separate from the public Team page profile below. A trainer doesn&apos;t need a public Team entry to log in, and adding one here doesn&apos;t publish anything publicly.
        </p>
        <CreateTrainerLoginForm />
      </section>

      <div className="row">
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>Add new employee / trainer</h2>
          <form action={createTeamMember} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name<RequiredMark /></Label>
                <Input id="name" name="name" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="role">Role / Designation<RequiredMark /></Label>
                <Input id="role" name="role" required className="mt-1.5" placeholder="e.g. Full-Stack Trainer" />
              </div>
              <div>
                <Label htmlFor="experienceYears">Years of Experience<RequiredMark /></Label>
                <Input id="experienceYears" name="experienceYears" type="number" min="0" required className="mt-1.5" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="isFreelancer" name="isFreelancer" className="size-4" />
                <Label htmlFor="isFreelancer" className="cursor-pointer">Freelance Trainer</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="background">Background (optional)</Label>
              <Textarea id="background" name="background" rows={2} className="mt-1.5" placeholder="Short summary of their expertise" />
            </div>
            <div>
              <Label htmlFor="specialties">Specialties (optional, comma-separated)</Label>
              <Input id="specialties" name="specialties" className="mt-1.5" placeholder="React, Node.js, MongoDB" />
            </div>
            <div>
              <Label htmlFor="colleges">Colleges Trained At (optional, comma-separated, freelancers only)</Label>
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
            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">Add Employee</Button>
          </form>
        </section>

        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>Current team ({members.length})</h2>
          <div className="stack" style={{ gap: 12, maxHeight: 700, overflowY: "auto" }}>
            {members.map((m) => {
              const specialties = parseJsonArray(m.specialties);
              const colleges = parseJsonArray(m.colleges);
              return (
                <div key={m.id} className="box" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <EditTeamMemberDialog
                    member={{
                      id: m.id,
                      name: m.name,
                      role: m.role,
                      experienceYears: m.experienceYears,
                      background: m.background,
                      specialties,
                      isFreelancer: m.isFreelancer,
                      colleges,
                      photoUrl: m.photoUrl,
                      cvUrl: m.cvUrl,
                    }}
                  />
                  <DeleteButton action={deleteTeamMember.bind(null, m.id)} />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
