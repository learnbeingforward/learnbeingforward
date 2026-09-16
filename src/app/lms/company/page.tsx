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
import { approveEnrollmentRequest, rejectEnrollmentRequest } from "@/lib/actions/enrollment-requests";

const navLinks = [{ href: "/lms/company", label: "Requests" }];

export default async function CompanyDashboardPage() {
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
        <div className="mt-8 rounded-xl border border-border bg-white">
          <div className="border-b border-border p-6">
            <p className="text-sm font-semibold text-indigo">Recent Decisions</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Decided</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDecided.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium text-indigo">{req.student.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {req.college?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{req.course.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {req.decidedAt ? format(req.decidedAt, "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        req.status === "APPROVED"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-red-100 text-red-700 hover:bg-red-100"
                      }
                    >
                      {req.status === "APPROVED" ? "Approved" : "Rejected"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardShell>
  );
}
