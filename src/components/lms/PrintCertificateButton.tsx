"use client";

export function PrintCertificateButton() {
  return (
    <button className="btn btn-gold btn-sm" type="button" onClick={() => window.print()}>
      Print / Save as PDF
    </button>
  );
}
