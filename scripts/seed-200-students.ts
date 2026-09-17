import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ATTENDANCE_THRESHOLD = 75;
const STUDENTS_PER_COLLEGE = 40;

const TARGET_COLLEGES = [
  "Global Institute of Technology",
  "Sunrise Engineering College",
  "Horizon College of Engineering",
  "Pinnacle Institute of Technology",
  "Crestview College of Engineering",
];

const BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Electrical Engineering",
];

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna",
  "Ishaan", "Rohan", "Ananya", "Diya", "Saanvi", "Aadhya", "Kavya", "Myra",
  "Anika", "Riya", "Ishita", "Pooja", "Karthik", "Nikhil", "Varun", "Siddharth",
  "Priya", "Sneha", "Divya", "Shreya", "Manoj", "Rahul", "Amit", "Vikram",
  "Harsha", "Deepak", "Sanjay", "Kiran", "Meera", "Naveen", "Swati", "Yash",
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

function generatePassword() {
  return Math.random().toString(36).slice(-10) + "A1!";
}

async function main() {
  console.log("Seeding 200 additional students across the existing 5 colleges...");

  const colleges = await prisma.college.findMany({
    where: { name: { in: TARGET_COLLEGES } },
  });
  if (colleges.length !== TARGET_COLLEGES.length) {
    throw new Error(
      `Expected ${TARGET_COLLEGES.length} existing colleges, found ${colleges.length}. Aborting — this script never creates colleges.`
    );
  }

  const allCourses = await prisma.course.findMany();
  const trainers = await prisma.trainer.findMany();
  if (allCourses.length === 0) throw new Error("No courses found — run the main seed first.");

  const bulkPassword = generatePassword();
  const bulkPasswordHash = await bcrypt.hash(bulkPassword, 10);

  let studentCount = 0;
  let enrollmentCount = 0;

  for (const college of colleges) {
    for (let i = 0; i < STUDENTS_PER_COLLEGE; i++) {
      studentCount += 1;
      const firstName = randomItem(FIRST_NAMES);
      const lastName = randomItem(LAST_NAMES);
      const name = `${firstName} ${lastName}`;
      const branch = randomItem(BRANCHES);
      const semester = randomInt(1, 8);
      const usn = `${college.name.slice(0, 2).toUpperCase()}${new Date().getFullYear() % 100}EX${String(studentCount).padStart(3, "0")}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentCount}@extradata.in`;

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
          branch,
          semester,
          collegeId: college.id,
        },
      });

      const existingEnrollment = await prisma.enrollment.findFirst({
        where: { studentId: student.id },
      });
      if (existingEnrollment) continue;

      const course = randomItem(allCourses);
      const trainer = trainers.length > 0 ? randomItem(trainers) : null;
      const totalClasses = randomInt(30, 45);
      const attendanceRatio = randomItem([0.35, 0.42, 0.5, 0.58, 0.65, 0.72, 0.78, 0.85, 0.9, 0.95]);
      const classesHeld = randomInt(Math.floor(totalClasses * 0.6), totalClasses);
      const presentCount = Math.round(classesHeld * attendanceRatio);

      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          collegeId: college.id,
          totalClasses,
          trainerId: trainer?.id ?? null,
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
      const issued = eligible && Math.random() < 0.3;

      await prisma.certification.create({
        data: {
          enrollmentId: enrollment.id,
          status: issued ? "ISSUED" : eligible ? "ELIGIBLE" : "NOT_ELIGIBLE",
          trainerApproved: issued,
          issuedAt: issued ? new Date() : null,
        },
      });
    }
    console.log(`  ${college.name}: ${STUDENTS_PER_COLLEGE} students seeded.`);
  }

  console.log("=================================================================");
  console.log(`Done. ${studentCount} students, ${enrollmentCount} enrollments across ${colleges.length} colleges.`);
  console.log(`Shared password for these accounts: ${bulkPassword}`);
  console.log("Emails: firstname.lastnameN@extradata.in");
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
