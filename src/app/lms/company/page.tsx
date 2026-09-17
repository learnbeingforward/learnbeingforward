import Link from "next/link";
import { format } from "date-fns";
import { Building2, BookOpenCheck, Clock3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BackLink } from "@/components/lms/BackLink";
import { approveEnrollmentRequest, rejectEnrollmentRequest } from "@/lib/actions/enrollment-requests";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";

export default async function CompanyDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  const { requestId } = await searchParams;

  if (requestId) {
    const request = await prisma.enrollmentRequest.findUnique({
      where: { id: requestId },
      include: { student: true, course: true, college: true },
    });

    return (
      <DashboardShell title="Enrollment Request" subtitle="Decision detail" navLinks={navLinks}>
        <BackLink href="/lms/company" label="Back to Requests" />
        {!request ? (
          <p className="text-sm text-muted-foreground">This request no longer exists.</p>
        ) : (
          <div className="max-w-lg rounded-xl border border-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-indigo">{request.student.name}</h2>
              <Badge
                className={
                  request.status === "APPROVED"
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : request.status === "REJECTED"
                      ? "bg-red-100 text-red-700 hover:bg-red-100"
                      : "bg-gold/20 text-indigo hover:bg-gold/20"
                }
              >
                {request.status}
              </Badge>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="text-indigo">{request.student.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">College</dt>
                <dd className="text-indigo">{request.college?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Course</dt>
                <dd className="text-indigo">{request.course.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Requested</dt>
                <dd className="text-indigo">{format(request.requestedAt, "MMM d, yyyy")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Decided</dt>
                <dd className="text-indigo">
                  {request.decidedAt ? format(request.decidedAt, "MMM d, yyyy") : "—"}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </DashboardShell>
    );
  }

  const [pending, recentDecided] = await Promise.all([
    prisma.enrollmentRequest.findMany({
      where: { status: "PENDING" },
      include: { student: true, course: true, college: true },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.enrollmentRequest.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      include: { student: true, course: true, college: true },
      orderBy: { decidedAt: "desc" },
      take: 10,
    }),
  ]);

  const collegesRepresented = new Set(pending.map((r) => r.collegeId).filter(Boolean)).size;
  const coursesRequested = new Set(pending.map((r) => r.courseId)).size;

  return (
    <DashboardShell title="Company Dashboard" subtitle="Enrollment requests" navLinks={navLinks}>
      <div className="mb-8 grid gap-5 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5">
          <div className="flex size-11 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
            <Clock3 className="size-5.5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo">{pending.length}</p>
            <p className="text-xs text-muted-foreground">Pending Requests</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5">
          <div className="flex size-11 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
            <Building2 className="size-5.5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo">{collegesRepresented}</p>
            <p className="text-xs text-muted-foreground">Colleges Represented</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5">
          <div className="flex size-11 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
            <BookOpenCheck className="size-5.5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo">{coursesRequested}</p>
            <p className="text-xs text-muted-foreground">Courses Requested</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Pending Approval</p>
        </div>

        {pending.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No pending enrollment requests right now.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium text-indigo">{req.student.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {req.college?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{req.course.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(req.requestedAt, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <form action={approveEnrollmentRequest.bind(null, req.id)}>
                        <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                          Approve
                        </Button>
                      </form>
                      <form action={rejectEnrollmentRequest.bind(null, req.id)}>
                        <Button type="submit" size="sm" variant="outline" className="border-border text-muted-foreground">
                          Reject
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {recentDecided.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">Recent Decisions</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentDecided.map((req) => (
              <Link
                key={req.id}
                href={`/lms/company?requestId=${req.id}`}
                className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-indigo">{req.student.name}</p>
                  <Badge
                    className={
                      req.status === "APPROVED"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-red-100 text-red-700 hover:bg-red-100"
                    }
                  >
                    {req.status === "APPROVED" ? "Approved" : "Rejected"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {req.course.name} &middot; {req.college?.name ?? "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {req.decidedAt ? format(req.decidedAt, "MMM d, yyyy") : "—"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
