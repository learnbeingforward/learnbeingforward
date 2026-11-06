import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCompanyNavLinksForRole } from "@/lib/lms-nav-links";
import type { LmsNavEntry } from "@/components/layout/LmsNav";

export type EmployeePageKey =
  | "accounts.add"
  | "accounts.manage"
  | "accounts.students"
  | "accounts.colleges"
  | "accounts.trainers"
  | "accounts.details"
  | "colleges.mous"
  | "colleges.approvals"
  | "colleges.sent"
  | "registrations.new"
  | "registrations.approvals"
  | "registrations.password-resets"
  | "overview.requests"
  | "overview.attendance"
  | "overview.edit-site"
  | "assessments.build"
  | "assessments.submissions"
  | "course-content";

type CatalogItem = { key: EmployeePageKey; label: string; href: string };
type CatalogGroup = { group: string; items: CatalogItem[] };

/**
 * Canonical catalog of every grantable company feature, grouped the same way the
 * Super Admin's own nav is grouped. This is the single source of truth: the
 * Employee Access builder renders its checkboxes from this list, and every company
 * page that should be gatable passes one of these keys to requireCompanyPageAccess.
 *
 * Several routes share a key on purpose — a drill-down page reached by clicking
 * through a granted page (e.g. Trainers → Invoices, Edit Site → Courses) is covered
 * by its parent's key rather than getting its own checkbox, matching how the
 * feature was specified: grant at the nav-item level, not per sub-page.
 */
export const EMPLOYEE_PAGE_CATALOG: CatalogGroup[] = [
  {
    group: "Accounts",
    items: [
      { key: "accounts.add", label: "Add Account", href: "/lms/company/accounts" },
      { key: "accounts.manage", label: "Manage Accounts", href: "/lms/company/manage-accounts" },
      { key: "accounts.students", label: "All Students", href: "/lms/company/students" },
      { key: "accounts.colleges", label: "Colleges", href: "/lms/company/colleges" },
      { key: "accounts.trainers", label: "Trainers", href: "/lms/company/trainers" },
      { key: "accounts.details", label: "Account Details", href: "/lms/company/account-details" },
    ],
  },
  {
    group: "College Admin",
    items: [
      { key: "colleges.mous", label: "College MOUs", href: "/lms/company/colleges/mous" },
      { key: "colleges.approvals", label: "College Approvals", href: "/lms/company/colleges/approvals" },
      { key: "colleges.sent", label: "College Sent Items", href: "/lms/company/colleges/sent" },
    ],
  },
  {
    group: "Registrations & Approvals",
    items: [
      { key: "registrations.new", label: "New Registrations", href: "/lms/company/registrations" },
      { key: "registrations.approvals", label: "Approvals from College", href: "/lms/company/approvals" },
      { key: "registrations.password-resets", label: "Password Reset Requests", href: "/lms/company/password-resets" },
    ],
  },
  {
    group: "Overview",
    items: [
      { key: "overview.requests", label: "Requests", href: "/lms/company" },
      { key: "overview.attendance", label: "Attendance", href: "/lms/company/attendance" },
      { key: "overview.edit-site", label: "Edit Site", href: "/lms/company/edit-site" },
    ],
  },
  {
    group: "Assessments",
    items: [
      { key: "assessments.build", label: "Build & Send Assessments", href: "/lms/company/assessments" },
      { key: "assessments.submissions", label: "Assessment Submissions", href: "/lms/company/assessments/submissions" },
    ],
  },
  {
    group: "Other",
    items: [{ key: "course-content", label: "Course Content", href: "/lms/company/course-content" }],
  },
];

const ALL_KEYS = new Set<string>(EMPLOYEE_PAGE_CATALOG.flatMap((g) => g.items.map((i) => i.key)));
const FLAT_ITEMS = EMPLOYEE_PAGE_CATALOG.flatMap((g) => g.items);

export function parseEmployeeKeys(value: unknown): EmployeePageKey[] {
  if (!Array.isArray(value)) return [];
  return value.filter((k): k is EmployeePageKey => typeof k === "string" && ALL_KEYS.has(k));
}

export async function getEmployeeKeys(userId: string): Promise<EmployeePageKey[]> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { employeePageKeys: true } });
  return parseEmployeeKeys(user?.employeePageKeys);
}

/** First granted page for this employee, used as the post-login landing page and as the
 * fallback redirect when they try to open something they weren't granted. */
export function employeeFirstHref(keys: EmployeePageKey[]): string {
  const first = FLAT_ITEMS.find((item) => keys.includes(item.key));
  return first?.href ?? "/lms/company/profile";
}

export function buildEmployeeNavLinks(keys: EmployeePageKey[]): LmsNavEntry[] {
  const groups: LmsNavEntry[] = [];
  for (const group of EMPLOYEE_PAGE_CATALOG) {
    const children = group.items.filter((item) => keys.includes(item.key)).map((item) => ({ href: item.href, label: item.label }));
    if (children.length === 0) continue;
    if (children.length === 1) {
      groups.push(children[0]);
    } else {
      groups.push({ label: group.group, children });
    }
  }
  groups.push({ href: "/lms/company/profile", label: "Profile" });
  return groups;
}

/**
 * Call at the top of every grantable company page (server component). SUPER_ADMIN and
 * ADMIN2 always pass through unaffected — this never changes their existing access.
 * EMPLOYEE passes only when granted `key`; otherwise they're redirected to the first
 * page they *were* granted (never shown a bare "not authorized" dead end). Any other
 * role reaching a /lms/company/* URL is sent back to their own portal.
 *
 * Omit `key` for pages every signed-in company-area role should reach regardless of
 * grants (currently only Profile).
 */
export async function requireCompanyPageAccess(key?: EmployeePageKey) {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const role = session.user.role;
  if (role === "SUPER_ADMIN" || role === "ADMIN2") {
    return { session, navLinks: getCompanyNavLinksForRole(role) as LmsNavEntry[] };
  }
  if (role === "EMPLOYEE") {
    const keys = await getEmployeeKeys(session.user.id);
    if (key && !keys.includes(key)) redirect(employeeFirstHref(keys));
    return { session, navLinks: buildEmployeeNavLinks(keys) };
  }

  if (role === "COLLEGE_ADMIN") redirect("/lms/college");
  if (role === "TRAINER") redirect("/lms/trainer");
  redirect("/lms/student");
}
