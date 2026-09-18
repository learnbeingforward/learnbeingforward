import type { LmsNavEntry } from "@/components/layout/LmsNav";

export const studentNavLinks: LmsNavEntry[] = [
  { href: "/lms/student", label: "My Dashboard" },
  { href: "/lms/student/attendance", label: "Attendance" },
  { href: "/lms/student/courses", label: "Browse Courses" },
  { href: "/lms/student/content", label: "Content" },
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
  { href: "/lms/college/profile", label: "Profile" },
];

export const companyNavLinks: LmsNavEntry[] = [
  { href: "/lms/company", label: "Requests" },
  {
    label: "Registrations & Approvals",
    children: [
      { href: "/lms/company/registrations", label: "New Registrations" },
      { href: "/lms/company/approvals", label: "Approvals from College" },
      { href: "/lms/company/password-resets", label: "Password Reset Requests" },
    ],
  },
  { href: "/lms/company/attendance", label: "Attendance" },
  {
    label: "Accounts",
    children: [
      { href: "/lms/company/accounts", label: "Add Account" },
      { href: "/lms/company/manage-accounts", label: "Manage Accounts" },
      { href: "/lms/company/students", label: "All Students" },
    ],
  },
  { href: "/lms/company/trainers", label: "Trainers" },
  { href: "/lms/company/course-content", label: "Course Content" },
  { href: "/lms/company/colleges", label: "Colleges" },
  { href: "/lms/company/profile", label: "Profile" },
  { href: "/lms/company/edit-site", label: "Edit Site" },
];

/**
 * Same as companyNavLinks, but the Colleges item becomes a dropdown
 * (Send Contract / Approvals / Sent to College / MOUs) for SUPER_ADMIN —
 * that split is main-admin-only, so ADMIN2 keeps the single flat link.
 * Used by the colleges section's own pages, which already know the role.
 */
export function getCompanyNavLinksForRole(role?: string): LmsNavEntry[] {
  if (role === "ADMIN2") return companyNavLinks;

  const collegesDropdown: LmsNavEntry = {
    label: "Colleges",
    children: [
      { href: "/lms/company/colleges", label: "Send Contract" },
      { href: "/lms/company/colleges/approvals", label: "Approvals" },
      { href: "/lms/company/colleges/sent", label: "Sent to College" },
      { href: "/lms/company/colleges/mous", label: "MOUs" },
    ],
  };

  return companyNavLinks.map((entry) =>
    "href" in entry && entry.href === "/lms/company/colleges" ? collegesDropdown : entry
  );
}

export const trainerNavLinks: LmsNavEntry[] = [
  { href: "/lms/trainer", label: "Personal Details" },
  { href: "/lms/trainer/schedule", label: "Schedule" },
  { href: "/lms/trainer/attendance", label: "Attendance" },
  { href: "/lms/trainer/content", label: "Content" },
  { href: "/lms/trainer/invoice", label: "Invoice" },
];
