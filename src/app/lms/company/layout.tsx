import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function CompanyLmsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/auth");
  if (session.user.role === "COLLEGE_ADMIN") redirect("/lms/college");
  if (session.user.role !== "SUPER_ADMIN") redirect("/lms/student");

  return <>{children}</>;
}
