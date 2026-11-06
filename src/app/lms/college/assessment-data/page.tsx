import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS: Record<string, string> = {
  APTITUDE: "Aptitude",
  TECHNICAL_APTITUDE: "Technical Aptitude",
  CODING: "Coding",
};

export default async function CollegeAssessmentDataPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId;

  const assignments = collegeId
    ? await prisma.assessmentAssignment.findMany({
        where: { student: { collegeId }, sentToCollegeAt: { not: null } },
        include: { student: true, assessment: true },
        orderBy: { sentToCollegeAt: "desc" },
      })
    : [];

  return (
    <DashboardShell title="Assessment Data" subtitle="Results shared by Learn Being Forward" navLinks={navLinks}>
      {assignments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No assessment results have been shared with your college yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Assessment</th>
                <th className="p-3">Type</th>
                <th className="p-3">Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td className="p-3 font-medium text-indigo">{a.student.name}</td>
                  <td className="p-3 text-muted-foreground">{a.assessment.title}</td>
                  <td className="p-3 text-muted-foreground">{TYPE_LABELS[a.assessment.type]}</td>
                  <td className="p-3">
                    <Badge className="bg-indigo/10 text-indigo hover:bg-indigo/10">
                      {a.totalMarks ?? 0} / {a.maxMarks ?? 0}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
