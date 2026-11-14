import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCompanyNavLinksForRole } from "@/lib/lms-nav-links";
import { getUnreadNotificationCount } from "@/lib/notifications";
import type { LmsNavEntry } from "@/components/layout/LmsNav";

export type EmployeePageKey =
  | "accounts.add"
  | "accounts.manage.students"
  | "accounts.manage.colleges"
  | "accounts.manage.trainers"
  | "accounts.manage.admins"
  | "accounts.students"
  | "accounts.details"
  | "colleges.view"
  | "colleges.mous"
  | "colleges.approvals"
  | "colleges.sent"
  | "trainers.manage"
  | "trainers.invoices"
  | "registrations.new"
  | "registrations.approvals"
  | "registrations.password-resets"
  | "overview.notifications.student"
  | "overview.notifications.college"
  | "overview.notifications.trainer"
  | "overview.notifications.admin"
  | "overview.requests"
  | "overview.attendance"
  | "overview.edit-site"
  | "overview.trainer-content"
  | "assessments.build"
  | "assessments.submissions.view"
  | "assessments.submissions.grade"
  | "assessments.submissions.send"
  | "course-content";

type CatalogPermission = { key: EmployeePageKey; label: string };
/** One grantable page. `permissions.length > 1` means this page has distinct
 * sub-actions a grantor can pick from individually, instead of one all-or-nothing
 * checkbox — the page is reachable (and shows in nav) if ANY of them is granted.
 * `cluster`, when set, visually groups several separate pages (each its own href
 * and nav entry) under one shared sub-heading in the builder form — for a feature
 * like Colleges where View/MOUs/Approvals/Sent are genuinely different pages, not
 * sub-actions of one page, but should still read as "one thing with sub-choices"
 * when granting access. */
type CatalogPage = { navLabel: string; href: string; permissions: CatalogPermission[]; cluster?: string };
type CatalogGroup = { group: string; pages: CatalogPage[] };

/**
 * Canonical catalog of every grantable company feature, grouped the same way the
 * Super Admin's own nav is grouped. This is the single source of truth: the
 * Employee Access builder renders its checkboxes from this list, and every company
 * page/action that should be gatable passes one or more of these keys to
 * requireCompanyPageAccess (pages) or requireCompanyAccess (server actions).
 *
 * Several routes share a key on purpose — a drill-down page reached by clicking
 * through a granted page (e.g. Edit Site → Courses) is covered by its parent's key
 * rather than getting its own checkbox, matching how the feature was specified:
 * grant at the nav-item level for simple pages. Pages with real distinct sub-actions
 * (Manage Accounts, Colleges, Trainers) instead list each sub-action as its own
 * permission, so a grantor is asked specifically what to allow within that page
 * rather than handing over the whole thing.
 */
export const EMPLOYEE_PAGE_CATALOG: CatalogGroup[] = [
  {
    group: "Overview",
    pages: [
      {
        navLabel: "Notifications",
        href: "/lms/company/notifications",
        permissions: [
          { key: "overview.notifications.student", label: "Student notifications" },
          { key: "overview.notifications.college", label: "College notifications" },
          { key: "overview.notifications.trainer", label: "Trainer notifications" },
          { key: "overview.notifications.admin", label: "Admin/system notifications" },
        ],
      },
      { navLabel: "Requests", href: "/lms/company", permissions: [{ key: "overview.requests", label: "Requests" }] },
      { navLabel: "Attendance", href: "/lms/company/attendance", permissions: [{ key: "overview.attendance", label: "Attendance" }] },
      { navLabel: "Edit Site", href: "/lms/company/edit-site", permissions: [{ key: "overview.edit-site", label: "Edit Site" }] },
      {
        navLabel: "Trainer-Submitted Content",
        href: "/lms/company/trainer-content",
        permissions: [{ key: "overview.trainer-content", label: "Trainer-Submitted Content" }],
      },
    ],
  },
  {
    group: "Accounts",
    pages: [
      { navLabel: "Add Account", href: "/lms/company/accounts", permissions: [{ key: "accounts.add", label: "Add Account" }] },
      {
        navLabel: "Manage Accounts",
        href: "/lms/company/manage-accounts",
        permissions: [
          { key: "accounts.manage.students", label: "Reset student passwords" },
          { key: "accounts.manage.colleges", label: "Reset college passwords" },
          { key: "accounts.manage.trainers", label: "Reset trainer passwords" },
          { key: "accounts.manage.admins", label: "Reset admin/employee passwords" },
        ],
      },
      { navLabel: "All Students", href: "/lms/company/students", permissions: [{ key: "accounts.students", label: "All Students" }] },
      {
        navLabel: "Colleges",
        href: "/lms/company/colleges",
        cluster: "Colleges",
        permissions: [{ key: "colleges.view", label: "View colleges & send training requests" }],
      },
      {
        navLabel: "College MOUs",
        href: "/lms/company/colleges/mous",
        cluster: "Colleges",
        permissions: [{ key: "colleges.mous", label: "View & manage MOUs" }],
      },
      {
        navLabel: "College Approvals",
        href: "/lms/company/colleges/approvals",
        cluster: "Colleges",
        permissions: [{ key: "colleges.approvals", label: "Approve training contract rates" }],
      },
      {
        navLabel: "College Sent Items",
        href: "/lms/company/colleges/sent",
        cluster: "Colleges",
        permissions: [{ key: "colleges.sent", label: "View sent/invoiced training items" }],
      },
      {
        navLabel: "Trainers",
        href: "/lms/company/trainers",
        permissions: [
          { key: "trainers.manage", label: "Create & manage trainers (rate, profile, login)" },
          { key: "trainers.invoices", label: "Decide trainer invoices" },
        ],
      },
      { navLabel: "Account Details", href: "/lms/company/account-details", permissions: [{ key: "accounts.details", label: "Account Details" }] },
    ],
  },
  {
    group: "Registrations & Approvals",
    pages: [
      { navLabel: "New Registrations", href: "/lms/company/registrations", permissions: [{ key: "registrations.new", label: "New Registrations" }] },
      { navLabel: "Approvals from College", href: "/lms/company/approvals", permissions: [{ key: "registrations.approvals", label: "Approvals from College" }] },
      { navLabel: "Password Reset Requests", href: "/lms/company/password-resets", permissions: [{ key: "registrations.password-resets", label: "Password Reset Requests" }] },
    ],
  },
  {
    group: "Assessments",
    pages: [
      { navLabel: "Build & Send Assessments", href: "/lms/company/assessments", permissions: [{ key: "assessments.build", label: "Build & Send Assessments" }] },
      {
        navLabel: "Assessment Submissions",
        href: "/lms/company/assessments/submissions",
        permissions: [
          { key: "assessments.submissions.view", label: "View submissions & proctoring snapshots" },
          { key: "assessments.submissions.grade", label: "Grade written answers" },
          { key: "assessments.submissions.send", label: "Send results to student/college, allow retest, delete snapshots" },
        ],
      },
    ],
  },
  {
    group: "Other",
    pages: [{ navLabel: "Course Content", href: "/lms/company/course-content", permissions: [{ key: "course-content", label: "Course Content" }] }],
  },
];

/**
 * Pages that were SUPER_ADMIN-exclusive (ADMIN2 blocked) before Employee Access
 * existed — Account Details, Assessments, and the College MOUs/Approvals/Sent
 * pages. ADMIN2 must stay excluded here exactly as before; Employee Access is the
 * only way to delegate these now, to either an EMPLOYEE or an "Admin"-labeled
 * Employee Access account, which is the point of that feature.
 */
const SUPER_ADMIN_ONLY_KEYS = new Set<EmployeePageKey>([
  "accounts.details",
  "colleges.mous",
  "colleges.approvals",
  "colleges.sent",
  "assessments.build",
  "assessments.submissions.view",
  "assessments.submissions.grade",
  "assessments.submissions.send",
]);

const FLAT_PAGES = EMPLOYEE_PAGE_CATALOG.flatMap((g) => g.pages);
const ALL_KEYS_LIST = FLAT_PAGES.flatMap((p) => p.permissions.map((perm) => perm.key)) as EmployeePageKey[];
const ALL_KEYS = new Set<string>(ALL_KEYS_LIST);

/**
 * Keys retired when pages gained granular sub-permissions. Any employee granted the
 * old broad key keeps equivalent (or, for accounts.manage, broader) access — it
 * expands to every sub-key that replaced it — rather than silently losing access
 * the next time this module changes. Remove an old grant here only once you're sure
 * no stored account still relies on it.
 */
const LEGACY_KEY_EXPANSIONS: Record<string, EmployeePageKey[]> = {
  "accounts.manage": ["accounts.manage.students", "accounts.manage.colleges", "accounts.manage.trainers", "accounts.manage.admins"],
  "accounts.colleges": ["colleges.view"],
  "accounts.trainers": ["trainers.manage", "trainers.invoices"],
  "overview.notifications": [
    "overview.notifications.student",
    "overview.notifications.college",
    "overview.notifications.trainer",
    "overview.notifications.admin",
  ],
  "assessments.submissions": ["assessments.submissions.view", "assessments.submissions.grade", "assessments.submissions.send"],
};

export function parseEmployeeKeys(value: unknown): EmployeePageKey[] {
  if (!Array.isArray(value)) return [];
  const result = new Set<EmployeePageKey>();
  for (const v of value) {
    if (typeof v !== "string") continue;
    if (ALL_KEYS.has(v)) {
      result.add(v as EmployeePageKey);
    } else if (v in LEGACY_KEY_EXPANSIONS) {
      for (const expanded of LEGACY_KEY_EXPANSIONS[v]) result.add(expanded);
    }
  }
  return Array.from(result);
}

export async function getEmployeeKeys(userId: string): Promise<EmployeePageKey[]> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { employeePageKeys: true } });
  return parseEmployeeKeys(user?.employeePageKeys);
}

/** First granted page for this employee, used as the post-login landing page and as the
 * fallback redirect when they try to open something they weren't granted. */
export function employeeFirstHref(keys: EmployeePageKey[]): string {
  const first = FLAT_PAGES.find((page) => page.permissions.some((perm) => keys.includes(perm.key)));
  return first?.href ?? "/lms/company/profile";
}

export function buildEmployeeNavLinks(keys: EmployeePageKey[]): LmsNavEntry[] {
  const groups: LmsNavEntry[] = [];
  for (const group of EMPLOYEE_PAGE_CATALOG) {
    const children = group.pages
      .filter((page) => page.permissions.some((perm) => keys.includes(perm.key)))
      .map((page) => ({ href: page.href, label: page.navLabel }));
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

function keysForRole(role: "SUPER_ADMIN" | "ADMIN2"): EmployeePageKey[] {
  if (role === "SUPER_ADMIN") return ALL_KEYS_LIST;
  return ALL_KEYS_LIST.filter((k) => !SUPER_ADMIN_ONLY_KEYS.has(k));
}

/** The current session's full effective permission set — for call sites (like
 * notification visibility) that need to check more than one key at once, which
 * requireCompanyAccess's any-of matching can't express on its own. Empty array for
 * anyone outside the company-staff/employee roles. */
export async function getViewerKeys(): Promise<EmployeePageKey[]> {
  const session = await auth();
  if (!session?.user) return [];
  const role = session.user.role;
  if (role === "SUPER_ADMIN" || role === "ADMIN2") return keysForRole(role);
  if (role === "EMPLOYEE") return getEmployeeKeys(session.user.id);
  return [];
}

/**
 * Call at the top of every grantable company page (server component). Pass one key
 * for a simple page, an array for a page with sub-permissions (access granted if
 * ANY of them match), or omit it for pages every signed-in company-area role should
 * reach regardless of grants (currently only Profile).
 *
 * SUPER_ADMIN always passes. ADMIN2 passes for everything it already had — except
 * the pages in SUPER_ADMIN_ONLY_KEYS, which stay off-limits to ADMIN2 exactly as
 * before Employee Access existed. EMPLOYEE passes only when granted one of the
 * requested keys; otherwise they're redirected to the first page they *were*
 * granted (never shown a bare "not authorized" dead end). Any other role reaching a
 * /lms/company/* URL is sent back to their own portal.
 *
 * Returns `keys`: the viewer's full effective permission set, so a page with
 * sub-permissions (e.g. Manage Accounts) can conditionally render just the parts
 * it granted, the same way for every role.
 */
/** Puts a red-dot `badge` on the Notifications nav entry (and its parent group)
 * when there's unread activity — the single place every company page's nav passes
 * through, so this alone keeps the whole admin area's nav in sync. */
function withNotificationBadge(navLinks: LmsNavEntry[], hasUnread: boolean): LmsNavEntry[] {
  if (!hasUnread) return navLinks;
  return navLinks.map((entry) =>
    "children" in entry
      ? { ...entry, children: entry.children.map((c) => (c.href === "/lms/company/notifications" ? { ...c, badge: true } : c)) }
      : entry.href === "/lms/company/notifications"
        ? { ...entry, badge: true }
        : entry
  );
}

export async function requireCompanyPageAccess(anyOfKeys?: EmployeePageKey | EmployeePageKey[]) {
  const needed = anyOfKeys ? (Array.isArray(anyOfKeys) ? anyOfKeys : [anyOfKeys]) : undefined;
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const role = session.user.role;
  if (role === "SUPER_ADMIN" || role === "ADMIN2") {
    const keys = keysForRole(role);
    if (needed && !needed.some((k) => keys.includes(k))) redirect("/lms/company");
    const hasUnread = (await getUnreadNotificationCount(keys)) > 0;
    return { session, navLinks: withNotificationBadge(getCompanyNavLinksForRole(role) as LmsNavEntry[], hasUnread), keys, hasUnread };
  }
  if (role === "EMPLOYEE") {
    const keys = await getEmployeeKeys(session.user.id);
    if (needed && !needed.some((k) => keys.includes(k))) redirect(employeeFirstHref(keys));
    const hasUnread = (await getUnreadNotificationCount(keys)) > 0;
    return { session, navLinks: withNotificationBadge(buildEmployeeNavLinks(keys), hasUnread), keys, hasUnread };
  }

  if (role === "COLLEGE_ADMIN") redirect("/lms/college");
  if (role === "TRAINER") redirect("/lms/trainer");
  redirect("/lms/student");
}

/**
 * Server-action equivalent of requireCompanyPageAccess — throws instead of
 * redirecting, for use inside "use server" mutations. Same rules: SUPER_ADMIN
 * always passes; ADMIN2 passes unless every requested key is SUPER_ADMIN-only;
 * EMPLOYEE passes only with a matching grant.
 */
export async function requireCompanyAccess(anyOfKeys: EmployeePageKey | EmployeePageKey[]) {
  const needed = Array.isArray(anyOfKeys) ? anyOfKeys : [anyOfKeys];
  const session = await auth();
  if (!session?.user) throw new Error("Not authorized.");

  const role = session.user.role;
  if (role === "SUPER_ADMIN" || role === "ADMIN2") {
    const keys = keysForRole(role as "SUPER_ADMIN" | "ADMIN2");
    if (needed.some((k) => keys.includes(k))) return session;
  } else if (role === "EMPLOYEE") {
    const keys = await getEmployeeKeys(session.user.id);
    if (needed.some((k) => keys.includes(k))) return session;
  }
  throw new Error("Not authorized.");
}
