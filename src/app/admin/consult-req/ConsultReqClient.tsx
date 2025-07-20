// src/app/admin/consult-req/ConsultReqClient.tsx

"use client";

import React, { useState } from "react";
import useSWR from "swr";
import styles from "../AdminPageClient.module.css";
import BulkActionBar from "@/components/BulkActionBar";

interface Consultation {
  id: number;
  name: string;
  company: string;
  email: string;
  message: string;
  status: "pending" | "done";
  submittedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ConsultReqClient() {
  const {
    data: consultations,
    error,
    isLoading,
    mutate, // We need mutate to refresh the data after an action
  } = useSWR<Consultation[]>("/api/consultation", fetcher, {
    revalidateOnFocus: true,
  });

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Handler to toggle selection of a single row
  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Safely handle cases where the API might not return an array yet
  const consultationList = Array.isArray(consultations) ? consultations : [];

  // Handler to toggle selection of all visible rows
  const toggleAll = () => {
    if (
      consultationList.length > 0 &&
      selectedIds.size === consultationList.length
    ) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(consultationList.map((c) => c.id)));
    }
  };

  // Handler for the "Mark as Done" button
  const handleMarkDone = async () => {
    if (selectedIds.size === 0) return;
    await fetch("/api/consultation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds) }),
    });
    setSelectedIds(new Set()); // Clear selection
    mutate(); // Re-fetch data to show changes
  };

  // Handler for the "Delete" button
  const handleDelete = async () => {
    if (selectedIds.size === 0) return;

    // The window.confirm line has been removed. The delete action will now happen immediately.
    await fetch("/api/consultation", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds) }),
    });
    setSelectedIds(new Set()); // Clear selection
    mutate(); // Re-fetch data to show changes
  };

  if (error)
    return <div className={styles.container}>Failed to load requests.</div>;
  if (isLoading) return <div className={styles.container}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Consultation Requests</h1>
      <p style={{ marginBottom: "2rem" }}>
        {consultationList.length} request{consultationList.length !== 1 && "s"}{" "}
        found.
      </p>

      <section className={styles.section}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={
                    consultationList.length > 0 &&
                    selectedIds.size === consultationList.length
                  }
                />
              </th>
              <th>Submitted</th>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {consultationList.map((req) => (
              <tr
                key={req.id}
                className={req.status === "done" ? styles.doneRow : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(req.id)}
                    onChange={() => toggleOne(req.id)}
                  />
                </td>
                <td>{new Date(req.submittedAt).toLocaleString()}</td>
                <td>{req.name}</td>
                <td>{req.company}</td>
                <td>
                  <a href={`mailto:${req.email}`} style={{ color: "#69c1ff" }}>
                    {req.email}
                  </a>
                </td>
                <td style={{ whiteSpace: "pre-wrap", maxWidth: "400px" }}>
                  {req.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          onDeleteAll={handleDelete}
          onPostAll={handleMarkDone}
          showReview={false}
          postButtonText={`Mark ${selectedIds.size} as Done`}
        />
      )}
    </div>
  );
}
