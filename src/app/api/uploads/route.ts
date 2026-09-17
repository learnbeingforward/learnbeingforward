import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ALLOWED_EXTENSIONS: Record<string, string> = {
  ".pdf": "pdf",
  ".ppt": "ppt",
  ".pptx": "ppt",
  ".doc": "doc",
  ".docx": "doc",
};
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_CATEGORIES = new Set(["cv", "content"]);

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-]/g, "_").slice(-100);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const category = String(formData.get("category") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Invalid upload category." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 10MB)." }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  const fileType = ALLOWED_EXTENSIONS[ext];
  if (!fileType) {
    return NextResponse.json(
      { error: "Only PDF, PPT, and Word files are allowed." },
      { status: 400 }
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", category);
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID()}-${sanitizeFilename(file.name)}`;
  const filePath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return NextResponse.json({ url: `/uploads/${category}/${filename}`, fileType });
}
