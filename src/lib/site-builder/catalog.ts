import type { IconName } from "@/components/lbf/icons";

/** Which account types (portals) may use a given section. */
export type PortalId = "public" | "super-admin" | "college" | "trainer" | "student";
export const ALL_PORTALS: PortalId[] = ["public", "super-admin", "college", "trainer", "student"];
export const PRIV_PORTALS: PortalId[] = ["super-admin", "college", "trainer", "student"];

export type BlockKind =
  | "heading" | "text" | "button" | "image" | "divider" | "alert" | "hero"
  | "tiles" | "chart" | "ring" | "table" | "list" | "cards" | "form" | "field"
  | "upload" | "calendar" | "tabs";

export type CatalogEntry = {
  id: string;
  name: string;
  portal: PortalId | "basic" | "field";
  page: string;
  kind: BlockKind;
  roles: PortalId[];
  data: string;
  icon: IconName;
  ftype?: string;
};

const c = (
  id: string,
  name: string,
  portal: PortalId,
  page: string,
  kind: BlockKind,
  roles: PortalId[],
  data: string,
  icon: IconName
): CatalogEntry => ({ id, name, portal, page, kind, roles, data, icon });

/** Every section on the live site, rebuilt as a reusable "smart block" — what
 * page it came from, what data it reads, and which portals may use it. This
 * mirrors the real app's actual pages; it does not replace them. */
export const CATALOG: CatalogEntry[] = [
  // Student
  c("stu-welcome", "Welcome header & summary tiles", "student", "Dashboard", "tiles", PRIV_PORTALS, "Enrollments, attendance", "home"),
  c("stu-course", "Enrolled course card (attendance ring)", "student", "Dashboard", "ring", ["student", "college", "super-admin"], "Enrollments + attendance", "award"),
  c("stu-placement", "Placement support banner", "student", "Dashboard", "alert", ["student", "college", "super-admin"], "Certificate eligibility", "briefcase"),
  c("stu-attchart", "Attendance across courses", "student", "Attendance", "chart", PRIV_PORTALS, "Attendance", "chart"),
  c("stu-cert", "Course attendance + certificate", "student", "Attendance", "tiles", ["student", "college", "super-admin"], "Attendance, certificates", "award"),
  c("stu-sessions", "Session-by-session attendance", "student", "Course progress", "table", PRIV_PORTALS, "Sessions, attendance", "book"),
  c("stu-catalog", "Course catalogue + request enrollment", "student", "Browse Courses", "cards", ["student", "public", "college"], "Courses, enrollment requests", "book"),
  c("stu-materials", "Module materials (locked / request / download)", "student", "Content", "list", ["student", "trainer", "super-admin"], "Course content, access requests", "file"),
  c("stu-assess", "Assigned assessments", "student", "Assessments", "cards", ["student", "college", "super-admin"], "Assessments", "code"),
  c("stu-profile", "Student profile form + CV", "student", "Profile", "form", ["student", "college", "super-admin"], "Student profile", "user"),
  // College
  c("col-tiles", "College summary tiles", "college", "Overview", "tiles", ["college", "super-admin"], "Students, attendance", "home"),
  c("col-attchart", "Average attendance by course", "college", "Overview", "chart", ["college", "super-admin", "trainer"], "Attendance", "chart"),
  c("col-breakdown", "Breakdown by course", "college", "Overview", "list", ["college", "super-admin"], "Enrollments", "book"),
  c("col-branches", "Students by branch", "college", "Students", "cards", ["college", "super-admin"], "Students", "users"),
  c("col-students", "Students table (search, filters, export)", "college", "Students", "table", ["college", "super-admin", "trainer"], "Students", "users"),
  c("col-addstudent", "Add student (single + Excel)", "college", "Students", "form", ["college", "super-admin"], "Student roster", "plus"),
  c("col-enroll", "Bulk enroll students in a course", "college", "Courses", "list", ["college", "super-admin"], "Enrollment requests", "book"),
  c("col-batches", "Batch cards", "college", "Batches", "cards", ["college", "super-admin", "trainer"], "Batches", "layers"),
  c("col-exceptions", "Attendance exception requests", "college", "Query from Student", "list", ["college", "super-admin"], "Exception requests", "message"),
  c("col-contracts", "Contracts waiting for decision", "college", "Contracts", "list", ["college", "super-admin"], "Contracts, invoices", "file"),
  c("col-results", "Shared assessment results", "college", "Assessment Data", "table", ["college", "super-admin"], "Assessment results", "chart"),
  // Trainer
  c("tr-tiles", "Trainer summary tiles", "trainer", "Personal Details", "tiles", ["trainer", "super-admin"], "Batches, sessions, invoices", "home"),
  c("tr-bank", "Bank details form", "trainer", "Personal Details", "form", ["trainer", "super-admin"], "Trainer profile", "money"),
  c("tr-batches", "My batches", "trainer", "My Batches", "cards", ["trainer", "super-admin", "college"], "Batches", "users"),
  c("tr-schedule", "Schedule list", "trainer", "Schedule", "list", ["trainer", "super-admin", "college", "student"], "Sessions", "calendar"),
  c("tr-mark", "Mark attendance (present / absent)", "trainer", "Attendance", "list", ["trainer", "super-admin"], "Attendance", "check"),
  c("tr-upload", "Upload content for approval", "trainer", "Content", "upload", ["trainer", "super-admin"], "Trainer content", "upload"),
  c("tr-invoice", "Invoice summary + generate", "trainer", "Invoice", "tiles", ["trainer"], "Sessions, rates", "money"),
  // Super admin
  c("sa-requests", "Enrollment requests by college", "super-admin", "Requests", "list", ["super-admin"], "Enrollment requests", "clipboard"),
  c("sa-notifs", "Notifications feed", "super-admin", "Notifications", "list", PRIV_PORTALS, "Notifications", "bell"),
  c("sa-certq", "Certificate queue (issue)", "super-admin", "Attendance", "table", ["super-admin"], "Certificates", "award"),
  c("sa-training", "Training request form", "super-admin", "Colleges", "form", ["super-admin"], "Contracts", "briefcase"),
  c("sa-invoice", "Generate college invoice", "super-admin", "Colleges", "list", ["super-admin"], "Invoices", "money"),
  c("sa-calendar", "Training schedule calendar", "super-admin", "Schedule", "calendar", ["super-admin", "trainer", "college", "student"], "Sessions", "calendar"),
  c("sa-reset", "Reset passwords", "super-admin", "Manage Accounts", "form", ["super-admin"], "Accounts", "key"),
  c("sa-access", "Employee access checkboxes", "super-admin", "Employee Access", "list", ["super-admin"], "Permissions", "shield"),
  c("sa-assess", "Assessment categories", "super-admin", "Assessments", "cards", ["super-admin"], "Assessments", "code"),
  c("sa-subs", "Assessment submissions table", "super-admin", "Submissions", "table", ["super-admin", "college"], "Submissions", "clipboard"),
  // Public site
  c("pub-hero", "Hero banner (title + 2 buttons)", "public", "Home", "hero", ["public"], "—", "home"),
  c("pub-stats", "Stats strip", "public", "Home", "tiles", ["public"], "—", "chart"),
  c("pub-pillars", '"What we do" pillars', "public", "Home", "cards", ["public"], "Site content", "grid"),
  c("pub-courses", "Course cards", "public", "Courses", "cards", ["public", "student"], "Courses", "book"),
  c("pub-team", "Trainer profiles", "public", "Team", "cards", ["public"], "Employees", "users"),
  c("pub-contact", "Contact form", "public", "Contact", "form", ["public"], "Messages", "message"),
];

export const BASICS: CatalogEntry[] = [
  { id: "b-heading", name: "Heading", portal: "basic", page: "Basics", kind: "heading", roles: ALL_PORTALS, data: "", icon: "file" },
  { id: "b-text", name: "Paragraph text", portal: "basic", page: "Basics", kind: "text", roles: ALL_PORTALS, data: "", icon: "file" },
  { id: "b-button", name: "Button", portal: "basic", page: "Basics", kind: "button", roles: ALL_PORTALS, data: "", icon: "chevR" },
  { id: "b-image", name: "Image", portal: "basic", page: "Basics", kind: "image", roles: ALL_PORTALS, data: "", icon: "file" },
  { id: "b-alert", name: "Notice / alert", portal: "basic", page: "Basics", kind: "alert", roles: ALL_PORTALS, data: "", icon: "bell" },
  { id: "b-divider", name: "Divider", portal: "basic", page: "Basics", kind: "divider", roles: ALL_PORTALS, data: "", icon: "file" },
  { id: "b-tiles", name: "Stat tiles", portal: "basic", page: "Basics", kind: "tiles", roles: ALL_PORTALS, data: "", icon: "grid" },
  { id: "b-table", name: "Data table", portal: "basic", page: "Basics", kind: "table", roles: ALL_PORTALS, data: "", icon: "grid" },
  { id: "b-cards", name: "Card grid", portal: "basic", page: "Basics", kind: "cards", roles: ALL_PORTALS, data: "", icon: "grid" },
  { id: "b-tabs", name: "Tabs", portal: "basic", page: "Basics", kind: "tabs", roles: ALL_PORTALS, data: "", icon: "grid" },
  { id: "b-form", name: "Form (save new data)", portal: "basic", page: "Basics", kind: "form", roles: ALL_PORTALS, data: "", icon: "edit" },
  { id: "b-upload", name: "File upload", portal: "basic", page: "Basics", kind: "upload", roles: ALL_PORTALS, data: "", icon: "upload" },
  { id: "b-calendar", name: "Calendar", portal: "basic", page: "Basics", kind: "calendar", roles: ALL_PORTALS, data: "", icon: "calendar" },
  { id: "b-timeline", name: "Timeline", portal: "basic", page: "Basics", kind: "list", roles: ALL_PORTALS, data: "", icon: "clock" },
];

export const FIELDS: CatalogEntry[] = [
  ["f-text", "Text input", "Text"],
  ["f-number", "Number", "Number"],
  ["f-dropdown", "Dropdown", "Dropdown"],
  ["f-date", "Date", "Date"],
  ["f-file", "File", "File"],
  ["f-check", "Checkbox", "Checkbox"],
  ["f-long", "Long text", "Long text"],
  ["f-email", "Email", "Email"],
  ["f-phone", "Phone", "Phone"],
].map(([id, name, ftype]) => ({ id, name, portal: "field" as const, page: "Form fields", kind: "field" as const, ftype, roles: ALL_PORTALS, data: "", icon: "edit" as const }));

export const BY_ID: Record<string, CatalogEntry> = Object.fromEntries([...CATALOG, ...BASICS, ...FIELDS].map((c) => [c.id, c]));

export const LAYOUTS: Record<string, number[]> = { "1": [1], "2": [1, 1], "2a": [2, 1], "2b": [1, 2], "3": [1, 1, 1], "4": [1, 1, 1, 1] };
export const LAYOUT_NAMES: Record<string, string> = { "1": "Full width", "2": "Two halves", "2a": "Wide + narrow", "2b": "Narrow + wide", "3": "Three columns", "4": "Four columns" };

export type Capability = {
  id: string;
  name: string;
  page: string;
  icon: IconName;
  rows: [string, ...string[][]][];
  keywords: string[];
};

/** Plain-language → capability matching for "AI Create" (rule-based keyword
 * matching that runs entirely in this request — no external AI service). */
export const CAPABILITIES: Capability[] = [
  { id: "reports", name: "Dashboard & reports", page: "Dashboard", icon: "chart", rows: [["1", ["col-tiles"]], ["2a", ["col-attchart"], ["col-breakdown"]]], keywords: ["report", "dashboard", "overview", "summary", "analytics", "numbers", "kpi"] },
  { id: "students", name: "See students", page: "Students", icon: "users", rows: [["1", ["col-students"]]], keywords: ["student", "roster", "candidate", "learner"] },
  { id: "attendance", name: "Attendance & certificates", page: "Attendance", icon: "check", rows: [["1", ["col-attchart"]], ["1", ["sa-certq"]]], keywords: ["attendance", "present", "absent", "certificate"] },
  { id: "mark", name: "Mark attendance", page: "Mark attendance", icon: "check", rows: [["1", ["tr-mark"]]], keywords: ["mark attendance", "take attendance", "record attendance"] },
  { id: "enroll", name: "Approve enrollments", page: "Enrollment requests", icon: "clipboard", rows: [["2a", ["sa-requests"], ["sa-notifs"]]], keywords: ["enroll", "registration", "approve student", "admission"] },
  { id: "assess", name: "Build & send assessments", page: "Assessments", icon: "code", rows: [["1", ["sa-assess"]]], keywords: ["create test", "build test", "create assessment", "build assessment", "send assessment", "make test", "make assessment", "conduct exam", "set exam", "quiz", "mcq", "question paper", "coding question"] },
  { id: "results", name: "Assessment results", page: "Results", icon: "chart", rows: [["1", ["sa-subs"]]], keywords: ["result", "score", "marks", "submission", "performance", "how students did"] },
  { id: "batches", name: "Batches", page: "Batches", icon: "layers", rows: [["1", ["col-batches"]]], keywords: ["batch", "group of students"] },
  { id: "schedule", name: "Schedule & calendar", page: "Schedule", icon: "calendar", rows: [["1", ["sa-calendar"]], ["1", ["tr-schedule"]]], keywords: ["schedule", "calendar", "session", "timetable", "class timing"] },
  { id: "content", name: "Course content", page: "Course content", icon: "book", rows: [["2a", ["tr-upload"], ["stu-materials"]]], keywords: ["content", "material", "notes", "pdf", "upload", "study material"] },
  { id: "invoices", name: "Invoices & payments", page: "Invoices", icon: "money", rows: [["1", ["sa-invoice"]]], keywords: ["invoice", "payment", "bill", "finance", "money", "accounts payable"] },
  { id: "contracts", name: "College contracts & MOUs", page: "Contracts", icon: "file", rows: [["1", ["col-contracts"]], ["1", ["sa-training"]]], keywords: ["contract", "mou", "training request", "partnership", "college deal"] },
  { id: "placement", name: "Placements", page: "Placements", icon: "briefcase", rows: [["1", ["stu-placement"]], ["1", ["col-students"]]], keywords: ["placement", "job", "company", "hiring", "interview", "recruit", "offer"] },
  { id: "notifs", name: "Notifications", page: "Notifications", icon: "bell", rows: [["1", ["sa-notifs"]]], keywords: ["notification", "alert", "update", "message"] },
  { id: "accounts", name: "Reset passwords", page: "Accounts", icon: "key", rows: [["1", ["sa-reset"]]], keywords: ["password", "reset", "login problem", "account"] },
];

export function matchCapabilities(text: string): { caps: Record<string, boolean>; why: Record<string, string>; viewOnly: boolean; scope: string | null } {
  const t = ` ${text.toLowerCase()} `;
  const caps: Record<string, boolean> = {};
  const why: Record<string, string> = {};
  for (const cap of CAPABILITIES) {
    const hit = cap.keywords.find((k) => t.includes(k));
    if (hit) {
      caps[cap.id] = true;
      why[cap.id] = hit;
    }
  }
  const viewOnly = /(view only|read only|only view|only see|cannot edit|can't edit|no edit|just see|only check)/.test(t);
  const m = t.match(/(crestview|pinnacle|global|sunrise|horizon)/g);
  const scope = m ? "Only " + [...new Set(m)].map((x) => x[0].toUpperCase() + x.slice(1)).join(", ") : null;
  return { caps, why, viewOnly, scope };
}
