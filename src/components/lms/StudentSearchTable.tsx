"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export type SearchableStudent = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  collegeName?: string;
  branch: string | null;
  semester: number | null;
  courseName: string;
  pct: number;
  eligible: boolean;
  certificationStatus?: string;
  cvUrl: string | null;
};

type SortKey = "name" | "attendance" | "semester";

const SORTERS: Record<SortKey, (a: SearchableStudent, b: SearchableStudent) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  attendance: (a, b) => b.pct - a.pct,
  semester: (a, b) => (b.semester ?? -1) - (a.semester ?? -1),
};

export function StudentSearchTable({
  rows,
  showCollege = false,
}: {
  rows: SearchableStudent[];
  showCollege?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const pathname = usePathname();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? rows.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)) : rows;
    return [...base].sort(SORTERS[sortKey]);
  }, [rows, query, sortKey]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Sort by
          <select
            className="rounded-md border border-border bg-white px-2 py-1.5 text-sm text-foreground"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="name">Name (A–Z)</option>
            <option value="attendance">Attendance (high–low)</option>
            <option value="semester">Semester (high–low)</option>
          </select>
        </label>
      </div>
      <div className="rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              {showCollege && <TableHead>College</TableHead>}
              <TableHead>Branch</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>CV</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-indigo">
                  <Link href={`${pathname}?studentId=${r.studentId}`} className="underline underline-offset-2 hover:text-indigo/70">
                    {r.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{r.email}</TableCell>
                {showCollege && <TableCell className="text-muted-foreground">{r.collegeName}</TableCell>}
                <TableCell className="text-muted-foreground">{r.branch ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.semester ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.courseName}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      r.certificationStatus === "ISSUED"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : r.eligible
                          ? "bg-gold/20 text-indigo hover:bg-gold/20"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                    }
                  >
                    {r.pct}%{r.certificationStatus === "ISSUED" ? " · Issued" : r.eligible ? " · Eligible" : ""}
                  </Badge>
                </TableCell>
                <TableCell>
                  {r.cvUrl ? (
                    <a href={r.cvUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo underline">
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={showCollege ? 8 : 7} className="text-center text-sm text-muted-foreground">
                  No students match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
