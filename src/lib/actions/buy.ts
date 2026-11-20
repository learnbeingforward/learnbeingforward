"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { requireCompanyAccess } from "@/lib/employee-access";
import { generatePdfPreview } from "@/lib/pdf/preview-extract";
import { sendMail } from "@/lib/mail";

function generatePassword() {
  return randomBytes(9).toString("base64").replace(/[+/=]/g, "");
}

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

function parseAudience(formData: FormData): { audience: "PUBLIC" | "STUDENTS" | "COLLEGES"; audienceCollegeIds: string[] | null } {
  const raw = String(formData.get("audience") ?? "PUBLIC");
  const audience = raw === "STUDENTS" || raw === "COLLEGES" ? raw : "PUBLIC";
  const audienceCollegeIds = audience === "COLLEGES" ? formData.getAll("audienceCollegeIds").map(String) : null;
  return { audience, audienceCollegeIds };
}

export async function createBuyListing(formData: FormData) {
  await requireCompany();

  const courseId = String(formData.get("courseId") ?? "");
  const priceInput = String(formData.get("price") ?? "").trim();
  const price = Number.parseInt(priceInput, 10);
  const mrpInput = String(formData.get("mrp") ?? "").trim();
  const mrp = mrpInput ? Number.parseInt(mrpInput, 10) : null;
  const headline = String(formData.get("headline") ?? "").trim() || null;
  const { audience, audienceCollegeIds } = parseAudience(formData);

  if (!courseId) throw new Error("Select a course.");
  if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a valid price.");

  const existing = await prisma.buyListing.findUnique({ where: { courseId } });
  if (existing) throw new Error("This course already has a Buy listing.");

  const count = await prisma.buyListing.count();
  await prisma.buyListing.create({
    data: { courseId, price, mrp, headline, audience, audienceCollegeIds: audienceCollegeIds ?? undefined, order: count },
  });

  revalidateBuy();
}

export async function updateBuyListing(listingId: string, formData: FormData) {
  await requireCompany();

  const priceInput = String(formData.get("price") ?? "").trim();
  const price = Number.parseInt(priceInput, 10);
  const mrpInput = String(formData.get("mrp") ?? "").trim();
  const mrp = mrpInput ? Number.parseInt(mrpInput, 10) : null;
  const headline = String(formData.get("headline") ?? "").trim() || null;
  const enabled = formData.get("enabled") === "on";
  const featured = formData.get("featured") === "on";
  const { audience, audienceCollegeIds } = parseAudience(formData);

  if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a valid price.");

  await prisma.buyListing.update({
    where: { id: listingId },
    data: { price, mrp, headline, enabled, featured, audience, audienceCollegeIds: audienceCollegeIds ?? undefined },
  });
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
  const utr = String(formData.get("utr") ?? "").replace(/\s/g, "");

  if (!buyerName || !buyerEmail) {
    return { ok: false, error: "Name and email are required." };
  }
  if (!/^\d{12}$/.test(utr)) {
    return { ok: false, error: "Enter the 12-digit UPI transaction ID (UTR) from your payment app." };
  }

  const token = randomBytes(24).toString("hex");
  const order = await prisma.courseOrder.create({
    data: { buyListingId: listingId, buyerName, buyerEmail, buyerPhone, utr, amount: listing.price, token },
  });

  const { notify } = await import("@/lib/notifications");
  await notify("ADMIN", `New course order awaiting verification`, {
    message: `${buyerName} (${buyerEmail}) — ₹${listing.price} — UTR ${utr}`,
    href: "/lms/company/edit-site/buy/orders",
    requiredKey: "overview.edit-site",
  });

  return { ok: true, orderId: order.id, token };
}

/**
 * Confirming payment is also the only moment a buyer gets an actual account —
 * never at checkout. A buyer who already has an account (e.g. a repeat
 * purchase with the same email) keeps their existing password; this just
 * attaches the new order to it and emails a "here's your new purchase"
 * notice instead of fresh credentials.
 */
export async function confirmOrderPaid(orderId: string) {
  await requireCompany();

  const order = await prisma.courseOrder.findUnique({
    where: { id: orderId },
    include: { buyListing: { include: { course: true } } },
  });
  if (!order || order.status === "PAID") return;

  let buyer = await prisma.user.findUnique({ where: { email: order.buyerEmail } });
  let generatedPassword: string | null = null;

  if (!buyer) {
    generatedPassword = generatePassword();
    buyer = await prisma.user.create({
      data: {
        name: order.buyerName,
        email: order.buyerEmail,
        phone: order.buyerPhone,
        passwordHash: await bcrypt.hash(generatedPassword, 10),
        role: "BUYER",
      },
    });
  } else if (buyer.role !== "BUYER") {
    // An existing student/staff account happens to share this email — don't
    // silently repurpose it. The order still gets marked paid so nothing is
    // lost; it's just not auto-linked to a login.
    buyer = null;
  }

  await prisma.courseOrder.update({
    where: { id: orderId },
    data: { status: "PAID", paidAt: new Date(), buyerUserId: buyer?.id ?? null },
  });

  const loginUrl = "https://learnbeingforward.in/auth";
  const lines = generatedPassword
    ? [
        `Hi ${order.buyerName},`,
        "",
        `Thanks for purchasing ${order.buyListing.course.name}. We've created an account for you so you can view your book inside the website — it can't be downloaded or shared, only viewed there.`,
        "",
        `Login: ${loginUrl}`,
        `Email: ${order.buyerEmail}`,
        `Password: ${generatedPassword}`,
        "",
        "You can change this password any time from your Profile page once you're logged in.",
        "",
        "— Learn Being Forward",
      ]
    : [
        `Hi ${order.buyerName},`,
        "",
        `Thanks for purchasing ${order.buyListing.course.name} — it's now available in your existing account.`,
        "",
        `Login: ${loginUrl}`,
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
    // The order and account still exist either way — a failed send here
    // shouldn't undo the sale. The admin can resend credentials manually.
  }

  revalidatePath("/lms/company/edit-site/buy/orders");
  revalidatePath(`/buy/order/${orderId}`);
}

export async function rejectOrder(orderId: string, formData: FormData) {
  await requireCompany();

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) throw new Error("Select a reason for rejecting this order.");

  const order = await prisma.courseOrder.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PENDING") return;

  await prisma.courseOrder.update({ where: { id: orderId }, data: { status: "CANCELLED", rejectReason: reason } });
  revalidatePath("/lms/company/edit-site/buy/orders");
  revalidatePath(`/buy/order/${orderId}`);
}

/** Re-sends the "your purchase is ready" notice for an already-confirmed
 * order — never a fresh password (none is retained after the first email),
 * just the login URL and a pointer to "Forgot password" if needed. */
export async function resendOrderEmail(orderId: string) {
  await requireCompany();

  const order = await prisma.courseOrder.findUnique({
    where: { id: orderId },
    include: { buyListing: { include: { course: true } } },
  });
  if (!order || order.status !== "PAID") return;

  const loginUrl = "https://learnbeingforward.in/auth";
  const lines = [
    `Hi ${order.buyerName},`,
    "",
    `Here's your purchase again — ${order.buyListing.course.name}, viewable inside your account.`,
    "",
    `Login: ${loginUrl}`,
    `Email: ${order.buyerEmail}`,
    "",
    "Forgotten your password? Use \"Forgot password\" on the login page.",
    "",
    "— Learn Being Forward",
  ];

  await sendMail({ to: order.buyerEmail, subject: `Your ${order.buyListing.course.name} purchase — resent`, text: lines.join("\n") });
  await prisma.courseOrder.update({ where: { id: orderId }, data: { emailSentAt: new Date() } });
  revalidatePath("/lms/company/edit-site/buy/orders");
}
