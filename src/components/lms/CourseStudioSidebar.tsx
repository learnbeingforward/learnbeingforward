"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/lbf/icons";
import { createCourse } from "@/lib/actions/course-content";

type CourseRow = { id: string; name: string; moduleCount: number; itemCount: number; onBuy: boolean };

export function CourseStudioSidebar({ courses, selectedCourseId }: { courses: CourseRow[]; selectedCourseId?: string }) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const filtered = courses.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <aside className="card st-courses" aria-label="Courses">
      <div className="split" style={{ marginBottom: 12 }}>
        <h2 className="h3">
          Courses <span className="muted" style={{ fontWeight: 500 }}>({courses.length})</span>
        </h2>
        <button
          className="btn btn-gold btn-sm"
          type="button"
          disabled={isPending}
          onClick={() => {
            const name = window.prompt("New course name");
            if (name && name.trim()) {
              startTransition(async () => {
                const id = await createCourse(name.trim());
                router.push(`/lms/company/course-content?courseId=${id}`);
              });
            }
          }}
        >
          <Icon name="plus" size={16} />
          New
        </button>
      </div>
      <label className="input-group" style={{ marginBottom: 10 }}>
        <Icon name="search" size={16} />
        <input className="input" placeholder="Search courses" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search courses" />
      </label>
      <ul className="st-clist">
        {filtered.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className={c.id === selectedCourseId ? "on" : ""}
              onClick={() => router.push(`/lms/company/course-content?courseId=${c.id}`)}
            >
              <span className="dot live" />
              <span className="grow">
                <b>{c.name}</b>
                <small>
                  {c.moduleCount} module{c.moduleCount !== 1 ? "s" : ""} · {c.itemCount} item{c.itemCount !== 1 ? "s" : ""}
                  {c.onBuy && " · on Buy"}
                </small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
