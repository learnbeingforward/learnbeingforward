import { mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { format } from "date-fns";

const INDIGO = "#1C2B4A";
const GOLD = "#C9973C";
const INK = "#1F2937";
const MUTED = "#6B7280";
const CREAM = "#FAF7F0";

const OUT_DIR = path.join(process.cwd(), "public", "uploads", "mous");
const PAGE_BOTTOM = 792 - 70;

function ensureRoom(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y > PAGE_BOTTOM - needed) doc.addPage();
}

function header(doc: PDFKit.PDFDocument, subtitle: string) {
  doc.rect(0, 0, doc.page.width, 130).fill(INDIGO);
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("LEARN BEING FORWARD", 64, 44, { characterSpacing: 1 });
  doc.fontSize(22).text("Memorandum of Understanding", 64, 66);
  doc.fontSize(11).fillColor(GOLD).text(subtitle, 64, 96);
  doc.fillColor(INK);
  doc.y = 160;
}

function clauseTitle(doc: PDFKit.PDFDocument, n: number, title: string) {
  ensureRoom(doc, 50);
  doc.moveDown(0.7);
  doc.font("Helvetica-Bold").fontSize(12.5).fillColor(INDIGO).text(`${n}. ${title}`, { paragraphGap: 4 });
}

function clauseBody(doc: PDFKit.PDFDocument, text: string) {
  ensureRoom(doc, 30);
  doc.font("Helvetica").fontSize(10).fillColor(INK).text(text, { paragraphGap: 6, lineGap: 2 });
}

function kv(doc: PDFKit.PDFDocument, label: string, value: string) {
  ensureRoom(doc, 20);
  doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(label, { continued: true });
  doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text(`  ${value}`);
}

export type MouData = {
  contractId: string;
  collegeName: string;
  courseName: string;
  contractType: "CSR" | "PER_STUDENT_HOURLY" | "PER_DAY_FLAT";
  ratePerStudentHour: number | null;
  flatRatePerDay: number | null;
  minStudents: number;
  totalDays: number;
  startDate: Date;
  endDate: Date;
  targetBranch: string | null;
  targetSemester: number | null;
  notes: string | null;
};

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CSR: "CSR (Free — no fee to the college)",
  PER_STUDENT_HOURLY: "Paid — Per Student, Per Hour",
  PER_DAY_FLAT: "Paid — Flat Rate Per Day",
};

export async function renderMouPdf(data: MouData): Promise<string> {
  await mkdir(OUT_DIR, { recursive: true });
  const fileSlug = `mou-${data.contractId}`;
  const filePath = path.join(OUT_DIR, `${fileSlug}.pdf`);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margins: { top: 0, bottom: 70, left: 64, right: 64 } });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);
    stream.on("finish", () => resolve());
    stream.on("error", reject);

    header(doc, `Issued ${format(new Date(), "MMM d, yyyy")}`);

    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor(INK)
      .text(
        `This Memorandum of Understanding ("MOU") is entered into between Learn Being Forward ("the Company") and ${data.collegeName} ("the College") to set out the terms of a placement-focused technical training engagement described below.`,
        { paragraphGap: 8, lineGap: 2 }
      );

    clauseTitle(doc, 1, "Scope of Training");
    kv(doc, "Course:", data.courseName);
    kv(doc, "Nature of Engagement:", CONTRACT_TYPE_LABELS[data.contractType]);
    if (data.ratePerStudentHour) kv(doc, "Rate:", `Rs. ${data.ratePerStudentHour} per student, per hour`);
    if (data.flatRatePerDay) kv(doc, "Rate:", `Rs. ${data.flatRatePerDay} per training day`);
    kv(doc, "Minimum Students:", String(data.minStudents));
    if (data.targetBranch || data.targetSemester) {
      kv(
        doc,
        "Restricted To:",
        [data.targetBranch, data.targetSemester ? `Semester ${data.targetSemester}` : null].filter(Boolean).join(", ")
      );
    }

    clauseTitle(doc, 2, "Training Period");
    kv(doc, "Start Date:", format(data.startDate, "MMMM d, yyyy"));
    kv(doc, "End Date:", format(data.endDate, "MMMM d, yyyy"));
    kv(doc, "Total Training Days:", String(data.totalDays));
    clauseBody(
      doc,
      "The training schedule above is agreed upon by both parties at the time of signing. Both parties commit to conducting sessions strictly within this window unless a rescheduling is agreed in writing as described in Clause 3."
    );

    clauseTitle(doc, 3, "Rescheduling & Cancellation");
    clauseBody(
      doc,
      "Any change to a scheduled training day — whether a postponement, cancellation, or rescheduling — must be communicated in writing by the initiating party at least 7 (seven) days in advance wherever possible, and in any case at the earliest opportunity once the need becomes known. Last-minute cancellations without prior notice should be avoided by both parties. Where a cancellation is unavoidable, the cancelling party shall promptly state the reason and propose alternate dates within a reasonable timeframe, so that the training plan can proceed with minimal disruption to students."
    );

    clauseTitle(doc, 4, "Delivery Commitment");
    clauseBody(
      doc,
      "The Company shall assign a qualified trainer for each scheduled session and ensure sessions are conducted as per the agreed curriculum and schedule. The College shall ensure the agreed number of students are made available and that adequate facilities (classroom/lab access, power, internet where required) are provided for each session."
    );

    clauseTitle(doc, 5, "Payment Terms");
    if (data.contractType === "CSR") {
      clauseBody(
        doc,
        "This training is provided free of cost to the College as part of the Company's corporate social responsibility (CSR) initiative. No fee, rate, or payment obligation applies to either party under this engagement."
      );
    } else {
      clauseBody(
        doc,
        "The College agrees to pay the Company at the rate stated in Clause 1, based on actual training delivered and attendance recorded. The Company will raise an invoice reflecting the training completed to date; the College is expected to review and settle each invoice within a reasonable period from the date of submission."
      );
    }

    clauseTitle(doc, 6, "Term & Termination");
    clauseBody(
      doc,
      "This MOU is effective from the Start Date and remains valid through the End Date stated in Clause 2, unless terminated earlier by mutual written consent of both parties, or extended by a fresh written agreement."
    );

    if (data.notes) {
      clauseTitle(doc, 7, "Special Terms / Notes");
      clauseBody(doc, data.notes);
    }

    ensureRoom(doc, 140);
    doc.moveDown(1.2);
    doc.save();
    doc.rect(64, doc.y, doc.page.width - 128, 1).fill(GOLD);
    doc.restore();
    doc.moveDown(1);

    const sigY = doc.y;
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(INDIGO).text("For Learn Being Forward", 64, sigY, { width: 220 });
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(INDIGO).text(`For ${data.collegeName}`, 320, sigY, { width: 220 });

    const lineY = sigY + 45;
    doc.save();
    doc.rect(64, lineY, 200, 1).fill(MUTED);
    doc.rect(320, lineY, 200, 1).fill(MUTED);
    doc.restore();
    doc.font("Helvetica").fontSize(9).fillColor(MUTED).text("Signature & Date", 64, lineY + 6, { width: 200 });
    doc.font("Helvetica").fontSize(9).fillColor(MUTED).text("Signature & Date", 320, lineY + 6, { width: 200 });
    doc.y = lineY + 26;

    doc.moveDown(1.5);
    doc.save();
    doc.rect(64, doc.y, doc.page.width - 128, 40).fill(CREAM);
    doc.restore();
    doc
      .font("Helvetica-Oblique")
      .fontSize(8.5)
      .fillColor(MUTED)
      .text(
        "This is a standard operational MOU template generated for internal record-keeping between Learn Being Forward and its partner colleges. It is not a substitute for independent legal review where required.",
        74,
        doc.y + 10,
        { width: doc.page.width - 148 }
      );

    doc.end();
  });

  return `/uploads/mous/${fileSlug}.pdf`;
}
