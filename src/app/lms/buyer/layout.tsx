import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function BuyerLmsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/auth");
  if (session.user.role !== "BUYER") redirect("/auth");

  return <>{children}</>;
}
