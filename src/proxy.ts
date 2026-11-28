import { NextResponse } from "next/server";
import { auth } from "@/auth";

const STAFF_ROLES = new Set(["SUPER_ADMIN", "ADMIN2", "EMPLOYEE", "COLLEGE_ADMIN", "TRAINER"]);

/**
 * Course-content PDFs/files live under public/uploads/course-content, which
 * Next.js serves to anyone with the URL by default — no login required. That
 * directly undermines the student content page's own approval gate (a
 * student can be denied "Request access" there and still just open the raw
 * link). This blocks direct requests to that one subtree for anyone who
 * isn't company/college/trainer staff; students and anonymous visitors get a
 * plain 403 and have to go through /api/content/view or /api/content/:id/file
 * instead, which re-check the same per-student approval before streaming the
 * file.
 */
export default auth((req) => {
  if (req.nextUrl.pathname.startsWith("/uploads/course-content")) {
    const role = req.auth?.user?.role;
    if (role && STAFF_ROLES.has(role)) {
      return NextResponse.next();
    }
    return new NextResponse("Forbidden — view this content from inside your student portal.", { status: 403 });
  }

  const response = NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/lms")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  }
  return response;
});

export const config = {
  matcher: ["/lms/:path*", "/uploads/course-content/:path*"],
};
