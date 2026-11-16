"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Row } from "@/lib/site-builder/types";
import { newBlock, newRow, uid } from "@/lib/site-builder/blocks";
import { CAPABILITIES, type PortalId } from "@/lib/site-builder/catalog";

async function requireSiteBuilderAccess() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN2")) {
    throw new Error("Only the main company admin team can use Site Builder.");
  }
  return session;
}

function revalidate() {
  revalidatePath("/lms/company/site-builder");
}

async function logActivity(who: string, what: string, pageId?: string) {
  await prisma.siteBuilderActivity.create({ data: { who, what, pageId } });
}

const BUILTIN_PORTALS: { id: PortalId; name: string; scope: string; icon: string }[] = [
  { id: "public", name: "Public website", scope: "Anyone visiting the site", icon: "globe" },
  { id: "super-admin", name: "Super Admin", scope: "All colleges, trainers and students", icon: "shield" },
  { id: "college", name: "College", scope: "This college's own students", icon: "building" },
  { id: "trainer", name: "Trainer", scope: "This trainer's own batches", icon: "briefcase" },
  { id: "student", name: "Student", scope: "The logged-in student only", icon: "user" },
];

/** Makes sure the 5 built-in portal rows exist — idempotent, called by every
 * Site Builder page load so a fresh database already has them. */
export async function ensureBuiltinPortals() {
  const existing = await prisma.siteBuilderPortal.findMany({ where: { builtin: true }, select: { name: true } });
  const have = new Set(existing.map((p) => p.name));
  const missing = BUILTIN_PORTALS.filter((p) => !have.has(p.name));
  if (missing.length === 0) return;
  await prisma.siteBuilderPortal.createMany({
    data: missing.map((p) => ({ name: p.name, builtin: true, scope: p.scope, icon: p.icon, menu: [] })),
  });
}

export async function createPortal(formData: FormData) {
  await requireSiteBuilderAccess();
  const name = String(formData.get("name") ?? "").trim();
  const basedOn = String(formData.get("basedOn") ?? "");
  const scope = String(formData.get("scope") ?? "").trim();
  if (!name || !basedOn) throw new Error("Name and base portal are required.");
  const base = await prisma.siteBuilderPortal.findUnique({ where: { id: basedOn } });
  await prisma.siteBuilderPortal.create({
    data: { name, builtin: false, basedOn: base?.name ?? basedOn, scope: scope || base?.scope || "", icon: "target", menu: [] },
  });
  await logActivity("Admin", `Created account type "${name}"`);
  revalidate();
}

export async function deletePortal(portalId: string) {
  await requireSiteBuilderAccess();
  const portal = await prisma.siteBuilderPortal.findUnique({ where: { id: portalId } });
  if (!portal || portal.builtin) throw new Error("Built-in portals can't be deleted.");
  await prisma.siteBuilderPortal.delete({ where: { id: portalId } });
  await logActivity("Admin", `Deleted account type "${portal.name}"`);
  revalidate();
}

export async function createPage(portalId: string, name = "New page") {
  await requireSiteBuilderAccess();
  const page = await prisma.siteBuilderPage.create({
    data: { portalId, name, icon: "file", status: "Draft", rows: [] },
  });
  await logActivity("Admin", `Created page "${name}"`, page.id);
  revalidate();
  return page.id;
}

export async function duplicatePage(pageId: string) {
  await requireSiteBuilderAccess();
  const page = await prisma.siteBuilderPage.findUniqueOrThrow({ where: { id: pageId } });
  const copy = await prisma.siteBuilderPage.create({
    data: { portalId: page.portalId, name: `${page.name} (copy)`, subtitle: page.subtitle, icon: page.icon, status: "Draft", rows: page.rows as object },
  });
  await logActivity("Admin", `Duplicated "${page.name}"`, copy.id);
  revalidate();
  return copy.id;
}

export async function deletePage(pageId: string) {
  await requireSiteBuilderAccess();
  const page = await prisma.siteBuilderPage.findUnique({ where: { id: pageId } });
  if (!page) return;
  await prisma.siteBuilderPage.delete({ where: { id: pageId } });
  await logActivity("Admin", `Deleted page "${page.name}"`);
  revalidate();
}

export async function updatePageRows(pageId: string, rows: Row[]) {
  await requireSiteBuilderAccess();
  const page = await prisma.siteBuilderPage.findUniqueOrThrow({ where: { id: pageId }, select: { status: true } });
  await prisma.siteBuilderPage.update({
    where: { id: pageId },
    data: { rows: rows as object, status: page.status === "Published" ? "Unpublished changes" : page.status },
  });
  revalidate();
}

export async function updatePageMeta(pageId: string, formData: FormData) {
  await requireSiteBuilderAccess();
  const name = String(formData.get("name") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "");
  const icon = String(formData.get("icon") ?? "file");
  if (!name) throw new Error("Page name is required.");
  await prisma.siteBuilderPage.update({ where: { id: pageId }, data: { name, subtitle, icon } });
  revalidate();
}

export async function publishPage(pageId: string) {
  await requireSiteBuilderAccess();
  const page = await prisma.siteBuilderPage.findUniqueOrThrow({ where: { id: pageId } });
  await prisma.siteBuilderPage.update({ where: { id: pageId }, data: { status: "Published" } });
  await logActivity("Admin", `Published "${page.name}"`, pageId);
  revalidate();
}

export async function updatePortalMenu(portalId: string, menu: unknown) {
  await requireSiteBuilderAccess();
  await prisma.siteBuilderPortal.update({ where: { id: portalId }, data: { menu: menu as object } });
  revalidate();
}

// ---------------------------------------------------------------------------
// Accounts — every account Site Builder creates is a real EMPLOYEE login.
// Legacy EmployeePageKey access (the app's existing static pages) and
// SiteBuilderPageAccess (pages built here) are independent grants; an
// account can hold either, both, or neither.

export type CreateSiteBuilderUserState = { ok: boolean; error?: string; email?: string } | null;

export async function createSiteBuilderUser(_prev: CreateSiteBuilderUserState, formData: FormData): Promise<CreateSiteBuilderUserState> {
  await requireSiteBuilderAccess();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const pageIds = formData.getAll("pageIds").map(String).filter(Boolean);

  if (!name || !email) return { ok: false, error: "Name and email are required." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "An account with this email already exists." };

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10), role: "EMPLOYEE", phone: phone || null, employeePageKeys: [], employeeKind: "EMPLOYEE" },
  });
  if (pageIds.length > 0) {
    await prisma.siteBuilderPageAccess.createMany({ data: pageIds.map((pageId) => ({ pageId, userId: user.id })) });
  }
  await logActivity("Admin", `Created account for ${email}`);
  revalidate();
  return { ok: true, email };
}

export async function resetSiteBuilderUserPassword(userId: string, formData: FormData) {
  await requireSiteBuilderAccess();
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  await prisma.user.update({ where: { id: userId, role: "EMPLOYEE" }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  revalidate();
}

export async function toggleSiteBuilderUser(userId: string) {
  await requireSiteBuilderAccess();
  // Reuses the EMPLOYEE role's own disable convention: employeeKind holds the
  // display label, so "DISABLED" blocks login the same way EmployeePageKey
  // checks already treat an empty grant set as "nothing to do" — but a true
  // disable needs a real login gate, so this flips employeeKind as the marker
  // the auth callback checks.
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId, role: "EMPLOYEE" } });
  await prisma.user.update({ where: { id: userId }, data: { employeeKind: user.employeeKind === "DISABLED" ? "EMPLOYEE" : "DISABLED" } });
  revalidate();
}

export async function deleteSiteBuilderUser(userId: string) {
  await requireSiteBuilderAccess();
  await prisma.user.delete({ where: { id: userId, role: "EMPLOYEE" } });
  await logActivity("Admin", "Deleted an account");
  revalidate();
}

export async function grantPageAccess(pageId: string, userId: string) {
  await requireSiteBuilderAccess();
  await prisma.siteBuilderPageAccess.upsert({ where: { pageId_userId: { pageId, userId } }, create: { pageId, userId }, update: {} });
  revalidate();
}

export async function revokePageAccess(pageId: string, userId: string) {
  await requireSiteBuilderAccess();
  await prisma.siteBuilderPageAccess.delete({ where: { pageId_userId: { pageId, userId } } }).catch(() => {});
  revalidate();
}

function profileFormRow(fieldLabels: string[], submitLabel: string): Row {
  const row = newRow("1", "b-form");
  const block = row.cols[0].blocks[0];
  block.props.title = submitLabel === "Change password" ? "Change password" : "Your details";
  block.props.submit = submitLabel;
  block.props.saveTo = "";
  block.props.items = fieldLabels.map((label) => ({ id: uid("i"), label, value: "", type: label.toLowerCase().includes("password") ? "Text" : label === "Email" ? "Email" : "Text" }));
  return row;
}

// ---------------------------------------------------------------------------
// AI Create — builds a draft portal, its pages and (optionally) a real
// employee login from a short plain-language description. Rule-based keyword
// matching only; nothing here calls an external AI service.

export type AiBuildInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  org: string;
  scope: string;
  capabilityIds: string[];
  access: Record<string, "view" | "edit">;
};

export async function aiCreateBuild(input: AiBuildInput): Promise<{ portalId: string; pageIds: string[] }> {
  await requireSiteBuilderAccess();
  const email = input.email.trim().toLowerCase();
  if (!input.name.trim() || !/.+@.+\..+/.test(email)) throw new Error("Enter a name and a valid email.");
  if (input.password.length < 8) throw new Error("Password needs at least 8 characters.");
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("That email already has an account.");

  const portal = await prisma.siteBuilderPortal.create({
    data: { name: input.role || `${input.name} (custom)`, builtin: false, basedOn: "super-admin", scope: input.scope, icon: "target", menu: [] },
  });

  const caps = CAPABILITIES.filter((c) => input.capabilityIds.includes(c.id));
  const pages: { name: string; icon: string; access?: "view" | "edit"; rows: Row[] }[] = [
    { name: "Home", icon: "home", rows: [newRow("1", "b-heading"), newRow("1", "b-tiles")] },
    ...caps.map((c) => ({
      name: c.page,
      icon: c.icon,
      access: input.access[c.id] ?? "edit",
      rows: c.rows.map(([layout, ...cols]) => {
        const row = newRow(layout);
        cols.forEach((colTypes, i) => {
          row.cols[i].blocks = colTypes.map((t) => newBlock(t));
        });
        return row;
      }),
    })),
    { name: "Profile", icon: "user", rows: [profileFormRow(["Name", "Email", "Phone"], "Save"), profileFormRow(["Current password", "New password"], "Change password")] },
  ];

  const menu: { id: string; label: string; icon: string; pageId: string; children: unknown[] }[] = [];
  const pageIds: string[] = [];
  for (const p of pages) {
    const readOnly = p.access === "view";
    if (readOnly) {
      for (const row of p.rows) for (const col of row.cols) for (const b of col.blocks) b.props.readOnly = true;
    }
    const page = await prisma.siteBuilderPage.create({
      data: { portalId: portal.id, name: p.name, subtitle: readOnly ? "View only" : "", icon: p.icon, status: "Draft", rows: p.rows as object },
    });
    pageIds.push(page.id);
    menu.push({ id: uid("m"), label: p.name, icon: p.icon, pageId: page.id, children: [] });
  }
  await prisma.siteBuilderPortal.update({ where: { id: portal.id }, data: { menu: menu as unknown as object } });

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: "EMPLOYEE",
      phone: input.phone || null,
      employeePageKeys: [],
      employeeKind: "EMPLOYEE",
    },
  });
  await prisma.siteBuilderPageAccess.createMany({ data: pageIds.map((pageId) => ({ pageId, userId: user.id })) });

  await logActivity("Admin", `AI Create built "${input.role || input.name}" with ${pageIds.length} pages for ${email}`);
  revalidate();
  return { portalId: portal.id, pageIds };
}

export async function aiPublishAll(pageIds: string[]) {
  await requireSiteBuilderAccess();
  await prisma.siteBuilderPage.updateMany({ where: { id: { in: pageIds } }, data: { status: "Published" } });
  await logActivity("Admin", `Published ${pageIds.length} pages`);
  revalidate();
}
