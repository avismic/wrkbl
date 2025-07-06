// src/app/post-a-job/page.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import styles from "./page.module.css";
import CsvUploadPanel from "@/components/CsvUploadPanel";


/* ─── option lists (same as admin) ─── */
type OfficeType = "Remote" | "Hybrid" | "In-Office" | "Remote-Anywhere";
type ExperienceLevel =
  | "Intern"
  | "Entry-level"
  | "Associate/Mid-level"
  | "Senior-level"
  | "Managerial"
  | "Executive";
type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Temporary"
  | "Freelance";

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

/* ─── manual form state ─── */
const emptyForm = {
  title: "",
  company: "",
  city: "",
  country: "",
  officeType: "" as "" | OfficeType,
  experienceLevel: "" as "" | ExperienceLevel,
  employmentType: "" as "" | EmploymentType,
  industries: [] as string[],
  visa: false,
  benefits: [] as string[],
  skills: "",
  url: "",
  currency: "",
  salaryLow: "",
  salaryHigh: "",
  type: "" as "" | "job" | "internship",
};

export default function PostAJobPage() {
  /* manual-form hooks */
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  /* csv-upload hooks */
  type CsvJob = typeof emptyForm & { id: string; postedAt: number };
  const [parsedJobs, setParsedJobs] = useState<CsvJob[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  /* ───────── CSV upload logic ───────── */
  const handleCsv = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return setCsvError("No file selected");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) {
          setCsvError(errors.map((er) => er.message).join("; "));
        } else {
          const rows: CsvJob[] = (data as any[]).map((row) => ({
            id: uuidv4().slice(0, 4) + "-" + Math.floor(100 + Math.random() * 900),
            title: row.title || "",
            company: row.company || "",
            city: row.city || "",
            country: row.country || "",
            officeType: row.officeType || "",
            experienceLevel: row.experienceLevel || "",
            employmentType: row.employmentType || "",
            industries:
              row.industries?.split(",").map((s: string) => s.trim()) ?? [],
            visa: String(row.visa).toLowerCase() === "yes",
            benefits: row.benefits?.split(",").map((s: string) => s.trim()) ?? [],
            skills: row.skills || "",
            url: row.url || "",
            currency: row.currency || "",
            salaryLow: row.salaryLow || "",
            salaryHigh: row.salaryHigh || "",
            type:
              String(row["type"] ?? row["j/i"])?.toLowerCase() === "internship" ||
              String(row["j/i"]).toLowerCase() === "i"
                ? "internship"
                : "job",
            postedAt: Date.now(),
          }));
          setParsedJobs(rows);
          setCsvError(null);
        }
      },
      error: (err) => setCsvError(err.message),
    });
  };

  const uploadCsvJobs = async () => {
    if (!parsedJobs.length) return;
    setUploadingCsv(true);
    try {
      for (const job of parsedJobs) {
        await fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...job,
            skills: job.skills.split(",").map((s) => s.trim()),
            industry: job.industries.join(","), // legacy fallback
          }),
        });
      }
      setParsedJobs([]);
    } catch (err: any) {
      setCsvError(err.message || "Failed to upload");
    } finally {
      setUploadingCsv(false);
    }
  };

  /* ───────── manual form helpers ───────── */
  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleArr = (key: "industries" | "benefits", val: string, max = 99) =>
    setForm((f) => {
      const next = new Set(f[key]);
      next.has(val) ? next.delete(val) : next.add(val);
      if (key === "industries" && next.size > max) return f;
      return { ...f, [key]: Array.from(next) };
    });

  /* ───────── manual submit ───────── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: uuidv4().slice(0, 4) + "-" + Math.floor(100 + Math.random() * 900),
          ...form,
          skills: form.skills.split(",").map((s) => s.trim()),
          industries: form.industries,
          benefits: form.benefits,
          postedAt: Date.now(),
        }),
      });
      setStatus("sent");
    } catch (err: any) {
      setError(err.message || "Failed to submit");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className={styles.thanks}>
        <h1>Thank you!</h1>
        <p>Your job request has been sent. The admin will review it shortly.</p>
      </div>
    );
  }

  /* ────────── render ────────── */
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Post a Job Request</h1>
      <CsvUploadPanel />


      {/*  manual form  */}
      {error && <p className={styles.error}>{error}</p>}
      <form className={styles.formGrid} onSubmit={handleSubmit}>
        {/* identical form fields as before … */}
        {/* Row 1 */}
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={onChange}
          required
        />
        <input
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={onChange}
          required
        />
        {/* Row 2 */}
        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={onChange}
          required
        />
        <input
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={onChange}
          required
        />
        {/* Row 3 */}
        <select name="officeType" value={form.officeType} onChange={onChange} required>
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
          onChange={onChange}
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
        {/* Row 4 */}
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
        <div className={styles.fullWidth}>
          <p className={styles.label}>Industry (up to 3):</p>
          <div className={styles.checkboxGroup}>
            {["Tech", "Marketing", "Finance", "Healthcare", "Education"].map((opt) => (
              <label key={opt}>
                <input
                  type="checkbox"
                  checked={form.industries.includes(opt)}
                  onChange={() => toggleArr("industries", opt, 3)}
                />{" "}
                {opt}
              </label>
            ))}
          </div>
        </div>
        {/* Visa */}
        <label className={styles.fullWidth}>
          <input
            type="checkbox"
            name="visa"
            checked={form.visa}
            onChange={onChange}
          />{" "}
          Visa Sponsorship Available
        </label>
        {/* Benefits */}
        <div className={styles.fullWidth}>
          <p className={styles.label}>Benefits:</p>
          <div className={styles.checkboxGroup}>
            {benefitOptions.map((b) => (
              <label key={b}>
                <input
                  type="checkbox"
                  checked={form.benefits.includes(b)}
                  onChange={() => toggleArr("benefits", b)}
                />{" "}
                {b}
              </label>
            ))}
          </div>
        </div>
        {/* Row 5 */}
        <input
          className={styles.fullWidth}
          name="skills"
          placeholder="Skills (comma-separated)"
          value={form.skills}
          onChange={onChange}
        />
        <input
          className={styles.fullWidth}
          name="url"
          placeholder="Application URL"
          value={form.url}
          onChange={onChange}
        />
        {/* Row 6 */}
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
        <div className={styles.salaryRow}>
          <input
            name="salaryLow"
            placeholder="Low"
            value={form.salaryLow}
            onChange={onChange}
          />
          <span>–</span>
          <input
            name="salaryHigh"
            placeholder="High"
            value={form.salaryHigh}
            onChange={onChange}
          />
        </div>
        {/* Row 7 */}
        <select
          name="type"
          value={form.type}
          onChange={onChange}
          className={styles.fullWidth}
          required
        >
          <option value="" disabled>
            Choose opportunity type
          </option>
          <option value="job">Job</option>
          <option value="internship">Internship</option>
        </select>
        {/* Submit */}
        <button
          type="submit"
          disabled={status === "sending"}
          className={`${styles.button} ${styles.primary} ${styles.fullWidth}`}
        >
          {status === "sending" ? "Sending…" : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
