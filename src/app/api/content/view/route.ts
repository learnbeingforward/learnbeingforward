import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { watermarkPdf } from "@/lib/pdf/watermark";

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

async function buyerHasCourse(buyerUserId: string, courseId: string) {
  const order = await prisma.courseOrder.findFirst({
    where: { buyerUserId, status: "PAID", buyListing: { courseId } },
  });
  return !!order;
}

/**
 * Serves a course-content file inline, in place of a raw /uploads/... link,
 * so a viewer only ever gets the bytes for a file they've specifically been
 * granted access to — a student's own admin-approved request, or a buyer's
 * own paid order — re-checked on every request. Paired with proxy.ts, which
 * blocks direct requests to /uploads/course-content/** for anyone who isn't
 * staff, so this route is the only way in for that subtree. Buyers (never
 * students) get the file watermarked before it's streamed back.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Not authorized.", { status: 401 });
  }
  const userId = session.user.id;
  const isBuyer = session.user.role === "BUYER";

  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get("contentId");
  const moduleId = searchParams.get("moduleId");
  const sessionContentId = searchParams.get("sessionContentId");

  let fileUrl: string | null = null;
  let filename = "document";

  if (contentId) {
    const content = await prisma.courseContent.findUnique({ where: { id: contentId } });
    if (!content) return new NextResponse("Not found.", { status: 404 });

    const approved = isBuyer
      ? await buyerHasCourse(userId, content.courseId)
      : !!(await prisma.contentAccessRequest.findFirst({ where: { studentId: userId, courseContentId: contentId, status: "APPROVED" } }));
    if (!approved) return new NextResponse("Not approved for this account.", { status: 403 });
    fileUrl = content.fileUrl;
    filename = content.title;
  } else if (moduleId) {
    const courseModule = await prisma.courseModule.findUnique({ where: { id: moduleId } });
    if (!courseModule?.mainPdfUrl) return new NextResponse("Not found.", { status: 404 });

    const approved = isBuyer
      ? await buyerHasCourse(userId, courseModule.courseId)
      : !!(await prisma.contentAccessRequest.findFirst({ where: { studentId: userId, courseModuleId: moduleId, status: "APPROVED" } }));
    if (!approved) return new NextResponse("Not approved for this account.", { status: 403 });
    fileUrl = courseModule.mainPdfUrl;
    filename = courseModule.mainPdfTitle ?? filename;
  } else if (sessionContentId) {
    if (isBuyer) return new NextResponse("Not available for this account.", { status: 403 });
    const content = await prisma.sessionContent.findUnique({ where: { id: sessionContentId } });
    if (!content || !content.sharedWithStudents) return new NextResponse("Not found.", { status: 404 });
    // Same rule as getSharedTrainerContentForStudent: visible only if this
    // student has a present attendance record for a session this trainer
    // taught covering this exact module.
    const attended = await prisma.trainingSession.findFirst({
      where: {
        trainerId: content.trainerId,
        courseModuleId: content.courseModuleId,
        attendanceRecords: { some: { present: true, enrollment: { studentId: userId } } },
      },
    });
    if (!attended) return new NextResponse("Not approved for this account.", { status: 403 });
    fileUrl = content.fileUrl;
    filename = content.title;
  } else {
    return new NextResponse("Missing content reference.", { status: 400 });
  }

  if (!fileUrl || !fileUrl.startsWith("/uploads/")) {
    return new NextResponse("Invalid file.", { status: 400 });
  }

  const absPath = path.join(process.cwd(), "public", fileUrl);
  if (!absPath.startsWith(UPLOADS_ROOT)) {
    return new NextResponse("Invalid path.", { status: 400 });
  }

  let buffer: Buffer;
  try {
    buffer = await readFile(absPath);
  } catch {
    return new NextResponse("File not found.", { status: 404 });
  }

  const ext = path.extname(absPath).toLowerCase();
  const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";
  const safeName = filename.replace(/["\r\n]/g, "").trim() || "document";

  let body: Uint8Array = new Uint8Array(buffer);
  if (isBuyer && ext === ".pdf") {
    try {
      body = new Uint8Array(await watermarkPdf(buffer));
    } catch (err) {
      console.error("[content/view] Watermarking failed, serving the original file instead:", err);
    }
  }

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${safeName}${ext}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
