import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LogoIcon } from "@/components/brand/LogoIcon";
import { PrintCertificateButton } from "@/components/lms/PrintCertificateButton";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ enrollmentId: string }>;
}) {
  const { enrollmentId } = await params;
  const session = await auth();

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true, student: true, certification: true },
  });

  if (!enrollment || enrollment.studentId !== session?.user.id || !enrollment.certification) {
    notFound();
  }
  const certification = enrollment.certification;
  if (certification.status !== "ISSUED") {
    notFound();
  }

  const issuedDate = certification.issuedAt
    ? new Date(certification.issuedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-cream p-6 print:bg-white print:p-0">
      <div className="print:hidden">
        <PrintCertificateButton />
      </div>

      <div className="w-full max-w-3xl rounded-2xl border-8 border-gold/30 bg-white p-10 text-center shadow-lg sm:p-16 print:border-4 print:shadow-none">
        <LogoIcon className="mx-auto size-16" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-gold">
          Certificate of Completion
        </p>
        <p className="mt-8 text-sm text-muted-foreground">This certifies that</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-indigo sm:text-4xl">
          {enrollment.student.name}
        </h1>
        <p className="mt-6 text-sm text-muted-foreground">has successfully completed the course</p>
        <h2 className="mt-2 text-xl font-semibold text-indigo sm:text-2xl">{enrollment.course.name}</h2>
        <p className="mt-8 text-sm text-muted-foreground">Issued on {issuedDate}</p>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm font-semibold text-indigo">
          <span className="text-gold">Learn Being</span> Forward
        </div>
      </div>
    </div>
  );
}
