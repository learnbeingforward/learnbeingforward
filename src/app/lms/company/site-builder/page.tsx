import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { ensureBuiltinPortals } from "@/lib/actions/site-builder";
import { SiteBuilderApp } from "@/components/lms/site-builder/SiteBuilderApp";
import "@/app/site-builder.css";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin" };

export default async function SiteBuilderPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN2")) {
    redirect("/lms/company");
  }

  await ensureBuiltinPortals();

  const [portals, users, activity] = await Promise.all([
    prisma.siteBuilderPortal.findMany({
      include: { pages: { orderBy: { createdAt: "desc" } }, _count: { select: { pages: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      include: { siteBuilderPageAccess: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteBuilderActivity.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
  ]);

  const nav = buildSuperAdminNav(session.user.role, []);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  return (
    <SiteBuilderApp
      nav={nav}
      shellUser={shellUser}
      portals={portals.map((p) => ({
        id: p.id,
        name: p.name,
        builtin: p.builtin,
        basedOn: p.basedOn,
        scope: p.scope,
        icon: p.icon,
        menu: p.menu as unknown as { id: string; label: string; icon?: string; pageId?: string; sys?: boolean; children: { id: string; label: string; pageId?: string }[] }[],
        pageCount: p._count.pages,
        pages: p.pages.map((pg) => ({
          id: pg.id,
          portalId: pg.portalId,
          name: pg.name,
          subtitle: pg.subtitle,
          icon: pg.icon,
          status: pg.status,
          rows: pg.rows as unknown as import("@/lib/site-builder/types").Row[],
          records: pg.records,
          updatedAt: pg.updatedAt.toISOString(),
        })),
      }))}
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        status: u.employeeKind === "DISABLED" ? "Disabled" : "Active",
        pageIds: u.siteBuilderPageAccess.map((a) => a.pageId),
        createdAt: u.createdAt.toISOString(),
      }))}
      activity={activity.map((a) => ({ id: a.id, who: a.who, what: a.what, pageId: a.pageId, createdAt: a.createdAt.toISOString() }))}
    />
  );
}
