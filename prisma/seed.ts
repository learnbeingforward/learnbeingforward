import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { courses } from "../src/data/courses";
import { teamMembers } from "../src/data/team";

const prisma = new PrismaClient();

const ATTENDANCE_THRESHOLD = 75;

function categoryFor(slug: string) {
  if (slug === "placement-training-program") return "Placement Training";
  if (slug === "data-science-ai-fundamentals") return "Data & AI";
  if (slug === "robotics") return "Robotics";
  return "Development";
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

  console.log("Seeding demo college & users...");
  const college = await prisma.college.upsert({
    where: { name: "Demo Institute of Technology" },
    update: {},
    create: { name: "Demo Institute of Technology", contactEmail: "admin@demoinstitute.edu" },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  const collegeAdmin = await prisma.user.upsert({
    where: { email: "college@demo.com" },
    update: {},
    create: {
      name: "Demo College Admin",
      email: "college@demo.com",
      passwordHash,
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
        passwordHash,
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

  console.log("Seed complete.");
  console.log("Demo logins (password: password123):");
  console.log("  College admin: college@demo.com");
  console.log("  Students: student1@demo.com .. student4@demo.com");
  console.log(`College admin id: ${collegeAdmin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
