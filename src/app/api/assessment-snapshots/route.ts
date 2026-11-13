import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { backupUploadToGitHub } from "@/lib/github-upload";
import { notify } from "@/lib/notifications";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const FLAG_LABELS: Record<string, string> = {
  phone_detected: "a phone was visible",
  multiple_people: "more than one person was visible",
  looking_away: "they appeared to be looking away from the screen",
  no_face: "no face was visible in frame",
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image");
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const reasonRaw = String(formData.get("reason") ?? "");
  const reason = reasonRaw in FLAG_LABELS ? reasonRaw : null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image is too large." }, { status: 400 });
  }

  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    include: { assessment: true, student: true },
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

  await prisma.assessmentSnapshot.create({ data: { assignmentId, imageUrl: publicUrl, flagReason: reason } });

  if (reason) {
    await notify("ADMIN", `AI proctor flagged ${assignment.student.name}'s attempt`, {
      message: `During "${assignment.assessment.title}", ${FLAG_LABELS[reason]}.`,
      href: `/lms/company/assessments/submissions?assignmentId=${assignmentId}`,
      requiredKey: "assessments.submissions.view",
    });
  }

  return NextResponse.json({ ok: true, url: publicUrl });
}
