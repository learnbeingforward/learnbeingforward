"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RevealPasswordCell } from "@/components/lms/RevealPasswordCell";

export type StudentRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  collegeName: string;
  courses: { name: string; pct: number }[];
};

export type CollegeRow = {
  id: string;
  collegeName: string;
  contactEmail: string | null;
  adminName: string;
  adminEmail: string;
  adminPhone: string | null;
};

export type TrainerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  hourlyRate: number;
  totalSessions: number;
  daysWorked: number;
  invoiceCount: number;
  pendingInvoiceCount: number;
  pendingAmount: number;
  approvedAmount: number;
};

export type AdminRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
};

type Tab = "students" | "colleges" | "trainers" | "admins";

const TAB_LABELS: Record<Tab, string> = {
  students: "Students",
  colleges: "Colleges",
  trainers: "Trainers",
  admins: "Admins / Employees",
};

export function AccountDetailsTabs({
  students,
  colleges,
  trainers,
  admins,
}: {
  students: StudentRow[];
  colleges: CollegeRow[];
  trainers: TrainerRow[];
  admins: AdminRow[];
}) {
  const [tab, setTab] = useState<Tab>("students");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filteredStudents = useMemo(
    () =>
      !q
        ? students
        : students.filter(
            (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.collegeName.toLowerCase().includes(q)
          ),
    [students, q]
  );
  const filteredColleges = useMemo(
    () => (!q ? colleges : colleges.filter((c) => c.collegeName.toLowerCase().includes(q) || c.adminName.toLowerCase().includes(q))),
    [colleges, q]
  );
  const filteredTrainers = useMemo(
    () => (!q ? trainers : trainers.filter((t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q))),
    [trainers, q]
  );
  const filteredAdmins = useMemo(
    () => (!q ? admins : admins.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))),
    [admins, q]
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-lg border border-border bg-white p-1">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t ? "bg-indigo text-white" : "text-muted-foreground hover:text-indigo"
              }`}
            >
              {TAB_LABELS[t]}
              <span className="ml-1.5 text-xs opacity-70">
                (
                {t === "students"
                  ? students.length
                  : t === "colleges"
                    ? colleges.length
                    : t === "trainers"
                      ? trainers.length
                      : admins.length}
                )
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        {tab === "students" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Courses &amp; Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-indigo">
                    <Link href={`/lms/company/account-details?type=student&id=${s.id}`} className="underline underline-offset-2 hover:text-indigo/70">
                      {s.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell>
                    <RevealPasswordCell email={s.email} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.phone ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.collegeName}</TableCell>
                  <TableCell>
                    {s.courses.length === 0 ? (
                      <span className="text-xs text-muted-foreground">Not enrolled</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {s.courses.map((c, i) => (
                          <Badge key={i} className="bg-cream text-indigo hover:bg-cream">
                            {c.name} — {c.pct}%
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {tab === "colleges" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>College</TableHead>
                <TableHead>Concerned Person</TableHead>
                <TableHead>Login Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>College Contact Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredColleges.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-indigo">
                    <Link href={`/lms/company/account-details?type=college&id=${c.id}`} className="underline underline-offset-2 hover:text-indigo/70">
                      {c.collegeName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.adminName}</TableCell>
                  <TableCell className="text-muted-foreground">{c.adminEmail}</TableCell>
                  <TableCell>
                    <RevealPasswordCell email={c.adminEmail} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.adminPhone ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.contactEmail ?? "—"}</TableCell>
                </TableRow>
              ))}
              {filteredColleges.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No colleges found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {tab === "trainers" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Sessions Done</TableHead>
                <TableHead>Invoices</TableHead>
                <TableHead>Due Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrainers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-indigo">
                    <Link href={`/lms/company/account-details?type=trainer&id=${t.id}`} className="underline underline-offset-2 hover:text-indigo/70">
                      {t.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.email}</TableCell>
                  <TableCell>
                    <RevealPasswordCell email={t.email} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.phone ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">₹{t.hourlyRate}/hr</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.totalSessions} sessions &middot; {t.daysWorked} day{t.daysWorked !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.invoiceCount} total
                    {t.pendingInvoiceCount > 0 && (
                      <Badge className="ml-1.5 bg-amber-100 text-amber-700 hover:bg-amber-100">
                        {t.pendingInvoiceCount} pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.pendingAmount > 0 ? (
                      <span className="font-medium text-amber-700">₹{t.pendingAmount} due</span>
                    ) : (
                      <span>₹{t.approvedAmount} paid</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTrainers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                    No trainers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {tab === "admins" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-indigo">
                    <Link href={`/lms/company/account-details?type=admin&id=${a.id}`} className="underline underline-offset-2 hover:text-indigo/70">
                      {a.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.email}</TableCell>
                  <TableCell>
                    <RevealPasswordCell email={a.email} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.phone ?? "—"}</TableCell>
                  <TableCell>
                    <Badge className="bg-indigo/10 text-indigo hover:bg-indigo/10">
                      {a.role === "SUPER_ADMIN" ? "Main Admin" : "Second Admin"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAdmins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No admin accounts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
