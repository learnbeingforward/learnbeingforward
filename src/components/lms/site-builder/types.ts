import type { Row } from "@/lib/site-builder/types";
import type { NavConfig } from "@/components/lbf/nav-config";

export type SbPage = {
  id: string;
  portalId: string;
  name: string;
  subtitle: string | null;
  icon: string;
  status: string;
  rows: Row[];
  records: number;
  updatedAt: string;
};

export type SbMenuItem = { id: string; label: string; icon?: string; pageId?: string; sys?: boolean; children: { id: string; label: string; pageId?: string }[] };

export type SbPortal = {
  id: string;
  name: string;
  builtin: boolean;
  basedOn: string | null;
  scope: string;
  icon: string;
  menu: SbMenuItem[];
  pageCount: number;
  pages: SbPage[];
};

export type SbUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  pageIds: string[];
  createdAt: string;
};

export type SbActivity = { id: string; who: string; what: string; pageId: string | null; createdAt: string };

export type SiteBuilderAppProps = {
  nav: NavConfig;
  shellUser: { name: string; subtitle: string };
  portals: SbPortal[];
  users: SbUser[];
  activity: SbActivity[];
};

export type SbView = "ai" | "pages" | "editor" | "accounts" | "menus" | "library" | "activity";
