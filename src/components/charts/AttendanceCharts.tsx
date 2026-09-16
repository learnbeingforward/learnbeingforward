"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const INDIGO = "#1c2b4a";
const GOLD = "#c9973c";
const MUTED = "#e4ddc9";

export function AttendanceBarChart({ data }: { data: { name: string; pct: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: INDIGO }} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: INDIGO }} />
        <Tooltip
          formatter={(value) => [`${value}%`, "Attendance"]}
          contentStyle={{ borderRadius: 8, borderColor: MUTED, fontSize: 13 }}
        />
        <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.pct >= 75 ? GOLD : INDIGO} fillOpacity={entry.pct >= 75 ? 1 : 0.6} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendancePieChart({ present, absent }: { present: number; absent: number }) {
  const data = [
    { name: "Attended", value: present },
    { name: "Missed", value: absent },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
          <Cell fill={GOLD} />
          <Cell fill={MUTED} />
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, borderColor: MUTED, fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
