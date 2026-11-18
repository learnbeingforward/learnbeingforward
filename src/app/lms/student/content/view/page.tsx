import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { STUDENT_NAV } from "@/components/lbf/nav-config";
import { BackLink } from "@/components/lms/BackLink";

export default async function StudentContentViewerPage({
  searchParams,
}: {
  searchParams: Promise<{ contentId?: string; moduleId?: string; sessionContentId?: string; title?: string; back?: string }>;
}) {
  const { contentId, moduleId, sessionContentId, title, back } = await searchParams;
  const session = await auth();
  const studentId = session!.user.id;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { name: true, college: { select: { name: true } } },
  });
  const shellUser = { name: student?.name ?? "Student", subtitle: student?.college?.name ?? "Student" };

  const params = new URLSearchParams();
  if (contentId) params.set("contentId", contentId);
  if (moduleId) params.set("moduleId", moduleId);
  if (sessionContentId) params.set("sessionContentId", sessionContentId);
  const viewerSrc = `/api/content/view?${params.toString()}#toolbar=0&navpanes=0`;

  return (
    <AppShell nav={STUDENT_NAV} active="content" user={shellUser} crumb="Course materials" title={title ?? "Viewing"} subtitle="Viewable here only — not available to download or share.">
      <BackLink href={back || "/lms/student/content"} label="Back to content" />
      <section className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ height: "80vh" }}>
          <iframe src={viewerSrc} title={title ?? "Document"} style={{ width: "100%", height: "100%", border: "none" }} />
        </div>
      </section>
    </AppShell>
  );
}
