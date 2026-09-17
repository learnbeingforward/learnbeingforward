import { mkdir } from "node:fs/promises";
import path from "node:path";
import PDFDocument from "pdfkit";
import { createWriteStream } from "node:fs";
import type { ModuleContent } from "./content/types";

const INDIGO = "#1C2B4A";
const GOLD = "#C9973C";
const INK = "#1F2937";

export async function renderModulePdf(
  courseName: string,
  content: ModuleContent,
  outDir: string,
  fileSlug: string
): Promise<string> {
  await mkdir(outDir, { recursive: true });
  const filePath = path.join(outDir, `${fileSlug}.pdf`);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margins: { top: 60, bottom: 60, left: 64, right: 64 } });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);
    stream.on("finish", () => resolve());
    stream.on("error", reject);

    // Cover
    doc.rect(0, 0, doc.page.width, 160).fill(INDIGO);
    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("LEARN BEING FORWARD", 64, 50, { characterSpacing: 1 });
    doc.fontSize(24).text(content.moduleTitle, 64, 78, { width: doc.page.width - 128 });
    doc
      .fontSize(12)
      .fillColor(GOLD)
      .text(courseName, 64, 126);

    doc.moveDown(4);
    doc.fillColor(INK);

    for (const section of content.sections) {
      if (doc.y > doc.page.height - 150) doc.addPage();
      doc
        .font("Helvetica-Bold")
        .fontSize(15)
        .fillColor(INDIGO)
        .text(section.heading, { paragraphGap: 6 });
      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor(INK)
        .text(section.body, { paragraphGap: 8, lineGap: 3 });

      if (section.bullets?.length) {
        for (const b of section.bullets) {
          if (doc.y > doc.page.height - 80) doc.addPage();
          doc
            .font("Helvetica")
            .fontSize(11)
            .fillColor(INK)
            .text(`•  ${b}`, { indent: 12, paragraphGap: 4, lineGap: 2 });
        }
        doc.moveDown(0.5);
      }
      doc.moveDown(0.5);
    }

    if (content.links.length > 0) {
      if (doc.y > doc.page.height - 150) doc.addPage();
      doc.moveDown(0.5);
      doc
        .font("Helvetica-Bold")
        .fontSize(15)
        .fillColor(INDIGO)
        .text("Learn More", { paragraphGap: 6 });
      for (const link of content.links) {
        if (doc.y > doc.page.height - 80) doc.addPage();
        doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text(link.label, { continued: false });
        doc.font("Helvetica").fontSize(10).fillColor(GOLD).text(link.url, { paragraphGap: 8 });
        doc.fillColor(INK);
      }
    }

    doc.end();
  });

  return filePath;
}
