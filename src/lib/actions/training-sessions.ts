"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ScheduleSessionState = { ok: boolean; error?: string } | null;

const SLOT_NUMBERS = [1, 2, 3] as const;

export async function scheduleTrainingSession(
  _prevState: ScheduleSessionState,
  formData: FormData
): Promise<ScheduleSessionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Not authorized." };
  }

  const batchId = String(formData.get("batchId") ?? "");
  const trainerId = String(formData.get("trainerId") ?? "");
  const sessionDateInput = String(formData.get("sessionDate") ?? "");

  if (!batchId || !trainerId || !sessionDateInput) {
    return { ok: false, error: "Batch, trainer, and date are required." };
  }

  const sessionDate = new Date(`${sessionDateInput}T00:00:00`);
  if (Number.isNaN(sessionDate.getTime())) {
    return { ok: false, error: "Enter a valid date." };
  }

  const slots = SLOT_NUMBERS.map((n) => {
    const include = formData.get(`slot${n}_include`) === "on";
    if (!include) return null;
    const timeValue = String(formData.get(`slot${n}_time`) ?? "");
    const [startTime, endTime] = timeValue.split("|");
    const courseModuleId = String(formData.get(`slot${n}_moduleId`) ?? "").trim() || null;
    const topic = String(formData.get(`slot${n}_topic`) ?? "").trim() || null;
    if (!startTime || !endTime) return null;
    return { slotNumber: n, startTime, endTime, courseModuleId, topic };
  }).filter((s): s is NonNullable<typeof s> => s !== null);

  if (slots.length === 0) {
    return { ok: false, error: "Include at least one session slot with a time." };
  }

  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch) return { ok: false, error: "Batch not found." };

  try {
    await prisma.$transaction(async (tx) => {
      if (batch.trainerId !== trainerId) {
        await tx.batch.update({ where: { id: batchId }, data: { trainerId } });
        await tx.enrollment.updateMany({ where: { batchId }, data: { trainerId } });
      }
      for (const slot of slots) {
        await tx.trainingSession.create({
          data: {
            batchId,
            trainerId,
            sessionDate,
            slotNumber: slot.slotNumber,
            startTime: slot.startTime,
            endTime: slot.endTime,
            courseModuleId: slot.courseModuleId,
            topic: slot.topic,
          },
        });
      }
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { ok: false, error: "One of these slots is already scheduled for this batch on this date." };
    }
    throw err;
  }

  revalidatePath("/lms/company/trainers/schedule");
  revalidatePath("/lms/trainer/schedule");
  revalidatePath("/lms/company/attendance");

  return { ok: true };
}
