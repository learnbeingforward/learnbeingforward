import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PrintCertificateButton } from "@/components/lms/PrintCertificateButton";
import "@/app/styles/lbf/cert.css";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ enrollmentId: string }>;
}) {
  const { enrollmentId } = await params;
  const session = await auth();

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true, student: true, college: true, certification: true },
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
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Eczar:wght@400;500&family=Dancing+Script:wght@600&display=swap" />
      {/* cert.css is ported verbatim from the design file and only covers the
          .ct certificate card itself — this page's own toolbar and padding
          around it aren't part of that file, so printing previously put the
          whole page (navy toolbar, cream background, padding) on the PDF
          instead of just the certificate. These rules are local to this page. */}
      <style>{`
        @media print {
          .cert-toolbar { display: none !important; }
          .cert-page-bg { background: none !important; min-height: 0 !important; }
          .cert-wrap { padding: 0 !important; max-width: none !important; margin: 0 !important; }
        }
      `}</style>
      <div className="cert-page-bg" style={{ background: "#E9E4D8", margin: 0, minHeight: "100vh" }}>
        <div
          className="cert-toolbar"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            background: "var(--navy)",
            color: "#fff",
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <b>{enrollment.course.name} certificate</b>
            <div className="small" style={{ color: "#D9DEE8" }}>
              Print → Save as PDF to download.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link className="btn btn-sm" href="/lms/student">
              Back
            </Link>
            <PrintCertificateButton />
          </div>
        </div>

        <div className="cert-wrap" style={{ padding: "24px 14px 60px", maxWidth: 1160, margin: "0 auto" }}>
          <div className="ct">
            <div className="ct-c tl" />
            <div className="ct-c tr" />
            <div className="ct-c bl" />
            <div className="ct-c br" />
            <div className="ct-main">
              <div className="ct-college">
                <span>{enrollment.college?.name ?? "Learn Being Forward"}</span>
              </div>
              <div className="ct-date">{issuedDate}</div>
              <div className="ct-name">{enrollment.student.name}</div>
              <div className="ct-small">has successfully completed</div>
              <div className="ct-course">{enrollment.course.name}</div>
              <div className="ct-small">
                a placement training programme delivered by Learn Being Forward
                {enrollment.college?.name && ` at ${enrollment.college.name}`}
              </div>
              <div className="ct-sign">
                <div className="ct-pad">
                  <span className="ct-typed">Lohit Kumar</span>
                </div>
                <div className="ct-who">
                  Lohit Kumar A B
                  <br />
                  Founder &amp; CEO, Learn Being Forward
                </div>
              </div>
            </div>

            <div className="ct-ribbon">
              <div className="ct-head">
                Course
                <br />
                Certificate
              </div>
              <svg className="ct-seal" viewBox="0 0 220 220" role="img" aria-label="Learn Being Forward seal">
                <defs>
                  <path id="ct-seal-top" d="M 27,110 A 83,83 0 1 1 193,110" />
                  <path id="ct-seal-bottom" d="M 27,110 A 83,83 0 1 0 193,110" />
                </defs>
                <circle cx="110" cy="110" r="96" fill="none" stroke="#1C2B4A" strokeWidth="3" />
                <circle cx="110" cy="110" r="70" fill="none" stroke="#C9973C" strokeWidth="2" />
                <text fontFamily="Poppins, sans-serif" fontSize="12" fontWeight="700" letterSpacing="2.5" fill="#1C2B4A">
                  <textPath href="#ct-seal-top" startOffset="50%" textAnchor="middle">
                    LEARN BEING FORWARD
                  </textPath>
                </text>
                <text fontFamily="Poppins, sans-serif" fontSize="12" fontWeight="700" letterSpacing="2.5" fill="#1C2B4A">
                  <textPath href="#ct-seal-bottom" startOffset="50%" textAnchor="middle">
                    ALWAYS BE FORWARD
                  </textPath>
                </text>
                <text x="110" y="100" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="14" fontWeight="700" fill="#1C2B4A">
                  LEARN BEING
                </text>
                <text x="110" y="121" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="14" fontWeight="700" fill="#1C2B4A">
                  FORWARD
                </text>
                <text x="110" y="141" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="8" letterSpacing="2" fill="#C9973C">
                  EST. LEARNING
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
