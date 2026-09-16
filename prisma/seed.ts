import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { courses } from "../src/data/courses";
import { teamMembers } from "../src/data/team";

const prisma = new PrismaClient();

const ATTENDANCE_THRESHOLD = 75;
const SEED_DEMO_DATA = process.env.SEED_DEMO_DATA === "true";

function categoryFor(slug: string) {
  if (slug === "placement-training-program") return "Placement Training";
  if (slug === "data-science-ai-fundamentals") return "Data & AI";
  if (slug === "robotics") return "Robotics";
  return "Development";
}

function generatePassword() {
  return randomBytes(9).toString("base64").replace(/[+/=]/g, "");
}

async function main() {
  console.log("Seeding courses...");
  for (const course of courses) {
    const created = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        name: course.name,
        description: course.description,
        category: categoryFor(course.slug),
      },
      create: {
        slug: course.slug,
        name: course.name,
        description: course.description,
        category: categoryFor(course.slug),
      },
    });

    await prisma.courseModule.deleteMany({ where: { courseId: created.id } });
    const genericTrackTitles = new Set(["Course Modules", "Course Modules (placeholder)"]);
    for (const track of course.tracks) {
      for (const mod of track.modules) {
        const title = genericTrackTitles.has(track.title)
          ? mod.title
          : `${track.title} — ${mod.title}`;
        await prisma.courseModule.create({
          data: {
            courseId: created.id,
            title,
            level: mod.level ?? null,
            topics: JSON.stringify(mod.topics),
          },
        });
      }
    }
  }

  console.log("Seeding team members...");
  await prisma.teamMember.deleteMany();
  for (const member of teamMembers) {
    await prisma.teamMember.create({
      data: {
        name: member.name,
        role: member.role,
        experienceYears: member.experienceYears,
        background: member.background,
        specialties: JSON.stringify(member.specialties),
        isFreelancer: member.isFreelancer,
        colleges: member.colleges ? JSON.stringify(member.colleges) : null,
        cvUrl: member.cvUrl,
        avatarSeed: member.avatarSeed,
      },
    });
  }

  console.log("Seeding company (super admin) account...");
  const existingCompanyAdmin = await prisma.user.findUnique({
    where: { email: "company@learnbeingforward.in" },
  });

  let generatedCompanyPassword: string | null = null;
  if (!existingCompanyAdmin) {
    generatedCompanyPassword = generatePassword();
    await prisma.user.create({
      data: {
        name: "Learn Being Forward Admin",
        email: "company@learnbeingforward.in",
        passwordHash: await bcrypt.hash(generatedCompanyPassword, 10),
        role: "SUPER_ADMIN",
      },
    });
  }

  if (SEED_DEMO_DATA) {
    console.log("Seeding demo college & users (SEED_DEMO_DATA=true)...");
    const college = await prisma.college.upsert({
      where: { name: "Demo Institute of Technology" },
      update: {},
      create: { name: "Demo Institute of Technology", contactEmail: "admin@demoinstitute.edu" },
    });

    const demoPasswordHash = await bcrypt.hash("password123", 10);

    await prisma.user.upsert({
      where: { email: "college@demo.com" },
      update: {},
      create: {
        name: "Demo College Admin",
        email: "college@demo.com",
        passwordHash: demoPasswordHash,
        role: "COLLEGE_ADMIN",
        collegeId: college.id,
      },
    });

    const demoStudents = [
      { name: "Aditi Sharma", email: "student1@demo.com", attendance: 0.92 },
      { name: "Rohan Verma", email: "student2@demo.com", attendance: 0.62 },
      { name: "Kavya Reddy", email: "student3@demo.com", attendance: 0.8 },
      { name: "Sameer Khan", email: "student4@demo.com", attendance: 0.45 },
    ];

    const fullStack = await prisma.course.findUniqueOrThrow({ where: { slug: "full-stack-development" } });
    const placement = await prisma.course.findUniqueOrThrow({ where: { slug: "placement-training-program" } });

    const totalClasses = 40;

    for (const [i, s] of demoStudents.entries()) {
      const student = await prisma.user.upsert({
        where: { email: s.email },
        update: {},
        create: {
          name: s.name,
          email: s.email,
          passwordHash: demoPasswordHash,
          role: "STUDENT",
          collegeId: college.id,
        },
      });

      const course = i % 2 === 0 ? fullStack : placement;

      const existingEnrollment = await prisma.enrollment.findFirst({
        where: { studentId: student.id, courseId: course.id },
      });

      const enrollment =
        existingEnrollment ??
        (await prisma.enrollment.create({
          data: {
            studentId: student.id,
            courseId: course.id,
            collegeId: college.id,
            totalClasses,
          },
        }));

      await prisma.attendanceRecord.deleteMany({ where: { enrollmentId: enrollment.id } });

      const presentCount = Math.round(totalClasses * s.attendance);
      const records = Array.from({ length: totalClasses }, (_, idx) => ({
        enrollmentId: enrollment.id,
        classDate: new Date(Date.now() - (totalClasses - idx) * 24 * 60 * 60 * 1000),
        present: idx < presentCount,
      }));
      await prisma.attendanceRecord.createMany({ data: records });

      const attendancePct = (presentCount / totalClasses) * 100;
      await prisma.certification.upsert({
        where: { enrollmentId: enrollment.id },
        update: { status: attendancePct >= ATTENDANCE_THRESHOLD ? "ELIGIBLE" : "NOT_ELIGIBLE" },
        create: {
          enrollmentId: enrollment.id,
          status: attendancePct >= ATTENDANCE_THRESHOLD ? "ELIGIBLE" : "NOT_ELIGIBLE",
        },
      });
    }

    console.log("Seeding a demo enrollment request...");
    const kavya = await prisma.user.findUnique({ where: { email: "student3@demo.com" } });
    const frontend = await prisma.course.findUnique({ where: { slug: "frontend-development" } });
    if (kavya && frontend) {
      const existingRequest = await prisma.enrollmentRequest.findFirst({
        where: { studentId: kavya.id, courseId: frontend.id, status: "PENDING" },
      });
      if (!existingRequest) {
        await prisma.enrollmentRequest.create({
          data: {
            studentId: kavya.id,
            courseId: frontend.id,
            collegeId: college.id,
            status: "PENDING",
          },
        });
      }
    }

    console.log("Demo logins (password: password123):");
    console.log("  College admin: college@demo.com");
    console.log("  Students: student1@demo.com .. student4@demo.com");
  }

  console.log("Seed complete.");
  if (generatedCompanyPassword) {
    console.log("");
    console.log("=================================================================");
    console.log("Company account created — save this password now, it will not be shown again:");
    console.log(`  Email:    company@learnbeingforward.in`);
    console.log(`  Password: ${generatedCompanyPassword}`);
    console.log("=================================================================");
  } else if (existingCompanyAdmin) {
    console.log("Company account already exists (company@learnbeingforward.in) — password unchanged.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
