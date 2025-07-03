// src/app/admin/AdminPageClient.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  url: string;
  postedAt: number;
  remote: boolean;
  type: "job" | "internship";
  salaryLow: number;
  salaryHigh: number;
  currency: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPageClient() {

  const router = useRouter();


  const {
    data: jobs = [],
    error,
    mutate,
  } = useSWR<Job[]>("/api/jobs", fetcher);

  const { data: requests = [] } = useSWR<any[]>("/api/requests", fetcher);
  const pendingCount = requests.length;

  // Pagination state for Load More
  const [visibleCount, setVisibleCount] = useState(10);

  // Search/filter
  const [query, setQuery] = useState("");
  const filtered = jobs.filter((job) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  // Only show up to visibleCount results
  const visibleJobs = filtered.slice(0, visibleCount);

  // CSV upload state
  const [parsedJobs, setParsedJobs] = useState<Job[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Manual-add form
  const [manual, setManual] = useState({
    title: "",
    company: "",
    location: "",
    skills: "",
    url: "",
    remote: false,
    type: "job" as "job" | "internship",
    currency: "$",
    salaryLow: "",
    salaryHigh: "",
  });

  // Inline-edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Job>({
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

  if (error) return <p>Error loading jobs</p>;

  // --- CSV Handling ---
  const handleCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return setCsvError("No file selected");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) {
          setCsvError(errors.map((er) => er.message).join("; "));
          return;
        }
        const list: Job[] = (data as any[]).map((row) => ({
          id:
            uuidv4().slice(0, 4) + "-" + Math.floor(100 + Math.random() * 900),
          title: row.title,
          company: row.company,
          location: row.location,
          skills: row.skills?.split(",").map((s: string) => s.trim()) ?? [],
          url: row.url,
          postedAt: Date.now(),
          remote: String(row.remote).toLowerCase() === "y",
          type: String(row["j/i"]).toLowerCase() === "i" ? "internship" : "job",
          currency: row.currency || "$",
          salaryLow: parseInt(row.salaryLow, 10) || 0,
          salaryHigh: parseInt(row.salaryHigh, 10) || 0,
        }));
        setParsedJobs(list);
        setCsvError(null);
      },
      error: (err) => setCsvError(err.message),
    });
  };

  const uploadCsv = async () => {
    if (!parsedJobs.length) return;
    setUploading(true);
    const payload = parsedJobs.map((j) => ({
      ...j,
      type: j.type === "internship" ? "i" : "j",
      remote: j.remote,
    }));
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setParsedJobs([]);
    setUploading(false);
    mutate();
  };

  // --- Manual Add ---
  const addManual = async () => {
    const newJob: Job = {
      id: uuidv4().slice(0, 4) + "-" + Math.floor(100 + Math.random() * 900),
      title: manual.title,
      company: manual.company,
      location: manual.location,
      skills: manual.skills.split(",").map((s) => s.trim()),
      url: manual.url,
      postedAt: Date.now(),
      remote: manual.remote,
      type: manual.type,
      currency: manual.currency,
      salaryLow: parseInt(manual.salaryLow, 10) || 0,
      salaryHigh: parseInt(manual.salaryHigh, 10) || 0,
    };
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        {
          ...newJob,
          type: newJob.type === "internship" ? "i" : "j",
        },
      ]),
    });
    setManual({
      title: "",
      company: "",
      location: "",
      skills: "",
      url: "",
      remote: false,
      type: "job",
      currency: "$",
      salaryLow: "",
      salaryHigh: "",
    });
    mutate();
  };

  // --- Edit / Delete ---
  const startEdit = (job: Job) => {
    setEditingId(job.id);
    setEditingData(job);
  };

  const saveEdit = async () => {
    const payload = {
      ...editingData,
      type: editingData.type === "internship" ? "i" : "j",
      remote: editingData.remote,
    };
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([payload]),
    });
    setEditingId(null);
    mutate();
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const deleteJob = async (id: string) => {
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    mutate();
  };



  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "1rem" }}>
      <h1>Admin Console</h1>
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        style={{
          padding: "0.5rem 1rem",
          background: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Log out
      </button>

      <button
        onClick={() => router.push("/post-requests")}
        style={{
          position: "relative",
          padding: "0.5rem 1rem",
          background: "#4baaf3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginLeft:"7px",
        }}
      >
        Requests
        {pendingCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-4px",
              background: "#e74c3c",
              color: "white",
              fontSize: "0.6rem",
              padding: "0.2rem 0.4rem",
              borderRadius: "8px",
              
            }}
          >
            {pendingCount}
          </span>
        )}
      </button>

      {/* Search */}
      <input
        placeholder="Search jobs…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", margin: "1rem 0" }}
      />

      {/* CSV Bulk Upload */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>CSV Bulk Upload</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleCsv}
          disabled={uploading}
        />
        {csvError && <p style={{ color: "red" }}>{csvError}</p>}
        {parsedJobs.length > 0 && (
          <button onClick={uploadCsv} disabled={uploading}>
            {uploading ? "Uploading…" : `Upload ${parsedJobs.length} Jobs`}
          </button>
        )}
      </section>

      {/* Manual Add */}
      <section
        style={{
          marginBottom: "2rem",
          border: "1px solid #ccc",
          padding: "1rem",
        }}
      >
        <h2>Add Job Manually</h2>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <input
            placeholder="Title"
            value={manual.title}
            onChange={(e) => setManual({ ...manual, title: e.target.value })}
          />
          <input
            placeholder="Company"
            value={manual.company}
            onChange={(e) => setManual({ ...manual, company: e.target.value })}
          />
          <input
            placeholder="Location City - Country e.g New York - USA"
            value={manual.location}
            onChange={(e) => setManual({ ...manual, location: e.target.value })}
          />
          <label>
            <input
              type="checkbox"
              checked={manual.remote}
              onChange={(e) =>
                setManual({ ...manual, remote: e.target.checked })
              }
            />{" "}
            Remote
          </label>
          <select
            value={manual.type}
            onChange={(e) =>
              setManual({ ...manual, type: e.target.value as any })
            }
          >
            <option value="job">Job</option>
            <option value="internship">Internship</option>
          </select>
          <input
            placeholder="Skills (comma-separated)"
            value={manual.skills}
            onChange={(e) => setManual({ ...manual, skills: e.target.value })}
          />
          <input
            placeholder="URL"
            value={manual.url}
            onChange={(e) => setManual({ ...manual, url: e.target.value })}
          />
          <input
            placeholder="Currency"
            value={manual.currency}
            onChange={(e) => setManual({ ...manual, currency: e.target.value })}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              placeholder="Salary Low"
              value={manual.salaryLow}
              onChange={(e) =>
                setManual({ ...manual, salaryLow: e.target.value })
              }
            />
            <input
              placeholder="Salary High"
              value={manual.salaryHigh}
              onChange={(e) =>
                setManual({ ...manual, salaryHigh: e.target.value })
              }
            />
          </div>
          <button onClick={addManual}>Add Job</button>
        </div>
      </section>

      {/* All Jobs Table */}
      <section>
        <h2>All Jobs</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Remote</th>
              <th>Type</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleJobs.map((job) => (
              <tr key={job.id}>
                <td style={{ padding: "0.5rem" }}>{job.id}</td>

                <td style={{ padding: "0.5rem" }}>
                  {editingId === job.id ? (
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
                    job.title
                  )}
                </td>

                <td style={{ padding: "0.5rem" }}>
                  {editingId === job.id ? (
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
                    job.company
                  )}
                </td>

                <td style={{ padding: "0.5rem" }}>
                  {editingId === job.id ? (
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
                    job.location
                  )}
                </td>

                <td style={{ padding: "0.5rem", textAlign: "center" }}>
                  {editingId === job.id ? (
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
                  ) : job.remote ? (
                    "Y"
                  ) : (
                    ""
                  )}
                </td>

                <td style={{ padding: "0.5rem" }}>
                  {editingId === job.id ? (
                    <select
                      value={editingData.type}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          type: e.target.value as any,
                        })
                      }
                    >
                      <option value="job">Job</option>
                      <option value="internship">Internship</option>
                    </select>
                  ) : (
                    job.type.charAt(0).toUpperCase() + job.type.slice(1)
                  )}
                </td>

                <td style={{ padding: "0.5rem" }}>
                  {editingId === job.id ? (
                    <>
                      <input
                        style={{ width: "4rem" }}
                        value={editingData.currency}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            currency: e.target.value,
                          })
                        }
                      />
                      <input
                        style={{ width: "4rem" }}
                        value={editingData.salaryLow}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            salaryLow: parseInt(e.target.value) || 0,
                          })
                        }
                      />{" "}
                      -{" "}
                      <input
                        style={{ width: "4rem" }}
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
                    `${job.currency}${job.salaryLow} - ${job.currency}${job.salaryHigh}`
                  )}
                </td>

                <td style={{ padding: "0.5rem" }}>
                  {editingId === job.id ? (
                    <>
                      <button
                        onClick={saveEdit}
                        style={{ marginRight: "0.5rem" }}
                      >
                        Save
                      </button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(job)}
                        style={{ marginRight: "0.5rem" }}
                      >
                        Edit
                      </button>
                      <button onClick={() => deleteJob(job.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Load More Button */}
      {visibleCount < filtered.length && (
        <div
          style={{
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            style={{ padding: "0.5rem 1rem" }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
