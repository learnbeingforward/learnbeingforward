import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { createCourse, deleteCourse, createCourseModule, createCourseSubModule, deleteCourseSubModule } from "@/lib/actions/site-content";
import { TechCheckboxGrid } from "@/components/lms/TechCheckboxGrid";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };
const CATEGORY_LABEL: Record<string, string> = { TECHNICAL: "Technical", APTITUDE: "Aptitude", SOFT_SKILL: "Soft Skills" };

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
    <AppShell
      nav={nav}
      active="edit-site"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Edit Site › Courses"
      title="Courses & curriculum"
      subtitle="Add courses and modules. Each module topic becomes a selectable sub-module for course content."
      actions={
        <Link className="btn btn-ghost-light" href="/lms/company/edit-site">
          <Icon name="arrowL" size={16} />
          Back to Edit Site
        </Link>
      }
    >
      <div className="row">
        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Add new course
          </h2>
          <form action={createCourse} className="stack" style={{ gap: 16 }}>
            <div className="grid" style={{ ["--min" as string]: "200px" }}>
              <label className="field">
                <span>
                  Course name <span className="req" aria-hidden="true">*</span>
                </span>
                <input className="input" type="text" name="name" required />
              </label>
              <label className="field">
                <span>
                  Category <span className="req" aria-hidden="true">*</span>
                </span>
                <select className="select" name="category" required defaultValue="TECHNICAL">
                  <option value="TECHNICAL">Technical</option>
                  <option value="APTITUDE">Aptitude</option>
                  <option value="SOFT_SKILL">Soft Skills</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span>Short description (course card)</span>
              <input className="input" type="text" name="shortDescription" />
            </label>
            <label className="field">
              <span>
                Full description <span className="req" aria-hidden="true">*</span>
              </span>
              <textarea className="textarea" name="description" required rows={4} />
            </label>
            <div className="field">
              Technologies covered
              <TechCheckboxGrid technologies={technologies} name="techSlugs" />
            </div>
            <label className="check">
              <input type="checkbox" name="isPlaceholder" /> Mark as placeholder syllabus (real content not provided yet)
            </label>
            <div className="split">
              <span />
              <button className="btn btn-primary" type="submit">
                <Icon name="plus" size={16} />
                Create course
              </button>
            </div>
          </form>
        </section>

        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Add module to a course
          </h2>
          <form action={createCourseModule} className="stack" style={{ gap: 16 }}>
            <label className="field">
              <span>
                Course <span className="req" aria-hidden="true">*</span>
              </span>
              <select className="select" name="courseId" required defaultValue="">
                <option value="" disabled>
                  Select course
                </option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid" style={{ ["--min" as string]: "160px" }}>
              <label className="field">
                <span>Track / section title</span>
                <input className="input" type="text" name="trackTitle" placeholder="e.g. DSA Track" />
              </label>
              <label className="field">
                <span>Level</span>
                <select className="select" name="level" defaultValue="">
                  <option value="">—</option>
                  <option value="Fundamentals">Fundamentals</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span>
                Module title <span className="req" aria-hidden="true">*</span>
              </span>
              <input className="input" type="text" name="title" required />
            </label>
            <label className="field">
              <span>
                Topics / sub-modules (one per line) <span className="req" aria-hidden="true">*</span>
              </span>
              <textarea className="textarea" name="topics" required rows={5} placeholder={"Arrays & strings\nLinked lists\nStacks & queues"} />
              <span className="hint">Each line becomes a sub-module when attaching course content.</span>
            </label>
            <label className="field">
              <span>Delivery note</span>
              <input className="input" type="text" name="delivery" placeholder="e.g. Daily problem sets with walkthroughs" />
            </label>
            <button className="btn btn-primary" type="submit">
              <Icon name="plus" size={16} />
              Add module
            </button>
          </form>
        </section>
      </div>

      <section className="card">
        <div className="split" style={{ marginBottom: 18 }}>
          <h2 className="h2">Existing courses</h2>
        </div>
        <div className="table-wrap">
          <table className="table m-cards" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Modules</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td data-label="Course">
                    <span className="strong">{course.name}</span>
                  </td>
                  <td data-label="Category">{CATEGORY_LABEL[course.domain] ?? course.domain}</td>
                  <td data-label="Modules">{course.modules.length}</td>
                  <td data-label="Status">
                    <span className={`pill ${course.isPlaceholder ? "warning" : "success"}`}>{course.isPlaceholder ? "Placeholder" : "Live"}</span>
                  </td>
                  <td data-label="">
                    <form action={deleteCourse.bind(null, course.id)}>
                      <button className="btn btn-sm" type="submit">
                        <Icon name="trash" size={16} />
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {courses.length === 0 && <p className="empty">No courses yet.</p>}
      </section>

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>
          Add a sub-module to an existing module
        </h2>
        <form action={createCourseSubModule} className="row" style={{ alignItems: "flex-end" }}>
          <label className="field grow">
            <span>
              Module <span className="req" aria-hidden="true">*</span>
            </span>
            <select className="select" name="courseModuleId" required defaultValue="">
              <option value="" disabled>
                Select module
              </option>
              {modulesForSelect.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.course.name} — {m.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field grow">
            <span>
              Sub-module title <span className="req" aria-hidden="true">*</span>
            </span>
            <input className="input" type="text" name="title" required placeholder="e.g. Exception Handling" />
          </label>
          <button className="btn btn-primary" type="submit">
            <Icon name="plus" size={16} />
            Add sub-module
          </button>
        </form>
        <ul className="list" style={{ marginTop: 18 }}>
          {courses.flatMap((course) =>
            course.modules.flatMap((mod) =>
              mod.subModules.map((sm) => (
                <li key={sm.id} className="list-row">
                  <span className="grow small">
                    {course.name} — {mod.title} — {sm.title}
                  </span>
                  <form action={deleteCourseSubModule.bind(null, sm.id)}>
                    <button className="btn-icon danger" type="submit" title="Delete">
                      <Icon name="trash" size={16} />
                    </button>
                  </form>
                </li>
              ))
            )
          )}
        </ul>
      </section>
    </AppShell>
  );
}
