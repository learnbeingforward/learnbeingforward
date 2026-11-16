import { BY_ID, type PortalId } from "./catalog";
import type { Block, BlockItem } from "./types";

function uid(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 8);
}

const TILE_DEFAULTS: Record<string, [string, string][]> = {
  "stu-welcome": [["Enrolled courses", "2"], ["Overall attendance", "90%"], ["Next class", "Mon 9:30"], ["Assessments due", "0"]],
  "col-tiles": [["Students enrolled", "60"], ["Average attendance", "66%"], ["Courses active", "6"], ["Certificates issued", "12"]],
  "tr-tiles": [["Active batches", "1"], ["Upcoming sessions", "2"], ["Attendance pending", "2"], ["Ready to invoice", "₹0"]],
  "stu-cert": [["Classes held", "20"], ["Attended", "18"], ["Upcoming", "14"], ["Attendance", "90%"]],
  "tr-invoice": [["Sessions ready", "0"], ["Total hours", "0"], ["Rate", "₹1,000/hr"], ["Total", "₹0"]],
  "pub-stats": [["Languages taught", "6+"], ["Frameworks", "10+"], ["Colleges trained", "75+"], ["Students placement-ready", "1000s"]],
};

function defaultItems(b: Block): BlockItem[] | null {
  const c = BY_ID[b.type];
  if (!c) return null;
  const mk = (label: string, value = "", type = "Text"): BlockItem => ({ id: uid("i"), label, value, type });
  const sample: Record<string, string[]> = {
    student: ["Java & DSA", "Full-Stack Development", "Backend Development"],
    college: ["Crestview — CSE", "Information Technology", "Mechanical Engineering"],
    trainer: ["Riya Patel", "Riya Agarwal", "Rohan Kumar"],
    public: ["Programming & Full-Stack", "Aptitude & Soft Skills", "Placement Support"],
  };
  const sampleList = sample[c.portal] ?? ["Crestview College", "Pinnacle Institute", "Global Institute"];

  switch (c.kind) {
    case "tiles":
      return (TILE_DEFAULTS[b.type] ?? [["Metric one", "0"], ["Metric two", "0"], ["Metric three", "0"], ["Metric four", "0"]]).map(([l, v]) => mk(l, v));
    case "chart":
      return ([["Java", "90"], ["FSD", "66"], ["Backend", "73"], ["Frontend", "58"], ["Data", "75"], ["Robotics", "61"]] as [string, string][]).map(([l, v]) => mk(l, v));
    case "table": {
      const cols =
        b.type === "b-table"
          ? ["Company", "Role", "Stipend", "Start date", "Status"]
          : c.portal === "student"
            ? ["Date", "Session", "Module", "Status"]
            : c.portal === "super-admin"
              ? ["Student", "College", "Course", "Status"]
              : c.portal === "trainer"
                ? ["Student", "Batch", "Attendance", "Status"]
                : ["Student", "Branch", "Course", "Attendance"];
      return cols.map((l) => mk(l));
    }
    case "form": {
      const fields: [string, string][] =
        b.type === "b-form"
          ? [["Company name", "Text"], ["Role", "Text"], ["Stipend (₹/month)", "Number"], ["Start date", "Date"], ["Offer letter", "File"]]
          : b.type === "tr-bank"
            ? [["Account holder", "Text"], ["Account number", "Number"], ["IFSC code", "Text"], ["Bank name", "Text"]]
            : b.type === "sa-reset"
              ? [["Account email", "Email"], ["New password", "Text"]]
              : b.type === "pub-contact"
                ? [["Name", "Text"], ["Email", "Email"], ["Message", "Long text"]]
                : b.type === "col-addstudent"
                  ? [["Full name", "Text"], ["Email", "Email"], ["USN", "Text"], ["Branch", "Dropdown"]]
                  : b.type === "sa-training"
                    ? [["College", "Dropdown"], ["Course", "Dropdown"], ["Training type", "Dropdown"], ["Start date", "Date"]]
                    : [["Full name", "Text"], ["Email", "Email"], ["Branch", "Dropdown"], ["Semester", "Dropdown"]];
      return fields.map(([l, t]) => mk(l, "", t));
    }
    case "list":
      return sampleList.map((l) => mk(l));
    case "cards":
      return (b.type === "stu-catalog" || b.type === "pub-courses" ? ["Java & DSA", "Full-Stack Development", "Frontend Development"] : b.type === "sa-assess" ? ["Aptitude", "Technical aptitude", "Coding"] : sampleList).map((l) => mk(l));
    default:
      return null;
  }
}

export function itemsOf(b: Block): BlockItem[] {
  if (!Array.isArray(b.props.items)) b.props.items = defaultItems(b) ?? [];
  return b.props.items;
}

export function newBlock(type: string): Block {
  const c = BY_ID[type];
  const b: Block = { id: uid("b"), type, props: { title: c.name, showTitle: c.kind !== "heading" && c.kind !== "divider" && c.kind !== "hero", course: "All courses" } };
  if (c.kind === "heading") b.props.text = "Section heading";
  if (c.kind === "text") b.props.text = "Write a short description for this part of the page.";
  if (c.kind === "button") {
    b.props.label = "Open";
    b.props.style = "Primary";
  }
  if (c.kind === "alert") {
    b.props.text = c.portal === "basic" ? "Add an important note for users here." : "";
    b.props.tone = "gold";
  }
  if (type === "b-form") {
    b.props.submit = "Save";
    b.props.saveTo = "New data set: Internships";
  }
  if (c.kind === "field") {
    b.props.label = c.name;
    b.props.required = false;
    b.props.ftype = c.ftype;
    b.props.options = "Option 1, Option 2";
  }
  if (type === "b-table") {
    b.props.search = true;
    b.props.export = true;
  }
  itemsOf(b);
  return b;
}

export function newRow(layout: string, blockType?: string): { id: string; layout: string; cols: { id: string; blocks: Block[] }[] } {
  const colCount = layout === "1" ? 1 : layout === "3" ? 3 : layout === "4" ? 4 : 2;
  return {
    id: uid("r"),
    layout,
    cols: Array.from({ length: colCount }, (_, i) => ({ id: uid("c"), blocks: i === 0 && blockType ? [newBlock(blockType)] : [] })),
  };
}

export function roleOf(portalId: PortalId | string, builtin: boolean, basedOn: string | null): PortalId {
  return (builtin ? portalId : basedOn ?? portalId) as PortalId;
}

export { uid };
