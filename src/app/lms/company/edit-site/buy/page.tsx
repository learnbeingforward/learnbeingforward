import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { FileUploadField } from "@/components/lms/FileUploadField";
import {
  updateBuyPaymentSettings,
  createBuyListing,
  updateBuyListing,
  deleteBuyListing,
  setContentPreviewLock,
  setModulePreviewLock,
  removePreviewLock,
} from "@/lib/actions/buy";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function EditSiteBuyPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>;
}) {
  const { listingId } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const [settings, listings, courses, pendingOrderCount, colleges] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.buyListing.findMany({ include: { course: true }, orderBy: { order: "asc" } }),
    prisma.course.findMany({ where: { buyListing: null, isPlaceholder: false }, orderBy: { name: "asc" } }),
    prisma.courseOrder.count({ where: { status: "PENDING" } }),
    prisma.college.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (listingId) {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) {
      return (
        <AppShell nav={nav} active="edit-site" user={shellUser} hasUnread={hasUnread} crumb="Overview › Edit Site › Buy" title="Listing" subtitle="Not found">
          <BackLink href="/lms/company/edit-site/buy" label="Back to Buy" />
        </AppShell>
      );
    }

    const [modules, content, locks] = await Promise.all([
      prisma.courseModule.findMany({ where: { courseId: listing.courseId, mainPdfUrl: { not: null } }, orderBy: { order: "asc" } }),
      prisma.courseContent.findMany({ where: { courseId: listing.courseId }, include: { courseSubModule: true }, orderBy: { title: "asc" } }),
      prisma.buyPreviewLock.findMany({ where: { buyListingId: listing.id } }),
    ]);
    const moduleLockByModuleId = new Map(locks.filter((l) => l.courseModuleId).map((l) => [l.courseModuleId!, l]));
    const contentLockByContentId = new Map(locks.filter((l) => l.courseContentId).map((l) => [l.courseContentId!, l]));

    return (
      <AppShell nav={nav} active="edit-site" user={shellUser} hasUnread={hasUnread} crumb="Overview › Edit Site › Buy" title={listing.course.name} subtitle="Preview locks — how many pages a visitor can see before buying.">
        <BackLink href="/lms/company/edit-site/buy" label="Back to Buy" />

        <section className="card">
          <h2 className="h2" style={{ marginBottom: 14 }}>Course books</h2>
          <div className="stack" style={{ gap: 12 }}>
            {modules.map((mod) => {
              const lock = moduleLockByModuleId.get(mod.id);
              return (
                <div key={mod.id} className="box">
                  <div className="split">
                    <span className="strong">{mod.mainPdfTitle ?? mod.title}</span>
                    {lock && <DeleteButton action={removePreviewLock.bind(null, lock.id)} />}
                  </div>
                  <form action={setModulePreviewLock.bind(null, listing.id, mod.id)} style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                    <input className="input" type="number" name="previewPages" min={1} max={20} defaultValue={lock?.previewPages ?? 4} style={{ width: 90 }} />
                    <span className="small muted">preview pages</span>
                    <button className="btn btn-sm" type="submit">{lock ? "Update" : "Lock preview"}</button>
                    {lock?.previewFileUrl && (
                      <a className="small" href={lock.previewFileUrl} target="_blank" rel="noopener noreferrer">
                        View preview
                      </a>
                    )}
                  </form>
                </div>
              );
            })}
            {modules.length === 0 && <p className="muted">No course book PDFs on this course.</p>}
          </div>
        </section>

        <section className="card">
          <h2 className="h2" style={{ marginBottom: 14 }}>Sub-module PDFs</h2>
          <div className="stack" style={{ gap: 12 }}>
            {content.map((item) => {
              const lock = contentLockByContentId.get(item.id);
              return (
                <div key={item.id} className="box">
                  <div className="split">
                    <span className="strong">{item.courseSubModule ? item.courseSubModule.title : item.title}</span>
                    {lock && <DeleteButton action={removePreviewLock.bind(null, lock.id)} />}
                  </div>
                  <form action={setContentPreviewLock.bind(null, listing.id, item.id)} style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                    <input className="input" type="number" name="previewPages" min={1} max={20} defaultValue={lock?.previewPages ?? 4} style={{ width: 90 }} />
                    <span className="small muted">preview pages</span>
                    <button className="btn btn-sm" type="submit">{lock ? "Update" : "Lock preview"}</button>
                    {lock?.previewFileUrl && (
                      <a className="small" href={lock.previewFileUrl} target="_blank" rel="noopener noreferrer">
                        View preview
                      </a>
                    )}
                  </form>
                </div>
              );
            })}
            {content.length === 0 && <p className="muted">No sub-module PDFs on this course.</p>}
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      nav={nav}
      active="edit-site"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Edit Site › Buy"
      title="Buy"
      subtitle="Price courses and manage the public Buy catalog."
      actions={
        <Link className="btn btn-ghost-light" href="/lms/company/edit-site/buy/orders">
          Orders{pendingOrderCount > 0 ? ` (${pendingOrderCount} pending)` : ""}
        </Link>
      }
    >
      <div className="row">
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>Payment settings</h2>
          <p className="small muted" style={{ marginBottom: 14 }}>
            Shared across every book — change this any time and it updates the payment page for all of them.
          </p>
          <form action={updateBuyPaymentSettings} className="stack" style={{ gap: 12 }}>
            <div>
              <label className="small muted">UPI ID</label>
              <input className="input" name="buyUpiId" defaultValue={settings?.buyUpiId ?? ""} placeholder="yourname@upi" />
            </div>
            <FileUploadField name="buyQrImageUrl" label="QR code image (optional — overrides the auto-generated one)" category="photo" defaultUrl={settings?.buyQrImageUrl} />
            <button className="btn btn-primary btn-sm" type="submit">Save</button>
          </form>
        </section>

        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>Add a course to Buy</h2>
          {courses.length === 0 ? (
            <p className="muted">Every course already has a Buy listing.</p>
          ) : (
            <form action={createBuyListing} className="grid" style={{ ["--min" as string]: "180px", gap: 10 }}>
              <select className="input" name="courseId" required defaultValue="">
                <option value="" disabled>Select a course…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input className="input" type="number" name="price" min={1} placeholder="Price (₹)" required />
              <input className="input" type="number" name="mrp" min={1} placeholder="Original price (₹, optional)" />
              <input className="input" name="headline" placeholder="Headline (optional)" />
              <button className="btn btn-primary btn-sm" type="submit">Add listing</button>
            </form>
          )}
        </section>
      </div>

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>Listings ({listings.length})</h2>
        {listings.length === 0 ? (
          <p className="empty">Nothing added yet.</p>
        ) : (
          <div className="stack" style={{ gap: 12 }}>
            {listings.map((listing) => {
              const audienceCollegeIds = Array.isArray(listing.audienceCollegeIds) ? (listing.audienceCollegeIds as unknown[]).map(String) : [];
              return (
                <div key={listing.id} className="box">
                  <div className="split" style={{ alignItems: "flex-start" }}>
                    <div>
                      <div className="strong">{listing.course.name}</div>
                      <div className="small muted">{listing.headline}</div>
                    </div>
                    <span className={`pill ${listing.enabled ? "success" : ""}`}>{listing.enabled ? "Live" : "Hidden"}</span>
                  </div>
                  <form action={updateBuyListing.bind(null, listing.id)} className="stack" style={{ gap: 10, marginTop: 12 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <input className="input" type="number" name="price" min={1} defaultValue={listing.price} placeholder="Price" style={{ width: 110 }} />
                      <input className="input" type="number" name="mrp" min={1} defaultValue={listing.mrp ?? ""} placeholder="Original price" style={{ width: 130 }} />
                      <input className="input" name="headline" defaultValue={listing.headline ?? ""} placeholder="Headline" style={{ flex: 1, minWidth: 160 }} />
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                      <label className="small" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input type="checkbox" name="enabled" defaultChecked={listing.enabled} /> Live
                      </label>
                      <label className="small" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input type="checkbox" name="featured" defaultChecked={listing.featured} /> Featured on Home
                      </label>
                    </div>
                    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                      <span className="small muted">Who can see and buy it</span>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 6 }}>
                        {(["PUBLIC", "STUDENTS", "COLLEGES"] as const).map((a) => (
                          <label key={a} className="small" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input type="radio" name="audience" value={a} defaultChecked={listing.audience === a} />
                            {a === "PUBLIC" ? "Everyone" : a === "STUDENTS" ? "Logged-in students only" : "Students of chosen colleges"}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    {colleges.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {colleges.map((c) => (
                          <label key={c.id} className="chip" style={{ cursor: "pointer" }}>
                            <input type="checkbox" name="audienceCollegeIds" value={c.id} defaultChecked={audienceCollegeIds.includes(c.id)} style={{ marginRight: 6 }} />
                            {c.name}
                          </label>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="btn btn-sm" type="submit">Save</button>
                      <Link className="btn btn-sm" href={`/lms/company/edit-site/buy?listingId=${listing.id}`}>Preview locks</Link>
                      <DeleteButton action={deleteBuyListing.bind(null, listing.id)} />
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
