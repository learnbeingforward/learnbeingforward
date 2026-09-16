export function BlobBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-24 -top-24 size-72 rounded-full bg-gold/20 blur-3xl sm:size-96" />
      <div className="absolute -right-16 top-1/3 size-64 rounded-full bg-indigo/10 blur-3xl sm:size-80" />
      <div className="absolute bottom-0 left-1/3 size-56 rounded-full bg-gold-light/25 blur-3xl sm:size-72" />
    </div>
  );
}
