import { PublicHeader } from "./PublicHeader";
import { SiteFooter } from "./SiteFooter";

/** Wraps a public marketing page in the redesigned navy-band + white-card
 * system. `headerProps` are passed straight to PublicHeader. */
export function PublicShell({
  header,
  children,
}: {
  header: React.ComponentProps<typeof PublicHeader>;
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader {...header} />
      <main className="container">{children}</main>
      <SiteFooter />
    </>
  );
}
