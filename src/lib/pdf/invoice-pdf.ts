import { mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { format } from "date-fns";

const INDIGO = "#1C2B4A";
const GOLD = "#C9973C";
const INK = "#1F2937";
const MUTED = "#6B7280";

const OUT_DIR = path.join(process.cwd(), "public", "uploads", "invoices");

function header(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
  doc.rect(0, 0, doc.page.width, 130).fill(INDIGO);
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("LEARN BEING FORWARD", 64, 44, { characterSpacing: 1 });
  doc.fontSize(22).text(title, 64, 66);
  doc.fontSize(11).fillColor(GOLD).text(subtitle, 64, 96);
  doc.fillColor(INK);
  doc.y = 160;
}

function kv(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(label, { continued: true });
  doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text(`  ${value}`);
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.8);
  doc.font("Helvetica-Bold").fontSize(13).fillColor(INDIGO).text(title, { paragraphGap: 4 });
  doc.moveDown(0.2);
}

async function finish(fileSlug: string, draw: (doc: PDFKit.PDFDocument) => void): Promise<string> {
  await mkdir(OUT_DIR, { recursive: true });
  const filePath = path.join(OUT_DIR, `${fileSlug}.pdf`);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margins: { top: 0, bottom: 60, left: 64, right: 64 } });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);
    stream.on("finish", () => resolve());
    stream.on("error", reject);
    draw(doc);
    doc.end();
  });

  return `/uploads/invoices/${fileSlug}.pdf`;
}

export type TrainerBankDetails = {
  name: string;
  email: string | null;
  phone: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  bankName: string | null;
};

export type TrainerInvoiceLineItem = {
  date: Date;
  collegeName: string;
  batchName: string;
  topic: string;
  hours: number;
  rate: number;
};

export async function renderTrainerInvoicePdf(
  invoiceId: string,
  trainer: TrainerBankDetails,
  lineItems: TrainerInvoiceLineItem[],
  totalAmount: number,
  notes: string | null
): Promise<string> {
  return finish(`trainer-${invoiceId}`, (doc) => {
    header(doc, "Trainer Invoice", `Submitted ${format(new Date(), "MMM d, yyyy")}`);

    sectionTitle(doc, "Trainer Details");
    kv(doc, "Name:", trainer.name);
    if (trainer.email) kv(doc, "Email:", trainer.email);
    if (trainer.phone) kv(doc, "Phone:", trainer.phone);

    sectionTitle(doc, "Bank Details (for payment credit)");
    if (trainer.bankAccountName || trainer.bankAccountNumber || trainer.bankIfsc || trainer.bankName) {
      if (trainer.bankAccountName) kv(doc, "Account Holder:", trainer.bankAccountName);
      if (trainer.bankName) kv(doc, "Bank Name:", trainer.bankName);
      if (trainer.bankAccountNumber) kv(doc, "Account Number:", trainer.bankAccountNumber);
      if (trainer.bankIfsc) kv(doc, "IFSC:", trainer.bankIfsc);
    } else {
      doc.font("Helvetica-Oblique").fontSize(10).fillColor(MUTED).text("No bank details on file yet.");
    }

    sectionTitle(doc, "Training Line Items");
    const colX = [64, 160, 280, 380, 440, 500];
    doc.font("Helvetica-Bold").fontSize(9).fillColor(INDIGO);
    doc.text("Date", colX[0], doc.y, { continued: false, width: 90 });
    const headerY = doc.y - 11;
    doc.text("College", colX[1], headerY, { width: 110 });
    doc.text("Batch", colX[2], headerY, { width: 90 });
    doc.text("Topic", colX[3], headerY, { width: 55 });
    doc.text("Hrs", colX[4], headerY, { width: 50 });
    doc.text("Amount", colX[5], headerY, { width: 70 });
    doc.moveDown(0.5);
    doc.moveTo(64, doc.y).lineTo(doc.page.width - 64, doc.y).strokeColor("#E5E7EB").stroke();
    doc.moveDown(0.3);

    for (const li of lineItems) {
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
        doc.y = 60;
      }
      const rowY = doc.y;
      doc.font("Helvetica").fontSize(9).fillColor(INK);
      doc.text(format(li.date, "MMM d, yyyy"), colX[0], rowY, { width: 90 });
      doc.text(li.collegeName, colX[1], rowY, { width: 110 });
      doc.text(li.batchName, colX[2], rowY, { width: 90 });
      doc.text(li.topic, colX[3], rowY, { width: 55 });
      doc.text(String(li.hours), colX[4], rowY, { width: 50 });
      doc.text(`₹${li.hours * li.rate}`, colX[5], rowY, { width: 70 });
      doc.moveDown(0.6);
    }

    doc.moveDown(0.5);
    doc.moveTo(64, doc.y).lineTo(doc.page.width - 64, doc.y).strokeColor("#E5E7EB").stroke();
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(INDIGO).text(`Total: ₹${totalAmount}`, { align: "right" });

    if (notes) {
      sectionTitle(doc, "Note");
      doc.font("Helvetica").fontSize(10).fillColor(INK).text(notes);
    }
  });
}

export async function renderTrainerApprovalPdf(
  invoiceId: string,
  trainer: { name: string },
  totalAmount: number,
  approved: boolean,
  approvedAmount: number | null,
  deductionAmount: number | null,
  deductionReason: string | null,
  paymentTimelineDays: number | null
): Promise<string> {
  return finish(`trainer-${invoiceId}-approval`, (doc) => {
    header(
      doc,
      approved ? "Invoice Approved" : "Invoice Rejected",
      `Decided ${format(new Date(), "MMM d, yyyy")}`
    );

    sectionTitle(doc, "Trainer");
    kv(doc, "Name:", trainer.name);

    sectionTitle(doc, "Summary");
    kv(doc, "Submitted Amount:", `₹${totalAmount}`);
    if (approved) {
      if (deductionAmount && deductionAmount > 0) {
        kv(doc, "Deduction:", `₹${deductionAmount}${deductionReason ? ` (${deductionReason})` : ""}`);
      }
      kv(doc, "Approved Amount:", `₹${approvedAmount ?? totalAmount}`);
      if (paymentTimelineDays) {
        kv(doc, "Expected Payment Within:", `${paymentTimelineDays} day${paymentTimelineDays !== 1 ? "s" : ""}`);
      }
    } else {
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(10).fillColor(INK).text("This invoice was not approved for payment.");
    }
  });
}

export type CompanyBankDetails = {
  companyBankAccountName: string | null;
  companyBankAccountNumber: string | null;
  companyBankIfsc: string | null;
  companyBankName: string | null;
  companyGstNumber: string | null;
};

export async function renderCollegeInvoicePdf(
  invoiceId: string,
  collegeName: string,
  courseName: string,
  breakdown: { totalStudents: number; totalHours: number | null; totalDays: number | null; totalAmount: number },
  companyBank: CompanyBankDetails
): Promise<string> {
  return finish(`college-${invoiceId}`, (doc) => {
    header(doc, "Training Invoice", `Issued ${format(new Date(), "MMM d, yyyy")}`);

    sectionTitle(doc, "Billed To");
    kv(doc, "College:", collegeName);
    kv(doc, "Course:", courseName);

    sectionTitle(doc, "Training Summary");
    kv(doc, "Students Trained:", String(breakdown.totalStudents));
    if (breakdown.totalHours) kv(doc, "Total Hours:", String(breakdown.totalHours));
    if (breakdown.totalDays) kv(doc, "Total Days:", String(breakdown.totalDays));
    doc.moveDown(0.3);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(INDIGO).text(`Total: ₹${breakdown.totalAmount}`);

    sectionTitle(doc, "Pay To (Learn Being Forward)");
    if (
      companyBank.companyBankAccountName ||
      companyBank.companyBankAccountNumber ||
      companyBank.companyBankIfsc ||
      companyBank.companyBankName
    ) {
      if (companyBank.companyBankAccountName) kv(doc, "Account Holder:", companyBank.companyBankAccountName);
      if (companyBank.companyBankName) kv(doc, "Bank Name:", companyBank.companyBankName);
      if (companyBank.companyBankAccountNumber) kv(doc, "Account Number:", companyBank.companyBankAccountNumber);
      if (companyBank.companyBankIfsc) kv(doc, "IFSC:", companyBank.companyBankIfsc);
      if (companyBank.companyGstNumber) kv(doc, "GSTIN:", companyBank.companyGstNumber);
    } else {
      doc.font("Helvetica-Oblique").fontSize(10).fillColor(MUTED).text("Bank details not yet configured.");
    }
  });
}
