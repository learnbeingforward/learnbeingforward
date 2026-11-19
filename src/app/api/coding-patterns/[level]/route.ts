import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { hasFullCodingPatternsAccess } from "@/lib/coding-patterns-access";

const LEVEL_PATTERN = /^level-(0[1-9]|1[0-4])$/;

/**
 * The public /coding-patterns/*.html files always ship locked (only the
 * first pattern free) — the unlock decision has to happen server-side, not
 * via a URL flag the file's own JS could read, since a query param on a
 * public static file is just as shareable as the plain link. This route is
 * the only way to get the fully-unlocked version: it re-checks access on
 * every request and, only if it passes, serves the same HTML with a flag
 * injected that the file's JS trusts instead of any query string.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  if (!LEVEL_PATTERN.test(level)) {
    return new NextResponse("Not found.", { status: 404 });
  }

  const allowed = await hasFullCodingPatternsAccess();
  if (!allowed) {
    return new NextResponse("Purchase this course to unlock every pattern.", { status: 403 });
  }

  const filePath = path.join(process.cwd(), "public", "coding-patterns", `${level}.html`);
  let html: string;
  try {
    html = await readFile(filePath, "utf-8");
  } catch {
    return new NextResponse("Not found.", { status: 404 });
  }

  html = html.replace("<body>", '<body><script>window.__VIZ_UNLOCKED__=true;</script>');

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
