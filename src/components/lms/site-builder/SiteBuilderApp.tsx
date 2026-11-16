"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SbIcon } from "./SbIcon";
import type { SbView, SiteBuilderAppProps } from "./types";
import { PagesView } from "./views/PagesView";
import { EditorView } from "./views/EditorView";
import { AccountsView } from "./views/AccountsView";
import { MenusView } from "./views/MenusView";
import { LibraryView } from "./views/LibraryView";
import { ActivityView } from "./views/ActivityView";
import { AiCreateView } from "./views/AiCreateView";

const TABS: { key: SbView; label: string; icon: string }[] = [
  { key: "ai", label: "AI Create", icon: "star" },
  { key: "pages", label: "Pages", icon: "file" },
  { key: "editor", label: "Canvas editor", icon: "layers" },
  { key: "accounts", label: "Accounts & portals", icon: "users" },
  { key: "menus", label: "Menus", icon: "settings" },
  { key: "library", label: "Section library", icon: "grid" },
  { key: "activity", label: "Activity", icon: "history" },
];

export function SiteBuilderApp({ shellUser, portals, users, activity }: SiteBuilderAppProps) {
  const router = useRouter();
  const [view, setView] = useState<SbView>("ai");
  const [pageId, setPageId] = useState<string | null>(null);

  const refresh = () => router.refresh();

  const allPages = portals.flatMap((p) => p.pages);
  const initial = shellUser.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const tabCount: Partial<Record<SbView, number>> = {
    pages: allPages.length,
    accounts: users.length,
  };

  function openEditor(id: string) {
    setPageId(id);
    setView("editor");
  }

  return (
    <div className="sb-scope">
      <header className="app-band">
        <div className="top">
          <Link className="brand" href="/lms/company">
            <SbIcon name="cap" size={24} />
            Learn Being <span className="f">Forward</span>
            <span className="sep" />
            <span className="sb">Site Builder</span>
          </Link>
          <div className="row" style={{ gap: 10 }}>
            <span className="role-pill">Super Admin</span>
            <div className="user-chip">
              <span className="avatar">{initial}</span>
              {shellUser.name}
            </div>
          </div>
        </div>
        <nav className="tabsbar" role="tablist" aria-label="Site Builder">
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={view === t.key} onClick={() => setView(t.key)}>
              <SbIcon name={t.icon} size={15} />
              {t.label}
              {tabCount[t.key] != null && <span className="count">{tabCount[t.key]}</span>}
            </button>
          ))}
        </nav>
      </header>

      {view === "ai" && <AiCreateView portals={portals} onOpenPage={openEditor} onRefresh={refresh} />}
      {view === "pages" && <PagesView portals={portals} onEdit={openEditor} onRefresh={refresh} />}
      {view === "editor" && <EditorView portals={portals} pageId={pageId} onBack={() => setView("pages")} onOpenPage={openEditor} onRefresh={refresh} />}
      {view === "accounts" && <AccountsView portals={portals} users={users} onRefresh={refresh} onEditPortalMenu={() => setView("menus")} onNewPageFor={openEditor} />}
      {view === "menus" && <MenusView portals={portals} onRefresh={refresh} />}
      {view === "library" && <LibraryView />}
      {view === "activity" && <ActivityView activity={activity} />}
    </div>
  );
}
