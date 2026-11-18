import QRCode from "qrcode";

/** Builds a standard UPI deep-link payment string and renders it as a data-URL
 * QR code — scannable by any UPI app, pre-filled with the payee, amount, and
 * a note identifying the order. Falls back to null if no UPI ID is configured
 * yet (the checkout page shows the UPI ID as plain text either way). */
export async function buildUpiQrDataUrl(upiId: string, amount: number, payeeName: string, note: string): Promise<string> {
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  return QRCode.toDataURL(upiUrl, { margin: 1, width: 280 });
}
