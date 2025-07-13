// src/app/admin/AdminPageClient.tsx
"use client";

import { useState, ChangeEvent } from "react";
import useSWR from "swr";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import TrashButton from "@/components/TrashButton";
import CsvUploadPanel from "@/components/CsvUploadPanel";
import styles from "./AdminPageClient.module.css";

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

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Fixed option lists:
const industryOptions = [
  "Tech",
  "Marketing",
  "Finance",
  "Healthcare",
  "Education",
];
const benefitOptions = [
  "Health insurance",
  "Paid leave",
  "Flexible working hours",
  "Stock options",
];
const currencyOptions = [
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "JPY", label: "JPY (¥)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "AUD", label: "AUD (A$)" },
  { code: "CAD", label: "CAD (C$)" },
  { code: "CHF", label: "CHF (CHF)" },
  { code: "CNY", label: "CNY (¥)" },
  { code: "SEK", label: "SEK (kr)" },
  { code: "NZD", label: "NZD (NZ$)" },
];

export default function AdminPageClient() {
  const router = useRouter();
  const {
    data: jobs = [],
    error,
    mutate,
  } = useSWR<Job[]>("/api/jobs", fetcher);
  const { data: requests = [] } = useSWR<any[]>("/api/requests", fetcher);
  const { data: trash = [] } = useSWR<any[]>("/api/trash", fetcher);
  const pendingCount = requests.length;
  const trashCount = trash.length;

  /* ---------------- Search & pagination ---------------- */
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const filtered = jobs.filter((j) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      `${j.city}, ${j.country}`.toLowerCase().includes(q) ||
      j.skills.some((s) => s.toLowerCase().includes(q))
    );
  });
  const visibleJobs = filtered.slice(0, visibleCount);

  /* ---------------- Form (add / edit) ---------------- */
  const emptyForm = {
    title: "",
    company: "",
    city: "",
    country: "",
    officeType: "",
    experienceLevel: "",
    employmentType: "",
    industries: [] as string[],
    visa: false,
    benefits: [] as string[],
    skills: "",
    url: "",
    currency: "",
    salaryLow: "",
    salaryHigh: "",
    type: "" as "job" | "internship" | "",
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (j: Job) => {
    setEditingId(j.id);
    setForm({
      title: j.title,
      company: j.company,
      city: j.city,
      country: j.country,
      officeType: j.officeType,
      experienceLevel: j.experienceLevel,
      employmentType: j.employmentType,
      industries: [...j.industries],
      visa: j.visa,
      benefits: [...j.benefits],
      skills: j.skills.join(", "),
      url: j.url,
      currency: j.currency,
      salaryLow: String(j.salaryLow),
      salaryHigh: String(j.salaryHigh),
      type: j.type,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleArray = (key: "industries" | "benefits", val: string) => {
    setForm((f) => {
      const next = new Set(f[key]);
      next.has(val) ? next.delete(val) : next.add(val);
      if (key === "industries" && next.size > 3) return f;
      return { ...f, [key]: Array.from(next) };
    });
  };

  const addJob = async () => {
    const newJob: Job = {
      id: crypto.randomUUID(),
      title: form.title,
      company: form.company,
      city: form.city,
      country: form.country,
      officeType: form.officeType as Job["officeType"],
      experienceLevel: form.experienceLevel as Job["experienceLevel"],
      employmentType: form.employmentType as Job["employmentType"],
      industries: form.industries,
      visa: form.visa,
      benefits: form.benefits,
      skills: form.skills.split(",").map((s) => s.trim()),
      url: form.url,
      postedAt: Date.now(),
      remote: form.officeType.toLowerCase().includes("remote"),
      type:
        form.experienceLevel === "Intern"
          ? "internship"
          : (form.type as "job" | "internship"),
      currency: form.currency,
      salaryLow: parseInt(form.salaryLow, 10) || 0,
      salaryHigh: parseInt(form.salaryHigh, 10) || 0,
    };
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        {
          ...newJob,
          type: newJob.type === "internship" ? "i" : "j",
          benefits: newJob.benefits.join(","),
          industries: newJob.industries.join(","),
        },
      ]),
    });
    mutate();
    setForm(emptyForm);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        {
          id: editingId,
          title: form.title,
          company: form.company,
          city: form.city,
          country: form.country,
          officeType: form.officeType,
          experienceLevel: form.experienceLevel,
          employmentType: form.employmentType,
          industries: form.industries.join(","),
          visa: form.visa,
          benefits: form.benefits.join(","),
          skills: form.skills.split(",").map((s) => s.trim()),
          url: form.url,
          postedAt: Date.now(),
          remote: form.officeType.toLowerCase().includes("remote"),
          type:
            form.experienceLevel === "Intern"
              ? "i"
              : form.type === "internship"
              ? "i"
              : "j",
          currency: form.currency,
          salaryLow: parseInt(form.salaryLow, 10) || 0,
          salaryHigh: parseInt(form.salaryHigh, 10) || 0,
        },
      ]),
    });
    mutate();
    cancelForm();
  };

  const deleteJob = async (id: string) => {
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    mutate();
  };

  if (error) return <p>Error loading jobs</p>;

  /* ---------------- JSX ---------------- */
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Console</h1>

      {/* top buttons */}
      <div className={styles.buttonGroup}>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className={`${styles.button} ${styles.logout}`}
        >
          Log out
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
        <TrashButton count={trashCount} />
      </div>

      {/* search */}
      <input
        placeholder="Search jobs…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setVisibleCount(10);
        }}
        className={styles.searchInput}
      />

      {/* CSV bulk upload */}
      <section className={styles.section}>
        <h2>CSV Bulk Upload</h2>
        <CsvUploadPanel />
      </section>

      {/* form */}
      <section className={`${styles.section} ${styles.card}`}>
        <h2>{editingId ? "Edit Job" : "Add Job Manually"}</h2>
        <div className={styles.formGrid}>
          {/* Row 1 */}
          <input
            placeholder="Title"
            name="title"
            value={form.title}
            onChange={onChange}
            required
          />
          <input
            placeholder="Company"
            name="company"
            value={form.company}
            onChange={onChange}
            required
          />

          {/* Row 2 */}
          <input
            placeholder="City"
            name="city"
            value={form.city}
            onChange={onChange}
          />
          <input
            placeholder="Country"
            name="country"
            value={form.country}
            onChange={onChange}
          />

          {/* Row 3 */}
          <select
            name="officeType"
            value={form.officeType}
            onChange={onChange}
            required
          >
            <option value="" disabled>
              Location Type (Select one)
            </option>
            <option>Remote</option>
            <option>Hybrid</option>
            <option>In-Office</option>
            <option>Remote-Anywhere</option>
          </select>

          <select
            name="experienceLevel"
            value={form.experienceLevel}
            onChange={(e) => {
              onChange(e as any);
              if (e.target.value === "Intern") {
                setForm((f) => ({ ...f, type: "internship" }));
              } else {
                setForm((f) => ({ ...f, type: "" }));
              }
            }}
            required
          >
            <option value="" disabled>
              Select Experience Level
            </option>
            <option>Intern</option>
            <option>Entry-level</option>
            <option>Associate/Mid-level</option>
            <option>Senior-level</option>
            <option>Managerial</option>
            <option>Executive</option>
          </select>

          <select
            name="employmentType"
            value={form.employmentType}
            onChange={onChange}
            required
          >
            <option value="" disabled>
              Select Employment Type
            </option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Temporary</option>
            <option>Freelance</option>
          </select>

          {/* Industry */}
          <div style={{ gridColumn: "1 / span 2" }}>
            <p style={{ margin: 0 }}>Industry (up to 3):</p>
            <div className={styles.checkboxGroup}>
              {industryOptions.map((opt) => (
                <label key={opt}>
                  <input
                    type="checkbox"
                    checked={form.industries.includes(opt)}
                    onChange={() => toggleArray("industries", opt)}
                    required={form.industries.length === 0}
                  />{" "}
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Visa */}
          <label style={{ gridColumn: "1 / span 2" }}>
            <input
              type="checkbox"
              name="visa"
              checked={form.visa}
              onChange={onChange}
            />{" "}
            Visa Sponsorship Available
          </label>

          {/* Benefits */}
          <div style={{ gridColumn: "1 / span 2" }}>
            <p style={{ margin: 0 }}>Benefits:</p>
            <div className={styles.checkboxGroup}>
              {benefitOptions.map((b) => (
                <label key={b}>
                  <input
                    type="checkbox"
                    checked={form.benefits.includes(b)}
                    onChange={() => toggleArray("benefits", b)}
                  />{" "}
                  {b}
                </label>
              ))}
            </div>
          </div>

          {/* Skills / URL */}
          <input
            placeholder="Skills (comma-separated)"
            name="skills"
            value={form.skills}
            onChange={onChange}
            required
          />
          <input
            placeholder="Application URL"
            name="url"
            value={form.url}
            onChange={onChange}
            required
          />

          {/* Currency & salary */}
          <select
            name="currency"
            value={form.currency}
            onChange={onChange}
            required
          >
            <option value="" disabled>
              Choose currency
            </option>
            {currencyOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              placeholder="Low"
              name="salaryLow"
              value={form.salaryLow}
              onChange={onChange}
              style={{ flex: 1 }}
            />
            <span>–</span>
            <input
              placeholder="High"
              name="salaryHigh"
              value={form.salaryHigh}
              onChange={onChange}
              style={{ flex: 1 }}
            />
          </div>

          {/* Opportunity type */}
          {form.experienceLevel !== "Intern" && (
            <select name="type" value={form.type} onChange={onChange} required>
              <option value="" disabled>
                Choose opportunity type
              </option>
              <option value="job">Job</option>
              <option value="internship">Internship</option>
            </select>
          )}
        </div>

        <div style={{ marginTop: "1rem" }}>
          {editingId ? (
            <>
              <button
                onClick={saveEdit}
                className={`${styles.button} ${styles.primary}`}
              >
                Save Changes
              </button>{" "}
              <button
                onClick={cancelForm}
                className={`${styles.button} ${styles.logout}`}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={addJob}
              className={`${styles.button} ${styles.primary}`}
            >
              Add Job
            </button>
          )}
        </div>
      </section>

      {/* Table */}
      <section className={styles.section}>
        <h2>All Jobs</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Experience</th>
              <th>Employment</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleJobs.map((j) => (
              <tr key={j.id}>
                <td>{j.title}</td>
                <td>{j.company}</td>
                <td>
                  {j.city}, {j.country}
                </td>
                <td>{j.experienceLevel}</td>
                <td>{j.employmentType}</td>
                <td className={styles.actions}>
                  <button
                    onClick={() => startEdit(j)}
                    className={`${styles.button} ${styles.edit}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteJob(j.id)}
                    className={`${styles.button} ${styles.delete}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Load more */}
      {visibleCount < filtered.length && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={() => setVisibleCount((c) => c + 10)}
            className={styles.loadMore}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
