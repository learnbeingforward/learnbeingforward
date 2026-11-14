import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { TRAINER_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { UploadContentForm } from "@/components/lms/UploadContentForm";
import { TrainerSendContentForm } from "@/components/lms/TrainerSendContentForm";
import { deleteSessionContent } from "@/lib/actions/session-content";
import { format } from "date-fns";

export default async function TrainerContentPage() {
  const session = await auth();
  const trainerId = session!.user.trainerId!;
  const trainer = await prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } });

  const [content, courses, modules, subModules, batches] = await Promise.all([
    prisma.sessionContent.findMany({
      where: { trainerId },
      include: { course: true, courseModule: true, courseSubModule: true },
      orderBy: { uploadedAt: "desc" },
    }),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    prisma.courseModule.findMany({ orderBy: { title: "asc" } }),
    prisma.courseSubModule.findMany({ orderBy: { order: "asc" } }),
    prisma.batch.findMany({ where: { trainerId }, include: { course: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <AppShell
      nav={TRAINER_NAV}
      active="content"
      user={{ name: trainer.name, subtitle: "Trainer" }}
      crumb="Content"
      title="Content"
      subtitle="Share what you've taught. Everything goes to the company admin for approval first."
    >
      <section className="card">
        <h2 className="h2" style={{ marginBottom: 10 }}>
          Send course content to eligible students
        </h2>
        <p className="muted" style={{ marginBottom: 14 }}>
          Pick a batch to see which students hit the attendance threshold, choose modules, and submit for approval.
        </p>
        <TrainerSendContentForm batches={batches.map((b) => ({ id: b.id, name: b.name, courseName: b.course.name }))} />
      </section>

      <div className="row">
        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Upload new content
          </h2>
          <UploadContentForm
            courses={courses}
            modules={modules}
            subModules={subModules.map((sm) => ({ id: sm.id, title: sm.title, courseModuleId: sm.courseModuleId }))}
          />
        </section>

        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Your content ({content.length})
          </h2>
          {content.length === 0 ? (
            <div className="empty">
              <span className="icon-box gold" style={{ margin: "0 auto 10px", width: 48, height: 48, borderRadius: "50%" }}>
                <Icon name="file" size={22} />
              </span>
              <div className="h3" style={{ color: "var(--text)" }}>
                Nothing uploaded yet.
              </div>
              <p className="small muted" style={{ marginTop: 6 }}>
                Uploads show here with status: Pending review → Sent to students.
              </p>
            </div>
          ) : (
            <ul className="list">
              {content.map((item) => (
                <li key={item.id} className="list-row" style={{ alignItems: "flex-start" }}>
                  <div className="grow">
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="strong">
                      {item.title}
                    </a>
                    <div className="small muted">
                      {item.course?.name} — {item.courseModule?.title}
                      {item.courseSubModule && ` — ${item.courseSubModule.title}`} · {format(item.uploadedAt, "MMM d, yyyy")}
                    </div>
                    {item.description && <div className="small muted">{item.description}</div>}
                    <span className={`pill ${item.sharedWithStudents ? "success" : "warning"}`} style={{ marginTop: 6 }}>
                      {item.sharedWithStudents ? "Sent to students" : "Awaiting admin review"}
                    </span>
                  </div>
                  <DeleteButton action={deleteSessionContent.bind(null, item.id)} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
