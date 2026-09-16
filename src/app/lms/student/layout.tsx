import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function StudentLmsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/auth");
  if (session.user.role !== "STUDENT") redirect("/lms/college");

  return <>{children}</>;
}
