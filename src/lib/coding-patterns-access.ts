import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const INTERNAL_ROLES = new Set(["SUPER_ADMIN", "ADMIN2", "EMPLOYEE", "COLLEGE_ADMIN", "TRAINER", "STUDENT"]);

/** Whether the current session should see every pattern unlocked, not just
 * the free first one — any logged-in internal account, or a buyer who has
 * actually paid for the Coding Patterns course. */
export async function hasFullCodingPatternsAccess(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  if (INTERNAL_ROLES.has(session.user.role)) return true;
  if (session.user.role === "BUYER") {
    const order = await prisma.courseOrder.findFirst({
      where: { buyerUserId: session.user.id, status: "PAID", buyListing: { course: { slug: "coding-patterns" } } },
    });
    return !!order;
  }
  return false;
}
