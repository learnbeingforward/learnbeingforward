"use client";

import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { EMPLOYEE_PAGE_CATALOG, type EmployeePageKey } from "@/lib/employee-access";
import { updateEmployeeAccess, deleteEmployeeAccount } from "@/lib/actions/employee-access";

const LABEL_BY_KEY = new Map(
  EMPLOYEE_PAGE_CATALOG.flatMap((g) => g.pages).flatMap((p) =>
    p.permissions.map((perm) => [perm.key, p.permissions.length > 1 ? `${p.navLabel}: ${perm.label}` : p.navLabel] as const)
  )
);

export function EmployeeAccessList({
  employees,
}: {
  employees: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    pageKeys: EmployeePageKey[];
    kind: "ADMIN" | "EMPLOYEE";
  }[];
}) {
  if (employees.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
        No employee accounts created yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {employees.map((emp) => (
        <details key={emp.id} className="group rounded-xl border border-border bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2">
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              <div>
                <p className="font-medium text-indigo">
                  {emp.name}{" "}
                  <Badge
                    className={
                      emp.kind === "ADMIN"
                        ? "bg-gold/20 text-indigo hover:bg-gold/20"
                        : "bg-cream text-indigo hover:bg-cream"
                    }
                  >
                    {emp.kind === "ADMIN" ? "Admin" : "Employee"}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">
                  {emp.email}
                  {emp.phone ? ` · ${emp.phone}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {emp.pageKeys.slice(0, 3).map((key) => (
                <Badge key={key} className="bg-indigo/10 text-indigo hover:bg-indigo/10">
                  {LABEL_BY_KEY.get(key) ?? key}
                </Badge>
              ))}
              {emp.pageKeys.length > 3 && (
                <Badge className="bg-indigo/10 text-indigo hover:bg-indigo/10">+{emp.pageKeys.length - 3} more</Badge>
              )}
              <DeleteButton action={deleteEmployeeAccount.bind(null, emp.id)} />
            </div>
          </summary>

          <form action={updateEmployeeAccess.bind(null, emp.id)} className="space-y-4 border-t border-border p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {EMPLOYEE_PAGE_CATALOG.map((group) => (
                <div key={group.group} className="rounded-lg border border-border p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.group}
                  </p>
                  <div className="space-y-3">
                    {group.pages.map((page) => (
                      <div key={page.href}>
                        <p className="text-xs font-semibold text-indigo">{page.cluster ?? page.navLabel}</p>
                        <div className="mt-1 space-y-1.5 pl-2">
                          {page.permissions.map((perm) => (
                            <label key={perm.key} className="flex items-center gap-2 text-sm text-indigo">
                              <input
                                type="checkbox"
                                name="pageKeys"
                                value={perm.key}
                                defaultChecked={emp.pageKeys.includes(perm.key)}
                                className="accent-indigo"
                              />
                              {page.permissions.length > 1 ? perm.label : page.navLabel}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
              Save Access
            </Button>
          </form>
        </details>
      ))}
    </div>
  );
}
