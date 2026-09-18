import { mkdir } from "node:fs/promises";
import path from "node:path";
import PDFDocument from "pdfkit";
import { createWriteStream } from "node:fs";
import type { SubModuleContent } from "./content/submodule-types";

const INDIGO = "#1C2B4A";
const INDIGO_DARK = "#121B30";
const GOLD = "#C9973C";
const GOLD_LIGHT = "#EBC77A";
const CREAM = "#FAF7F0";
const INK = "#1F2937";

const PAGE_BOTTOM = 792 - 60;

function ensureRoom(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y > PAGE_BOTTOM - needed) doc.addPage();
}

function renderCodeBlock(doc: PDFKit.PDFDocument, code: string, language: string) {
  const lines = code.split("\n");
  const lineHeight = 13;
  const boxHeight = lines.length * lineHeight + 24;

  if (doc.y > PAGE_BOTTOM - Math.min(boxHeight, 150)) doc.addPage();

  const boxY = doc.y;
  const boxX = 64;
  const boxWidth = doc.page.width - 128;

  doc.save();
  doc.rect(boxX, boxY, boxWidth, boxHeight).fill(CREAM);
  doc.rect(boxX, boxY, 3, boxHeight).fill(GOLD);
  doc.restore();

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(GOLD)
    .text(language.toUpperCase(), boxX + 14, boxY + 8, { characterSpacing: 1 });

  doc.font("Courier").fontSize(9).fillColor(INDIGO_DARK);
  let cursorY = boxY + 22;
  for (const line of lines) {
    if (cursorY > doc.page.height - 60) {
      doc.addPage();
      cursorY = 60;
    }
    doc.text(line || " ", boxX + 14, cursorY, { width: boxWidth - 28, lineBreak: false });
    cursorY += lineHeight;
  }
  doc.y = Math.max(doc.y, boxY + boxHeight) + 10;
  doc.fillColor(INK);
}

function renderCalloutBox(doc: PDFKit.PDFDocument, title: string, items: string[], accent: string) {
  ensureRoom(doc, 40);
  doc.moveDown(0.6);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(accent)
    .text(title, { paragraphGap: 6 });

  const boxX = 64;
  const boxWidth = doc.page.width - 128;
  const startY = doc.y;

  doc.save();
  doc.rect(boxX, startY, boxWidth, 1).fill(accent);
  doc.restore();
  doc.moveDown(0.4);

  for (const item of items) {
    ensureRoom(doc, 30);
    doc.font("Helvetica").fontSize(10.5).fillColor(INK);
    doc.text(`•  ${item}`, boxX + 8, doc.y, { width: boxWidth - 16, paragraphGap: 5, lineGap: 2 });
  }
  doc.moveDown(0.5);
}

export async function renderSubModulePdf(
  courseName: string,
  content: SubModuleContent,
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
    doc.rect(0, 0, doc.page.width, 175).fill(INDIGO);
    doc
      .fillColor(GOLD_LIGHT)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("LEARN BEING FORWARD", 64, 44, { characterSpacing: 1.5 });
    doc
      .fillColor("#FFFFFF")
      .font("Helvetica")
      .fontSize(11)
      .text(`${courseName} — ${content.moduleTitle}`, 64, 64);
    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(25)
      .text(content.subModuleTitle, 64, 86, { width: doc.page.width - 128 });
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(11).text("COMPLETE LEARNING GUIDE", 64, 145, { characterSpacing: 1 });

    doc.y = 200;
    doc.fillColor(INK);

    // Overview callout
    const boxX = 64;
    const boxWidth = doc.page.width - 128;
    doc.save();
    doc.rect(boxX, doc.y, boxWidth, 1).fill(GOLD);
    doc.restore();
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(INDIGO).text("What You'll Learn", { paragraphGap: 6 });
    doc.font("Helvetica").fontSize(11).fillColor(INK).text(content.overview, { paragraphGap: 8, lineGap: 3 });
    doc.moveDown(0.5);

    // Deep-dive sections
    content.sections.forEach((section, idx) => {
      ensureRoom(doc, 60);
      doc
        .font("Helvetica-Bold")
        .fontSize(15)
        .fillColor(INDIGO)
        .text(`${idx + 1}. ${section.heading}`, { paragraphGap: 6 });
      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor(INK)
        .text(section.body, { paragraphGap: 8, lineGap: 3 });

      if (section.bullets?.length) {
        for (const b of section.bullets) {
          ensureRoom(doc, 30);
          doc
            .font("Helvetica")
            .fontSize(11)
            .fillColor(INK)
            .text(`•  ${b}`, { indent: 12, paragraphGap: 4, lineGap: 2 });
        }
        doc.moveDown(0.4);
      }

      if (section.code) {
        renderCodeBlock(doc, section.code.code, section.code.language);
      }

      doc.moveDown(0.4);
    });

    if (content.commonPitfalls.length > 0) {
      renderCalloutBox(doc, "Common Pitfalls", content.commonPitfalls, GOLD);
    }

    if (content.keyTakeaways.length > 0) {
      renderCalloutBox(doc, "Key Takeaways", content.keyTakeaways, INDIGO);
    }

    if (content.links.length > 0) {
      ensureRoom(doc, 60);
      doc.moveDown(0.3);
      doc.font("Helvetica-Bold").fontSize(13).fillColor(INDIGO).text("Learn More", { paragraphGap: 6 });
      for (const link of content.links) {
        ensureRoom(doc, 30);
        doc.font("Helvetica-Bold").fontSize(10.5).fillColor(INK).text(link.label);
        doc.font("Helvetica").fontSize(10).fillColor(GOLD).text(link.url, { paragraphGap: 8 });
        doc.fillColor(INK);
      }
    }

    doc.end();
  });

  return filePath;
}
