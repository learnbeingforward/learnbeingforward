import Link from "next/link";
import { BookOpen, Cpu, Users, Contact, Home, Link2, Phone } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";

const sections = [
  {
    href: "/lms/company/edit-site/courses",
    icon: BookOpen,
    title: "Courses",
    description: "Add new courses and curriculum modules — shown on the Courses page.",
  },
  {
    href: "/lms/company/edit-site/technologies",
    icon: Cpu,
    title: "Technologies",
    description: "Add a new technology with a matching logo — shown on the Technologies page.",
  },
  {
    href: "/lms/company/edit-site/employees",
    icon: Users,
    title: "Employees",
    description: "Add a new trainer or employee profile — shown on the Employees page.",
  },
  {
    href: "/lms/company/edit-site/contacts",
    icon: Contact,
    title: "Contacts",
    description: "Add a new contact-section profile — shown on the Contact page.",
  },
  {
    href: "/lms/company/edit-site/home",
    icon: Home,
    title: "Home Page",
    description: "Add a new \"What We Do\" pillar on the homepage.",
  },
  {
    href: "/lms/company/edit-site/footer",
    icon: Link2,
    title: "Footer Links",
    description: "Add or remove quick links shown in the footer.",
  },
  {
    href: "/lms/company/edit-site/company-contact",
    icon: Phone,
    title: "Company Contact",
    description: "Edit the name, phone, and email shown in the footer and Contact page.",
  },
];

export default function EditSitePage() {
  return (
    <DashboardShell title="Edit Site" subtitle="Content management" navLinks={navLinks}>
      <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
        Changes here go straight to the live site — no redeploy needed. Pick what you want to add
        or update.
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
              <section.icon className="size-5.5" />
            </div>
            <h3 className="font-semibold text-indigo">{section.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
