import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

/**
 * Lets a buyer download a file from the course they actually paid for — gated
 * by their order's own token (no login), checked fresh on every request so
 * the link only ever works for a PAID order, and only for files that belong
 * to that order's course.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const token = searchParams.get("token");
  const contentId = searchParams.get("contentId");
  const moduleId = searchParams.get("moduleId");

  if (!orderId || !token) {
    return new NextResponse("Missing order reference.", { status: 400 });
  }

  const order = await prisma.courseOrder.findUnique({ where: { id: orderId }, include: { buyListing: true } });
  if (!order || order.token !== token) {
    return new NextResponse("Invalid order link.", { status: 403 });
  }
  if (order.status !== "PAID") {
    return new NextResponse("This order hasn't been confirmed as paid yet.", { status: 403 });
  }

  let fileUrl: string | null = null;
  let filename = "document";

  if (contentId) {
    const content = await prisma.courseContent.findUnique({ where: { id: contentId } });
    if (!content || content.courseId !== order.buyListing.courseId) {
      return new NextResponse("Not found.", { status: 404 });
    }
    fileUrl = content.fileUrl;
    filename = content.title;
  } else if (moduleId) {
    const mod = await prisma.courseModule.findUnique({ where: { id: moduleId } });
    if (!mod?.mainPdfUrl || mod.courseId !== order.buyListing.courseId) {
      return new NextResponse("Not found.", { status: 404 });
    }
    fileUrl = mod.mainPdfUrl;
    filename = mod.mainPdfTitle ?? filename;
  } else {
    return new NextResponse("Missing file reference.", { status: 400 });
  }

  if (!fileUrl.startsWith("/uploads/")) {
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

  const safeName = filename.replace(/["\r\n]/g, "").trim() || "document";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
