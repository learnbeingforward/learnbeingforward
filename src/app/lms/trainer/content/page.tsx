import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { trainerNavLinks as navLinks } from "@/lib/lms-nav-links";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { UploadContentForm } from "@/components/lms/UploadContentForm";
import { TrainerSendContentForm } from "@/components/lms/TrainerSendContentForm";
import { deleteSessionContent } from "@/lib/actions/session-content";
import { format } from "date-fns";

export default async function TrainerContentPage() {
  const session = await auth();
  const trainerId = session!.user.trainerId!;

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
    <DashboardShell title="Content" subtitle="What you've taught" navLinks={navLinks}>
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
          Send Course Content to Eligible Students
        </h2>
        <p className="mb-3 max-w-2xl text-sm text-muted-foreground">
          Pick a batch to see which students have hit the attendance threshold, choose which modules to send
          them, and submit — this goes to the company admin for approval before it unlocks for the students.
        </p>
        <TrainerSendContentForm batches={batches.map((b) => ({ id: b.id, name: b.name, courseName: b.course.name }))} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Upload New Content
          </h2>
          <UploadContentForm
            courses={courses}
            modules={modules}
            subModules={subModules.map((sm) => ({ id: sm.id, title: sm.title, courseModuleId: sm.courseModuleId }))}
          />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Your Content ({content.length})
          </h2>
          <div className="max-h-[700px] space-y-3 overflow-y-auto">
            {content.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nothing uploaded yet.</p>
            ) : (
              content.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-white p-4">
                  <div>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-indigo underline"
                    >
                      {item.title}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {item.course?.name} — {item.courseModule?.title}
                      {item.courseSubModule && ` — ${item.courseSubModule.title}`} &middot;{" "}
                      {format(item.uploadedAt, "MMM d, yyyy")}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    )}
                    <p className={`mt-1 text-xs font-medium ${item.sharedWithStudents ? "text-green-700" : "text-muted-foreground"}`}>
                      {item.sharedWithStudents ? "Sent to students who attended" : "Awaiting admin review"}
                    </p>
                  </div>
                  <DeleteButton action={deleteSessionContent.bind(null, item.id)} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
