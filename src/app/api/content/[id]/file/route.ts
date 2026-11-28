/**
 * GET /api/content/:id/file — streams a course-content PDF only to a student
 * or buyer who is actually allowed to see it, re-checked on every request.
 * Paired with proxy.ts, which blocks direct requests to
 * /uploads/course-content/** for anyone who isn't staff, so this is the only
 * way in for either of them.
 *
 * :id is whichever row the "View" link points at — a CourseContent item, a
 * CourseModule's whole course book, or (students only) a trainer's
 * SessionContent — resolved here by trying each table in turn, since they
 * live in separate id spaces but share this one URL shape for the PDF viewer.
 *
 * Supports HTTP Range requests so pdfjs-dist only pulls the bytes for the
 * pages actually being viewed instead of the whole file up front.
 */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

type Resolution =
  | { kind: "not_found" }
  | { kind: "forbidden" }
  | { kind: "ok"; fileUrl: string };

async function resolveForStudent(id: string, studentId: string): Promise<Resolution> {
  const content = await prisma.courseContent.findUnique({ where: { id } });
  if (content) {
    const approved = await prisma.contentAccessRequest.findFirst({
      where: { studentId, courseContentId: id, status: "APPROVED" },
    });
    return approved ? { kind: "ok", fileUrl: content.fileUrl } : { kind: "forbidden" };
  }

  const courseModule = await prisma.courseModule.findUnique({ where: { id } });
  if (courseModule) {
    if (!courseModule.mainPdfUrl) return { kind: "not_found" };
    const approved = await prisma.contentAccessRequest.findFirst({
      where: { studentId, courseModuleId: id, status: "APPROVED" },
    });
    return approved ? { kind: "ok", fileUrl: courseModule.mainPdfUrl } : { kind: "forbidden" };
  }

  const sessionContent = await prisma.sessionContent.findUnique({ where: { id } });
  if (sessionContent) {
    if (!sessionContent.sharedWithStudents) return { kind: "not_found" };
    // Same rule as getSharedTrainerContentForStudent: visible only if this
    // student has a present attendance record for a session this trainer
    // taught covering this exact module.
    const attended = await prisma.trainingSession.findFirst({
      where: {
        trainerId: sessionContent.trainerId,
        courseModuleId: sessionContent.courseModuleId,
        attendanceRecords: { some: { present: true, enrollment: { studentId } } },
      },
    });
    return attended ? { kind: "ok", fileUrl: sessionContent.fileUrl } : { kind: "forbidden" };
  }

  return { kind: "not_found" };
}

async function buyerHasCourse(buyerUserId: string, courseId: string) {
  const order = await prisma.courseOrder.findFirst({
    where: { buyerUserId, status: "PAID", buyListing: { courseId } },
  });
  return !!order;
}

// A buyer paid for the whole course, not individual items — there's no
// per-content approval to check, just whether their order covers the course
// this row belongs to. They never see trainer-shared SessionContent.
async function resolveForBuyer(id: string, buyerUserId: string): Promise<Resolution> {
  const content = await prisma.courseContent.findUnique({ where: { id } });
  if (content) {
    const paid = await buyerHasCourse(buyerUserId, content.courseId);
    return paid ? { kind: "ok", fileUrl: content.fileUrl } : { kind: "forbidden" };
  }

  const courseModule = await prisma.courseModule.findUnique({ where: { id } });
  if (courseModule) {
    if (!courseModule.mainPdfUrl) return { kind: "not_found" };
    const paid = await buyerHasCourse(buyerUserId, courseModule.courseId);
    return paid ? { kind: "ok", fileUrl: courseModule.mainPdfUrl } : { kind: "forbidden" };
  }

  return { kind: "not_found" };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return new NextResponse("Not signed in", { status: 401 });

  const resolved =
    session.user.role === "STUDENT"
      ? await resolveForStudent(id, session.user.id)
      : session.user.role === "BUYER"
        ? await resolveForBuyer(id, session.user.id)
        : ({ kind: "forbidden" } as const);
  if (resolved.kind === "not_found") return new NextResponse("Not found", { status: 404 });
  if (resolved.kind === "forbidden") return new NextResponse("Not allowed", { status: 403 });

  if (!resolved.fileUrl.startsWith("/uploads/")) {
    return new NextResponse("Invalid file", { status: 400 });
  }
  const absPath = path.join(process.cwd(), "public", resolved.fileUrl);
  if (!absPath.startsWith(UPLOADS_ROOT)) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  let size: number;
  try {
    size = (await stat(absPath)).size;
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/pdf",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "Content-Disposition": "inline", // never "attachment": no download prompt
    "X-Content-Type-Options": "nosniff",
  };

  const range = req.headers.get("range");
  const match = range ? /bytes=(\d+)-(\d*)/.exec(range) : null;
  const start = match ? Number(match[1]) : 0;
  const end = match ? (match[2] ? Math.min(Number(match[2]), size - 1) : Math.min(start + 262143, size - 1)) : size - 1;

  const stream = createReadStream(absPath, match ? { start, end } : undefined);
  // Readable.toWeb()'s return type doesn't line up with the DOM ReadableStream
  // NextResponse expects at the type level, though they're the same thing at
  // runtime — same kind of cross-library type mismatch as exceljs's Buffer type.
  const body = Readable.toWeb(stream) as unknown as ReadableStream;

  if (match) {
    return new NextResponse(body, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }
  return new NextResponse(body, { headers: { ...headers, "Content-Length": String(size) } });
}
