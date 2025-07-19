// src/app/admin/AdminPageClient.tsx
"use client";

import React, {
  useState,
  useMemo,
  useRef,
  ChangeEvent,
  useCallback,
} from "react";
import useSWR from "swr";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import JobForm from "@/components/JobForm/JobForm";
import BulkActionBar from "@/components/BulkActionBar";
import CsvUploadPanel from "@/components/CsvUploadPanel";
import TrashButton from "@/components/TrashButton";

import styles from "./AdminPageClient.module.css";

/* ───────── types ───────── */

interface Job {
  id: string;
  title: string;
  company: string;
  city: string;
  country: string;
  officeType: "Remote" | "Hybrid" | "In-Office" | "Remote-Anywhere";
  experienceLevel:
    | "Intern"
    | "Entry-level"
    | "Associate/Mid-level"
    | "Senior-level"
    | "Managerial"
    | "Executive";
  employmentType:
    | "Full-time"
    | "Part-time"
    | "Contract"
    | "Temporary"
    | "Freelance";
  industries: string[];
  visa: boolean;
  benefits: string[];
  skills: string[];
  url: string;
  postedAt: number;
  remote: boolean;
  type: "job" | "internship";
  currency: string;
  salaryLow: number;
  salaryHigh: number;
}

/* ───────── utils ───────── */

const fetcher = (u: string) => fetch(u).then((r) => r.json());

/** Accepts a comma-string or string[] and returns a trimmed array */
const normalizeSkills = (value: string | string[]): string[] =>
  Array.isArray(value)
    ? value
    : value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

/* ───────── component ───────── */

export default function AdminPageClient() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement | null>(null);

  /* data */
  const {
    data: jobs = [],
    error,
    mutate: mutateJobs,
  } = useSWR<Job[]>("/api/jobs", fetcher);

  const { data: requests = [] } = useSWR("/api/requests", fetcher);
  const { data: trash = [] } = useSWR("/api/trash", fetcher);
  const { data: consultations = [] } = useSWR("/api/consultation", fetcher);

  const pendingCount = requests.length;
  const trashCount = trash.length;
  const consultationCount = consultations.length;

  /* search + pagination */
  const [query, setQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(10);

  const filtered = useMemo<Job[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        `${j.city}, ${j.country}`.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [jobs, query]);

  const visibleJobs = filtered.slice(0, visibleCount);

  /* selection */
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleOne = (id: string): void =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAllVisible = (): void => {
    const ids = visibleJobs.map((j) => j.id);
    const allSelected: boolean = ids.every((id) => selected.has(id));
    setSelected(new Set(allSelected ? [] : ids));
  };

  /* edit panel */
  const [editing, setEditing] = useState<Job | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const startEdit = (job: Job): void => {
    setEditing(job);
    scrollToForm();
  };

  const handleCreate = async (payload: any): Promise<void> => {
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        {
          ...payload,
          id: crypto.randomUUID(),
          postedAt: Date.now(),
          remote: payload.officeType?.toLowerCase()?.includes("remote"),
          type:
            payload.experienceLevel === "Intern" ||
            payload.type === "internship"
              ? "i"
              : "j",
          industries: payload.industries.join(","),
          benefits: payload.benefits.join(","),
          skills: normalizeSkills(payload.skills),
        },
      ]),
    });
    await mutateJobs();
    setEditing(null);
    setSelected(new Set());
  };

  const handleSaveEdit = async (payload: any): Promise<void> => {
    setSavingId(payload.id);
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        {
          ...payload,
          industries: payload.industries.join(","),
          benefits: payload.benefits.join(","),
          skills: normalizeSkills(payload.skills),
          type: payload.type === "internship" ? "i" : "j",
          remote: payload.officeType?.toLowerCase()?.includes("remote"),
        },
      ]),
    });
    await mutateJobs();
    setSavingId(null);
    setEditing(null);
    setSelected(new Set());
  };

  /* bulk helpers */
  const deleteSelected = async (): Promise<void> => {
    for (const id of selected) {
      await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    }
    await mutateJobs();
    setSelected(new Set());
  };

  const reviewSelected = async (): Promise<void> => {
    if (selected.size === 0) return;
    await fetch("/api/review-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected] }),
    });
    await mutateJobs();
    setSelected(new Set());
  };

  /* single-row delete */
  const deleteOne = async (id: string): Promise<void> => {
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    await mutateJobs();
  };

  if (error) return <p>Error loading jobs</p>;

  /* ───────── JSX ───────── */

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Console</h1>

      {/* top-right controls */}
      <div className={styles.buttonGroup}>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className={`${styles.button} ${styles.logout}`}
        >
          Log&nbsp;out
        </button>

        <button
          onClick={() => router.push("/post-requests")}
          className={`${styles.button} ${styles.primary}`}
        >
          Requests
          {pendingCount > 0 && (
            <span className={styles.badge}>{pendingCount}</span>
          )}
        </button>

        {/* --- NEW: Consultation Button --- */}
        <button
          onClick={() => router.push("/admin/consult-req")}
          className={`${styles.button} ${styles.primary}`}
          style={{ background: "#9b59b6" }} // A different color
        >
          Consultations
          {consultationCount > 0 && (
            <span className={styles.badge}>{consultationCount}</span>
          )}
        </button>

        <TrashButton count={trashCount} />
      </div>

      {/* search */}
      <input
        className={styles.searchInput}
        placeholder="Search title, company, location, skills…"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
          setQuery(e.target.value);
          setVisibleCount(10);
        }}
      />

      {/* CSV upload */}
      <section className={styles.section}>
        <h2>CSV&nbsp;Bulk&nbsp;Upload</h2>
        <CsvUploadPanel />
      </section>

      {/* form */}
      <section ref={formRef} className={`${styles.section} ${styles.card}`}>
        <h2>{editing ? "Edit Job" : "Add Job Manually"}</h2>

        <JobForm
          key={editing?.id ?? "new"} // reset internal state on edit-switch
          initial={
            editing
              ? {
                  ...editing,
                  skills: editing.skills.join(", "),
                  salaryLow: editing.salaryLow.toString(),
                  salaryHigh: editing.salaryHigh.toString(),
                  type: editing.type,
                }
              : undefined
          }
          editMode={Boolean(editing)}
          loading={Boolean(savingId)}
          onSubmit={editing ? handleSaveEdit : handleCreate}
          onCancel={(): void => setEditing(null)}
        />
      </section>

      {/* table */}
      <section className={styles.section}>
        <h2>All Jobs</h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    visibleJobs.length > 0 &&
                    visibleJobs.every((j) => selected.has(j.id))
                  }
                  onChange={toggleAllVisible}
                />
              </th>
              <th>Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Experience</th>
              <th>Employment</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleJobs.map((j) => {
              const busy = savingId === j.id;
              return (
                <tr key={j.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(j.id)}
                      onChange={(): void => toggleOne(j.id)}
                    />
                  </td>
                  <td>{j.title}</td>
                  <td>{j.company}</td>
                  <td>
                    {j.city}, {j.country}
                  </td>
                  <td>{j.experienceLevel}</td>
                  <td>{j.employmentType}</td>
                  <td className={styles.actions}>
                    <button
                      className={`${styles.button} ${styles.edit}`}
                      onClick={(): void => startEdit(j)}
                      disabled={busy}
                    >
                      Edit
                    </button>
                    <button
                      className={`${styles.button} ${styles.delete}`}
                      onClick={() => {
                        void deleteOne(j.id);
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

        {/* load more */}
        {visibleCount < filtered.length && (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button
              className={styles.loadMore}
              onClick={(): void => setVisibleCount((c) => c + 10)}
            >
              Load&nbsp;More
            </button>
          </div>
        )}
      </section>

      {/* bulk bar */}
      {selected.size > 0 && (
        <BulkActionBar
          count={selected.size}
          onDeleteAll={() => {
            void deleteSelected();
          }}
          onReviewAll={() => {
            void reviewSelected();
          }}
          showPost={false} // hide “Post Selected”
        />
      )}
    </div>
  );
}
