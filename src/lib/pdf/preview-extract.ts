import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";

const PREVIEW_DIR = path.join(process.cwd(), "public", "uploads", "buy-previews");
const PREVIEW_URL_PREFIX = "/uploads/buy-previews";

/**
 * Copies the first `pageCount` pages of a source PDF (an existing
 * /uploads/... file) into a new, freely-public preview file — a real,
 * separate PDF rather than a page-fragment trick, so there's nothing in the
 * browser for a buyer to scroll past to see the rest. Returns the new file's
 * public URL. Overwrites any previous preview for the same lock id, so
 * calling this again after the admin changes the page count just replaces it.
 */
export async function generatePdfPreview(sourceFileUrl: string, pageCount: number, lockId: string): Promise<string> {
  const sourcePath = path.join(process.cwd(), "public", sourceFileUrl);
  const sourceBytes = await readFile(sourcePath);
  const sourceDoc = await PDFDocument.load(sourceBytes);

  const previewDoc = await PDFDocument.create();
  const pagesToCopy = Math.min(pageCount, sourceDoc.getPageCount());
  const indices = Array.from({ length: pagesToCopy }, (_, i) => i);
  const copiedPages = await previewDoc.copyPages(sourceDoc, indices);
  for (const page of copiedPages) previewDoc.addPage(page);

  const previewBytes = await previewDoc.save();

  await mkdir(PREVIEW_DIR, { recursive: true });
  const filename = `${lockId}.pdf`;
  await writeFile(path.join(PREVIEW_DIR, filename), previewBytes);

  return `${PREVIEW_URL_PREFIX}/${filename}`;
}
