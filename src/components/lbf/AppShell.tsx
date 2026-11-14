import Link from "next/link";
import { SessionGuard } from "@/components/auth/SessionGuard";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "./icons";
import { LogoutIconButton } from "./LogoutIconButton";
import type { NavConfig } from "./nav-config";

/** The redesigned portal shell — navy app-band (brand, role pill, bell,
 * user chip, logout) + top nav groups + gold sub-nav pills + page head,
 * then a white card lifted over the band. Used by every non-assessment
 * logged-in page; the assessment pages keep DashboardShell as-is. */
export function AppShell({
  nav,
  active,
  user,
  crumb,
  title,
  subtitle,
  actions,
  hasUnread,
  children,
}: {
  nav: NavConfig;
  /** Page key within the active group, e.g. "dashboard", "all-students". */
  active: string;
  user: { name: string; subtitle: string };
  crumb?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hasUnread?: boolean;
  children: React.ReactNode;
}) {
  const group = nav.groups.find((g) => g.pages.some((p) => p.key === active)) ?? nav.groups[0];

  return (
    <div className="lbf-scope">
      <SessionGuard />
      <header className="app-band">
        <div className="container">
          <div className="app-top">
            <Link className="brand" href="/">
              <Icon name="cap" size={26} />
              <span className="wm">
                Learn Being <span>Forward</span>
              </span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="role-pill">{nav.label}</span>
              <button className="icon-btn-light" type="button" aria-label="Notifications">
                <Icon name="bell" />
                {hasUnread && <span className="badge" />}
              </button>
              <div className="user-chip">
                <span className="avatar">
                  {user.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="who">
                  {user.name}
                  <small>{user.subtitle}</small>
                </span>
              </div>
              <LogoutIconButton />
            </div>
          </div>

          <nav className="app-nav" aria-label={`${nav.label} menu`}>
            {nav.groups.map((g) => (
              <Link key={g.key} href={g.pages[0].href} className={g.key === group.key ? "active" : ""}>
                <Icon name={g.icon} size={16} />
                {g.label}
              </Link>
            ))}
          </nav>

          {group.pages.length > 1 && (
            <nav className="sub-nav" aria-label={`${group.label} pages`}>
              {group.pages.map((p) => (
                <Link key={p.key} href={p.href} className={p.key === active ? "active" : ""}>
                  {p.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="page-head">
            <div>
              {crumb && <div className="crumb">{crumb}</div>}
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
            {actions && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
          </div>
        </div>
      </header>

      <main className="container">
        <section className="card lift stack">{children}</section>
      </main>

      <p className="app-footer">Powered by Learn Being Forward</p>
    </div>
  );
}
