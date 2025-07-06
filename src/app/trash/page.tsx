// src/app/trash/page.tsx
"use client";

import React, { useState, useMemo, ChangeEvent } from "react";
import useSWR from "swr";
import BulkActionBar from "@/components/BulkActionBar";
import JobForm from "@/components/JobForm/JobForm";
import styles from "../post-requests/page.module.css";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Raw {
  id: string;
  title: string;
  company: string;
  type: "job" | "internship" | "j" | "i";
  industry?: string;
  industries?: string | string[];
  benefits?: string;
  skills?: string;
  [k: string]: any;
}
interface Row extends Raw {
  industries: string[];
  benefits: string[];
  skills: string[];
}

const toArr = (v?: string[] | string) =>
  Array.isArray(v) ? v : v ? v.split(",").map((s) => s.trim()) : [];

const normalise = (r: Raw): Row => ({
  ...r,
  industries: toArr(r.industries ?? r.industry),
  benefits: toArr(r.benefits),
  skills: toArr(r.skills),
});

export default function TrashPage() {
  const { data: raw = [], mutate } = useSWR<Raw[]>("/api/trash", fetcher);
  const rows = useMemo(() => raw.map(normalise), [raw]);

  // search & pagination
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q)
    );
  }, [rows, query]);
  const visible = filtered.slice(0, limit);

  // edit
  const [editing, setEditing] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const saveRow = async (payload: any) => {
    setSaving(true);
    await fetch(`/api/trash/${payload.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await mutate();
    setSaving(false);
    setEditing(null);
  };

  // bulk selection
  const [sel, setSel] = useState<Set<string>>(new Set());
  const toggleOne = (id: string) =>
    setSel((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () => {
    const ids = visible.map((r) => r.id);
    const all = ids.every((id) => sel.has(id));
    setSel(new Set(all ? [] : ids));
  };

  // bulk handlers
  const [bulkProgress, setBulkProgress] = useState(0);
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [reviewResults, setReviewResults] = useState<Record<string, string> | null>(null);

  const handlePostSelected = async () => {
    setLoadingBulk(true);
    setBulkProgress(0);
    const ids = Array.from(sel);
    for (let i = 0; i < ids.length; i++) {
      await fetch(`/api/trash/${ids[i]}/post`, { method: "POST" });
      setBulkProgress(i + 1);
    }
    await mutate();
    setSel(new Set());
    setLoadingBulk(false);
  };

  const handleDeleteSelected = async () => {
    setLoadingBulk(true);
    setBulkProgress(0);
    const ids = Array.from(sel);
    for (let i = 0; i < ids.length; i++) {
      await fetch(`/api/trash/${ids[i]}`, { method: "DELETE" });
      setBulkProgress(i + 1);
    }
    await mutate();
    setSel(new Set());
    setLoadingBulk(false);
  };

  const handleReviewSelected = async () => {
    setLoadingBulk(true);
    setBulkProgress(0);
    const ids = Array.from(sel);
    const rsp = await fetch("/api/review-trash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    const { results } = await rsp.json();
    setReviewResults(results);
    await mutate(); // some may have moved
    setSel(new Set());
    setLoadingBulk(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Trash</h1>

      {/* search */}
      <input
        className={styles.searchInput}
        placeholder="Search…"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setQuery(e.target.value);
          setLimit(10);
        }}
      />

      {/* edit panel */}
      {editing && (
        <div className={styles.card}>
          <h2>Edit Request</h2>
          <JobForm
            initial={{
              ...editing,
              skills: editing.skills, // array is accepted
            }}
            editMode
            loading={saving}
            onSubmit={saveRow}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {/* table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={visible.length > 0 && visible.every((r) => sel.has(r.id))}
                onChange={toggleAll}
              />
            </th>
            <th>ID</th>
            <th>Title</th>
            <th>Company</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => {
            const busy =
              saving || loadingBulk || (editing !== null && editing.id === r.id);
            return (
              <tr key={r.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={sel.has(r.id)}
                    onChange={() => toggleOne(r.id)}
                  />
                </td>
                <td>{r.id}</td>
                <td>{r.title}</td>
                <td>{r.company}</td>
                <td>{r.type === "internship" ? "Internship" : "Job"}</td>
                <td className={styles.actions}>
                  <button
                    className={`${styles.button} ${styles.edit}`}
                    onClick={() => setEditing(r)}
                    disabled={busy}
                  >
                    Edit
                  </button>
                  <button
                    className={`${styles.button} ${styles.primary}`}
                    onClick={async () => {
                      await fetch(`/api/trash/${r.id}/post`, { method: "POST" });
                      mutate();
                    }}
                    disabled={busy}
                  >
                    Post
                  </button>
                  <button
                    className={`${styles.button} ${styles.delete}`}
                    onClick={async () => {
                      await fetch(`/api/trash/${r.id}`, { method: "DELETE" });
                      mutate();
                    }}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* bulk bar */}
      {sel.size > 0 && (
        <BulkActionBar
          count={sel.size}
          onPostAll={handlePostSelected}
          onDeleteAll={handleDeleteSelected}
          onReviewAll={handleReviewSelected}
          disabled={loadingBulk}
          progress={bulkProgress}
          total={sel.size}
        />
      )}

      {/* load more */}
      {limit < filtered.length && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button className={styles.loadMore} onClick={() => setLimit((l) => l + 10)}>
            Load More
          </button>
        </div>
      )}

      {/* gemini review panel */}
      {reviewResults && (
        <div className={styles.reviewPanel}>
          <h3>Gemini Review</h3>
          <pre>{JSON.stringify(reviewResults, null, 2)}</pre>
          <button
            className={`${styles.button} ${styles.delete}`}
            onClick={() => setReviewResults(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
