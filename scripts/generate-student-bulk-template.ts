import ExcelJS from "exceljs";
import path from "node:path";
import { BRANCH_OPTIONS } from "../src/lib/constants";

async function main() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");

  sheet.columns = [
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 30 },
    { header: "Mobile Number", key: "phone", width: 16 },
    { header: "USN", key: "usn", width: 16 },
    { header: "Father's Name", key: "fatherName", width: 24 },
    { header: "Branch", key: "branch", width: 30 },
    { header: "Semester", key: "semester", width: 12 },
    { header: "Password", key: "password", width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };

  sheet.addRow({
    name: "Aditi Sharma",
    email: "aditi.sharma@example.com",
    phone: "9876543210",
    usn: "1AB21CS001",
    fatherName: "Ramesh Sharma",
    branch: BRANCH_OPTIONS[0],
    semester: 5,
    password: "",
  });
  sheet.addRow({
    name: "Rohan Verma",
    email: "rohan.verma@example.com",
    phone: "9876543211",
    usn: "1AB21CS002",
    fatherName: "Suresh Verma",
    branch: BRANCH_OPTIONS[1],
    semester: 5,
    password: "Welcome@123",
  });

  const notes = workbook.addWorksheet("Read Me");
  notes.columns = [{ width: 90 }];
  notes.addRows([
    ["How to use this template"],
    [""],
    ["1. Keep the header row exactly as-is — column order doesn't matter, but the names must match."],
    ["2. Name and Email are required for every student. All other columns are optional."],
    ["3. Leave Password blank to auto-generate a login automatically (or, for college-uploaded"],
    ["   rosters, to have the student self-claim their account via sign-up)."],
    ["4. If you fill in Password, that exact password is used for the account (must be 8+ characters)."],
    ["5. Duplicate emails (within this file or already in the system) are skipped, not overwritten."],
    ["6. Delete the two example rows on the 'Students' sheet before uploading your real list."],
  ]);
  notes.getCell("A1").font = { bold: true, size: 13 };

  const outPath = path.join(process.cwd(), "public", "templates", "student-bulk-upload-template.xlsx");
  await workbook.xlsx.writeFile(outPath);
  console.log("Wrote", outPath);
}

main();
