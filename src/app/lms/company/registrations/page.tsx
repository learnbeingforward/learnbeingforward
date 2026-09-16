import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Button } from "@/components/ui/button";
import { approveRegistration, rejectRegistration } from "@/lib/actions/registration";
import { format } from "date-fns";

export default async function CompanyRegistrationsPage() {
  const pending = await prisma.user.findMany({
    where: { role: "STUDENT", studentStatus: "PENDING_APPROVAL" },
    include: { college: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <DashboardShell title="New Registrations" subtitle="Student sign-ups awaiting approval" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        A student appears here after they sign up and their details matched a roster entry their
        college added. Approve to give them access to request courses, or reject to send the entry
        back to the college&apos;s roster so the student can try signing up again.
      </p>

      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Pending ({pending.length})</p>
        </div>
        {pending.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No pending registrations.</p>
        ) : (
          <div className="divide-y divide-border">
            {pending.map((student) => (
              <div key={student.id} className="flex flex-wrap items-start justify-between gap-4 p-6">
                <div>
                  <p className="font-medium text-indigo">
                    {student.name}
                    {student.usn && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        USN: {student.usn}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {student.email} &middot; {student.college?.name ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Signed up {format(student.createdAt, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={approveRegistration.bind(null, student.id)}>
                    <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                      Approve
                    </Button>
                  </form>
                  <form action={rejectRegistration.bind(null, student.id)}>
                    <Button type="submit" size="sm" variant="outline" className="border-border text-muted-foreground">
                      Reject
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
