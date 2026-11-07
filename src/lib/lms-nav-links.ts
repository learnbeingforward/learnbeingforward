import type { LmsNavEntry } from "@/components/layout/LmsNav";

export const studentNavLinks: LmsNavEntry[] = [
  { href: "/lms/student", label: "My Dashboard" },
  { href: "/lms/student/attendance", label: "Attendance" },
  { href: "/lms/student/courses", label: "Browse Courses" },
  { href: "/lms/student/content", label: "Content" },
  { href: "/lms/student/assessments", label: "Assessments" },
  { href: "/lms/student/profile", label: "Profile" },
];

export const collegeNavLinks: LmsNavEntry[] = [
  { href: "/lms/college", label: "Overview" },
  {
    label: "Students",
    children: [
      { href: "/lms/college/students", label: "Students" },
      { href: "/lms/college/students/new", label: "Add Student" },
    ],
  },
  { href: "/lms/college/courses", label: "Courses" },
  { href: "/lms/college/batches", label: "Batches" },
  { href: "/lms/college/queries", label: "Query from Student" },
  { href: "/lms/college/contracts", label: "Contracts" },
  { href: "/lms/college/assessment-data", label: "Assessment Data" },
  { href: "/lms/college/profile", label: "Profile" },
];

export const companyNavLinks: LmsNavEntry[] = [
  {
    label: "Overview",
    children: [
      { href: "/lms/company/notifications", label: "Notifications" },
      { href: "/lms/company", label: "Requests" },
      { href: "/lms/company/attendance", label: "Attendance" },
      { href: "/lms/company/edit-site", label: "Edit Site" },
    ],
  },
  {
    label: "Accounts",
    children: [
      { href: "/lms/company/accounts", label: "Add Account" },
      { href: "/lms/company/manage-accounts", label: "Manage Accounts" },
      { href: "/lms/company/students", label: "All Students" },
      { href: "/lms/company/colleges", label: "Colleges" },
      { href: "/lms/company/trainers", label: "Trainers" },
      { href: "/lms/company/account-details", label: "Account Details" },
      { href: "/lms/company/employee-access", label: "Employee Access" },
    ],
  },
  {
    label: "Registrations & Approvals",
    children: [
      { href: "/lms/company/registrations", label: "New Registrations" },
      { href: "/lms/company/approvals", label: "Approvals from College" },
      { href: "/lms/company/password-resets", label: "Password Reset Requests" },
    ],
  },
  {
    label: "Assessments",
    children: [
      { href: "/lms/company/assessments", label: "Build & Send" },
      { href: "/lms/company/assessments/submissions", label: "Submissions" },
    ],
  },
  { href: "/lms/company/course-content", label: "Course Content" },
  { href: "/lms/company/profile", label: "Profile" },
];

/**
 * Same links, but ADMIN2 doesn't get "Account Details" in the Accounts dropdown
 * (it surfaces every account's contact info and a password-reset-and-reveal
 * control, so it stays main-admin-only). Most company pages render the static
 * companyNavLinks directly rather than calling this — Account Details itself
 * still enforces SUPER_ADMIN-only server-side regardless of what the nav shows.
 */
export function getCompanyNavLinksForRole(role?: string): LmsNavEntry[] {
  if (role !== "ADMIN2") return companyNavLinks;

  return companyNavLinks.map((entry) =>
    "children" in entry && entry.label === "Accounts"
      ? { ...entry, children: entry.children.filter((c) => c.label !== "Account Details") }
      : entry
  );
}

export const trainerNavLinks: LmsNavEntry[] = [
  { href: "/lms/trainer", label: "Personal Details" },
  { href: "/lms/trainer/schedule", label: "Schedule" },
  { href: "/lms/trainer/attendance", label: "Attendance" },
  { href: "/lms/trainer/content", label: "Content" },
  { href: "/lms/trainer/invoice", label: "Invoice" },
];
