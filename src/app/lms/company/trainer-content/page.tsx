import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/lms/BackLink";
import { DeleteButton } from "@/components/lms/DeleteButton";
import {
  sendSessionContentToAttendedStudents,
  unshareSessionContent,
  deleteSessionContentAsAdmin,
} from "@/lib/actions/session-content";
import Link from "next/link";
import { format } from "date-fns";

export default async function TrainerContentReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const { courseId } = await searchParams;
  const { navLinks } = await requireCompanyPageAccess("overview.trainer-content");

  const allContent = await prisma.sessionContent.findMany({
    include: { trainer: true, course: true, courseModule: true, courseSubModule: true },
    orderBy: { uploadedAt: "desc" },
  });

  if (courseId) {
    const course = allContent.find((c) => c.courseId === courseId)?.course;
    const items = allContent.filter((c) => c.courseId === courseId);

    return (
      <DashboardShell title={course?.name ?? "Course"} subtitle="Trainer-submitted content" navLinks={navLinks}>
        <BackLink href="/lms/company/trainer-content" label="Back to all courses" />
        <div className="rounded-xl border border-border bg-white">
          {items.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Nothing submitted for this course yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-indigo underline">
                      {item.title}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {item.trainer.name} &middot; {item.courseModule?.title}
                      {item.courseSubModule && ` — ${item.courseSubModule.title}`} &middot;{" "}
                      {format(item.uploadedAt, "MMM d, yyyy")}
                    </p>
                    {item.description && <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>}
                    {item.sharedWithStudents ? (
                      <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-100">
                        Sent {item.sharedAt ? format(item.sharedAt, "MMM d, yyyy") : ""}
                      </Badge>
                    ) : (
                      <Badge className="mt-2 bg-amber-100 text-amber-700 hover:bg-amber-100">Not sent yet</Badge>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {item.sharedWithStudents ? (
                      <form action={unshareSessionContent.bind(null, item.id)}>
                        <Button type="submit" size="sm" variant="outline" className="border-border text-muted-foreground">
                          Unshare
                        </Button>
                      </form>
                    ) : (
                      <form action={sendSessionContentToAttendedStudents.bind(null, item.id)}>
                        <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                          Send to Student
                        </Button>
                      </form>
                    )}
                    <DeleteButton action={deleteSessionContentAsAdmin.bind(null, item.id)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    );
  }

  const byCourse = new Map<string, { name: string; count: number; sentCount: number }>();
  for (const item of allContent) {
    if (!item.courseId || !item.course) continue;
    const existing = byCourse.get(item.courseId) ?? { name: item.course.name, count: 0, sentCount: 0 };
    existing.count += 1;
    if (item.sharedWithStudents) existing.sentCount += 1;
    byCourse.set(item.courseId, existing);
  }

  return (
    <DashboardShell title="Trainer-Submitted Content" subtitle="Review before it reaches students" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Content trainers upload lands here first — it never touches the official course content library. Open a
        course to review what was submitted and send it on to the students who actually attended that class.
      </p>
      {byCourse.size === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No trainer content submitted yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(byCourse.entries()).map(([cId, c]) => (
            <Link
              key={cId}
              href={`/lms/company/trainer-content?courseId=${cId}`}
              className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
            >
              <p className="font-semibold text-indigo">{c.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {c.count} item{c.count !== 1 ? "s" : ""} &middot; {c.sentCount} sent
              </p>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
