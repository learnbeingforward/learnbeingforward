import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
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
const AUDIENCE_OPTIONS = [
  { value: "PUBLIC", icon: "globe", label: "Everyone on the website" },
  { value: "STUDENTS", icon: "user", label: "Logged-in students only" },
  { value: "COLLEGES", icon: "building", label: "Students of chosen colleges" },
] as const;

export default async function EditSiteBuyPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>;
}) {
  const { listingId } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const [settings, listings, availableCourses, pendingOrderCount, colleges] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.buyListing.findMany({ include: { course: { include: { modules: true } } }, orderBy: { order: "asc" } }),
    prisma.course.findMany({ where: { buyListing: null, isPlaceholder: false }, orderBy: { name: "asc" } }),
    prisma.courseOrder.count({ where: { status: "PENDING" } }),
    prisma.college.findMany({ orderBy: { name: "asc" } }),
  ]);
  const unlistedCourseCount = await prisma.course.count({ where: { buyListing: null } });

  const selected = listingId ? listings.find((l) => l.id === listingId) : listings[0];

  const [modules, content, locks] = selected
    ? await Promise.all([
        prisma.courseModule.findMany({ where: { courseId: selected.courseId, mainPdfUrl: { not: null } }, orderBy: { order: "asc" } }),
        prisma.courseContent.findMany({ where: { courseId: selected.courseId }, include: { courseSubModule: true }, orderBy: { title: "asc" } }),
        prisma.buyPreviewLock.findMany({ where: { buyListingId: selected.id } }),
      ])
    : [[], [], []];
  const moduleLockByModuleId = new Map(locks.filter((l) => l.courseModuleId).map((l) => [l.courseModuleId!, l]));
  const contentLockByContentId = new Map(locks.filter((l) => l.courseContentId).map((l) => [l.courseContentId!, l]));
  const bookCount = modules.length + content.length;

  return (
    <AppShell
      nav={nav}
      active="edit-site"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Edit Site › Buy"
      title="Buy"
      subtitle="Sell course books on the website: prices, free previews, who can buy, payments and orders."
      actions={
        <Link className="btn btn-ghost-light" href="/lms/company/edit-site">
          <Icon name="arrowL" size={16} />
          Back to Edit Site
        </Link>
      }
    >
      <div className="card" style={{ paddingBottom: 0 }}>
        <div className="tabs" role="tablist" style={{ marginBottom: 0, borderBottom: 0 }}>
          <button type="button" role="tab" aria-selected="true" className="active">
            Listings ({listings.length})
          </button>
          <Link href="/lms/company/edit-site/buy/orders" role="tab" className="tab" style={{ textDecoration: "none" }}>
            Orders {pendingOrderCount > 0 && <span className="pill warning" style={{ marginLeft: 6 }}>{pendingOrderCount} to verify</span>}
          </Link>
        </div>
      </div>

      <div className="by-wrap" style={{ marginTop: 20 }}>
        <aside className="card" style={{ padding: 18 }}>
          <div className="split" style={{ marginBottom: 12 }}>
            <h3 className="h3">Listings</h3>
          </div>
          <ul className="st-clist">
            {listings.map((l) => (
              <li key={l.id}>
                <Link href={`/lms/company/edit-site/buy?listingId=${l.id}`} className={selected?.id === l.id ? "on" : ""}>
                  <span className="dot live" />
                  <span className="grow">
                    <b>{l.course.name}</b>
                    <small>
                      ₹{l.price} · {l.course.modules.length} book{l.course.modules.length !== 1 ? "s" : ""} ·{" "}
                      {l.audience === "PUBLIC" ? "Everyone on the website" : l.audience === "STUDENTS" ? "Logged-in students only" : "Chosen colleges"}
                    </small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {unlistedCourseCount > 0 && (
            <p className="small muted" style={{ marginTop: 12 }}>
              {unlistedCourseCount} course(s) from Course Studio aren&apos;t listed yet.
            </p>
          )}
          {availableCourses.length > 0 && (
            <form action={createBuyListing} className="stack" style={{ gap: 8, marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <select className="select" name="courseId" required defaultValue="">
                <option value="" disabled>
                  Add a course…
                </option>
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input className="input" type="number" name="price" min={1} placeholder="Price (₹)" required />
              <button className="btn btn-gold btn-sm" type="submit">
                <Icon name="plus" size={16} />
                Add
              </button>
            </form>
          )}
        </aside>

        <div className="stack" style={{ gap: 20, minWidth: 0 }}>
          <section className="card">
            <h2 className="h2" style={{ marginBottom: 18 }}>
              Payment settings
            </h2>
            <p className="small muted" style={{ marginBottom: 14 }}>
              Shared across every book — change this any time and it updates the payment page for all of them.
            </p>
            <form action={updateBuyPaymentSettings} className="row" style={{ alignItems: "flex-end" }}>
              <label className="field grow">
                <span>UPI ID</span>
                <input className="input" name="buyUpiId" defaultValue={settings?.buyUpiId ?? ""} placeholder="yourname@upi" />
              </label>
              <div className="grow">
                <FileUploadField name="buyQrImageUrl" label="QR code image (optional — overrides the auto-generated one)" category="photo" defaultUrl={settings?.buyQrImageUrl} />
              </div>
              <button className="btn btn-primary btn-sm" type="submit">
                Save
              </button>
            </form>
          </section>

          {!selected ? (
            <section className="card">
              <p className="empty">Add a listing on the left to get started.</p>
            </section>
          ) : (
            <>
              <section className="card">
                <div className="split" style={{ flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                  <div>
                    <div className="label">Listing</div>
                    <h2 className="h2" style={{ marginTop: 4 }}>
                      {selected.course.name}
                    </h2>
                  </div>
                </div>
                <form action={updateBuyListing.bind(null, selected.id)} className="by-ed">
                  <div className="stack" style={{ gap: 14 }}>
                    <div className="split" style={{ gap: 10 }}>
                      <span className="small" style={{ fontWeight: 600 }}>
                        Live on the Buy page
                      </span>
                      <label className="tgl">
                        <input type="checkbox" name="enabled" defaultChecked={selected.enabled} aria-label="Live" />
                        <span />
                      </label>
                    </div>
                    <div className="grid" style={{ ["--min" as string]: "150px" }}>
                      <label className="field">
                        <span>
                          Price (₹) <span className="req" aria-hidden="true">*</span>
                        </span>
                        <input className="input" type="number" min={1} name="price" defaultValue={selected.price} required />
                      </label>
                      <label className="field">
                        <span>Original price (₹)</span>
                        <input className="input" type="number" min={1} name="mrp" defaultValue={selected.mrp ?? ""} placeholder="optional" />
                        <span className="hint">Shows &quot;N% off&quot;</span>
                      </label>
                    </div>
                    <label className="field">
                      <span>Headline</span>
                      <input className="input" name="headline" defaultValue={selected.headline ?? ""} maxLength={110} />
                      <span className="hint">One line under the course name on the Buy page.</span>
                    </label>
                    <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
                      <span>Who can see and buy it</span>
                      <div className="by-aud">
                        {AUDIENCE_OPTIONS.map((a) => (
                          <label key={a.value}>
                            <input type="radio" name="audience" value={a.value} defaultChecked={selected.audience === a.value} />
                            <span>
                              <Icon name={a.icon} size={16} />
                              <b>{a.label}</b>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    {selected.audience === "COLLEGES" && colleges.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {colleges.map((c) => {
                          const ids = Array.isArray(selected.audienceCollegeIds) ? (selected.audienceCollegeIds as unknown[]).map(String) : [];
                          return (
                            <label key={c.id} className="chip" style={{ cursor: "pointer" }}>
                              <input type="checkbox" name="audienceCollegeIds" value={c.id} defaultChecked={ids.includes(c.id)} style={{ marginRight: 6 }} />
                              {c.name}
                            </label>
                          );
                        })}
                      </div>
                    )}
                    <div className="st-toggle">
                      <div>
                        <b>
                          <Icon name="home" size={16} /> Feature on the Home page
                        </b>
                        <p className="small muted">Shows this book set in the &quot;Own the course&quot; strip on the home page.</p>
                      </div>
                      <label className="tgl">
                        <input type="checkbox" name="featured" defaultChecked={selected.featured} />
                        <span />
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="label" style={{ marginBottom: 8 }}>
                      Preview on the Buy page
                    </div>
                    <article className="by-card sm">
                      <div className="by-cover">
                        <span>
                          <Icon name="book" size={28} />
                        </span>
                        <b>{selected.course.name}</b>
                        <small>{bookCount} course book{bookCount !== 1 ? "s" : ""}</small>
                        {selected.mrp && selected.mrp > selected.price && <em>{Math.round((1 - selected.price / selected.mrp) * 100)}% off</em>}
                      </div>
                      <div className="by-cbody">
                        <h3>{selected.course.name}</h3>
                        <p>{selected.headline}</p>
                        <div className="by-price">
                          <b>₹{selected.price}</b>
                          {selected.mrp && <s>₹{selected.mrp}</s>}
                        </div>
                        <span className="by-link">View &amp; preview →</span>
                      </div>
                    </article>
                  </div>
                  <div className="split" style={{ gridColumn: "1 / -1", marginTop: 4 }}>
                    <span />
                    <button className="btn btn-gold" type="submit">
                      <Icon name="check" size={16} />
                      Save changes
                    </button>
                  </div>
                </form>
              </section>

              <section className="card">
                <div className="split" style={{ flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                  <div>
                    <h3 className="h3">What&apos;s included ({bookCount} books)</h3>
                    <p className="small muted">Free preview pages are what anyone can read before buying. Lock a book to show only its title.</p>
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="table m-cards" style={{ minWidth: 560 }}>
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Free preview</th>
                        <th>Locked</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((mod) => {
                        const lock = moduleLockByModuleId.get(mod.id);
                        return (
                          <tr key={mod.id}>
                            <td className="strong" data-label="Book">
                              {mod.mainPdfTitle ?? mod.title}
                            </td>
                            <td data-label="Free preview">
                              <form action={setModulePreviewLock.bind(null, selected.id, mod.id)} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input className="input" type="number" name="previewPages" min={1} defaultValue={lock?.previewPages ?? 4} style={{ width: 80 }} aria-label="Preview pages" />
                                <button className="btn btn-sm" type="submit">
                                  {lock ? "Update" : "Lock preview"}
                                </button>
                              </form>
                            </td>
                            <td data-label="Locked">{lock ? <span className="pill gold">Locked</span> : <span className="small muted">Full preview</span>}</td>
                            <td data-label="">{lock && <DeleteButton action={removePreviewLock.bind(null, lock.id)} />}</td>
                          </tr>
                        );
                      })}
                      {content.map((item) => {
                        const lock = contentLockByContentId.get(item.id);
                        const title = item.courseSubModule ? item.courseSubModule.title : item.title;
                        return (
                          <tr key={item.id}>
                            <td className="strong" data-label="Book">
                              {title}
                            </td>
                            <td data-label="Free preview">
                              <form action={setContentPreviewLock.bind(null, selected.id, item.id)} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input className="input" type="number" name="previewPages" min={1} defaultValue={lock?.previewPages ?? 4} style={{ width: 80 }} aria-label="Preview pages" />
                                <button className="btn btn-sm" type="submit">
                                  {lock ? "Update" : "Lock preview"}
                                </button>
                              </form>
                            </td>
                            <td data-label="Locked">{lock ? <span className="pill gold">Locked</span> : <span className="small muted">Full preview</span>}</td>
                            <td data-label="">{lock && <DeleteButton action={removePreviewLock.bind(null, lock.id)} />}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {bookCount === 0 && <p className="empty">No book PDFs on this course yet.</p>}
                <div className="split" style={{ marginTop: 16, flexWrap: "wrap", gap: 10 }}>
                  <form action={deleteBuyListing.bind(null, selected.id)}>
                    <button className="btn btn-danger btn-sm" type="submit">
                      <Icon name="trash" size={16} />
                      Delete listing
                    </button>
                  </form>
                  <Link className="btn" href={`/buy/${selected.course.slug}`} target="_blank">
                    <Icon name="eye" size={16} />
                    View as a buyer
                  </Link>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
