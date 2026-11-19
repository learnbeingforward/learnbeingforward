import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

/**
 * Stamps a faint, repeated "LEARN BEING FORWARD" watermark across every
 * page — so a screenshot or printout of a purchased book still carries a
 * visible mark of where it came from, even though the file itself is only
 * ever streamed inline (never handed out as a plain download link).
 */
export async function watermarkPdf(sourceBytes: Buffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(sourceBytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const text = "LEARN BEING FORWARD";

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const fontSize = Math.max(18, Math.min(width, height) / 14);
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    const rows = 3;
    const cols = 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        page.drawText(text, {
          x: (width / cols) * c - textWidth / 4,
          y: (height / (rows + 1)) * (r + 1),
          size: fontSize,
          font,
          color: rgb(0.6, 0.6, 0.6),
          opacity: 0.18,
          rotate: degrees(35),
        });
      }
    }
  }

  return doc.save();
}
