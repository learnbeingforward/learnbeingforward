import { auth } from "@/auth";

type AudienceListing = { audience: string; audienceCollegeIds: unknown };

/** Whether the current visitor can see/buy a given listing — PUBLIC listings
 * are open to everyone, STUDENTS requires any logged-in student session, and
 * COLLEGES requires a logged-in student whose college is in the listing's
 * chosen list. Staff/buyer sessions never unlock a gated listing on their
 * own; this mirrors exactly who a real prospective buyer would be. */
export async function canViewBuyListing(listing: AudienceListing): Promise<boolean> {
  if (listing.audience === "PUBLIC") return true;

  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") return false;
  if (listing.audience === "STUDENTS") return true;

  if (listing.audience === "COLLEGES") {
    const ids = Array.isArray(listing.audienceCollegeIds) ? (listing.audienceCollegeIds as unknown[]).map(String) : [];
    return !!session.user.collegeId && ids.includes(session.user.collegeId);
  }
  return false;
}
