import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/technologies", label: "Technologies" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Employees" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-indigo-dark text-white/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo theme="light" />
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            Courses &middot; Campus Partnerships &middot; Placements
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gold-light">
            Quick Links
          </h3>
          <ul className="space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/70 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gold-light">
            Contact
          </h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li>Pavan Kumar</li>
            <li>
              <a href="tel:+918557076391" className="inline-flex items-center gap-2 hover:text-white">
                <Phone className="size-4 shrink-0" /> +91 85570 76391
              </a>
            </li>
            <li>
              <a
                href="mailto:info@learnbeingforward.in"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Mail className="size-4 shrink-0" /> info@learnbeingforward.in
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Learn Being Forward. All rights reserved.</p>
          <p>Learn Being Forward.</p>
        </div>
      </div>
    </footer>
  );
}
