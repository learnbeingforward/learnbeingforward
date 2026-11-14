// Role menus for the redesigned AppShell — same groups/pages as the design
// files' assets/nav.js, pointed at this app's real routes. The assessment
// pages keep their existing DashboardShell UI (explicitly out of scope for
// this redesign) but still need a nav entry so people can get to them.
import type { IconName } from "./icons";

export type NavPage = { key: string; label: string; href: string };
export type NavGroup = { key: string; label: string; icon: IconName; pages: NavPage[] };
export type NavConfig = { label: string; groups: NavGroup[] };

// Maps each super-admin nav page to the Employee Access key(s) that unlock it
// (any one of them is enough) — mirrors requireCompanyPageAccess's own gating
// so an EMPLOYEE's nav never shows a page they'd be redirected away from.
// "account-details" and "employee-access" have no entry: SUPER_ADMIN only.
const PAGE_PERMISSION: Record<string, string[]> = {
  dashboard: ["overview.requests"],
  notifications: ["overview.notifications.student", "overview.notifications.college", "overview.notifications.trainer", "overview.notifications.admin"],
  attendance: ["overview.attendance"],
  "edit-site": ["overview.edit-site"],
  "trainer-content": ["overview.trainer-content"],
  "add-account": ["accounts.add"],
  "manage-accounts": ["accounts.manage.students", "accounts.manage.colleges", "accounts.manage.trainers", "accounts.manage.admins"],
  students: ["accounts.students"],
  colleges: ["colleges.view"],
  trainers: ["trainers.manage"],
  registrations: ["registrations.new"],
  "attendance-approvals": ["registrations.approvals"],
  "password-resets": ["registrations.password-resets"],
  assessments: ["assessments.build"],
  submissions: ["assessments.submissions.view", "assessments.submissions.grade", "assessments.submissions.send"],
  "course-content": ["course-content"],
};

/** Filters SUPER_ADMIN_NAV down to what this viewer can actually use — full
 * access for SUPER_ADMIN, everything but Account Details for ADMIN2, and only
 * matching pages (profile always included) for an EMPLOYEE. */
export function buildSuperAdminNav(role: string | undefined, keys: string[]): NavConfig {
  if (role === "SUPER_ADMIN") return SUPER_ADMIN_NAV;

  const canSee = (pageKey: string) => {
    if (pageKey === "profile") return true;
    if (pageKey === "account-details" || pageKey === "employee-access") return false;
    const required = PAGE_PERMISSION[pageKey];
    if (!required) return true;
    return required.some((k) => keys.includes(k));
  };

  const groups = SUPER_ADMIN_NAV.groups
    .map((g) => ({ ...g, pages: g.pages.filter((p) => canSee(p.key)) }))
    .filter((g) => g.pages.length > 0);

  return { label: SUPER_ADMIN_NAV.label, groups };
}

export const SUPER_ADMIN_NAV: NavConfig = {
  label: "Super Admin",
  groups: [
    {
      key: "overview",
      label: "Overview",
      icon: "home",
      pages: [
        { key: "dashboard", label: "Requests", href: "/lms/company" },
        { key: "notifications", label: "Notifications", href: "/lms/company/notifications" },
        { key: "attendance", label: "Attendance", href: "/lms/company/attendance" },
        { key: "edit-site", label: "Edit Site", href: "/lms/company/edit-site" },
        { key: "trainer-content", label: "Trainer-Submitted Content", href: "/lms/company/trainer-content" },
      ],
    },
    {
      key: "accounts",
      label: "Accounts",
      icon: "users",
      pages: [
        { key: "add-account", label: "Add Account", href: "/lms/company/accounts" },
        { key: "manage-accounts", label: "Manage Accounts", href: "/lms/company/manage-accounts" },
        { key: "students", label: "All Students", href: "/lms/company/students" },
        { key: "colleges", label: "Colleges", href: "/lms/company/colleges" },
        { key: "trainers", label: "Trainers", href: "/lms/company/trainers" },
        { key: "account-details", label: "Account Details", href: "/lms/company/account-details" },
        { key: "employee-access", label: "Employee Access", href: "/lms/company/employee-access" },
      ],
    },
    {
      key: "registrations",
      label: "Registrations & Approvals",
      icon: "clipboard",
      pages: [
        { key: "registrations", label: "New Registrations", href: "/lms/company/registrations" },
        { key: "attendance-approvals", label: "Approvals from College", href: "/lms/company/approvals" },
        { key: "password-resets", label: "Password Reset Requests", href: "/lms/company/password-resets" },
      ],
    },
    {
      key: "assessments",
      label: "Assessments",
      icon: "code",
      pages: [
        { key: "assessments", label: "Build & Send", href: "/lms/company/assessments" },
        { key: "submissions", label: "Submissions", href: "/lms/company/assessments/submissions" },
      ],
    },
    { key: "content", label: "Course Content", icon: "book", pages: [{ key: "course-content", label: "Course Content", href: "/lms/company/course-content" }] },
    { key: "profile", label: "Profile", icon: "user", pages: [{ key: "profile", label: "Profile", href: "/lms/company/profile" }] },
  ],
};

export const TRAINER_NAV: NavConfig = {
  label: "Trainer",
  groups: [
    { key: "details", label: "Personal Details", icon: "user", pages: [{ key: "details", label: "Personal Details", href: "/lms/trainer" }] },
    { key: "batches", label: "My Batches", icon: "users", pages: [{ key: "batches", label: "My Batches", href: "/lms/trainer/batches" }] },
    { key: "schedule", label: "Schedule", icon: "calendar", pages: [{ key: "schedule", label: "Schedule", href: "/lms/trainer/schedule" }] },
    { key: "attendance", label: "Attendance", icon: "check", pages: [{ key: "attendance", label: "Attendance", href: "/lms/trainer/attendance" }] },
    { key: "content", label: "Content", icon: "upload", pages: [{ key: "content", label: "Content", href: "/lms/trainer/content" }] },
    { key: "invoice", label: "Invoice", icon: "money", pages: [{ key: "invoice", label: "Invoice", href: "/lms/trainer/invoice" }] },
  ],
};

export const COLLEGE_NAV: NavConfig = {
  label: "College",
  groups: [
    { key: "overview", label: "Overview", icon: "home", pages: [{ key: "dashboard", label: "Overview", href: "/lms/college" }] },
    {
      key: "students",
      label: "Students",
      icon: "users",
      pages: [
        { key: "students", label: "Browse by branch", href: "/lms/college/students" },
        { key: "all-students", label: "All students", href: "/lms/college/students?view=all" },
        { key: "add-student", label: "Add student", href: "/lms/college/students/new" },
      ],
    },
    { key: "courses", label: "Courses", icon: "book", pages: [{ key: "courses", label: "Courses", href: "/lms/college/courses" }] },
    { key: "batches", label: "Batches", icon: "layers", pages: [{ key: "batches", label: "Batches", href: "/lms/college/batches" }] },
    { key: "queries", label: "Query from Student", icon: "message", pages: [{ key: "queries", label: "Query from Student", href: "/lms/college/queries" }] },
    { key: "contracts", label: "Contracts", icon: "file", pages: [{ key: "contracts", label: "Contracts", href: "/lms/college/contracts" }] },
    { key: "assessment-data", label: "Assessment Data", icon: "chart", pages: [{ key: "assessment-data", label: "Assessment Data", href: "/lms/college/assessment-data" }] },
    { key: "profile", label: "Profile", icon: "user", pages: [{ key: "profile", label: "Profile", href: "/lms/college/profile" }] },
  ],
};

export const STUDENT_NAV: NavConfig = {
  label: "Student",
  groups: [
    { key: "dashboard", label: "My Dashboard", icon: "home", pages: [{ key: "dashboard", label: "My Dashboard", href: "/lms/student" }] },
    { key: "attendance", label: "Attendance", icon: "check", pages: [{ key: "attendance", label: "Attendance", href: "/lms/student/attendance" }] },
    { key: "courses", label: "Browse Courses", icon: "book", pages: [{ key: "courses", label: "Browse Courses", href: "/lms/student/courses" }] },
    { key: "content", label: "Content", icon: "file", pages: [{ key: "content", label: "Content", href: "/lms/student/content" }] },
    { key: "assessments", label: "Assessments", icon: "code", pages: [{ key: "assessments", label: "Assessments", href: "/lms/student/assessments" }] },
    { key: "profile", label: "Profile", icon: "user", pages: [{ key: "profile", label: "Profile", href: "/lms/student/profile" }] },
  ],
};
