// src/app/admin/AdminPageClient.tsx
"use client";

import { useState, ChangeEvent } from "react";
import useSWR from "swr";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  industry: string;
  visa: boolean;
  benefits: string[];
  skills: string[];
  url: string;
  postedAt: number;
  remote: boolean; // retained for backwards compatibility
  type: "job" | "internship";
  currency: string;
  salaryLow: number;
  salaryHigh: number;
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
      `${job.city}-${job.country}`.toLowerCase().includes(q) ||
      job.skills.some((s) => s.toLowerCase().includes(q))
    );
  });
  const visibleJobs = filtered.slice(0, visibleCount);

  // CSV upload state
  const [parsedJobs, setParsedJobs] = useState<Job[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Manual-add form
  const [manual, setManual] = useState({
    title: "",
    company: "",
    city: "",
    country: "",
    officeType: "Remote" as Job["officeType"],
    experienceLevel: "Intern" as Job["experienceLevel"],
    employmentType: "Full-time" as Job["employmentType"],
    industry: "Tech",
    visa: false,
    benefits: ["Health insurance"],
    skills: "",
    url: "",
    currency: "$",
    salaryLow: "",
    salaryHigh: "",
    type: "job" as "job" | "internship",
  });

  // Inline-edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Job>({
    id: "",
    title: "",
    company: "",
    city: "",
    country: "",
    officeType: "Remote",
    experienceLevel: "Intern",
    employmentType: "Full-time",
    industry: "Tech",
    visa: false,
    benefits: [],
    skills: [],
    url: "",
    postedAt: 0,
    remote: false,
    type: "job",
    currency: "$",
    salaryLow: 0,
    salaryHigh: 0,
  });

  if (error) return <p>Error loading jobs</p>;

  // --- CSV Handling ---
  const handleCsv = (e: ChangeEvent<HTMLInputElement>) => {
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
          city: row.city,
          country: row.country,
          officeType: row.officeType,
          experienceLevel: row.experienceLevel,
          employmentType: row.employmentType,
          industry: row.industry,
          visa: String(row.visa).toLowerCase() === "yes",
          benefits: row.benefits?.split(",").map((b: string) => b.trim()) ?? [],
          skills: row.skills?.split(",").map((s: string) => s.trim()) ?? [],
          url: row.url,
          postedAt: Date.now(),
          remote: String(row.officeType).toLowerCase().includes("remote"),
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
      // convert to your API format (j/i, remote flag)
      type: j.type === "internship" ? "i" : "j",
      remote: j.remote,
      benefits: j.benefits.join(","),
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
      city: manual.city,
      country: manual.country,
      officeType: manual.officeType,
      experienceLevel: manual.experienceLevel,
      employmentType: manual.employmentType,
      industry: manual.industry,
      visa: manual.visa,
      benefits: manual.benefits,
      skills: manual.skills.split(",").map((s) => s.trim()),
      url: manual.url,
      postedAt: Date.now(),
      remote: manual.officeType.toLowerCase().includes("remote"),
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
          benefits: newJob.benefits.join(","),
        },
      ]),
    });
    setManual({
      title: "",
      company: "",
      city: "",
      country: "",
      officeType: "Remote",
      experienceLevel: "Intern",
      employmentType: "Full-time",
      industry: "Tech",
      visa: false,
      benefits: ["Health insurance"],
      skills: "",
      url: "",
      currency: "$",
      salaryLow: "",
      salaryHigh: "",
      type: "job",
    });
    mutate();
  };

  // --- Edit / Delete ---
  const startEdit = (job: Job) => {
    setEditingId(job.id);
    setEditingData(job);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const payload = {
      ...editingData,
      type: editingData.type === "internship" ? "i" : "j",
      remote: editingData.officeType.toLowerCase().includes("remote"),
      benefits: editingData.benefits.join(","),
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
          marginLeft: "7px",
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
            placeholder="City"
            value={manual.city}
            onChange={(e) => setManual({ ...manual, city: e.target.value })}
          />
          <input
            placeholder="Country"
            value={manual.country}
            onChange={(e) => setManual({ ...manual, country: e.target.value })}
          />
          <select
            value={manual.officeType}
            onChange={(e) =>
              setManual({
                ...manual,
                officeType: e.target.value as Job["officeType"],
              })
            }
          >
            <option>Remote</option>
            <option>Hybrid</option>
            <option>In-Office</option>
            <option>Remote-Anywhere</option>
          </select>
          <select
            value={manual.experienceLevel}
            onChange={(e) =>
              setManual({
                ...manual,
                experienceLevel: e.target.value as Job["experienceLevel"],
              })
            }
          >
            <option>Intern</option>
            <option>Entry-level</option>
            <option>Associate/Mid-level</option>
            <option>Senior-level</option>
            <option>Managerial</option>
            <option>Executive</option>
          </select>
          <select
            value={manual.employmentType}
            onChange={(e) =>
              setManual({
                ...manual,
                employmentType: e.target.value as Job["employmentType"],
              })
            }
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Temporary</option>
            <option>Freelance</option>
          </select>
          <input
            placeholder="Industry / Job Sector"
            value={manual.industry}
            onChange={(e) => setManual({ ...manual, industry: e.target.value })}
          />
          <label>
            <input
              type="checkbox"
              checked={manual.visa}
              onChange={(e) => setManual({ ...manual, visa: e.target.checked })}
            />{" "}
            Visa Sponsorship Available
          </label>
          <select
            multiple
            value={manual.benefits}
            onChange={(e) => {
              const opts = Array.from(
                e.target.selectedOptions,
                (opt) => opt.value
              );
              setManual({ ...manual, benefits: opts });
            }}
          >
            <option>Health insurance</option>
            <option>Paid leave</option>
            <option>Flexible working hours</option>
            <option>Stock options</option>
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
          <select
            value={manual.type}
            onChange={(e) =>
              setManual({
                ...manual,
                type: e.target.value as "job" | "internship",
              })
            }
          >
            <option value="job">Job</option>
            <option value="internship">Internship</option>
          </select>
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
              <th>City</th>
              <th>Country</th>
              <th>Office Type</th>
              <th>Experience</th>
              <th>Employment</th>
              <th>Industry</th>
              <th>Visa</th>
              <th>Benefits</th>
              <th>Skills</th>
              <th>URL</th>
              <th>Type</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleJobs.map((job) => {
              const isEditing = editingId === job.id;
              return (
                <tr key={job.id}>
                  <td style={{ padding: "0.5rem" }}>{job.id}</td>
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
                      job.title
                    )}
                  </td>
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
                      job.company
                    )}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {isEditing ? (
                      <input
                        value={editingData.city}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            city: e.target.value,
                          })
                        }
                      />
                    ) : (
                      job.city
                    )}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {isEditing ? (
                      <input
                        value={editingData.country}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            country: e.target.value,
                          })
                        }
                      />
                    ) : (
                      job.country
                    )}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {isEditing ? (
                      <select
                        value={editingData.officeType}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            officeType: e.target.value as Job["officeType"],
                          })
                        }
                      >
                        <option>Remote</option>
                        <option>Hybrid</option>
                        <option>In-Office</option>
                        <option>Remote-Anywhere</option>
                      </select>
                    ) : (
                      job.officeType
                    )}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {isEditing ? (
                      <select
                        value={editingData.experienceLevel}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            experienceLevel: e.target
                              .value as Job["experienceLevel"],
                          })
                        }
                      >
                        <option>Intern</option>
                        <option>Entry-level</option>
                        <option>Associate/Mid-level</option>
                        <option>Senior-level</option>
                        <option>Managerial</option>
                        <option>Executive</option>
                      </select>
                    ) : (
                      editingData.experienceLevel
                    )}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {isEditing ? (
                      <select
                        value={editingData.employmentType}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            employmentType: e.target
                              .value as Job["employmentType"],
                          })
                        }
                      >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Temporary</option>
                        <option>Freelance</option>
                      </select>
                    ) : (
                      job.employmentType
                    )}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {isEditing ? (
                      <input
                        value={editingData.industry}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            industry: e.target.value,
                          })
                        }
                      />
                    ) : (
                      job.industry
                    )}
                  </td>
                  <td style={{ padding: "0.5rem", textAlign: "center" }}>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editingData.visa}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            visa: e.target.checked,
                          })
                        }
                      />
                    ) : job.visa ? (
                      "Y"
                    ) : (
                      ""
                    )}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {isEditing ? (
                      <select
                        multiple
                        value={editingData.benefits}
                        onChange={(e) => {
                          const opts = Array.from(
                            e.target.selectedOptions,
                            (opt) => opt.value
                          );
                          setEditingData({
                            ...editingData,
                            benefits: opts,
                          });
                        }}
                      >
                        <option>Health insurance</option>
                        <option>Paid leave</option>
                        <option>Flexible working hours</option>
                        <option>Stock options</option>
                      </select>
                    ) : (
                      job.benefits.join(", ")
                    )}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {isEditing ? (
                      <input
                        value={editingData.skills.join(", ")}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            skills: e.target.value
                              .split(",")
                              .map((s) => s.trim()),
                          })
                        }
                      />
                    ) : (
                      job.skills.join(", ")
                    )}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {isEditing ? (
                      <input
                        value={editingData.url}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            url: e.target.value,
                          })
                        }
                      />
                    ) : (
                      job.url
                    )}
                  </td>
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
                      job.type.toUpperCase()
                    )}
                  </td>
                  <td
                    style={{ padding: "0.5rem" }}
                  >{`${job.currency}${job.salaryLow} - ${job.currency}${job.salaryHigh}`}</td>
                  <td
                    style={{
                      padding: "0.5rem",
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    {editingId === job.id ? (
                      <>
                        <button onClick={saveEdit}>Save</button>
                        <button onClick={cancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(job)}>Edit</button>
                        <button onClick={() => deleteJob(job.id)}>
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
      </section>

      {/* Load More Button */}
      {visibleCount < filtered.length && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
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
