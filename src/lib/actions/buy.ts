"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { requireCompanyAccess } from "@/lib/employee-access";
import { generatePdfPreview } from "@/lib/pdf/preview-extract";
import { sendMail } from "@/lib/mail";

async function requireCompany() {
  const session = await auth();
  if (session?.user && isCompanyStaff(session.user.role)) return;
  try {
    await requireCompanyAccess("overview.edit-site");
  } catch {
    throw new Error("Only the company admin can manage the Buy section.");
  }
}

function revalidateBuy() {
  revalidatePath("/buy");
  revalidatePath("/lms/company/edit-site/buy");
}

// ---------- Site-wide payment settings ----------

export async function updateBuyPaymentSettings(formData: FormData) {
  await requireCompany();

  const buyUpiId = String(formData.get("buyUpiId") ?? "").trim() || null;
  const buyQrImageUrl = String(formData.get("buyQrImageUrl") ?? "").trim() || null;

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { buyUpiId, buyQrImageUrl },
    create: { id: "singleton", buyUpiId, buyQrImageUrl },
  });

  revalidateBuy();
}

// ---------- Listings ----------

export async function createBuyListing(formData: FormData) {
  await requireCompany();

  const courseId = String(formData.get("courseId") ?? "");
  const priceInput = String(formData.get("price") ?? "").trim();
  const price = Number.parseInt(priceInput, 10);
  const headline = String(formData.get("headline") ?? "").trim() || null;

  if (!courseId) throw new Error("Select a course.");
  if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a valid price.");

  const existing = await prisma.buyListing.findUnique({ where: { courseId } });
  if (existing) throw new Error("This course already has a Buy listing.");

  const count = await prisma.buyListing.count();
  await prisma.buyListing.create({
    data: { courseId, price, headline, order: count },
  });

  revalidateBuy();
}

export async function updateBuyListing(listingId: string, formData: FormData) {
  await requireCompany();

  const priceInput = String(formData.get("price") ?? "").trim();
  const price = Number.parseInt(priceInput, 10);
  const headline = String(formData.get("headline") ?? "").trim() || null;
  const enabled = formData.get("enabled") === "on";

  if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a valid price.");

  await prisma.buyListing.update({ where: { id: listingId }, data: { price, headline, enabled } });
  revalidateBuy();
}

export async function deleteBuyListing(listingId: string) {
  await requireCompany();

  const pendingOrPaid = await prisma.courseOrder.count({ where: { buyListingId: listingId, status: { not: "CANCELLED" } } });
  if (pendingOrPaid > 0) {
    throw new Error("This listing has orders against it and can't be deleted — disable it instead.");
  }

  await prisma.buyListing.delete({ where: { id: listingId } });
  revalidateBuy();
}

// ---------- Preview locks ----------

export async function setContentPreviewLock(listingId: string, courseContentId: string, formData: FormData) {
  await requireCompany();

  const pagesInput = String(formData.get("previewPages") ?? "4").trim();
  const previewPages = Number.parseInt(pagesInput, 10) || 4;

  const content = await prisma.courseContent.findUnique({ where: { id: courseContentId } });
  if (!content) throw new Error("Content item not found.");

  const lock = await prisma.buyPreviewLock.upsert({
    where: { courseContentId },
    update: { previewPages, buyListingId: listingId },
    create: { buyListingId: listingId, courseContentId, previewPages },
  });

  const previewFileUrl = await generatePdfPreview(content.fileUrl, previewPages, lock.id);
  await prisma.buyPreviewLock.update({ where: { id: lock.id }, data: { previewFileUrl } });

  revalidateBuy();
}

export async function setModulePreviewLock(listingId: string, courseModuleId: string, formData: FormData) {
  await requireCompany();

  const pagesInput = String(formData.get("previewPages") ?? "4").trim();
  const previewPages = Number.parseInt(pagesInput, 10) || 4;

  const mod = await prisma.courseModule.findUnique({ where: { id: courseModuleId } });
  if (!mod?.mainPdfUrl) throw new Error("This module has no book PDF to preview-lock.");

  const lock = await prisma.buyPreviewLock.upsert({
    where: { courseModuleId },
    update: { previewPages, buyListingId: listingId },
    create: { buyListingId: listingId, courseModuleId, previewPages },
  });

  const previewFileUrl = await generatePdfPreview(mod.mainPdfUrl, previewPages, lock.id);
  await prisma.buyPreviewLock.update({ where: { id: lock.id }, data: { previewFileUrl } });

  revalidateBuy();
}

export async function removePreviewLock(lockId: string) {
  await requireCompany();
  await prisma.buyPreviewLock.delete({ where: { id: lockId } });
  revalidateBuy();
}

// ---------- Checkout ----------

export type CreateOrderState = { ok: boolean; error?: string; orderId?: string; token?: string } | null;

export async function createCourseOrder(
  listingId: string,
  _prevState: CreateOrderState,
  formData: FormData
): Promise<CreateOrderState> {
  const listing = await prisma.buyListing.findUnique({ where: { id: listingId } });
  if (!listing || !listing.enabled) return { ok: false, error: "This course isn't available for purchase." };

  const buyerName = String(formData.get("buyerName") ?? "").trim();
  const buyerEmail = String(formData.get("buyerEmail") ?? "").trim();
  const buyerPhone = String(formData.get("buyerPhone") ?? "").trim() || null;

  if (!buyerName || !buyerEmail) {
    return { ok: false, error: "Name and email are required." };
  }

  const token = randomBytes(24).toString("hex");
  const order = await prisma.courseOrder.create({
    data: { buyListingId: listingId, buyerName, buyerEmail, buyerPhone, amount: listing.price, token },
  });

  return { ok: true, orderId: order.id, token };
}

export async function buyerClaimPaid(orderId: string, token: string) {
  const order = await prisma.courseOrder.findUnique({ where: { id: orderId } });
  if (!order || order.token !== token || order.status !== "PENDING") return;

  await prisma.courseOrder.update({ where: { id: orderId }, data: { buyerClaimedPaidAt: new Date() } });

  const { notify } = await import("@/lib/notifications");
  await notify("ADMIN", `A buyer marked a course order as paid — needs confirmation`, {
    message: `${order.buyerName} (${order.buyerEmail}) — ₹${order.amount}`,
    href: "/lms/company/edit-site/buy/orders",
    requiredKey: "overview.edit-site",
  });

  revalidatePath(`/buy/order/${orderId}`);
}

export async function confirmOrderPaid(orderId: string) {
  await requireCompany();

  const order = await prisma.courseOrder.findUnique({
    where: { id: orderId },
    include: { buyListing: { include: { course: true } } },
  });
  if (!order || order.status === "PAID") return;

  await prisma.courseOrder.update({ where: { id: orderId }, data: { status: "PAID", paidAt: new Date() } });

  const downloadBase = `https://learnbeingforward.in/buy/order/${order.id}?token=${order.token}`;
  const lines: string[] = [
    `Hi ${order.buyerName},`,
    "",
    `Thanks for purchasing ${order.buyListing.course.name}. Your books are ready — view and download them here:`,
    downloadBase,
    "",
    "This link is yours alone — please don't share it.",
    "",
    "— Learn Being Forward",
  ];

  try {
    await sendMail({
      to: order.buyerEmail,
      subject: `Your ${order.buyListing.course.name} purchase is ready`,
      text: lines.join("\n"),
    });
    await prisma.courseOrder.update({ where: { id: orderId }, data: { emailSentAt: new Date() } });
  } catch (err) {
    console.error("[buy] Failed to email purchase confirmation:", err);
    // The order is still marked PAID and the buyer can always revisit their
    // own order link — a failed send here shouldn't undo the sale.
  }

  revalidatePath("/lms/company/edit-site/buy/orders");
  revalidatePath(`/buy/order/${orderId}`);
}

export async function cancelOrder(orderId: string) {
  await requireCompany();
  await prisma.courseOrder.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "CANCELLED" } });
  revalidatePath("/lms/company/edit-site/buy/orders");
}
