"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/lbf/icons";
import { ResendBooksButton, ResetBuyerPasswordButton } from "@/components/lms/BuyerActionButtons";

type OrderRow = {
  orderId: string;
  userId: string;
  name: string;
  email: string;
  courseName: string;
  amount: number;
  code: string;
  since: string;
};

export function BuyersTable({ orders, courseNames }: { orders: OrderRow[]; courseNames: string[] }) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (course && o.courseName !== course) return false;
      if (!q) return true;
      return o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    });
  }, [orders, query, course]);

  return (
    <>
      <div className="toolbar">
        <div className="filters">
          <label className="search">
            <Icon name="search" size={16} />
            <input className="input" type="search" placeholder="Search name or email" aria-label="Search name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <select className="select" value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="">All books</option>
            {courseNames.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table m-cards" style={{ minWidth: 820 }}>
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Bought</th>
              <th>Paid</th>
              <th>Order</th>
              <th>Since</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const initials = o.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <tr key={o.orderId}>
                  <td data-label="Buyer">
                    <div className="stat-inline">
                      <span className="avatar sm">{initials}</span>
                      <div>
                        <div className="strong">{o.name}</div>
                        <div className="small muted">{o.email}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Bought">{o.courseName}</td>
                  <td data-label="Paid">₹{o.amount}</td>
                  <td data-label="Order">
                    <code>{o.code}</code>
                  </td>
                  <td data-label="Since">{new Date(o.since).toLocaleDateString()}</td>
                  <td data-label="" style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <ResendBooksButton orderId={o.orderId} />
                    <ResetBuyerPasswordButton userId={o.userId} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && orders.length > 0 && (
              <tr>
                <td colSpan={6}>
                  <p className="empty">No buyers match that search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
