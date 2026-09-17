import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCourse,
  deleteCourse,
  createCourseModule,
  deleteCourseModule,
  createCourseSubModule,
  deleteCourseSubModule,
} from "@/lib/actions/site-content";
import { TechCheckboxGrid } from "@/components/lms/TechCheckboxGrid";

export default async function EditCoursesPage() {
  const [courses, technologies, modulesForSelect] = await Promise.all([
    prisma.course.findMany({
      orderBy: { order: "asc" },
      include: { modules: { orderBy: { order: "asc" }, include: { subModules: { orderBy: { order: "asc" } } } } },
    }),
    prisma.technology.findMany({ orderBy: { order: "asc" } }),
    prisma.courseModule.findMany({ orderBy: { title: "asc" }, include: { course: true } }),
  ]);

  return (
    <DashboardShell title="Courses" subtitle="Edit site — Courses & curriculum" navLinks={navLinks}>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Add New Course
          </h2>
          <form action={createCourse} className="space-y-5 rounded-xl border border-border bg-white p-6">
            <div>
              <Label htmlFor="name">
                Course Name
                <RequiredMark />
              </Label>
              <Input id="name" name="name" required className="mt-1.5" placeholder="e.g. Cloud Computing" />
            </div>
            <div>
              <Label htmlFor="category">
                Category
                <RequiredMark />
              </Label>
              <Input id="category" name="category" required className="mt-1.5" placeholder="e.g. Development" />
            </div>
            <div>
              <Label htmlFor="shortDescription">Short Description (optional — for the course card)</Label>
              <Textarea id="shortDescription" name="shortDescription" rows={2} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="description">
                Full Description
                <RequiredMark />
              </Label>
              <Textarea id="description" name="description" required rows={4} className="mt-1.5" />
            </div>
            <div>
              <Label>Technologies Covered</Label>
              <div className="mt-1.5">
                <TechCheckboxGrid technologies={technologies} name="techSlugs" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isPlaceholder" name="isPlaceholder" className="size-4" />
              <Label htmlFor="isPlaceholder" className="cursor-pointer">
                Mark as placeholder syllabus (real content not provided yet)
              </Label>
            </div>
            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">
              Create Course
            </Button>
          </form>

          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-indigo">
            Add Module to a Course
          </h2>
          <form action={createCourseModule} className="space-y-5 rounded-xl border border-border bg-white p-6">
            <div>
              <Label htmlFor="courseId">
                Course
                <RequiredMark />
              </Label>
              <Select name="courseId" required>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="trackTitle">Track / Section Title (optional)</Label>
              <Input id="trackTitle" name="trackTitle" className="mt-1.5" placeholder="e.g. Programming Track (leave blank for a single unnamed section)" />
            </div>
            <div>
              <Label htmlFor="title">
                Module Title
                <RequiredMark />
              </Label>
              <Input id="title" name="title" required className="mt-1.5" placeholder="e.g. Java Fundamentals" />
            </div>
            <div>
              <Label htmlFor="level">Level (optional)</Label>
              <Input id="level" name="level" className="mt-1.5" placeholder="e.g. Fundamentals" />
            </div>
            <div>
              <Label htmlFor="topics">
                Topics / Sub-Modules (one per line)
                <RequiredMark />
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Each line becomes a selectable sub-module when attaching course content later.
              </p>
              <Textarea id="topics" name="topics" required rows={4} className="mt-1.5" placeholder={"Syntax & data types\nControl flow\nOOP basics"} />
            </div>
            <div>
              <Label htmlFor="delivery">Delivery Note (optional)</Label>
              <Input id="delivery" name="delivery" className="mt-1.5" placeholder="e.g. Hands-on labs with daily practice problems." />
            </div>
            <div>
              <Label>Technologies</Label>
              <div className="mt-1.5">
                <TechCheckboxGrid technologies={technologies} name="techSlugs" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">
              Add Module
            </Button>
          </form>

          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-indigo">
            Add a Sub-Module
          </h2>
          <form action={createCourseSubModule} className="space-y-5 rounded-xl border border-border bg-white p-6">
            <div>
              <Label htmlFor="courseModuleId">
                Module
                <RequiredMark />
              </Label>
              <Select name="courseModuleId" required>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select module">
                    {(value: string | null) => {
                      const m = modulesForSelect.find((x) => x.id === value);
                      return m ? `${m.course.name} — ${m.title}` : "Select module";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {modulesForSelect.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.course.name} — {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subModuleTitle">
                Sub-Module Title
                <RequiredMark />
              </Label>
              <Input id="subModuleTitle" name="title" required className="mt-1.5" placeholder="e.g. Exception Handling" />
            </div>
            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">
              Add Sub-Module
            </Button>
          </form>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Current Courses ({courses.length})
          </h2>
          <div className="max-h-[900px] space-y-4 overflow-y-auto">
            {courses.map((course) => (
              <div key={course.id} className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-indigo">{course.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.modules.length} module{course.modules.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <DeleteButton action={deleteCourse.bind(null, course.id)} />
                </div>
                {course.modules.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    {course.modules.map((mod) => (
                      <div key={mod.id} className="text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-indigo/80">
                            {mod.trackTitle} — {mod.title}
                          </span>
                          <DeleteButton action={deleteCourseModule.bind(null, mod.id)} />
                        </div>
                        {mod.subModules.length > 0 && (
                          <div className="mt-1 ml-3 space-y-0.5">
                            {mod.subModules.map((sm) => (
                              <div key={sm.id} className="flex items-center justify-between gap-2 text-muted-foreground">
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
        </div>
      </div>
    </DashboardShell>
  );
}
