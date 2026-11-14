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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCourse, deleteCourse, createCourseModule, deleteCourseModule, createCourseSubModule, deleteCourseSubModule } from "@/lib/actions/site-content";
import { TechCheckboxGrid } from "@/components/lms/TechCheckboxGrid";
import { SubModuleModuleSelect } from "@/components/lms/SubModuleModuleSelect";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function EditCoursesPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const [courses, technologies, modulesForSelect] = await Promise.all([
    prisma.course.findMany({ orderBy: { order: "asc" }, include: { modules: { orderBy: { order: "asc" }, include: { subModules: { orderBy: { order: "asc" } } } } } }),
    prisma.technology.findMany({ orderBy: { order: "asc" } }),
    prisma.courseModule.findMany({ orderBy: { title: "asc" }, include: { course: true } }),
  ]);

  return (
    <AppShell nav={nav} active="edit-site" user={shellUser} hasUnread={hasUnread} crumb="Overview › Edit Site › Courses" title="Courses" subtitle="Edit site — Courses & curriculum">
      <div className="row">
        <div className="side stack" style={{ gap: 20 }}>
          <section className="card">
            <h2 className="h2" style={{ marginBottom: 18 }}>Add new course</h2>
            <form action={createCourse} className="space-y-5">
              <div>
                <Label htmlFor="name">Course Name<RequiredMark /></Label>
                <Input id="name" name="name" required className="mt-1.5" placeholder="e.g. Cloud Computing" />
              </div>
              <div>
                <Label htmlFor="category">Category<RequiredMark /></Label>
                <Input id="category" name="category" required className="mt-1.5" placeholder="e.g. Development" />
              </div>
              <div>
                <Label htmlFor="shortDescription">Short Description (optional — for the course card)</Label>
                <Textarea id="shortDescription" name="shortDescription" rows={2} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="description">Full Description<RequiredMark /></Label>
                <Textarea id="description" name="description" required rows={4} className="mt-1.5" />
              </div>
              <div>
                <Label>Technologies Covered</Label>
                <div className="mt-1.5"><TechCheckboxGrid technologies={technologies} name="techSlugs" /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPlaceholder" name="isPlaceholder" className="size-4" />
                <Label htmlFor="isPlaceholder" className="cursor-pointer">Mark as placeholder syllabus (real content not provided yet)</Label>
              </div>
              <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">Create Course</Button>
            </form>
          </section>

          <section className="card">
            <h2 className="h2" style={{ marginBottom: 18 }}>Add module to a course</h2>
            <form action={createCourseModule} className="space-y-5">
              <div>
                <Label htmlFor="courseId">Course<RequiredMark /></Label>
                <Select name="courseId" required>
                  <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trackTitle">Track / Section Title (optional)</Label>
                <Input id="trackTitle" name="trackTitle" className="mt-1.5" placeholder="e.g. Programming Track (leave blank for a single unnamed section)" />
              </div>
              <div>
                <Label htmlFor="title">Module Title<RequiredMark /></Label>
                <Input id="title" name="title" required className="mt-1.5" placeholder="e.g. Java Fundamentals" />
              </div>
              <div>
                <Label htmlFor="level">Level (optional)</Label>
                <Input id="level" name="level" className="mt-1.5" placeholder="e.g. Fundamentals" />
              </div>
              <div>
                <Label htmlFor="topics">Topics / Sub-Modules (one per line)<RequiredMark /></Label>
                <p className="mt-1 text-xs text-muted-foreground">Each line becomes a selectable sub-module when attaching course content later.</p>
                <Textarea id="topics" name="topics" required rows={4} className="mt-1.5" placeholder={"Syntax & data types\nControl flow\nOOP basics"} />
              </div>
              <div>
                <Label htmlFor="delivery">Delivery Note (optional)</Label>
                <Input id="delivery" name="delivery" className="mt-1.5" placeholder="e.g. Hands-on labs with daily practice problems." />
              </div>
              <div>
                <Label>Technologies</Label>
                <div className="mt-1.5"><TechCheckboxGrid technologies={technologies} name="techSlugs" /></div>
              </div>
              <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">Add Module</Button>
            </form>
          </section>

          <section className="card">
            <h2 className="h2" style={{ marginBottom: 18 }}>Add a sub-module</h2>
            <form action={createCourseSubModule} className="space-y-5">
              <div>
                <Label htmlFor="courseModuleId">Module<RequiredMark /></Label>
                <SubModuleModuleSelect modules={modulesForSelect} />
              </div>
              <div>
                <Label htmlFor="subModuleTitle">Sub-Module Title<RequiredMark /></Label>
                <Input id="subModuleTitle" name="title" required className="mt-1.5" placeholder="e.g. Exception Handling" />
              </div>
              <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">Add Sub-Module</Button>
            </form>
          </section>
        </div>

        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>Current courses ({courses.length})</h2>
          <div className="stack" style={{ gap: 12, maxHeight: 900, overflowY: "auto" }}>
            {courses.map((course) => (
              <div key={course.id} className="box">
                <div className="split">
                  <div>
                    <div className="strong">{course.name}</div>
                    <div className="small muted">{course.modules.length} module{course.modules.length !== 1 ? "s" : ""}</div>
                  </div>
                  <DeleteButton action={deleteCourse.bind(null, course.id)} />
                </div>
                {course.modules.length > 0 && (
                  <div className="stack" style={{ gap: 8, marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                    {course.modules.map((mod) => (
                      <div key={mod.id} className="small">
                        <div className="split">
                          <span className="strong" style={{ fontSize: 13 }}>{mod.trackTitle} — {mod.title}</span>
                          <DeleteButton action={deleteCourseModule.bind(null, mod.id)} />
                        </div>
                        {mod.subModules.length > 0 && (
                          <div className="stack" style={{ gap: 2, marginLeft: 12 }}>
                            {mod.subModules.map((sm) => (
                              <div key={sm.id} className="split muted">
                                <span>— {sm.title}</span>
                                <DeleteButton action={deleteCourseSubModule.bind(null, sm.id)} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
