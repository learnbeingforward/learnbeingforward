"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { SessionGuard } from "@/components/auth/SessionGuard";
import { Icon } from "./icons";
import type { NavConfig } from "./nav-config";

const SHORT_LABEL: Record<string, string> = {
  "Registrations & Approvals": "Approvals",
  "Personal Details": "Details",
  "Query from Student": "Queries",
};

/** The portal shell — navy app-band (brand, role pill, bell, user chip,
 * logout) + top nav groups + gold sub-nav pills + page head, then page
 * content in <main>. On phones: a compact top bar, a bottom tab bar (first
 * four sections + "More"), and a slide-in drawer with every section and
 * page — ported element-for-element from design/rendered/super-admin/dashboard.html.
 * Page content supplies its own <section className="card"> block(s); this
 * shell only wraps them in the <main class="container"><div class="lift stack">. */
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
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const group = nav.groups.find((g) => g.pages.some((p) => p.key === active)) ?? nav.groups[0];
  const roleKey = nav.label.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    document.body.dataset.layout = "app";
    document.body.dataset.role = roleKey;
    document.body.dataset.active = active;
    return () => {
      delete document.body.dataset.layout;
      delete document.body.dataset.role;
      delete document.body.dataset.active;
    };
  }, [roleKey, active]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("m-lock", drawerOpen);
    return () => document.body.classList.remove("m-lock");
  }, [drawerOpen]);

  function handleLogout() {
    signOut({ redirect: false }).then(() => {
      window.location.href = "/auth";
    });
  }

  let tabs = nav.groups.slice(0, 4);
  if (!tabs.some((g) => g.key === group.key)) tabs = tabs.slice(0, 3).concat([group]);
  const inTabs = tabs.some((g) => g.key === group.key);

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <>
      <SessionGuard />
      <header className="app-band">
        <div className="container">
          <div className="app-top">
            <button
              className="m-burger"
              type="button"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <Icon name="menu" size={22} />
            </button>
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
                <span className="avatar">{initials}</span>
                <span className="who">
                  {user.name}
                  <small>{user.subtitle}</small>
                </span>
              </div>
              <button className="icon-btn-light" type="button" aria-label="Log out" onClick={handleLogout}>
                <Icon name="logout" />
              </button>
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
        <div className="lift stack">{children}</div>
      </main>

      <p className="app-footer">Powered by Learn Being Forward</p>

      <nav className="m-tabs" aria-label={`${nav.label} quick menu`}>
        {tabs.map((g) => (
          <Link key={g.key} href={g.pages[0].href} className={g.key === group.key ? "active" : ""}>
            <Icon name={g.icon} size={20} />
            <span>{SHORT_LABEL[g.label] ?? g.label}</span>
          </Link>
        ))}
        <button type="button" className={inTabs ? "" : "active"} onClick={() => setDrawerOpen(true)}>
          <Icon name="grid" size={20} />
          <span>More</span>
        </button>
      </nav>

      <div className="m-scrim" hidden={!drawerOpen} onClick={() => setDrawerOpen(false)} />
      <aside className="m-drawer" aria-label={`${nav.label} menu`} hidden={!drawerOpen}>
        <div className="m-dhead">
          <div className="user-chip">
            <span className="avatar">{initials}</span>
            <span className="who">
              {user.name}
              <small>{user.subtitle}</small>
            </span>
          </div>
          <button className="m-x" type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <Icon name="x" size={20} />
          </button>
        </div>
        <span className="role-pill" style={{ alignSelf: "flex-start", margin: "0 0 6px" }}>
          {nav.label}
        </span>
        <nav className="m-groups">
          {nav.groups.map((g) =>
            g.pages.length > 1 ? (
              <details key={g.key} open={g.key === group.key}>
                <summary className={g.key === group.key ? "active" : ""}>
                  <Icon name={g.icon} size={18} />
                  <span>{g.label}</span>
                  <Icon name="chevD" size={16} />
                </summary>
                <div>
                  {g.pages.map((p) => (
                    <Link key={p.key} href={p.href} className={p.key === active ? "active" : ""} onClick={() => setDrawerOpen(false)}>
                      {p.label}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <details key={g.key}>
                <summary
                  className={g.key === group.key ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    setDrawerOpen(false);
                    router.push(g.pages[0].href);
                  }}
                >
                  <Icon name={g.icon} size={18} />
                  <span>{g.label}</span>
                </summary>
              </details>
            )
          )}
        </nav>
        <div className="m-dfoot">
          <button className="btn" type="button" onClick={handleLogout}>
            <Icon name="logout" size={16} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
