import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { backupUploadToGitHub } from "@/lib/github-upload";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image");
  const assignmentId = String(formData.get("assignmentId") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image is too large." }, { status: 400 });
  }

  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    include: { assessment: true },
  });
  if (
    !assignment ||
    assignment.studentId !== session.user.id ||
    assignment.status !== "IN_PROGRESS" ||
    !assignment.assessment.proctoringEnabled
  ) {
    return NextResponse.json({ error: "Not accepting snapshots for this assessment." }, { status: 403 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "assessment-snapshots", assignmentId);
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}.jpg`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const publicUrl = `/uploads/assessment-snapshots/${assignmentId}/${filename}`;

  try {
    await backupUploadToGitHub(publicUrl, buffer);
  } catch (err) {
    console.error("[assessment-snapshots] GitHub backup threw unexpectedly:", err);
  }

  await prisma.assessmentSnapshot.create({ data: { assignmentId, imageUrl: publicUrl } });

  return NextResponse.json({ ok: true, url: publicUrl });
}
