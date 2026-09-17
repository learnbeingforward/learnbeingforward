export function isCompanyStaff(role?: string | null) {
  return role === "SUPER_ADMIN" || role === "ADMIN2";
}
