import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";
import { PdfCanvasViewer } from "@/components/lms/PdfCanvasViewer";

export const revalidate = 0;

/**
 * Renders a buy-preview PDF (the truncated, freely-public copy
 * generatePdfPreview() writes to /uploads/buy-previews) in the same
 * canvas viewer the paid student/buyer portals use, instead of a bare
 * `<a href target="_blank">` straight to the file — that opened the
 * browser's own PDF plugin (with its own download button, and on a lot of
 * mobile browsers a straight download prompt instead of a view at all)
 * in place of the site's own reading experience.
 */
export default async function BuyPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string; title?: string; back?: string }>;
}) {
  const { src, title, back } = await searchParams;

  // Only ever serve files from the one directory generatePdfPreview() writes
  // to — this route takes an arbitrary query param, so it must not become an
  // open proxy for any other path on the server.
  if (!src || !src.startsWith("/uploads/buy-previews/")) notFound();

  return (
    <PublicShell
      header={{
        active: "buy",
        heroContent: (
          <div className="container band-hero">
            <h1>{title ?? "Free preview"}</h1>
            <p>The first pages of this book — free to read, no account needed.</p>
          </div>
        ),
      }}
    >
      <div className="lift">
        {back && (
          <Link className="btn btn-sm" href={back} style={{ marginBottom: 16, display: "inline-flex" }}>
            <Icon name="arrowL" size={16} />
            Back
          </Link>
        )}
        <section className="card" style={{ padding: 0, overflow: "hidden" }}>
          <PdfCanvasViewer src={src} title={title ?? "Preview"} />
        </section>
      </div>
    </PublicShell>
  );
}
