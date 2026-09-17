import { Download, Clock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { studentNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Button } from "@/components/ui/button";
import { getUnlockedContentForStudent } from "@/lib/content-access";
import { requestContentAccess } from "@/lib/actions/content-access";

export default async function StudentContentPage() {
  const session = await auth();
  const studentId = session!.user.id;

  const [unlocked, myRequests] = await Promise.all([
    getUnlockedContentForStudent(studentId),
    prisma.contentAccessRequest.findMany({ where: { studentId } }),
  ]);

  const requestByContentId = new Map(myRequests.map((r) => [r.courseContentId, r]));

  const byCourse = new Map<string, typeof unlocked>();
  for (const item of unlocked) {
    const key = item.course.name;
    if (!byCourse.has(key)) byCourse.set(key, []);
    byCourse.get(key)!.push(item);
  }

  return (
    <DashboardShell title="Content" subtitle="Course materials" navLinks={navLinks}>
      {unlocked.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          Content unlocks here once your trainer has taken a class on that module and marked
          attendance. Nothing&apos;s unlocked yet.
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(byCourse.entries()).map(([courseName, items]) => (
            <div key={courseName}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
                {courseName}
              </h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const request = requestByContentId.get(item.id);
                  return (
                    <div key={item.id} className="rounded-xl border border-border bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-indigo">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.courseModule?.title}</p>
                        </div>
                        {request?.status === "APPROVED" ? (
                          <Button
                            render={<a href={item.fileUrl} target="_blank" rel="noopener noreferrer" />}
                            nativeButton={false}
                            size="sm"
                            className="bg-indigo text-white hover:bg-indigo/90"
                          >
                            <Download className="size-3.5" />
                            Download
                          </Button>
                        ) : request?.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-indigo">
                            <Clock className="size-3.5" /> Request pending
                          </span>
                        ) : (
                          <form action={requestContentAccess.bind(null, item.id)}>
                            <Button type="submit" size="sm" variant="outline" className="border-border text-indigo">
                              Request Access
                            </Button>
                          </form>
                        )}
                      </div>
                      {item.links.length > 0 && (
                        <div className="mt-3 space-y-1 border-t border-border pt-3">
                          <p className="text-xs font-medium text-muted-foreground">Learn more:</p>
                          {item.links.map((l) => (
                            <a
                              key={l.id}
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-indigo underline"
                            >
                              {l.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
