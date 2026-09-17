import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { courses } from "../src/data/courses";
import { teamMembers } from "../src/data/team";
import { technologies } from "../src/data/technologies";
import { contactProfiles } from "../src/data/contacts";

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

const TECH_SLUG_TO_ICON: Record<string, string> = {
  c: "SiC",
  cpp: "SiCplusplus",
  java: "FaJava",
  python: "SiPython",
  csharp: "SiSharp",
  javascript: "SiJavascript",
  typescript: "SiTypescript",
  html5: "SiHtml5",
  css3: "SiCss",
  tailwind: "SiTailwindcss",
  react: "SiReact",
  angular: "SiAngular",
  vue: "SiVuedotjs",
  nodejs: "SiNodedotjs",
  django: "SiDjango",
  "spring-boot": "SiSpringboot",
  dotnet: "SiDotnet",
  mysql: "SiMysql",
  postgresql: "SiPostgresql",
  mongodb: "SiMongodb",
  git: "SiGit",
  github: "SiGithub",
  docker: "SiDocker",
  "quant-aptitude": "FaCalculator",
  "logical-reasoning": "FaBrain",
  "verbal-reasoning": "FaComments",
  "nonverbal-reasoning": "FaBrain",
  communication: "FaComments",
  "group-discussion": "FaUsers",
  "interview-prep": "FaUsers",
  "resume-building": "FaFileAlt",
  numpy: "SiNumpy",
  pandas: "SiPandas",
  "scikit-learn": "SiScikitlearn",
  "robotics-fundamentals": "FaRobot",
  arduino: "SiArduino",
  "raspberry-pi": "SiRaspberrypi",
};

const CATEGORY_TO_ENUM: Record<string, string> = {
  Languages: "LANGUAGES",
  Frontend: "FRONTEND",
  Backend: "BACKEND",
  Databases: "DATABASES",
  "Tools & DevOps": "TOOLS_DEVOPS",
  "Data & AI": "DATA_AI",
  Aptitude: "APTITUDE",
  "Soft Skills": "SOFT_SKILLS",
  Robotics: "ROBOTICS",
};

async function main() {
  console.log("Seeding technologies...");
  for (const [i, tech] of technologies.entries()) {
    const iconName = TECH_SLUG_TO_ICON[tech.slug];
    if (!iconName) continue;
    await prisma.technology.upsert({
      where: { slug: tech.slug },
      update: { name: tech.name, iconName, category: CATEGORY_TO_ENUM[tech.category] as never, order: i },
      create: {
        slug: tech.slug,
        name: tech.name,
        iconName,
        category: CATEGORY_TO_ENUM[tech.category] as never,
        order: i,
      },
    });
  }

  console.log("Seeding courses...");
  for (const [courseOrder, course] of courses.entries()) {
    const created = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        name: course.name,
        shortDescription: course.shortDescription,
        description: course.description,
        category: categoryFor(course.slug),
        techSlugs: JSON.stringify(course.techSlugs),
        isPlaceholder: course.isPlaceholder ?? false,
        order: courseOrder,
      },
      create: {
        slug: course.slug,
        name: course.name,
        shortDescription: course.shortDescription,
        description: course.description,
        category: categoryFor(course.slug),
        techSlugs: JSON.stringify(course.techSlugs),
        isPlaceholder: course.isPlaceholder ?? false,
        order: courseOrder,
      },
    });

    await prisma.courseModule.deleteMany({ where: { courseId: created.id } });
    let moduleOrder = 0;
    for (const track of course.tracks) {
      for (const mod of track.modules) {
        await prisma.courseModule.create({
          data: {
            courseId: created.id,
            trackTitle: track.title,
            title: mod.title,
            level: mod.level ?? null,
            topics: JSON.stringify(mod.topics),
            techSlugs: JSON.stringify(mod.techSlugs),
            delivery: mod.delivery,
            order: moduleOrder++,
          },
        });
      }
    }
  }

  console.log("Seeding team members (only if table is empty)...");
  if ((await prisma.teamMember.count()) === 0) {
    for (const [i, member] of teamMembers.entries()) {
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
          order: i,
        },
      });
    }
  }

  console.log("Seeding contact profiles (only if table is empty)...");
  if ((await prisma.contactProfile.count()) === 0) {
    for (const [i, profile] of contactProfiles.entries()) {
      await prisma.contactProfile.create({
        data: {
          name: profile.name,
          role: profile.role,
          email: profile.email,
          phone: profile.phone,
          avatarSeed: profile.avatarSeed,
          order: i,
        },
      });
    }
  }

  console.log("Seeding home page features...");
  const homeFeatures = [
    {
      icon: "Code2",
      title: "Programming & Full-Stack Training",
      description: "Hands-on training in languages and frameworks that make students job-ready developers.",
    },
    {
      icon: "Brain",
      title: "Aptitude & Soft-Skills Training",
      description: "Quantitative, logical and verbal reasoning alongside communication and interview readiness.",
    },
    {
      icon: "GraduationCap",
      title: "Placement Support & Campus Partnerships",
      description: "Direct campus partnerships that connect classroom training to real placement outcomes.",
    },
    {
      icon: "Building2",
      title: "Corporate Onboarding Training",
      description: "Structured onboarding programs that get corporate freshers productive, faster.",
    },
  ];
  const existingFeatureCount = await prisma.homeFeature.count();
  if (existingFeatureCount === 0) {
    for (const [i, f] of homeFeatures.entries()) {
      await prisma.homeFeature.create({ data: { ...f, order: i } });
    }
  }

  console.log("Seeding footer quick links...");
  const footerLinks = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "Technologies", href: "/technologies" },
    { label: "About", href: "/about" },
    { label: "Team", href: "/team" },
    { label: "Contact", href: "/contact" },
  ];
  const existingLinkCount = await prisma.footerLink.count();
  if (existingLinkCount === 0) {
    for (const [i, l] of footerLinks.entries()) {
      await prisma.footerLink.create({ data: { ...l, order: i } });
    }
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

  if (process.env.SEED_BULK_DEMO === "true") {
    await seedBulkDemoData();
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

const BULK_COLLEGES = [
  "Global Institute of Technology",
  "Sunrise Engineering College",
  "Horizon College of Engineering",
  "Pinnacle Institute of Technology",
  "Crestview College of Engineering",
];

const TRAINER_NAMES = [
  "Anil Deshmukh",
  "Priyanka Rao",
  "Suresh Iyer",
  "Meenakshi Nair",
  "Arvind Bhatt",
  "Lakshmi Menon",
  "Ravi Chandran",
  "Neha Kapoor",
];

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna",
  "Ishaan", "Rohan", "Ananya", "Diya", "Saanvi", "Aadhya", "Kavya", "Myra",
  "Anika", "Riya", "Ishita", "Pooja", "Karthik", "Nikhil", "Varun", "Siddharth",
  "Priya", "Sneha", "Divya", "Shreya", "Manoj", "Rahul", "Amit", "Vikram",
];

const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Reddy", "Nair", "Iyer", "Patel", "Singh",
  "Kumar", "Rao", "Mehta", "Joshi", "Pillai", "Menon", "Agarwal", "Chauhan",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedBulkDemoData() {
  console.log("Seeding bulk demo data (SEED_BULK_DEMO=true)...");

  const bulkPassword = generatePassword();
  const bulkPasswordHash = await bcrypt.hash(bulkPassword, 10);

  const allCourses = await prisma.course.findMany();

  const trainers = [];
  for (const name of TRAINER_NAMES) {
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@learnbeingforward.in`;
    const trainer = await prisma.trainer.upsert({
      where: { email },
      update: {},
      create: { name, email },
    });
    trainers.push(trainer);
  }

  let studentCount = 0;
  let enrollmentCount = 0;

  for (const collegeName of BULK_COLLEGES) {
    const college = await prisma.college.upsert({
      where: { name: collegeName },
      update: {},
      create: { name: collegeName, contactEmail: `admin@${collegeName.toLowerCase().replace(/\s+/g, "")}.edu` },
    });

    const collegeAdminEmail = `admin@${collegeName.toLowerCase().replace(/\s+/g, "")}.edu`;
    await prisma.user.upsert({
      where: { email: collegeAdminEmail },
      update: {},
      create: {
        name: `${collegeName} Admin`,
        email: collegeAdminEmail,
        passwordHash: bulkPasswordHash,
        role: "COLLEGE_ADMIN",
        collegeId: college.id,
      },
    });

    const studentTarget = randomInt(15, 20);
    for (let i = 0; i < studentTarget; i++) {
      studentCount += 1;
      const firstName = randomItem(FIRST_NAMES);
      const lastName = randomItem(LAST_NAMES);
      const name = `${firstName} ${lastName}`;
      const usn = `${collegeName.slice(0, 2).toUpperCase()}${new Date().getFullYear() % 100}CS${String(studentCount).padStart(3, "0")}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentCount}@bulkdemo.in`;

      const student = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          name,
          email,
          passwordHash: bulkPasswordHash,
          role: "STUDENT",
          usn,
          fatherName: `${randomItem(FIRST_NAMES)} ${lastName}`,
          collegeId: college.id,
        },
      });

      const course = randomItem(allCourses);
      const trainer = randomItem(trainers);
      const totalClasses = randomInt(30, 45);
      const attendanceRatio = randomItem([0.35, 0.42, 0.5, 0.58, 0.65, 0.72, 0.78, 0.85, 0.9, 0.95]);
      const classesHeld = randomInt(Math.floor(totalClasses * 0.6), totalClasses);
      const presentCount = Math.round(classesHeld * attendanceRatio);

      const existingEnrollment = await prisma.enrollment.findFirst({
        where: { studentId: student.id, courseId: course.id },
      });
      if (existingEnrollment) continue;

      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          collegeId: college.id,
          totalClasses,
          trainerId: trainer.id,
        },
      });
      enrollmentCount += 1;

      const records = Array.from({ length: classesHeld }, (_, idx) => ({
        enrollmentId: enrollment.id,
        classDate: new Date(Date.now() - (classesHeld - idx) * 24 * 60 * 60 * 1000),
        present: idx < presentCount,
      }));
      await prisma.attendanceRecord.createMany({ data: records });

      const attendancePct = (presentCount / classesHeld) * 100;
      const eligible = attendancePct >= ATTENDANCE_THRESHOLD;
      const issued = eligible && Math.random() < 0.4;

      await prisma.certification.create({
        data: {
          enrollmentId: enrollment.id,
          status: issued ? "ISSUED" : eligible ? "ELIGIBLE" : "NOT_ELIGIBLE",
          trainerApproved: issued,
          issuedAt: issued ? new Date() : null,
        },
      });

      if (Math.random() < 0.15) {
        const otherCourse = randomItem(allCourses.filter((c) => c.id !== course.id));
        const existingRequest = await prisma.enrollmentRequest.findFirst({
          where: { studentId: student.id, courseId: otherCourse.id },
        });
        if (!existingRequest) {
          await prisma.enrollmentRequest.create({
            data: {
              studentId: student.id,
              courseId: otherCourse.id,
              collegeId: college.id,
              status: "PENDING",
            },
          });
        }
      }
    }
  }

  console.log(`Bulk demo data: ${BULK_COLLEGES.length} colleges, ${studentCount} students, ${enrollmentCount} enrollments, ${trainers.length} trainers.`);
  console.log("=================================================================");
  console.log("Bulk demo accounts — shared password (college admins + students):");
  console.log(`  Password: ${bulkPassword}`);
  console.log("  College admin emails: admin@<collegenameNoSpaces>.edu (see console above)");
  console.log("  Student emails: firstname.lastnameN@bulkdemo.in");
  console.log("=================================================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
