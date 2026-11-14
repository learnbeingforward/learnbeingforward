// Each public page renders its own full shell (PublicShell: navy band header
// + nav + white card + footer) via @/components/lbf, so this layout no
// longer wraps them in the old Header/Footer.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
