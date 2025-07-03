// src/app/post-requests/page.tsx
"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";

// same fetcher as everywhere else
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface JobRequest {
  id: string;
  title: string;
  company: string;
  location: string;
  skills: string[]; // stored as JSON-array string in DB
  url: string;
  postedAt: number;
  remote: boolean;
  type: "job" | "internship";
  salaryLow: number;
  salaryHigh: number;
  currency: string;
}

export default function PostRequestsPage() {
  const router = useRouter();
  const { data: reqs = [], mutate: mutateReqs } = useSWR<JobRequest[]>(
    "/api/requests",
    fetcher
  );
  const { mutate: mutateJobs } = useSWR<JobRequest[]>("/api/jobs", fetcher);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<JobRequest>({
    id: "",
    title: "",
    company: "",
    location: "",
    skills: [],
    url: "",
    postedAt: 0,
    remote: false,
    type: "job",
    salaryLow: 0,
    salaryHigh: 0,
    currency: "$",
  });

  // click “Edit” → populate editingData
  const startEdit = (r: JobRequest) => {
    setEditingId(r.id);
    setEditingData(r);
  };

  // click “Cancel”
  const cancelEdit = () => {
    setEditingId(null);
  };

  // save edits back to /api/requests/[id] via POST
  const saveEdit = async () => {
    if (!editingId) return;
    setLoadingId(editingId);
    try {
      await fetch(`/api/requests/${editingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingData,
          // convert type & remote flags to your shorthand if needed:
          type: editingData.type === "internship" ? "i" : "j",
          remote: editingData.remote,
        }),
      });
      await mutateReqs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
      setEditingId(null);
    }
  };

  // either Post (publish) or Delete (reject)
  const handleAction = async (id: string, action: "post" | "delete") => {
    setLoadingId(id);
    try {
      const url =
        action === "post" ? `/api/requests/${id}/post` : `/api/requests/${id}`;
      await fetch(url, { method: action === "post" ? "POST" : "DELETE" });
      await mutateReqs();
      if (action === "post") await mutateJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "1rem" }}>
      <h1>Pending Job Requests</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "0.5rem", textAlign: "left" }}>ID</th>
            <th style={{ padding: "0.5rem", textAlign: "left" }}>Title</th>
            <th style={{ padding: "0.5rem", textAlign: "left" }}>Company</th>
            <th style={{ padding: "0.5rem", textAlign: "left" }}>Location</th>
            <th style={{ padding: "0.5rem", textAlign: "center" }}>Remote</th>
            <th style={{ padding: "0.5rem", textAlign: "left" }}>Type</th>
            <th style={{ padding: "0.5rem", textAlign: "left" }}>Salary</th>
            <th style={{ padding: "0.5rem", textAlign: "left" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reqs.map((r) => {
            const isEditing = editingId === r.id;
            const isLoading = loadingId === r.id;
            const date = new Date(r.postedAt);
            const remoteText = r.remote ? "Y" : "";
            const typeLabel = r.type === "internship" ? "Internship" : "Job";
            const salaryText = `${r.currency}${r.salaryLow} – ${r.currency}${r.salaryHigh}`;

            return (
              <tr key={r.id}>
                {/* ID */}
                <td style={{ padding: "0.5rem" }}>{r.id}</td>

                {/* Title */}
                <td style={{ padding: "0.5rem" }}>
                  {isEditing ? (
                    <input
                      value={editingData.title}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          title: e.target.value,
                        })
                      }
                    />
                  ) : (
                    r.title
                  )}
                </td>

                {/* Company */}
                <td style={{ padding: "0.5rem" }}>
                  {isEditing ? (
                    <input
                      value={editingData.company}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          company: e.target.value,
                        })
                      }
                    />
                  ) : (
                    r.company
                  )}
                </td>

                {/* Location */}
                <td style={{ padding: "0.5rem" }}>
                  {isEditing ? (
                    <input
                      value={editingData.location}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          location: e.target.value,
                        })
                      }
                    />
                  ) : (
                    r.location
                  )}
                </td>

                {/* Remote */}
                <td style={{ padding: "0.5rem", textAlign: "center" }}>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editingData.remote}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          remote: e.target.checked,
                        })
                      }
                    />
                  ) : (
                    remoteText
                  )}
                </td>

                {/* Type */}
                <td style={{ padding: "0.5rem" }}>
                  {isEditing ? (
                    <select
                      value={editingData.type}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          type: e.target.value as "job" | "internship",
                        })
                      }
                    >
                      <option value="job">Job</option>
                      <option value="internship">Internship</option>
                    </select>
                  ) : (
                    typeLabel
                  )}
                </td>

                {/* Salary */}
                <td style={{ padding: "0.5rem" }}>
                  {isEditing ? (
                    <>
                      <input
                        style={{ width: "3rem" }}
                        value={editingData.currency}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            currency: e.target.value,
                          })
                        }
                      />
                      <input
                        style={{ width: "4rem", margin: "0 0.25rem" }}
                        value={editingData.salaryLow}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            salaryLow: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      –
                      <input
                        style={{ width: "4rem", margin: "0 0.25rem" }}
                        value={editingData.salaryHigh}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            salaryHigh: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </>
                  ) : (
                    salaryText
                  )}
                </td>

                {/* Actions */}
                <td
                  style={{
                    padding: "0.5rem",
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  {isEditing ? (
                    <>
                      <button onClick={saveEdit} disabled={isLoading}>
                        Save
                      </button>
                      <button onClick={cancelEdit} disabled={isLoading}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(r)} disabled={isLoading}>
                        Edit
                      </button>
                      <button
                        onClick={() => handleAction(r.id, "post")}
                        disabled={isLoading}
                      >
                        Post
                      </button>
                      <button
                        onClick={() => handleAction(r.id, "delete")}
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
