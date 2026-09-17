import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { trainerNavLinks as navLinks } from "@/lib/lms-nav-links";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { UploadContentForm } from "@/components/lms/UploadContentForm";
import { deleteSessionContent } from "@/lib/actions/session-content";
import { format } from "date-fns";

export default async function TrainerContentPage() {
  const session = await auth();
  const trainerId = session!.user.trainerId!;

  const [content, courses, modules] = await Promise.all([
    prisma.sessionContent.findMany({
      where: { trainerId },
      include: { course: true, courseModule: true },
      orderBy: { uploadedAt: "desc" },
    }),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    prisma.courseModule.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <DashboardShell title="Content" subtitle="What you've taught" navLinks={navLinks}>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Upload New Content
          </h2>
          <UploadContentForm courses={courses} modules={modules} />
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
                      {item.course?.name} — {item.courseModule?.title} &middot;{" "}
                      {format(item.uploadedAt, "MMM d, yyyy")}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    )}
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
