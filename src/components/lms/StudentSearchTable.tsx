"use client";

import { useMemo, useState } from "react";
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
  name: string;
  email: string;
  collegeName?: string;
  branch: string | null;
  semester: number | null;
  courseName: string;
  pct: number;
  eligible: boolean;
  cvUrl: string | null;
};

export function StudentSearchTable({
  rows,
  showCollege = false,
}: {
  rows: SearchableStudent[];
  showCollege?: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="pl-9"
        />
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
                <TableCell className="font-medium text-indigo">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.email}</TableCell>
                {showCollege && <TableCell className="text-muted-foreground">{r.collegeName}</TableCell>}
                <TableCell className="text-muted-foreground">{r.branch ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.semester ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.courseName}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      r.eligible
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                    }
                  >
                    {r.pct}%
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
