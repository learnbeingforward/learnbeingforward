import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { BlockRenderer } from "@/components/lms/site-builder/BlockRenderer";
import { LAYOUTS } from "@/lib/site-builder/catalog";
import type { Row } from "@/lib/site-builder/types";
import "@/app/site-builder.css";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

function cols(layout: string) {
  return (LAYOUTS[layout] ?? [1]).map((n) => `${n}fr`).join(" ");
}

export default async function SiteBuilderPublishedPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN2";
  const isEmployee = session.user.role === "EMPLOYEE";
  if (!isAdmin && !isEmployee) redirect("/lms/company");

  const page = await prisma.siteBuilderPage.findUnique({ where: { id: pageId }, include: { portal: true } });
  if (!page) notFound();

  if (isEmployee) {
    const granted = await prisma.siteBuilderPageAccess.findUnique({ where: { pageId_userId: { pageId, userId: session.user.id } } });
    if (!granted) redirect("/lms/company/profile");
    if (page.status !== "Published") notFound();
  } else if (page.status !== "Published") {
    // Admin preview of a draft still renders, flagged below.
  }

  const grantedPages = isEmployee
    ? await prisma.siteBuilderPageAccess.findMany({ where: { userId: session.user.id }, include: { page: true } })
    : [];
  const nav = buildSuperAdminNav(
    session.user.role,
    [],
    grantedPages.map((g) => ({ id: g.page.id, name: g.page.name }))
  );
  const shellUser = { name: session.user.name ?? "User", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "User" };
  const rows = page.rows as unknown as Row[];

  return (
    <AppShell nav={nav} active={`site-${page.id}`} user={shellUser} crumb={page.portal.name} title={page.name} subtitle={page.subtitle ?? undefined}>
      {isAdmin && page.status !== "Published" && (
        <div className="alert warning">This page is still a {page.status.toLowerCase()} — only you can see it. Publish it from Site Builder for the account it was built for.</div>
      )}
      <div className="sb-scope">
        {rows.length === 0 ? (
          <p className="empty">Nothing on this page yet.</p>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="cv-cols" style={{ gridTemplateColumns: cols(r.layout), marginBottom: 14 }}>
              {r.cols.map((c) => (
                <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {c.blocks.map((b) => (
                    <div key={b.id} className="blk" style={{ cursor: "default" }}>
                      <BlockRenderer block={b} preview />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
