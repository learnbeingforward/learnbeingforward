import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { trainerNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { createSessionContent, deleteSessionContent } from "@/lib/actions/session-content";
import { format } from "date-fns";

export default async function TrainerContentPage() {
  const session = await auth();
  const trainerId = session!.user.trainerId!;

  const [content, courses] = await Promise.all([
    prisma.sessionContent.findMany({
      where: { trainerId },
      include: { course: true, courseModule: true },
      orderBy: { uploadedAt: "desc" },
    }),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <DashboardShell title="Content" subtitle="What you've taught" navLinks={navLinks}>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Upload New Content
          </h2>
          <form action={createSessionContent} className="space-y-5 rounded-xl border border-border bg-white p-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required className="mt-1.5" placeholder="e.g. Arrays & Time Complexity" />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea id="description" name="description" rows={3} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="courseId">Course (optional)</Label>
              <Select name="courseId">
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
            <FileUploadField name="fileUrl" typeFieldName="fileType" label="File (PDF, PPT, or Word)" category="content" />
            <Button type="submit" className="w-full bg-indigo text-white hover:bg-indigo/90">
              Upload
            </Button>
          </form>
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
                      {item.course?.name ?? "General"} &middot; {format(item.uploadedAt, "MMM d, yyyy")}
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
