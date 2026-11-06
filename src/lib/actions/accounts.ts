"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { getEmployeeKeys } from "@/lib/employee-access";

async function isAuthorizedEmployee(userId: string) {
  return (await getEmployeeKeys(userId)).includes("accounts.add");
}

export type CreateAccountState = {
  ok: boolean;
  error?: string;
  email?: string;
  password?: string;
  roster?: boolean;
} | null;

function generatePassword() {
  return randomBytes(9).toString("base64").replace(/[+/=]/g, "");
}

export async function createStudentAccount(
  _prevState: CreateAccountState,
  formData: FormData
): Promise<CreateAccountState> {
  const session = await auth();
  const authorized =
    !!session?.user &&
    (session.user.role === "COLLEGE_ADMIN" ||
      isCompanyStaff(session.user.role) ||
      (session.user.role === "EMPLOYEE" && (await isAuthorizedEmployee(session.user.id))));
  if (!authorized) {
    return { ok: false, error: "Not authorized." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const usn = String(formData.get("usn") ?? "").trim();
  const fatherName = String(formData.get("fatherName") ?? "").trim();
  const branch = String(formData.get("branch") ?? "").trim();
  const semesterInput = String(formData.get("semester") ?? "").trim();
  const semester = semesterInput ? Number.parseInt(semesterInput, 10) : null;
  const collegeIdInput = String(formData.get("collegeId") ?? "").trim();

  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const isCollegeAdmin = session.user.role === "COLLEGE_ADMIN";
  const collegeId = isCollegeAdmin ? session.user.collegeId : collegeIdInput || null;

  if (isCollegeAdmin) {
    // College admins add a roster entry only — no login credential yet. The
    // student claims it themselves via sign-up (name + email + college must
    // match), which is what closes the "anyone can claim any college" hole.
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(randomBytes(24).toString("hex"), 10),
        role: "STUDENT",
        usn: usn || null,
        fatherName: fatherName || null,
        branch: branch || null,
        semester,
        collegeId,
        studentStatus: "PRE_REGISTERED",
      },
    });

    revalidatePath("/lms/college/students");
    return { ok: true, email, roster: true };
  }

  const password = generatePassword();
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "STUDENT",
      usn: usn || null,
      fatherName: fatherName || null,
      branch: branch || null,
      semester,
      collegeId,
      studentStatus: "ACTIVE",
    },
  });

  revalidatePath("/lms/company/accounts");

  return { ok: true, email, password };
}

export type BulkCreateStudentsState = {
  ok: boolean;
  error?: string;
  created?: Array<{ row: number; name: string; email: string; password: string | null; status: "roster" | "active" }>;
  skipped?: Array<{ row: number; email: string; reason: string }>;
} | null;

const HEADER_ALIASES: Record<string, string> = {
  name: "name",
  fullname: "name",
  studentname: "name",
  email: "email",
  emailaddress: "email",
  mobilenumber: "phone",
  mobile: "phone",
  phone: "phone",
  phonenumber: "phone",
  contactnumber: "phone",
  usn: "usn",
  usnrollnumber: "usn",
  rollnumber: "usn",
  rollno: "usn",
  fathersname: "fatherName",
  fathername: "fatherName",
  branch: "branch",
  semester: "semester",
  sem: "semester",
  password: "password",
};

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function bulkCreateStudents(
  _prevState: BulkCreateStudentsState,
  formData: FormData
): Promise<BulkCreateStudentsState> {
  const session = await auth();
  const authorized =
    !!session?.user &&
    (session.user.role === "COLLEGE_ADMIN" ||
      isCompanyStaff(session.user.role) ||
      (session.user.role === "EMPLOYEE" && (await isAuthorizedEmployee(session.user.id))));
  if (!authorized) {
    return { ok: false, error: "Not authorized." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose an Excel file to upload." };
  }

  const workbook = new ExcelJS.Workbook();
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    // exceljs's bundled .d.ts declares its own outdated ambient `Buffer` type that
    // conflicts with modern @types/node's generic Buffer — real Buffer at runtime.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workbook.xlsx.load(buffer as any);
  } catch {
    return { ok: false, error: "Couldn't read that file — please upload a valid .xlsx file." };
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { ok: false, error: "The uploaded file has no sheets." };
  }

  const colMap: Record<string, number> = {};
  sheet.getRow(1).eachCell((cell, colNumber) => {
    const canonical = HEADER_ALIASES[normalizeHeader(String(cell.value ?? ""))];
    if (canonical) colMap[canonical] = colNumber;
  });

  if (!colMap.name || !colMap.email) {
    return {
      ok: false,
      error: "The file must have Name and Email columns — download the sample template for the expected format.",
    };
  }

  type ParsedRow = {
    row: number;
    name: string;
    email: string;
    phone: string;
    usn: string;
    fatherName: string;
    branch: string;
    semester: number | null;
    password: string;
  };

  const parsedRows: ParsedRow[] = [];
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const cellText = (col?: number) => (col ? String(row.getCell(col).value ?? "").trim() : "");
    const name = cellText(colMap.name);
    const email = cellText(colMap.email).toLowerCase();
    if (!name && !email) continue;

    const semesterRaw = cellText(colMap.semester);
    const semesterNum = semesterRaw ? Number.parseInt(semesterRaw, 10) : NaN;

    parsedRows.push({
      row: r,
      name,
      email,
      phone: cellText(colMap.phone),
      usn: cellText(colMap.usn),
      fatherName: cellText(colMap.fatherName),
      branch: cellText(colMap.branch),
      semester: Number.isFinite(semesterNum) ? semesterNum : null,
      password: cellText(colMap.password),
    });
  }

  if (parsedRows.length === 0) {
    return { ok: false, error: "No student rows found in the uploaded file." };
  }

  const created: NonNullable<BulkCreateStudentsState>["created"] = [];
  const skipped: NonNullable<BulkCreateStudentsState>["skipped"] = [];

  const seenInFile = new Set<string>();
  const validRows: ParsedRow[] = [];
  for (const r of parsedRows) {
    if (!r.name || !r.email) {
      skipped.push({ row: r.row, email: r.email || "(missing)", reason: "Missing name or email." });
      continue;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) {
      skipped.push({ row: r.row, email: r.email, reason: "Invalid email format." });
      continue;
    }
    if (r.password && r.password.length < 8) {
      skipped.push({ row: r.row, email: r.email, reason: "Password must be at least 8 characters." });
      continue;
    }
    if (seenInFile.has(r.email)) {
      skipped.push({ row: r.row, email: r.email, reason: "Duplicate email within this file." });
      continue;
    }
    seenInFile.add(r.email);
    validRows.push(r);
  }

  const existing = await prisma.user.findMany({
    where: { email: { in: validRows.map((r) => r.email) } },
    select: { email: true },
  });
  const existingEmails = new Set(existing.map((u) => u.email));

  const isCollegeAdmin = session.user.role === "COLLEGE_ADMIN";
  const collegeIdInput = String(formData.get("collegeId") ?? "").trim();
  const collegeId = isCollegeAdmin ? session.user.collegeId : collegeIdInput || null;

  for (const r of validRows) {
    if (existingEmails.has(r.email)) {
      skipped.push({ row: r.row, email: r.email, reason: "An account with this email already exists." });
      continue;
    }

    const baseData = {
      name: r.name,
      email: r.email,
      role: "STUDENT" as const,
      usn: r.usn || null,
      fatherName: r.fatherName || null,
      branch: r.branch || null,
      semester: r.semester,
      phone: r.phone || null,
      collegeId,
    };

    try {
      if (r.password) {
        await prisma.user.create({
          data: { ...baseData, passwordHash: await bcrypt.hash(r.password, 10), studentStatus: "ACTIVE" },
        });
        created.push({ row: r.row, name: r.name, email: r.email, password: r.password, status: "active" });
      } else if (isCollegeAdmin) {
        await prisma.user.create({
          data: {
            ...baseData,
            passwordHash: await bcrypt.hash(randomBytes(24).toString("hex"), 10),
            studentStatus: "PRE_REGISTERED",
          },
        });
        created.push({ row: r.row, name: r.name, email: r.email, password: null, status: "roster" });
      } else {
        const generated = generatePassword();
        await prisma.user.create({
          data: { ...baseData, passwordHash: await bcrypt.hash(generated, 10), studentStatus: "ACTIVE" },
        });
        created.push({ row: r.row, name: r.name, email: r.email, password: generated, status: "active" });
      }
    } catch {
      skipped.push({ row: r.row, email: r.email, reason: "Failed to create this account — please retry this row." });
    }
  }

  revalidatePath("/lms/college/students");
  revalidatePath("/lms/company/accounts");
  revalidatePath("/lms/company/students");

  return { ok: true, created, skipped };
}

export async function createCollegeAccount(
  _prevState: CreateAccountState,
  formData: FormData
): Promise<CreateAccountState> {
  const session = await auth();
  const authorized =
    !!session?.user &&
    (isCompanyStaff(session.user.role) ||
      (session.user.role === "EMPLOYEE" && (await isAuthorizedEmployee(session.user.id))));
  if (!authorized) {
    return { ok: false, error: "Not authorized." };
  }

  const adminName = String(formData.get("adminName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const collegeName = String(formData.get("collegeName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();

  if (!adminName || !email || !collegeName) {
    return { ok: false, error: "Admin name, email, and college name are required." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const college = await prisma.college.upsert({
    where: { name: collegeName },
    update: {},
    create: { name: collegeName, contactEmail: contactEmail || null },
  });

  const password = generatePassword();
  await prisma.user.create({
    data: {
      name: adminName,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "COLLEGE_ADMIN",
      collegeId: college.id,
    },
  });

  revalidatePath("/lms/company/accounts");

  return { ok: true, email, password };
}

export async function createAdmin2Account(
  _prevState: CreateAccountState,
  formData: FormData
): Promise<CreateAccountState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Only the main company admin can create a second admin account." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();

  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const password = generatePassword();
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN2",
      phone: phone || null,
      gender: gender || null,
    },
  });

  revalidatePath("/lms/company/accounts");

  return { ok: true, email, password };
}
