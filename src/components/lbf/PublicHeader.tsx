import Link from "next/link";
import { Icon } from "./icons";

const LINKS = [
  { key: "home", label: "Home", href: "/" },
  { key: "courses", label: "Courses", href: "/courses" },
  { key: "technologies", label: "Technologies", href: "/technologies" },
  { key: "about", label: "About", href: "/about" },
  { key: "team", label: "Team", href: "/team" },
  { key: "contact", label: "Contact", href: "/contact" },
];

/** The navy band + nav + hero used at the top of every public page. `tall`
 * matches the design's `band tall` (more bottom padding) — only Home uses it. */
export function PublicHeader({
  active,
  tall,
  bandStyle,
  eyebrow,
  title,
  description,
  actions,
  heroContent,
}: {
  active: string;
  tall?: boolean;
  /** Override the band's own padding/etc — the auth pages use a taller
   * 180px bottom padding that doesn't match the `tall` variant's 160px. */
  bandStyle?: React.CSSProperties;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  /** Replaces the default centred eyebrow/h1/p hero entirely (course detail's
   * back-link + title/pills row doesn't fit that shape). */
  heroContent?: React.ReactNode;
}) {
  return (
    <header className={`band${tall ? " tall" : ""}`} style={bandStyle}>
      <div className="container">
        <div className="app-top" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <Link className="brand" href="/">
            <Icon name="cap" size={26} />
            <span className="wm">
              Learn Being <span>Forward</span>
            </span>
          </Link>
          <nav className="nav" aria-label="Main">
            {LINKS.map((l) => (
              <Link key={l.key} href={l.href} className={l.key === active ? "active" : ""}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link className="btn btn-ghost-light btn-sm" href="/auth">
              Login
            </Link>
            <Link className="btn btn-gold btn-sm" href="/auth?mode=signup">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      {heroContent ?? (
        <div className="container band-hero">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{description}</p>
          {actions && <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>{actions}</div>}
        </div>
      )}
    </header>
  );
}
